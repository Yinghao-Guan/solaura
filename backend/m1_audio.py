import socket, json, time, math
import numpy as np
import sounddevice as sd

UDP_IP = "0.0.0.0"
UDP_PORT = 5005

# 音频参数
SR = 48000
BEEP_HZ = 880.0
BEEP_LEN = 0.06   # 单次 beep 时长（秒）
VOL = 0.15

def clamp(x, a, b):
    return max(a, min(b, x))

def quat_to_rotmat_xyzw(q):
    # q = [x,y,z,w]
    x, y, z, w = q
    xx, yy, zz = x*x, y*y, z*z
    xy, xz, yz = x*y, x*z, y*z
    wx, wy, wz = w*x, w*y, w*z
    return np.array([
        [1-2*(yy+zz), 2*(xy - wz),   2*(xz + wy)],
        [2*(xy + wz), 1-2*(xx+zz),   2*(yz - wx)],
        [2*(xz - wy), 2*(yz + wx),   1-2*(xx+yy)],
    ], dtype=np.float32)

def world_to_camera(v_w, cam_quat_xyzw):
    R = quat_to_rotmat_xyzw(cam_quat_xyzw)
    return R.T @ v_w  # world -> camera

def azimuth_from_vc(v_c):
    # 约定：相机前方接近 -Z（ARKit 通常如此）
    x = float(v_c[0])
    z = float(v_c[2])
    az = math.atan2(x, -z)  # 如果你听起来左右反了：改成 atan2(-x, -z)
    return az

def distance_to_interval(d):
    d = clamp(d, 0.2, 3.0)
    return 0.10 + (d - 0.2) / (3.0 - 0.2) * (0.70 - 0.10)

def pan_from_az(az):
    az = clamp(az, -math.pi/2, math.pi/2)
    pan = az / (math.pi/2)  # [-1,1]
    if abs(pan) < 0.08:     # 死区
        pan = 0.0
    return clamp(pan, -0.9, 0.9)

def stereo_gains(pan):
    angle = (pan + 1) * (math.pi/4)  # 0..pi/2
    L = math.cos(angle)
    R = math.sin(angle)
    return L, R

def make_beep(pan):
    t = np.arange(int(SR * BEEP_LEN), dtype=np.float32) / SR
    wave = np.sin(2 * math.pi * BEEP_HZ * t).astype(np.float32) * VOL
    Lg, Rg = stereo_gains(pan)
    stereo = np.stack([wave * Lg, wave * Rg], axis=1)
    return stereo

def extract_target_and_cam(msg):
    cam = msg.get("cam") or {}
    cam_pos = cam.get("pos")
    cam_quat = cam.get("quat")
    if cam_pos is None or cam_quat is None:
        return None

    target_pos = None
    conf = 1.0
    for o in msg.get("obj", []):
        if o.get("name") == "target":
            target_pos = o.get("pos")
            conf = float(o.get("conf", 1.0))
            break
    if target_pos is None:
        return None

    return (np.array(target_pos, dtype=np.float32),
            np.array(cam_pos, dtype=np.float32),
            np.array(cam_quat, dtype=np.float32),
            conf)

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    sock.settimeout(0.02)

    print(f"[OK] M1 audio listening on udp://{UDP_IP}:{UDP_PORT}")
    print("[TIP] Tap on the iPhone screen; you'll hear beeps panned left/right.")
    print("[TIP] If right/left feels flipped, edit azimuth_from_vc() sign.")

    last_update_t = None
    last_beep_t = 0.0
    want = None  # (pan, interval, dist, az)

    with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as stream:
        while True:
            now = time.time()

            # 每轮最多处理少量包，避免 30Hz cam 流“饿死”播放逻辑
            try:
                for _ in range(8):
                    data, _addr = sock.recvfrom(65535)
                    text = data.decode("utf-8", errors="replace").strip()

                    # cam 流通常没有 "mode"，直接跳过
                    if '"mode"' not in text:
                        continue

                    # 只关心 tap_target / tap_miss
                    if '"tap_target"' in text:
                        msg = json.loads(text)
                        parsed = extract_target_and_cam(msg)
                        if parsed is None:
                            continue

                        target_pos, cam_pos, cam_quat, conf = parsed
                        v_w = target_pos - cam_pos
                        d = float(np.linalg.norm(v_w))
                        v_c = world_to_camera(v_w, cam_quat)
                        az = azimuth_from_vc(v_c)
                        pan = pan_from_az(az)
                        interval = distance_to_interval(d)

                        want = (pan, interval, d, az)
                        last_update_t = time.time()

                        # 关键：每次新 tap 都立刻响一下（消灭“随机/延迟”）
                        last_beep_t = 0.0

                    elif '"tap_miss"' in text:
                        # miss：立刻静音/停止 beep，让用户感到“这次没命中”
                        want = None
                        last_update_t = time.time()
                        # 你也可以取消注释看 miss 频率
                        # print("tap_miss")

            except socket.timeout:
                pass
            except Exception:
                # 解析失败就跳过，别崩
                pass

            # 超时：2 秒没新 tap_target 就停
            if last_update_t is None or (now - last_update_t) > 2.0:
                want = None

            if want is not None:
                pan, interval, d, az = want
                if now - last_beep_t >= interval:
                    stream.write(make_beep(pan))
                    last_beep_t = now
                    print(f"az={az:+.2f}rad pan={pan:+.2f} dist={d:.2f}m interval={interval:.2f}s")

if __name__ == "__main__":
    main()

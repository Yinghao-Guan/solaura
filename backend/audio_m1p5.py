import math, time, json, socket
import numpy as np
import sounddevice as sd

from filter import EMA3
from state import TargetState

UDP_IP = "0.0.0.0"
UDP_PORT = 5005

SR = 48000
BEEP_HZ = 880.0
BEEP_LEN = 0.06
VOL = 0.15

def clamp(x, a, b): return max(a, min(b, x))

def quat_to_rotmat_xyzw(q):
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
    return R.T @ v_w

def azimuth_from_vc(v_c):
    x = float(v_c[0]); z = float(v_c[2])
    az = math.atan2(x, -z)  # 左右反了就改成 atan2(-x, -z)
    return az

def pan_from_az(az):
    az = clamp(az, -math.pi/2, math.pi/2)
    pan = az / (math.pi/2)
    if abs(pan) < 0.03:  # 原来 0.08
        pan = 0.0
    return clamp(pan, -1.0, 1.0)


def distance_to_interval(d):
    d = clamp(d, 0.2, 3.0)
    return 0.10 + (d - 0.2) / (3.0 - 0.2) * (0.70 - 0.10)

def stereo_gains(pan):
    # 更“硬”的线性 panning：pan=-1 纯左，+1 纯右
    pan = clamp(pan, -1.0, 1.0)
    L = 0.5 * (1.0 - pan)
    R = 0.5 * (1.0 + pan)
    # 归一化到最大 1（可选）
    m = max(L, R, 1e-6)
    return L / m, R / m


def make_beep(pan):
    t = np.arange(int(SR * BEEP_LEN), dtype=np.float32) / SR
    wave = (np.sin(2 * math.pi * BEEP_HZ * t).astype(np.float32)) * VOL
    Lg, Rg = stereo_gains(pan)
    return np.stack([wave * Lg, wave * Rg], axis=1)

def extract_target(msg):
    """
    优先使用 bottle（M2），没有 bottle 就用 target（M1 tap）。
    只要 obj 里有对应 name，就返回。
    """
    cam = msg.get("cam") or {}
    cam_pos = cam.get("pos"); cam_quat = cam.get("quat")
    if cam_pos is None or cam_quat is None:
        return None

    want_name = None
    if msg.get("mode") in ("bottle_mock", "bottle_target", "bottle_depth"):
        want_name = "bottle"
    elif msg.get("mode") == "tap_target":
        want_name = "target"
    else:
        # 其它 mode 先不处理
        return None

    obj_pos = None
    for o in msg.get("obj", []):
        if o.get("name") == want_name:
            obj_pos = o.get("pos")
            break
    if obj_pos is None:
        return None

    return (np.array(obj_pos, np.float32),
            np.array(cam_pos, np.float32),
            np.array(cam_quat, np.float32))


def live_source():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    sock.settimeout(0.02)
    print(f"[OK] Live source udp://{UDP_IP}:{UDP_PORT}")

    while True:
        try:
            data, _ = sock.recvfrom(65535)
        except socket.timeout:
            yield None, time.time()
            continue
        text = data.decode("utf-8", errors="replace").strip()
        # 快速过滤：只关心 mode 消息
        if '"mode"' not in text:
            continue
        try:
            msg = json.loads(text)
        except Exception:
            continue
        yield msg, time.time()

def main(mode="live", replay_path=None, replay_speed=1.0):
    # 过滤器：对 v_w（target-cam）滤波，减少 jitter
    ema_vw = EMA3(alpha=0.25)
    st = TargetState(timeout_s=2.0)

    last_beep_t = 0.0
    want = None  # (pan, interval, dist, az)

    if mode == "replay":
        from replay import replay
        src = replay(replay_path, speed=replay_speed)
        print(f"[OK] Replay source: {replay_path} x{replay_speed}")
    else:
        src = live_source()

    print("[TIP] Tap -> immediate beep. No new target for 2s -> silence.")

    with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as stream:
        while True:
            msg, now = next(src)

            # tick 状态机
            st.tick(now)

            if msg is not None:
                if msg.get("mode") in ("tap_miss", "bottle_miss"):
                    st.on_miss(now)
                    want = None

                parsed = extract_target(msg)
                if parsed is not None:
                    target_pos, cam_pos, cam_quat = parsed
                    v_w = target_pos - cam_pos
                    v_w = ema_vw.update(v_w)

                    d = float(np.linalg.norm(v_w))
                    v_c = world_to_camera(v_w, cam_quat)
                    az = azimuth_from_vc(v_c)
                    pan = pan_from_az(az)
                    interval = distance_to_interval(d)

                    want = (pan, interval, d, az)
                    st.on_target(now)

                    # 每次新 target 立刻响一下
                    last_beep_t = 0.0

            if not st.should_sound():
                want = None

            if want is not None:
                pan, interval, d, az = want
                if now - last_beep_t >= interval:
                    stream.write(make_beep(pan))
                    last_beep_t = now
                    print(f"az={az:+.2f} pan={pan:+.2f} dist={d:.2f}m int={interval:.2f}s")

if __name__ == "__main__":
    # 用法：
    #   live:   python audio_m1p5.py
    #   replay: python audio_m1p5.py replay records/capture-xxxx.jsonl 1.0
    import sys
    if len(sys.argv) >= 2 and sys.argv[1] == "replay":
        path = sys.argv[2]
        speed = float(sys.argv[3]) if len(sys.argv) >= 4 else 1.0
        main(mode="replay", replay_path=path, replay_speed=speed)
    else:
        main(mode="live")

import math, time, json, socket, threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import numpy as np
import sounddevice as sd

from state import TargetState

UDP_IP = "0.0.0.0"
UDP_PORT = 5005

SR = 44100
BEEP_HZ = 880.0
BEEP_LEN = 0.06
VOL = 0.8


def clamp(x, a, b): return max(a, min(b, x))


def quat_to_rotmat_xyzw(q):
    x, y, z, w = q
    xx, yy, zz = x * x, y * y, z * z
    xy, xz, yz = x * y, x * z, y * z
    wx, wy, wz = w * x, w * y, w * z
    return np.array([
        [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy)],
        [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx)],
        [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)],
    ], dtype=np.float32)


def world_to_camera(v_w, cam_quat_xyzw):
    R = quat_to_rotmat_xyzw(cam_quat_xyzw)
    return R.T @ v_w


def azimuth_from_vc(v_c):
    y_axis = float(v_c[1])
    z = float(v_c[2])
    return math.atan2(y_axis, -z)


def pan_from_az(az):
    max_angle = math.pi / 12.0
    az = clamp(az, -max_angle, max_angle)
    pan = (az / max_angle)
    if abs(pan) < 0.05:
        pan = 0.0
    return clamp(pan, -1.0, 1.0)


def distance_to_interval(d):
    min_dist = 0.2
    max_dist = 1.5
    d = clamp(d, min_dist, max_dist)
    ratio = (d - min_dist) / (max_dist - min_dist)
    curve_ratio = ratio ** 2.0
    return 0.07 + curve_ratio * (0.50 - 0.07)


def stereo_gains(pan):
    pan = clamp(pan, -1.0, 1.0)
    angle = (pan + 1.0) * math.pi / 4.0
    return math.cos(angle), math.sin(angle)


def make_beep(pan, d):
    d_clamped = clamp(d, 0.2, 1.5)
    ratio = (1.5 - d_clamped) / (1.5 - 0.2)
    dynamic_hz = 400.0 + (ratio * 1100.0)

    N = int(SR * BEEP_LEN)
    t = np.arange(N, dtype=np.float32) / SR
    wave = (np.sin(2 * math.pi * dynamic_hz * t).astype(np.float32)) * VOL

    # ==========================================
    # 🚀 修复 1：ADSR 声音包络 (Envelope)
    # 增加 5 毫秒的极速淡入淡出，彻底消除音频相位的“啪啪”断裂杂音
    # ==========================================
    fade_len = int(SR * 0.005)
    envelope = np.ones(N, dtype=np.float32)
    if N > fade_len * 2:
        envelope[:fade_len] = np.linspace(0, 1, fade_len, dtype=np.float32)
        envelope[-fade_len:] = np.linspace(1, 0, fade_len, dtype=np.float32)
    wave *= envelope

    L, R = stereo_gains(pan)
    return np.ascontiguousarray(np.stack([wave * L, wave * R], axis=1))


def extract_target(msg):
    cam = msg.get("cam") or {}
    cam_pos = cam.get("pos");
    cam_quat = cam.get("quat")
    if cam_pos is None or cam_quat is None:
        return None

    want_name = None
    if msg.get("mode") in ("bottle_mock", "bottle_target", "bottle_depth"):
        want_name = "bottle"
    elif msg.get("mode") == "tap_target":
        want_name = "target"
    else:
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


# ================= HTTP State Server =================
class _StateHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        with state_lock:
            cp = latest_state["cam_pos"]
            tp = latest_state["target_pos"]
            cq = latest_state["cam_quat"]
            active = latest_state["is_active"]

        # Camera-frame offset + derived quantities for visualization
        cam_offset = None
        az = None       # azimuth angle in radians (left/right)
        dist = None     # 3-D distance in metres
        if cp is not None and tp is not None and cq is not None:
            v_w = tp - cp
            v_c = world_to_camera(v_w, cq)
            cam_offset = v_c.tolist()
            az   = math.atan2(float(v_c[1]), -float(v_c[2]))
            dist = float(np.linalg.norm(v_w))

        body = json.dumps({
            "cam_pos":    cp.tolist() if cp is not None else None,
            "target_pos": tp.tolist() if tp is not None else None,
            "cam_offset": cam_offset,   # [x_cam, y_cam(=LR), z_cam(=FB)]
            "az":         az,           # azimuth (rad) – same as audio uses
            "dist":       dist,         # metres
            "is_active":  bool(active),
        }).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # suppress access logs


def http_server_thread():
    HTTPServer(("0.0.0.0", 8765), _StateHandler).serve_forever()


# ================= 🚀 核心修改：多线程与全局共享状态 =================
state_lock = threading.Lock()
latest_state = {
    "cam_pos": None,
    "cam_quat": None,
    "raw_target_pos": None,  # YOLO 传来的 5Hz 跳跃坐标
    "target_pos": None,  # EMA 平滑后的 30Hz 丝滑坐标
    "is_active": False,
    "last_target_update": 0.0
}


def udp_listener_thread():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"[OK] UDP Listener thread running on {UDP_IP}:{UDP_PORT}")

    while True:
        try:
            data, _ = sock.recvfrom(65535)
            now = time.time()
            text = data.decode("utf-8", errors="replace").strip()
            if '"mode"' not in text: continue

            msg = json.loads(text)
            mode = msg.get("mode")

            with state_lock:
                if mode == "pose":
                    cam = msg.get("cam")
                    if cam is not None and cam.get("pos") and cam.get("quat"):
                        latest_state["cam_pos"] = np.array(cam.get("pos"), np.float32)
                        latest_state["cam_quat"] = np.array(cam.get("quat"), np.float32)

                        # 在接收 pose (30Hz) 的稳定节拍下进行 EMA 滤波
                        # 这样即使瓶子坐标 200 毫秒才更新一次，系统也会在期间顺滑地“滑”过去
                        raw_pos = latest_state["raw_target_pos"]
                        curr_pos = latest_state["target_pos"]
                        if raw_pos is not None:
                            if curr_pos is None:
                                latest_state["target_pos"] = raw_pos.copy()
                            else:
                                alpha = 0.15  # 0.15 完美平衡了“延迟感”和“顺滑感”
                                latest_state["target_pos"] = curr_pos * (1.0 - alpha) + raw_pos * alpha

                elif mode in ("tap_miss", "bottle_miss"):
                    latest_state["is_active"] = False
                else:
                    parsed = extract_target(msg)
                    if parsed is not None:
                        target_pos, c_pos, c_quat = parsed
                        latest_state["raw_target_pos"] = target_pos  # 只更新 raw，不干扰 target_pos 的顺滑滑动
                        latest_state["is_active"] = True
                        latest_state["last_target_update"] = now

                        if c_pos is not None:
                            latest_state["cam_pos"] = c_pos
                            latest_state["cam_quat"] = c_quat
        except Exception:
            pass


def main(mode="live", replay_path=None, replay_speed=1.0):
    t = threading.Thread(target=udp_listener_thread, daemon=True)
    t.start()

    # 启动 HTTP 状态服务器线程
    ht = threading.Thread(target=http_server_thread, daemon=True)
    ht.start()
    print("[OK] HTTP state server on http://0.0.0.0:8765/state")


    st = TargetState(timeout_s=2.0)
    last_beep_t = 0.0
    main_last_target_update = 0.0

    print("[TIP] Tap -> immediate beep. No new target for 2s -> silence.")

    with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as stream:
        while True:
            now = time.time()

            with state_lock:
                cam_pos = latest_state["cam_pos"]
                cam_quat = latest_state["cam_quat"]
                target_pos = latest_state["target_pos"]  # 直接取用丝滑状态
                is_active = latest_state["is_active"]
                target_update_time = latest_state["last_target_update"]

            if is_active and target_pos is not None:
                if target_update_time > main_last_target_update:
                    if not st.should_sound():
                        last_beep_t = 0.0
                    st.on_target(target_update_time)
                    main_last_target_update = target_update_time
            else:
                st.on_miss(now)

            st.tick(now)

            want = None
            if st.should_sound() and cam_pos is not None and target_pos is not None and cam_quat is not None:
                # 🚀 修复 3：直接相减，抛弃在 while 循环中瞎跑的旧 EMA 滤波器
                v_w = target_pos - cam_pos

                d = float(np.linalg.norm(v_w))
                v_c = world_to_camera(v_w, cam_quat)
                az = azimuth_from_vc(v_c)
                pan = pan_from_az(az)
                interval = distance_to_interval(d)

                want = (pan, interval, d, az)

            if want is not None:
                pan, interval, d, az = want
                if now - last_beep_t >= interval:
                    stream.write(make_beep(pan, d))
                    last_beep_t = time.time()
                    print(f"az={az:+.2f} pan={pan:+.2f} dist={d:.2f}m int={interval:.2f}s")
            else:
                time.sleep(0.005)


if __name__ == "__main__":
    main(mode="live")
import math, time, json, socket, threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import numpy as np
import sounddevice as sd

from state import TargetState

UDP_IP = "0.0.0.0"
UDP_PORT = 5005
HTTP_PORT = 8765

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


# ==========================================
# 🚀 模式 1：相机信标模式 (使用角度 Azimuth 映射)
# ==========================================
def azimuth_from_vc(v_c):
    x_axis = float(v_c[0])
    z_axis = float(v_c[2])
    return math.atan2(x_axis, -z_axis)


def pan_from_az(az):
    max_angle = math.pi / 12.0  # 15度满声道
    az = clamp(az, -max_angle, max_angle)
    pan = (az / max_angle)
    if abs(pan) < 0.05:
        pan = 0.0
    return clamp(pan, -1.0, 1.0)


# ==========================================
# 🚀 模式 2：手部游标模式 (极其敏锐的横向位移映射)
# ==========================================
def pan_from_hand_offset(v_c):
    x_offset = float(v_c[0])

    # 只要手偏离水瓶中心 2厘米 (0.02米)，立刻满声道！
    max_offset = 0.02
    pan = x_offset / max_offset

    # 极其精准的中心死区：0.5厘米 (5毫米)
    if abs(x_offset) < 0.005:
        pan = 0.0

    return clamp(pan, -1.0, 1.0)


# ==========================================
# 🚀 独立的物理体积距离参数
# ==========================================
def get_distance_limits(mode):
    if mode == "HAND":
        # 手的物理厚度极限为 12cm，最远检测为 70cm
        return 0.12, 0.70
    else:
        # 相机正常使用距离
        return 0.20, 1.50


def distance_to_interval(d, mode):
    min_dist, max_dist = get_distance_limits(mode)
    d = clamp(d, min_dist, max_dist)
    ratio = (d - min_dist) / (max_dist - min_dist)
    curve_ratio = ratio ** 2.0
    return 0.07 + curve_ratio * (0.50 - 0.07)


def stereo_gains(pan):
    pan = clamp(pan, -1.0, 1.0)
    angle = (pan + 1.0) * math.pi / 4.0
    return math.cos(angle), math.sin(angle)


def make_beep(pan, d, mode):
    min_dist, max_dist = get_distance_limits(mode)
    d_clamped = clamp(d, min_dist, max_dist)
    ratio = (max_dist - d_clamped) / (max_dist - min_dist)

    # 动态音高：手越近，音调越高，最高可达 1500Hz
    dynamic_hz = 400.0 + (ratio * 1100.0)

    N = int(SR * BEEP_LEN)
    t = np.arange(N, dtype=np.float32) / SR
    wave = (np.sin(2 * math.pi * dynamic_hz * t).astype(np.float32)) * VOL

    # 音频包络淡入淡出，彻底消除杂音
    fade_len = int(SR * 0.005)
    envelope = np.ones(N, dtype=np.float32)
    if N > fade_len * 2:
        envelope[:fade_len] = np.linspace(0, 1, fade_len, dtype=np.float32)
        envelope[-fade_len:] = np.linspace(1, 0, fade_len, dtype=np.float32)
    wave *= envelope

    L, R = stereo_gains(pan)
    return np.ascontiguousarray(np.stack([wave * L, wave * R], axis=1))


def extract_targets(msg):
    cam = msg.get("cam") or {}
    cam_pos = cam.get("cam_pos") if "cam_pos" in cam else cam.get("pos")
    cam_quat = cam.get("cam_quat") if "cam_quat" in cam else cam.get("quat")

    b_pos = None
    h_pos = None

    for o in msg.get("obj", []):
        if o.get("name") == "bottle" and o.get("pos") is not None:
            b_pos = o.get("pos")
        elif o.get("name") == "hand" and o.get("pos") is not None:
            h_pos = o.get("pos")

    if b_pos is not None: b_pos = np.array(b_pos, np.float32)
    if h_pos is not None: h_pos = np.array(h_pos, np.float32)
    if cam_pos is not None: cam_pos = np.array(cam_pos, np.float32)
    if cam_quat is not None: cam_quat = np.array(cam_quat, np.float32)

    return cam_pos, cam_quat, b_pos, h_pos


state_lock = threading.Lock()
latest_state = {
    "cam_pos": None,
    "cam_quat": None,
    "raw_bottle_pos": None,
    "bottle_pos": None,
    "raw_hand_pos": None,
    "hand_pos": None,
    "is_active": False,
    "last_target_update": 0.0,
    "last_hand_update": 0.0
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

                        # 双轨平滑
                        alpha = 0.15
                        raw_b = latest_state["raw_bottle_pos"]
                        curr_b = latest_state["bottle_pos"]
                        if raw_b is not None:
                            if curr_b is None:
                                latest_state["bottle_pos"] = raw_b.copy()
                            else:
                                latest_state["bottle_pos"] = curr_b * (1.0 - alpha) + raw_b * alpha

                        raw_h = latest_state["raw_hand_pos"]
                        curr_h = latest_state["hand_pos"]
                        if raw_h is not None:
                            if curr_h is None:
                                latest_state["hand_pos"] = raw_h.copy()
                            else:
                                latest_state["hand_pos"] = curr_h * (1.0 - alpha) + raw_h * alpha

                elif mode in ("tap_miss", "bottle_miss"):
                    latest_state["is_active"] = False
                else:
                    c_pos, c_quat, b_pos, h_pos = extract_targets(msg)

                    if c_pos is not None:
                        latest_state["cam_pos"] = c_pos
                        latest_state["cam_quat"] = c_quat

                    if b_pos is not None:
                        latest_state["raw_bottle_pos"] = b_pos
                        latest_state["is_active"] = True
                        latest_state["last_target_update"] = now

                    if h_pos is not None:
                        latest_state["raw_hand_pos"] = h_pos
                        latest_state["last_hand_update"] = now

                        # 💡 客体永久性：当看到手，冻结水瓶的记忆位置！
                        if b_pos is None and latest_state["raw_bottle_pos"] is not None:
                            latest_state["last_target_update"] = now
                            latest_state["is_active"] = True
                    else:
                        if now - latest_state["last_hand_update"] > 0.5:
                            latest_state["raw_hand_pos"] = None
                            latest_state["hand_pos"] = None

        except Exception as e:
            pass


class StateHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/state":
            with state_lock:
                cam_pos    = latest_state["cam_pos"]
                cam_quat   = latest_state["cam_quat"]
                bottle_pos = latest_state["bottle_pos"]
                hand_pos   = latest_state["hand_pos"]
                is_active  = latest_state["is_active"]

            resp: dict = {"is_active": is_active}

            if cam_pos is not None:
                resp["cam_pos"] = cam_pos.tolist()

            if bottle_pos is not None and cam_pos is not None and cam_quat is not None:
                resp["target_pos"] = bottle_pos.tolist()
                v_w = bottle_pos - cam_pos
                v_c = world_to_camera(v_w, cam_quat)
                resp["cam_offset"] = v_c.tolist()

            if hand_pos is not None and cam_pos is not None and cam_quat is not None:
                v_hand_w = hand_pos - cam_pos
                v_hand_c = world_to_camera(v_hand_w, cam_quat)
                resp["hand_cam_offset"] = v_hand_c.tolist()
                resp["hand_visible"] = True
            else:
                resp["hand_visible"] = False

            body = json.dumps(resp).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # suppress request logs


def http_server_thread():
    server = HTTPServer(("0.0.0.0", HTTP_PORT), StateHandler)
    print(f"[OK] HTTP server running on port {HTTP_PORT}")
    server.serve_forever()


def main(mode="live", replay_path=None, replay_speed=1.0):
    t = threading.Thread(target=udp_listener_thread, daemon=True)
    t.start()

    ht = threading.Thread(target=http_server_thread, daemon=True)
    ht.start()

    st = TargetState(timeout_s=2.0)
    last_beep_t = 0.0
    main_last_target_update = 0.0

    print("[TIP] Master Build Ready! Decoupled Hyper-Sensitive Hand Tracking.")

    with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as stream:
        while True:
            now = time.time()

            with state_lock:
                cam_pos = latest_state["cam_pos"]
                cam_quat = latest_state["cam_quat"]
                bottle_pos = latest_state["bottle_pos"]
                hand_pos = latest_state["hand_pos"]
                is_active = latest_state["is_active"]
                target_update_time = latest_state["last_target_update"]

            if is_active and bottle_pos is not None:
                if target_update_time > main_last_target_update:
                    if not st.should_sound():
                        last_beep_t = 0.0
                    st.on_target(target_update_time)
                    main_last_target_update = target_update_time
            else:
                st.on_miss(now)

            st.tick(now)

            want = None
            if st.should_sound() and cam_pos is not None and bottle_pos is not None and cam_quat is not None:

                origin_name = "CAM"
                if hand_pos is not None:
                    # 💡 指向修正：瓶子指向手，引导手向瓶子移动
                    v_w = bottle_pos - hand_pos
                    d = float(np.linalg.norm(v_w))
                    v_c = world_to_camera(v_w, cam_quat)
                    pan = pan_from_hand_offset(v_c)
                    origin_name = "HAND"
                else:
                    v_w = bottle_pos - cam_pos
                    d = float(np.linalg.norm(v_w))
                    v_c = world_to_camera(v_w, cam_quat)
                    az = azimuth_from_vc(v_c)
                    pan = pan_from_az(az)

                interval = distance_to_interval(d, origin_name)
                # 对横向偏移单独取值以备打印查看
                want = (pan, interval, d, origin_name, float(v_c[0]))

            if want is not None:
                pan, interval, d, origin, x_off = want
                if now - last_beep_t >= interval:
                    stream.write(make_beep(pan, d, origin))
                    last_beep_t = time.time()
                    print(f"[{origin}] OffsetX={x_off:+.3f}m pan={pan:+.2f} dist={d:.2f}m int={interval:.3f}s")
            else:
                time.sleep(0.005)


if __name__ == "__main__":
    main(mode="live")
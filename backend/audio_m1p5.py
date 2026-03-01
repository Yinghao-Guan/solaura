import math, time, json, socket, threading
import numpy as np
import sounddevice as sd

from filter import EMA3
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
    az = math.atan2(y_axis, -z)
    return az


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
    min_interval = 0.07
    max_interval = 0.50
    return min_interval + curve_ratio * (max_interval - min_interval)


def stereo_gains(pan):
    pan = clamp(pan, -1.0, 1.0)
    angle = (pan + 1.0) * math.pi / 4.0
    L = math.cos(angle)
    R = math.sin(angle)
    return L, R


def make_beep(pan, d):
    d_clamped = clamp(d, 0.2, 1.5)
    ratio = (1.5 - d_clamped) / (1.5 - 0.2)
    dynamic_hz = 400.0 + (ratio * 1100.0)
    t = np.arange(int(SR * BEEP_LEN), dtype=np.float32) / SR
    wave = (np.sin(2 * math.pi * dynamic_hz * t).astype(np.float32)) * VOL
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


# ================= 🚀 核心修改：多线程与全局共享状态 =================
state_lock = threading.Lock()
latest_state = {
    "cam_pos": None,
    "cam_quat": None,
    "target_pos": None,
    "is_active": False,
    "last_target_update": 0.0  # 记录收到目标的时间，用于触发状态机
}


def udp_listener_thread():
    """独立线程：疯狂无阻塞地读取 UDP，只保存最新状态，果断丢弃积压包"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"[OK] UDP Listener thread running on {UDP_IP}:{UDP_PORT}")

    while True:
        try:
            # 阻塞接收，一旦有数据瞬间唤醒
            data, _ = sock.recvfrom(65535)
            now = time.time()
            text = data.decode("utf-8", errors="replace").strip()

            if '"mode"' not in text:
                continue

            msg = json.loads(text)
            mode = msg.get("mode")

            # 加锁更新最新状态
            with state_lock:
                # 1. 更新相机位姿 (30Hz 会频繁更新)
                cam = msg.get("cam")
                if cam is not None and cam.get("pos") and cam.get("quat"):
                    latest_state["cam_pos"] = np.array(cam.get("pos"), np.float32)
                    latest_state["cam_quat"] = np.array(cam.get("quat"), np.float32)

                # 2. 更新目标状态
                if mode in ("tap_miss", "bottle_miss"):
                    latest_state["is_active"] = False
                else:
                    parsed = extract_target(msg)
                    if parsed is not None:
                        target_pos, _, _ = parsed
                        latest_state["target_pos"] = target_pos
                        latest_state["is_active"] = True
                        latest_state["last_target_update"] = now

        except Exception:
            pass


def main(mode="live", replay_path=None, replay_speed=1.0):
    if mode != "live":
        print("[Error] 此脚本已被优化为多线程Live模式，如果需要 replay 请使用旧版脚本。")
        return

    # 启动后台收包线程
    t = threading.Thread(target=udp_listener_thread, daemon=True)
    t.start()

    ema_vw = EMA3(alpha=0.25)
    st = TargetState(timeout_s=2.0)

    last_beep_t = 0.0
    main_last_target_update = 0.0  # 用于追踪状态机是否需要触发 on_target

    print("[TIP] Tap -> immediate beep. No new target for 2s -> silence.")

    with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as stream:
        while True:
            now = time.time()

            # 1. 安全地拉取最新一帧的状态
            with state_lock:
                cam_pos = latest_state["cam_pos"]
                cam_quat = latest_state["cam_quat"]
                target_pos = latest_state["target_pos"]
                is_active = latest_state["is_active"]
                target_update_time = latest_state["last_target_update"]

            # 2. 状态机逻辑（更新 Target 存活状态）
            if is_active and target_pos is not None:
                # 只有发现新目标时间戳时，才触发 on_target
                if target_update_time > main_last_target_update:
                    if not st.should_sound():
                        last_beep_t = 0.0  # 瞬间发声
                    st.on_target(target_update_time)
                    main_last_target_update = target_update_time
            else:
                st.on_miss(now)

            st.tick(now)

            # 3. 计算方位并准备发声
            want = None
            if st.should_sound() and cam_pos is not None and target_pos is not None and cam_quat is not None:
                v_w = target_pos - cam_pos
                v_w = ema_vw.update(v_w)

                d = float(np.linalg.norm(v_w))
                v_c = world_to_camera(v_w, cam_quat)
                az = azimuth_from_vc(v_c)
                pan = pan_from_az(az)
                interval = distance_to_interval(d)

                want = (pan, interval, d, az)

            # 4. 音频播放与时钟控制
            if want is not None:
                pan, interval, d, az = want
                if now - last_beep_t >= interval:
                    # 注意：这一步会阻塞 0.06 秒，但这不再影响后台线程飞速收包！
                    stream.write(make_beep(pan, d))
                    last_beep_t = time.time()
                    print(f"az={az:+.2f} pan={pan:+.2f} dist={d:.2f}m int={interval:.2f}s")
            else:
                # 如果当前不需要发声，主循环休眠极短时间防止 CPU 100% 占用
                time.sleep(0.005)


if __name__ == "__main__":
    import sys

    # 为了简化，这段优化后的代码仅专注 live 模式
    main(mode="live")
import socket, time, json
from pathlib import Path

UDP_IP = "0.0.0.0"
UDP_PORT = 5005

def main():
    out_dir = Path("records")
    out_dir.mkdir(exist_ok=True)
    ts = time.strftime("%Y%m%d-%H%M%S")
    out_path = out_dir / f"capture-{ts}.jsonl"

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    sock.settimeout(1.0)

    print(f"[OK] Recording udp://{UDP_IP}:{UDP_PORT} -> {out_path}")

    with out_path.open("w", encoding="utf-8") as f:
        while True:
            try:
                data, addr = sock.recvfrom(65535)
            except socket.timeout:
                continue

            recv_t = time.time()
            text = data.decode("utf-8", errors="replace").strip()
            try:
                msg = json.loads(text)
                ok = True
            except json.JSONDecodeError:
                msg = {"raw": text}
                ok = False

            rec = {"recv_t": recv_t, "addr": list(addr), "ok": ok, "msg": msg}
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            f.flush()

            if ok and isinstance(msg, dict):
                print("[RX]", msg.get("mode", "-"), "keys=", list(msg.keys()))
            else:
                print("[RX] non-json")

if __name__ == "__main__":
    main()

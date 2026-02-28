import socket
import json
import time
from pathlib import Path

UDP_IP = "0.0.0.0"
UDP_PORT = 5005
OUT = Path("../../../Downloads/temp_h4h-0c58cd0dde2af64264a616294fe53e8dbfcf3c93/mac/record.jsonl")

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    sock.settimeout(1.0)

    print(f"[OK] Listening on udp://{UDP_IP}:{UDP_PORT}")
    print(f"[OK] Recording to {OUT.resolve()}")

    with OUT.open("a", encoding="utf-8") as f:
        while True:
            try:
                data, addr = sock.recvfrom(65535)
            except socket.timeout:
                continue

            now = time.time()
            text = data.decode("utf-8", errors="replace").strip()

            try:
                msg = json.loads(text)
                ok = True
            except json.JSONDecodeError:
                msg = {"raw": text}
                ok = False

            line = json.dumps({"recv_t": now, "addr": addr, "ok": ok, "msg": msg}, ensure_ascii=False)
            f.write(line + "\n")
            f.flush()

            if ok:
                keys = list(msg.keys())
                print(f"[RX] {addr} keys={keys} t={msg.get('t')}")
            else:
                print(f"[RX] {addr} (non-json) {text[:80]}")

if __name__ == "__main__":
    main()

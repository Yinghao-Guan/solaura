import json, time
from pathlib import Path

def replay(path: str, speed: float = 1.0):
    """
    读取 record.jsonl，按原始 recv_t 间隔回放
    yield: msg(dict), now(time.time())
    """
    p = Path(path)
    lines = p.read_text(encoding="utf-8").splitlines()
    events = []
    for ln in lines:
        rec = json.loads(ln)
        if not rec.get("ok"):
            continue
        msg = rec.get("msg")
        if isinstance(msg, dict):
            events.append((float(rec["recv_t"]), msg))

    if not events:
        return

    t0 = events[0][0]
    wall0 = time.time()

    for t_rec, msg in events:
        dt = (t_rec - t0) / max(speed, 1e-6)
        while True:
            now = time.time()
            if now - wall0 >= dt:
                break
            time.sleep(0.001)
        yield msg, time.time()

import time

class TargetState:
    """
    状态：IDLE -> LOCKED（收到 target） -> LOST（超时）
    规则：
      - 收到 tap_target：进入 LOCKED，更新 last_seen
      - 收到 tap_miss：不更新 last_seen（可选：立刻 LOST）
      - 超过 timeout 没收到新 target：进入 LOST，并静音
    """
    def __init__(self, timeout_s: float = 2.0):
        self.timeout_s = float(timeout_s)
        self.mode = "IDLE"
        self.last_seen = None

    def on_target(self, t_now: float):
        self.mode = "LOCKED"
        self.last_seen = t_now

    def on_miss(self, t_now: float):
        # 这里选择“不给 last_seen 续命”，让它自然超时静音
        if self.mode == "IDLE":
            self.mode = "IDLE"
        # 如果你希望 miss 立刻静音，可改成：self.mode="LOST"; self.last_seen=None

    def tick(self, t_now: float):
        if self.mode == "LOCKED" and self.last_seen is not None:
            if (t_now - self.last_seen) > self.timeout_s:
                self.mode = "LOST"
        elif self.mode == "LOST":
            # LOST 保持，直到下一次 target
            pass

    def should_sound(self) -> bool:
        return self.mode == "LOCKED"

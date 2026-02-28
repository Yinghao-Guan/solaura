import numpy as np

class EMA3:
    """3D 向量 EMA"""
    def __init__(self, alpha: float = 0.25):
        self.alpha = float(alpha)
        self.y = None  # np.array shape (3,)

    def reset(self):
        self.y = None

    def update(self, x):
        x = np.asarray(x, dtype=np.float32)
        if self.y is None:
            self.y = x
        else:
            a = self.alpha
            self.y = (1 - a) * self.y + a * x
        return self.y

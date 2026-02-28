import numpy as np
import sounddevice as sd
import time

SR = 48000
DUR = 0.25
HZ = 800
VOL = 0.15

def tone(pan):  # pan=-1 左, +1 右
    t = np.arange(int(SR * DUR), dtype=np.float32) / SR
    w = (np.sin(2*np.pi*HZ*t).astype(np.float32)) * VOL
    if pan < 0:
        return np.stack([w, w*0], axis=1)  # 纯左
    else:
        return np.stack([w*0, w], axis=1)  # 纯右

with sd.OutputStream(samplerate=SR, channels=2, dtype="float32") as s:
    for _ in range(6):
        s.write(tone(-1))
        time.sleep(0.05)
        s.write(tone(+1))
        time.sleep(0.05)
print("done")

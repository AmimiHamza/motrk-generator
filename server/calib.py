"""Quick calibration render — no server needed.
Usage: python calib.py [grid]   ->  writes calib.png (and calib_grid.png)
"""
import sys
from PIL import Image
import config, generator

hx, hy, hw, hh = generator.get_hole()

# Use the real reference car photo if present, else a checker.
ref = None
for p in ("../../result.png",):
    try:
        ref = Image.open(p).convert("RGB"); break
    except Exception:
        pass
car = Image.new("RGB", (hw, hh), (70, 80, 95))
px = car.load()
for yy in range(hh):
    for xx in range(hw):
        if ((xx // 40) + (yy // 40)) % 2 == 0:
            px[xx, yy] = (90, 102, 120)

grid = len(sys.argv) > 1 and sys.argv[1] == "grid"
png = generator.generate(config.TEST_DATA, car,
                         crop=dict(x=0, y=0, width=hw, height=hh),
                         calibrate=grid)
out = "calib_grid.png" if grid else "calib.png"
open(out, "wb").write(png)
print("wrote", out)

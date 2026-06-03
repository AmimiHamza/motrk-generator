"""
One-time prep: turn the raw template (model.png, 2000x2000 RGB whose car area is a
solid dark-gray #282828 fill) into a proper RGBA overlay where that car area is
fully transparent. Everything else (logo, gold frame, specs labels+icons, price
box, bottom bar, decorations) stays opaque.

Run:  ./.venv/Scripts/python.exe make_overlay.py
Output: assets/template_overlay.png  (1080x1080 RGBA)

The car hole is the largest connected region of the #282828 fill, found by flood
filling from the template center, so the diagonal gold cut on the top-right corner
is preserved automatically.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

SRC_CANDIDATES = [
    Path(__file__).parent / "assets" / "source_template.png",
    Path(__file__).parent.parent.parent / "model.png",
    Path(__file__).parent / "model.png",
]
OUT = Path(__file__).parent / "assets" / "template_overlay.png"
OUT_SIZE = 1080
HOLE_RGB = (40, 40, 40)
TOL = 10


def find_src() -> Path:
    for p in SRC_CANDIDATES:
        if p.exists():
            return p
    raise SystemExit(f"model.png not found in: {[str(p) for p in SRC_CANDIDATES]}")


def main():
    src = find_src()
    im = Image.open(src).convert("RGB")
    W, H = im.size
    arr = np.array(im).astype(int)
    dist = np.abs(arr - np.array(HOLE_RGB)).max(2)
    hole = (dist <= TOL)

    # Remove the scattered tiny decorative specks (also #282828) via a
    # morphological opening, leaving only the large contiguous car hole.
    holeL = Image.fromarray(np.where(hole, 255, 0).astype("uint8"), "L")
    opened = holeL.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
    comp = np.array(opened) > 127

    alpha = np.where(comp, 0, 255).astype("uint8")  # 0 = transparent in the hole
    rgba = im.convert("RGBA")
    rgba.putalpha(Image.fromarray(alpha, "L"))

    rgba = rgba.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(OUT)

    a = np.array(rgba.split()[-1])
    ys, xs = np.where(a < 8)
    print(f"src={src}")
    print(f"Saved {OUT} ({OUT_SIZE}x{OUT_SIZE})")
    print(f"Hole bbox @ {OUT_SIZE}: x[{xs.min()}..{xs.max()}] y[{ys.min()}..{ys.max()}] "
          f"w={xs.max()-xs.min()+1} h={ys.max()-ys.min()+1}  pixels={len(xs)}")


if __name__ == "__main__":
    main()

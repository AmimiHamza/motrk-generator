"""
One-time prep: turn each raw template (model_<theme>.png, whose car area is a
solid #282828 fill) into a proper RGBA overlay where that car area is fully
transparent. Everything else (logo, gold frame, specs labels+icons, price box,
bottom bar, decorations) stays opaque.

Run:  ./.venv/Scripts/python.exe make_overlay.py
Output: assets/template_dark.png and assets/template_light.png (1080x1080 RGBA)

The car hole is found as the largest region of the #282828 fill (the diagonal
gold cut on the top-right corner is preserved automatically via the morphology).

The light template ships with a sample phone number ("3888 1234") baked into the
contact band; we erase it here so the generator can draw the real number on top.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ASSETS = Path(__file__).parent / "assets"
OUT_SIZE = 1080
HOLE_RGB = (40, 40, 40)  # #282828
TOL = 10

# (source model, output overlay, post-resize cleanup function or None)
TEMPLATES = [
    ("model_dark.png", "template_dark.png", None),
    ("model_light.png", "template_light.png", "clean_light_phone"),
]


def _carve_hole(im: Image.Image) -> Image.Image:
    """Return an RGBA copy of `im` with the #282828 car area made transparent."""
    rgb = im.convert("RGB")
    arr = np.array(rgb).astype(int)
    dist = np.abs(arr - np.array(HOLE_RGB)).max(2)
    hole = dist <= TOL

    # Drop scattered decorative specks (also #282828) via a morphological
    # opening, leaving only the large contiguous car hole.
    holeL = Image.fromarray(np.where(hole, 255, 0).astype("uint8"), "L")
    opened = holeL.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
    comp = np.array(opened) > 127

    alpha = np.where(comp, 0, 255).astype("uint8")  # 0 = transparent in the hole
    rgba = rgb.convert("RGBA")
    rgba.putalpha(Image.fromarray(alpha, "L"))
    return rgba


def clean_light_phone(rgba: Image.Image) -> Image.Image:
    """Erase the baked sample number from the light template's contact band by
    repainting the dark glyph pixels with each column's background color."""
    a = np.array(rgba)
    y0, y1, x0, x1 = 848, 888, 466, 690  # number bbox (1080-space); x0 sits in the icon/number gap
    region = a[y0:y1, x0:x1, :3].astype(int)
    gray = region.mean(2)
    dark = gray < 110
    # dilate the glyph mask a little to catch anti-aliased edges
    mask = Image.fromarray((dark * 255).astype("uint8")).filter(ImageFilter.MaxFilter(7))
    dark = np.array(mask) > 127
    for col in range(region.shape[1]):
        light = region[:, col][gray[:, col] > 180]
        bg = np.median(light, axis=0) if len(light) else np.array([243, 236, 228])
        region[:, col][dark[:, col]] = bg
    a[y0:y1, x0:x1, :3] = region.astype("uint8")
    return Image.fromarray(a)


def build(src_name: str, out_name: str, cleanup: str | None):
    src = ASSETS / src_name
    if not src.exists():
        raise SystemExit(f"{src} not found")
    rgba = _carve_hole(Image.open(src))
    rgba = rgba.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    if cleanup:
        rgba = globals()[cleanup](rgba)
    out = ASSETS / out_name
    rgba.save(out)

    a = np.array(rgba.split()[-1])
    ys, xs = np.where(a < 8)
    print(f"{src_name} -> {out_name} ({OUT_SIZE}x{OUT_SIZE})  "
          f"hole x[{xs.min()}..{xs.max()}] y[{ys.min()}..{ys.max()}] "
          f"w={xs.max()-xs.min()+1} h={ys.max()-ys.min()+1}")


def main():
    for src, out, cleanup in TEMPLATES:
        build(src, out, cleanup)


if __name__ == "__main__":
    main()

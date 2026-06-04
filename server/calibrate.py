"""Calibration helper for the specs panel.

Outputs two images (cropped to the specs panel and enlarged 3x so pixels are
readable):

  calib_grid.png    template + a 10px red grid; labels every 50px show the REAL
                    canvas X (top) and Y (left). Read the X where the white
                    labels' right edge sits.
  calib_values.png  a normal render so you can see where the gold values land
                    relative to the white labels.

Run: .venv\\Scripts\\python calibrate.py
"""
from PIL import Image, ImageDraw, ImageFont
import config, generator

# Specs-panel crop window on the 1080 canvas, and zoom factor.
X0, Y0, X1, Y1 = 748, 338, 1014, 780
S = 3

FONT = ImageFont.truetype(str(generator.ASSETS / "fonts" / "Assistant-Bold.ttf"), 13)


def _panel_base() -> Image.Image:
    """Template composited on the navy background (RGB), full 1080 canvas."""
    overlay, _ = generator._load_overlay(config.DEFAULT_THEME)
    base = Image.new("RGB", (config.CANVAS, config.CANVAS), config.NAVY_BG)
    base.paste(overlay, (0, 0), overlay)
    return base


def _crop_zoom(img: Image.Image) -> Image.Image:
    crop = img.crop((X0, Y0, X1, Y1))
    return crop.resize((crop.width * S, crop.height * S), Image.NEAREST)


def make_grid():
    big = _crop_zoom(_panel_base()).convert("RGB")
    d = ImageDraw.Draw(big)
    W, H = big.size

    # vertical lines every 10px (canvas), brighter + labelled every 50px
    x = (X0 // 10) * 10
    while x <= X1:
        sx = (x - X0) * S
        if 0 <= sx < W:
            major = x % 50 == 0
            d.line([(sx, 0), (sx, H)], fill=(255, 60, 60) if major else (90, 30, 30), width=1)
            if major:
                d.text((sx + 2, 2), str(x), fill=(255, 220, 0), font=FONT)
                d.text((sx + 2, H - 18), str(x), fill=(255, 220, 0), font=FONT)
        x += 10

    # horizontal lines every 10px, labelled every 50px
    y = (Y0 // 10) * 10
    while y <= Y1:
        sy = (y - Y0) * S
        if 0 <= sy < H:
            major = y % 50 == 0
            d.line([(0, sy), (W, sy)], fill=(255, 60, 60) if major else (90, 30, 30), width=1)
            if major:
                d.text((2, sy + 1), str(y), fill=(0, 230, 255), font=FONT)
        y += 10

    big.save("calib_grid.png")
    print("wrote calib_grid.png", big.size, "| crop x[%d..%d] y[%d..%d] zoom %dx"
          % (X0, X1, Y0, Y1, S))


def make_values():
    hx, hy, hw, hh = generator.get_hole()
    car = Image.new("RGB", (hw, hh), (70, 80, 95))
    data = dict(config.TEST_DATA)
    data.update(model="2026", brand="هونداي", category="توسان",
                engine="6 سلندر", transmission="أوتوماتيك", fuel="بترول", color="أسود")
    png = generator.generate(data, car, crop=dict(x=0, y=0, width=hw, height=hh))
    open("_full_values.png", "wb").write(png)
    img = Image.open("_full_values.png").convert("RGB")
    _crop_zoom(img).save("calib_values.png")
    print("wrote calib_values.png")


if __name__ == "__main__":
    make_grid()
    make_values()

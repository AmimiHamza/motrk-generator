"""3-layer compositing: car photo -> template overlay -> dynamic text."""
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

import config
from text_renderer import draw_text, get_font

OVERLAY_PATH = Path(__file__).parent / "assets" / "template_overlay.png"

_overlay = None
_hole = None  # (x, y, w, h)


def _load_overlay():
    global _overlay, _hole
    if _overlay is not None:
        return
    if not OVERLAY_PATH.exists():
        raise FileNotFoundError(
            f"{OVERLAY_PATH} missing — run `python make_overlay.py` first."
        )
    ov = Image.open(OVERLAY_PATH).convert("RGBA")
    if ov.size != (config.CANVAS, config.CANVAS):
        ov = ov.resize((config.CANVAS, config.CANVAS), Image.LANCZOS)
    _overlay = ov
    a = np.array(ov.split()[-1])
    ys, xs = np.where(a < 8)
    if len(xs):
        _hole = (int(xs.min()), int(ys.min()),
                 int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1))
    else:
        f = config.CAR_AREA_FALLBACK
        _hole = (f["x"], f["y"], f["width"], f["height"])


def get_hole():
    _load_overlay()
    return _hole


def _cover_resize(img: Image.Image, w: int, h: int) -> Image.Image:
    """Resize+center-crop so img fully covers a w x h box (object-fit: cover)."""
    img = img.convert("RGB")
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    nw, nh = max(1, round(sw * scale)), max(1, round(sh * scale))
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return img.crop((left, top, left + w, top + h))


def _apply_crop(img: Image.Image, crop: dict | None) -> Image.Image:
    """Apply the react-easy-crop pixel rectangle, if provided."""
    if not crop:
        return img
    try:
        x = int(crop["x"]); y = int(crop["y"])
        w = int(crop["width"]); h = int(crop["height"])
    except (KeyError, TypeError, ValueError):
        return img
    if w <= 0 or h <= 0:
        return img
    x = max(0, x); y = max(0, y)
    return img.crop((x, y, x + w, y + h))


def _draw_price_and_currency(draw: ImageDraw.ImageDraw, data: dict):
    """Price + currency live in one box. The currency is baked into the template,
    so erase it first, then render dynamically. With no price, show a longer
    placeholder (auto-fit to a smaller size) and no currency."""
    pcfg = config.TEXT["price"]
    price = str(data.get("price", "") or "").strip()

    # Erase the baked-in "دينار بحريني" so a different (or no) currency can show.
    draw.rectangle(config.CURRENCY_COVER, fill=config.PRICE_BOX_BG)

    if price:
        draw_text(draw, price, x=pcfg["x"], y=pcfg["y"], font=pcfg["font"],
                  size=pcfg["size"], color=pcfg["color"], anchor=pcfg["anchor"],
                  arabic=pcfg["arabic"], max_width=pcfg.get("max_width"))
        c = config.CURRENCY
        draw_text(draw, data.get("currency", ""), x=c["x"], y=c["y"],
                  font=c["font"], size=c["size"], color=c["color"],
                  anchor=c["anchor"], arabic=c["arabic"], max_width=c["max_width"])
    else:
        draw_text(draw, config.PRICE_DEFAULT_TEXT, x=pcfg["x"], y=pcfg["y"],
                  font=config.PRICE_DEFAULT_FONT, size=config.PRICE_DEFAULT_SIZE,
                  color=pcfg["color"], anchor="mm", arabic=True,
                  max_width=config.PRICE_DEFAULT_MAX_W)


def _draw_all_text(canvas: Image.Image, data: dict):
    draw = ImageDraw.Draw(canvas)

    for key, cfg in config.TEXT.items():
        if key == "price":
            continue  # price + currency are handled together below
        draw_text(draw, data.get(key, ""), x=cfg["x"], y=cfg["y"],
                  font=cfg["font"], size=cfg["size"], color=cfg["color"],
                  anchor=cfg["anchor"], arabic=cfg["arabic"],
                  max_width=cfg.get("max_width"))

    _draw_price_and_currency(draw, data)

    for spec_key, y in config.SPEC_ROWS.items():
        draw_text(draw, data.get(spec_key, ""), x=config.SPEC_VALUE_RIGHT_X, y=y,
                  font=config.SPEC_VALUE_FONT, size=config.SPEC_VALUE_SIZE,
                  color=config.GOLD_VALUE, anchor="rm", arabic=True,
                  max_width=config.SPEC_VALUE_MAX_W)


def _draw_calibration(canvas: Image.Image):
    """Overlay a coordinate grid + slot markers for tuning positions."""
    draw = ImageDraw.Draw(canvas, "RGBA")
    for v in range(0, config.CANVAS + 1, 60):
        c = (255, 0, 0, 90) if v % 120 == 0 else (255, 255, 255, 40)
        draw.line([(v, 0), (v, config.CANVAS)], fill=c, width=1)
        draw.line([(0, v), (config.CANVAS, v)], fill=c, width=1)
        draw.text((v + 2, 2), str(v), fill=(255, 80, 80, 200))
        draw.text((2, v + 2), str(v), fill=(255, 80, 80, 200))
    # mark spec value right edge + row centers
    rx = config.SPEC_VALUE_RIGHT_X
    for y in config.SPEC_ROWS.values():
        draw.line([(rx - 250, y), (rx, y)], fill=(0, 255, 0, 160), width=1)
        draw.ellipse([rx - 3, y - 3, rx + 3, y + 3], fill=(0, 255, 0, 220))
    for cfg in config.TEXT.values():
        x, y = cfg["x"], cfg["y"]
        draw.ellipse([x - 4, y - 4, x + 4, y + 4], outline=(0, 200, 255, 255), width=2)


def generate(data: dict, image: Image.Image | None, crop: dict | None = None,
             *, calibrate: bool = False) -> bytes:
    _load_overlay()
    hx, hy, hw, hh = _hole

    canvas = Image.new("RGBA", (config.CANVAS, config.CANVAS), (*config.NAVY_BG, 255))

    if image is not None:
        car = _apply_crop(image, crop)
        car = _cover_resize(car, hw, hh)
        canvas.paste(car, (hx, hy))

    canvas.alpha_composite(_overlay)

    _draw_all_text(canvas, data)

    if calibrate:
        _draw_calibration(canvas)

    final = Image.new("RGB", (config.CANVAS, config.CANVAS), config.NAVY_BG)
    final.paste(canvas, (0, 0), canvas)

    buf = io.BytesIO()
    final.save(buf, format="PNG")
    return buf.getvalue()


def load_image(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes))

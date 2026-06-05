"""3-layer compositing: car photo -> template overlay -> dynamic text."""
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

import config
from text_renderer import draw_text, get_font

ASSETS = Path(__file__).parent / "assets"

# theme -> (overlay RGBA image, hole bbox (x, y, w, h)), cached after first load.
_overlays: dict[str, tuple] = {}


def _load_overlay(theme: str = config.DEFAULT_THEME):
    if theme not in config.THEME_COLORS:
        theme = config.DEFAULT_THEME
    if theme in _overlays:
        return _overlays[theme]

    path = ASSETS / f"template_{theme}.png"
    if not path.exists():
        raise FileNotFoundError(
            f"{path} missing — run `python make_overlay.py` first."
        )
    ov = Image.open(path).convert("RGBA")
    if ov.size != (config.CANVAS, config.CANVAS):
        ov = ov.resize((config.CANVAS, config.CANVAS), Image.LANCZOS)

    a = np.array(ov.split()[-1])
    ys, xs = np.where(a < 8)
    if len(xs):
        hole = (int(xs.min()), int(ys.min()),
                int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1))
    else:
        f = config.CAR_AREA_FALLBACK
        hole = (f["x"], f["y"], f["width"], f["height"])

    _overlays[theme] = (ov, hole)
    return _overlays[theme]


def get_hole(theme: str = config.DEFAULT_THEME):
    return _load_overlay(theme)[1]


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


def _format_price(value) -> str:
    """Add thousands separators to a numeric price (35000 -> 35,000). Non-numeric
    placeholders (e.g. 'بعد المعاينة') are returned unchanged."""
    s = str(value or "").strip()
    digits = s.replace(",", "").replace(" ", "")
    return f"{int(digits):,}" if digits.isdigit() else s


def _format_phone(value) -> str:
    """Group the owner's phone digits in 4s with a space (38881234 -> 3888 1234)."""
    s = str(value or "").strip()
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) < 5:
        return s
    return " ".join(digits[i:i + 4] for i in range(0, len(digits), 4))


def _draw_price_and_currency(draw: ImageDraw.ImageDraw, data: dict, colors: dict):
    """Price + currency live in one box. With no price, show a longer placeholder
    (auto-fit to a smaller size) and no currency line."""
    pcfg = config.TEXT["price"]
    price = str(data.get("price", "") or "").strip()

    if price:
        draw_text(draw, price, x=pcfg["x"], y=pcfg["y"], font=pcfg["font"],
                  size=pcfg["size"], color=colors["price"], anchor=pcfg["anchor"],
                  arabic=pcfg["arabic"], max_width=pcfg.get("max_width"))
        c = config.CURRENCY
        draw_text(draw, data.get("currency", ""), x=c["x"], y=c["y"],
                  font=c["font"], size=c["size"], color=colors[c["color_key"]],
                  anchor=c["anchor"], arabic=c["arabic"], max_width=c["max_width"])
    else:
        draw_text(draw, config.PRICE_DEFAULT_TEXT, x=pcfg["x"], y=pcfg["y"],
                  font=config.PRICE_DEFAULT_FONT, size=config.PRICE_DEFAULT_SIZE,
                  color=colors["price"], anchor="mm", arabic=True,
                  max_width=config.PRICE_DEFAULT_MAX_W)


def _draw_all_text(canvas: Image.Image, data: dict, theme: str):
    draw = ImageDraw.Draw(canvas)
    colors = config.THEME_COLORS[theme]

    # Default formatting: thousands comma on price, 4-digit grouping on phone.
    data = {
        **data,
        "price": _format_price(data.get("price", "")),
        "phone": _format_phone(data.get("phone", "")),
    }

    for key, cfg in config.TEXT.items():
        if key == "price":
            continue  # price + currency are handled together below
        draw_text(draw, data.get(key, ""), x=cfg["x"], y=cfg["y"],
                  font=cfg["font"], size=cfg["size"], color=colors[cfg["color_key"]],
                  anchor=cfg["anchor"], arabic=cfg["arabic"],
                  max_width=cfg.get("max_width"))

    _draw_price_and_currency(draw, data, colors)

    lx = config.SPEC_VALUE_LEFT_X
    spec_max_w = config.SPEC_VALUE_RIGHT_BOUND - lx
    for spec_key, cy in config.SPEC_ROWS.items():
        draw_text(draw, data.get(spec_key, ""), x=lx, y=cy,
                  font=config.SPEC_VALUE_FONT, size=config.SPEC_VALUE_SIZE,
                  color=colors["spec_value"], anchor="lm", arabic=True,
                  max_width=spec_max_w, min_size=config.SPEC_VALUE_MIN_SIZE)


def _restyle_footer(canvas: Image.Image, theme: str):
    """Restyle the baked footer (client requests 7a/7b/7c): redraw the CTA line in
    a stylish font, the contact phone bigger+bold, and both dividers gold. The
    footer interior is a flat dark band, so covering + redrawing is seamless."""
    draw = ImageDraw.Draw(canvas)
    bg = config.FOOTER_BG.get(theme, config.FOOTER_BG["dark"])

    # cover the two static text bits with the footer background
    for cfg in config.FOOTER.values():
        draw.rectangle(cfg["cover"], fill=(*bg, 255))

    # paint both vertical dividers gold (also restores any covered top edge)
    y0, y1 = config.FOOTER_DIVIDER_Y
    for x0, x1 in config.FOOTER_DIVIDERS:
        draw.rectangle((x0, y0, x1, y1), fill=config.FOOTER_DIVIDER_COLOR)

    # redraw the text
    for cfg in config.FOOTER.values():
        draw_text(draw, cfg["text"], x=cfg["x"], y=cfg["y"], font=cfg["font"],
                  size=cfg["size"], color=config.WHITE, anchor="mm",
                  arabic=cfg["arabic"], max_width=cfg.get("max_width"))


def _draw_calibration(canvas: Image.Image):
    """Overlay a coordinate grid + slot markers for tuning positions."""
    draw = ImageDraw.Draw(canvas, "RGBA")
    for v in range(0, config.CANVAS + 1, 60):
        c = (255, 0, 0, 90) if v % 120 == 0 else (255, 255, 255, 40)
        draw.line([(v, 0), (v, config.CANVAS)], fill=c, width=1)
        draw.line([(0, v), (config.CANVAS, v)], fill=c, width=1)
        draw.text((v + 2, 2), str(v), fill=(255, 80, 80, 200))
        draw.text((2, v + 2), str(v), fill=(255, 80, 80, 200))
    # mark the shared value left edge (anchor line) + max-width extent
    lx = config.SPEC_VALUE_LEFT_X
    for cy in config.SPEC_ROWS.values():
        draw.line([(lx, cy), (config.SPEC_VALUE_RIGHT_BOUND, cy)], fill=(0, 255, 0, 160), width=1)
        draw.ellipse([lx - 3, cy - 3, lx + 3, cy + 3], fill=(0, 255, 0, 220))
    for cfg in config.TEXT.values():
        x, y = cfg["x"], cfg["y"]
        draw.ellipse([x - 4, y - 4, x + 4, y + 4], outline=(0, 200, 255, 255), width=2)


def generate(data: dict, image: Image.Image | None, crop: dict | None = None,
             *, theme: str = config.DEFAULT_THEME, calibrate: bool = False) -> bytes:
    if theme not in config.THEME_COLORS:
        theme = config.DEFAULT_THEME
    overlay, (hx, hy, hw, hh) = _load_overlay(theme)

    canvas = Image.new("RGBA", (config.CANVAS, config.CANVAS), (*config.NAVY_BG, 255))

    if image is not None:
        car = _apply_crop(image, crop)
        car = _cover_resize(car, hw, hh)
        canvas.paste(car, (hx, hy))

    canvas.alpha_composite(overlay)

    _draw_all_text(canvas, data, theme)
    _restyle_footer(canvas, theme)

    if calibrate:
        _draw_calibration(canvas)

    final = Image.new("RGB", (config.CANVAS, config.CANVAS), config.NAVY_BG)
    final.paste(canvas, (0, 0), canvas)

    buf = io.BytesIO()
    final.save(buf, format="PNG")
    return buf.getvalue()


def load_image(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes))

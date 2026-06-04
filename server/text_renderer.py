"""Arabic-aware text drawing helpers built on Pillow.

Pillow here has no raqm/HarfBuzz, so we shape Arabic ourselves with
arabic-reshaper (-> Presentation Forms-B) + python-bidi. Modern fonts like
Tajawal don't map every FExx presentation codepoint (notably the *isolated*
alef U+FE8D and yeh U+FEF1 — Unicode expects the base letter for those), so any
reshaped glyph the font is missing is remapped to its base form, which is
visually identical and present in the font.
"""
import unicodedata
from functools import lru_cache
from pathlib import Path

from PIL import ImageFont
from fontTools.ttLib import TTFont
import arabic_reshaper
from bidi.algorithm import get_display

import config

FONT_DIR = Path(__file__).parent / "assets" / "fonts"

_reshaper = arabic_reshaper.ArabicReshaper(
    configuration={"delete_harakat": False, "support_ligatures": True}
)


@lru_cache(maxsize=8)
def _font_cmap(file_name: str) -> frozenset:
    tt = TTFont(str(FONT_DIR / file_name))
    return frozenset(tt.getBestCmap().keys())


@lru_cache(maxsize=256)
def get_font(font_key: str, size: int) -> ImageFont.FreeTypeFont:
    file_name, variation = config.FONTS[font_key]
    font = ImageFont.truetype(str(FONT_DIR / file_name), size)
    if variation:
        try:
            font.set_variation_by_name(variation)
        except Exception:
            pass
    return font


def _base_form(ch: str) -> str:
    """Strip a presentation form down to a base char present-ish in the font."""
    decomp = unicodedata.decomposition(ch)
    if not decomp:
        return ch
    parts = [p for p in decomp.split() if not p.startswith("<")]
    if not parts:
        return ch
    # use the last code point (the actual letter for <isolated>/<final> etc.)
    return chr(int(parts[-1], 16))


def _fallback_missing(text: str, font_key: str) -> str:
    file_name = config.FONTS[font_key][0]
    cmap = _font_cmap(file_name)
    out = []
    for ch in text:
        if ord(ch) in cmap or ch in ("‏", "‎", " "):
            out.append(ch)
        else:
            out.append(_base_form(ch))
    return "".join(out)


def shape_arabic(text: str, font_key: str) -> str:
    reshaped = _reshaper.reshape(text)
    reshaped = _fallback_missing(reshaped, font_key)
    return get_display(reshaped)


def _fit_size(draw, shaped, font_key, size, min_size, max_width):
    """Largest size in [min_size, size] whose shaped text fits max_width."""
    size = int(size)
    for s in range(size, int(min_size) - 1, -1):
        if draw.textlength(shaped, font=get_font(font_key, s)) <= max_width:
            return s
    return int(min_size)


def _truncate(draw, raw, font_key, font, max_width, arabic):
    """Drop trailing (logical) characters + append … until it fits at min size.
    For RTL text the dropped chars are on the visual left, where overflow occurs."""
    def shaped(t):
        return shape_arabic(t, font_key) if arabic else t

    chars = list(str(raw))
    while chars:
        chars.pop()
        cand = shaped("".join(chars).rstrip() + "…")
        if draw.textlength(cand, font=font) <= max_width:
            return cand
    return shaped("…")


def draw_text(draw, text, *, x, y, font, size, color, anchor="rm",
              arabic=False, max_width=None, min_size=12):
    if text is None or str(text).strip() == "":
        return
    raw = str(text)
    shaped = shape_arabic(raw, font) if arabic else raw

    if max_width:
        s = _fit_size(draw, shaped, font, size, min_size, max_width)
        ft = get_font(font, s)
        # Even at the minimum size it may still be too wide -> truncate with …
        if draw.textlength(shaped, font=ft) > max_width:
            shaped = _truncate(draw, raw, font, ft, max_width, arabic)
    else:
        ft = get_font(font, size)

    draw.text((x, y), shaped, font=ft, fill=color, anchor=anchor)

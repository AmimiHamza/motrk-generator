"""
Layout configuration for the MOTRK listing generator.

All coordinates are on the 1080x1080 output canvas. Text is placed with Pillow
anchors (https://pillow.readthedocs.io/en/stable/handbook/text-anchors.html):
  "rm" = right / vertical-middle   (used for right-aligned RTL Arabic + RTL digits)
  "mm" = center / vertical-middle

Two templates share this layout: `dark` and `light`. Positions/fonts are
identical for both; only the overlay PNG and the text COLORS change (see
THEME_COLORS). Tweak with the /api/test?theme=light calibration image until each
value lands in its slot.
"""

CANVAS = 1080
GOLD = "#d8b54f"
GOLD_VALUE = "#e3c25c"
WHITE = "#ffffff"
DARK_TEXT = "#15233c"  # dark navy, for text on the light background / contact band
NAVY_BG = (10, 22, 40)

DEFAULT_THEME = "dark"

# Per-theme text colors, keyed by the `color_key` on each text element below.
# The specs panel, price box and currency line sit on the SAME dark navy panel
# in both themes, so spec_value / price / currency / phone don't change between
# them — only the car name / year / tagline (which sit on the main background).
THEME_COLORS = {
    "dark": {
        "car_name": WHITE,
        "year": GOLD,
        "tagline": WHITE,
        "spec_value": GOLD_VALUE,
        "price": GOLD,
        "currency": WHITE,
        "phone": DARK_TEXT,
    },
    "light": {
        "car_name": DARK_TEXT,
        "year": DARK_TEXT,
        "tagline": DARK_TEXT,
        "spec_value": GOLD_VALUE,
        "price": GOLD,
        "currency": WHITE,
        "phone": DARK_TEXT,
    },
}

# Font keys -> (file, variable-weight-name or None)
FONTS = {
    "taj-regular": ("Tajawal-Regular.ttf", None),
    "taj-bold": ("Tajawal-Bold.ttf", None),
    "taj-extra": ("Tajawal-ExtraBold.ttf", None),
    "mont-bold": ("Montserrat-VF.ttf", "Bold"),
    "mont-extra": ("Montserrat-VF.ttf", "ExtraBold"),
}

# Right edge that the specs values right-align to, and per-row vertical centers.
# Labels (baked in the overlay) right-align at x~965; values sit ~33px below each.
SPEC_VALUE_RIGHT_X = 962
SPEC_VALUE_FONT = "taj-bold"
SPEC_VALUE_SIZE = 24
SPEC_VALUE_MAX_W = 185

# value vertical center per spec row (label_center + ~33)
SPEC_ROWS = {
    "model": 394,
    "brand": 458,
    "category": 502,
    "engine": 563,
    "transmission": 620,
    "fuel": 677,
    "color": 741,
}

# Single-element text fields.
# Each: (x, y, font_key, size, color_key, anchor, arabic, max_width)
TEXT = {
    "car_name_en": dict(x=1030, y=112, font="mont-extra", size=56, color_key="car_name",
                        anchor="rm", arabic=False, max_width=560),
    "year": dict(x=861, y=185, font="mont-extra", size=58, color_key="year",
                 anchor="rm", arabic=False, max_width=180),
    "tagline": dict(x=1028, y=270, font="taj-bold", size=32, color_key="tagline",
                    anchor="rm", arabic=True, max_width=470),
    "price": dict(x=190, y=838, font="taj-extra", size=52, color_key="price",
                  anchor="mm", arabic=False, max_width=290),
    "phone": dict(x=602, y=882, font="taj-bold", size=46, color_key="phone",
                  anchor="mm", arabic=False, max_width=320),
}

# Price box: when no price is entered, show this placeholder instead of a number.
# It is longer than a price, so it auto-fits to a smaller size (see PRICE_DEFAULT_*).
PRICE_DEFAULT_TEXT = "السعر بعد المعاينة"
PRICE_DEFAULT_FONT = "taj-bold"
PRICE_DEFAULT_SIZE = 40
PRICE_DEFAULT_MAX_W = 230

# Currency line inside the price box (drawn dynamically; nothing is baked here).
# Skipped entirely when the price is empty.
CURRENCY = dict(x=178, y=867, font="taj-bold", size=30, color_key="currency",
                anchor="mm", arabic=True, max_width=230)

# Car hole is read from the overlay's alpha bbox at runtime; this is only a fallback.
CAR_AREA_FALLBACK = dict(x=0, y=294, width=793, height=487)

# Dummy data for the calibration / test render.
TEST_DATA = {
    "car_name_en": "HYUNDAI SONATA",
    "year": "2019",
    "tagline": "ريق الأساطير لا يندثر",
    "model": "2011",
    "brand": "هونداي",
    "category": "سوناتا",
    "engine": "4 سلندر",
    "transmission": "اوتوماتيك",
    "fuel": "بترول",
    "color": "اسود",
    "price": "6,700",
    "currency": "دينار بحريني",
    "phone": "37777840",
}

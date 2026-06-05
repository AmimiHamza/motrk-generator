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
        "price": WHITE,
        "currency": WHITE,
        "phone": DARK_TEXT,
    },
    "light": {
        "car_name": DARK_TEXT,
        "year": DARK_TEXT,
        "tagline": DARK_TEXT,
        "spec_value": GOLD_VALUE,
        "price": WHITE,
        "currency": WHITE,
        "phone": DARK_TEXT,
    },
}

# Font keys -> (file, variable-weight-name or None).
# Arabic = Tajawal; Latin (English/French letters + digits) = Assistant.
FONTS = {
    "taj-regular": ("Tajawal-Regular.ttf", None),
    "taj-medium": ("Tajawal-Medium.ttf", None),
    "taj-bold": ("Tajawal-Bold.ttf", None),
    "taj-extra": ("Tajawal-ExtraBold.ttf", None),
    "asst-bold": ("Assistant-Bold.ttf", None),
    "asst-extra": ("Assistant-ExtraBold.ttf", None),
    "asst-semibold": ("Assistant-SemiBold.ttf", None),
    "cairo-bold": ("Cairo-VF.ttf", "Bold"),
}

SPEC_VALUE_FONT = "taj-bold"
SPEC_VALUE_SIZE = 18       # medium; shrinks if a value is too wide
SPEC_VALUE_MIN_SIZE = 15   # never smaller than this (then truncate with …)
# The baked white labels are LEFT-aligned: every label's left edge sits at x~816
# (their right edges vary only because the words differ in length). In RTL that
# left edge is where each word "ends" (its last letter), so each gold value is
# LEFT-aligned to the same line — value left edge under label left edge.
SPEC_VALUE_LEFT_X = 816    # the shared vertical line (anchor "lm")
SPEC_VALUE_RIGHT_BOUND = 911  # don't run into the icons; max width = bound - left

# value vertical center per spec row (left edge = SPEC_VALUE_LEFT_X, anchor "lm")
SPEC_ROWS = {
    "model": 411,
    "brand": 457,
    "category": 510,
    "engine": 568,
    "transmission": 627,
    "fuel": 688,
    "color": 748,
}

# Single-element text fields.
# Each: (x, y, font_key, size, color_key, anchor, arabic, max_width)
TEXT = {
    "car_name_en": dict(x=1030, y=112, font="asst-extra", size=66, color_key="car_name",
                        anchor="rm", arabic=False, max_width=560),
    "year": dict(x=861, y=188, font="asst-extra", size=70, color_key="year",
                 anchor="rm", arabic=False, max_width=180),
    "tagline": dict(x=1028, y=284, font="taj-bold", size=32, color_key="tagline",
                    anchor="rm", arabic=True, max_width=470),
    "price": dict(x=190, y=830, font="taj-extra", size=56, color_key="price",
                  anchor="mm", arabic=False, max_width=290),
    "phone": dict(x=560, y=882, font="taj-bold", size=46, color_key="phone",
                  anchor="mm", arabic=False, max_width=300),
}

# Price box: when no price is entered, show this placeholder instead of a number.
# It is longer than a price, so it auto-fits to a smaller size (see PRICE_DEFAULT_*).
PRICE_DEFAULT_TEXT = "السعر بعد المعاينة"
PRICE_DEFAULT_FONT = "taj-bold"
PRICE_DEFAULT_SIZE = 40
PRICE_DEFAULT_MAX_W = 230

# Currency line inside the price box (drawn dynamically; nothing is baked here).
# Skipped entirely when the price is empty.
CURRENCY = dict(x=178, y=866, font="taj-bold", size=26, color_key="currency",
                anchor="mm", arabic=True, max_width=230)

# ---- Footer restyle (drawn on top of the baked footer; template file unchanged) ----
# The footer (CTA line, contact items, separators) is baked into the template PNG.
# Its interior is a uniform dark navy, so we cover the two static text bits and the
# gray separator and redraw them with the styling the client asked for.
FOOTER_BG = {"dark": (7, 23, 36), "light": (4, 4, 4)}  # footer interior per theme
# Only 7b is applied in code: the contact phone is redrawn bigger + bold over the
# baked footer. 7a (CTA font) and 7c (gold separator) were reverted — those are
# kept as-is in the template and styled in Photoshop.
FOOTER = {
    "phone": dict(text="+973 3973 9784", x=580, y=1018, font="asst-extra",
                  size=27, arabic=False, max_width=236, cover=(480, 1004, 672, 1033)),
}

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

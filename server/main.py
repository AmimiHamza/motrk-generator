"""MOTRK cars4sale — FastAPI image generation backend (layer compositing)."""
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, ImageColor

import config
import generator

app = FastAPI(title="MOTRK Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health(theme: str = "dark"):
    return {"ok": True, "hole": generator.get_hole(theme)}


@app.post("/api/generate")
async def generate(
    image: UploadFile = File(...),
    car_name_en: str = Form(...),
    year: str = Form(...),
    model: str = Form(...),
    brand: str = Form(...),
    category: str = Form(...),
    engine: str = Form(...),
    transmission: str = Form(...),
    fuel: str = Form(...),
    color: str = Form(...),
    price: str = Form(...),
    currency: str = Form("دينار بحريني"),
    phone: str = Form(...),
    tagline: str = Form(""),
    theme: str = Form("dark"),
    crop_x: float = Form(0),
    crop_y: float = Form(0),
    crop_width: float = Form(0),
    crop_height: float = Form(0),
    crop_mode: str = Form("horizontal"),
):
    raw = await image.read()
    try:
        img = generator.load_image(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    data = dict(
        car_name_en=car_name_en, year=year, tagline=tagline,
        model=model, brand=brand, category=category, engine=engine,
        transmission=transmission, fuel=fuel, color=color,
        price=price, currency=currency, phone=phone,
    )
    crop = dict(x=crop_x, y=crop_y, width=crop_width, height=crop_height)
    png = generator.generate(data, img, crop, theme=theme)
    return Response(content=png, media_type="image/png")


@app.get("/api/test")
def test(grid: int = 0, theme: str = "dark"):
    """Calibration render: dummy data over a checkerboard 'car', optional grid."""
    hx, hy, hw, hh = generator.get_hole(theme)
    car = Image.new("RGB", (hw, hh), (60, 70, 85))
    # subtle checker so the car area is visible
    px = car.load()
    for yy in range(hh):
        for xx in range(0, hw, 1):
            if ((xx // 40) + (yy // 40)) % 2 == 0:
                px[xx, yy] = (74, 86, 104)
    png = generator.generate(config.TEST_DATA, car,
                             crop=dict(x=0, y=0, width=hw, height=hh),
                             theme=theme, calibrate=bool(grid))
    return Response(content=png, media_type="image/png")

# MOTRK cars4sale — Car Listing Image Generator

Generates branded 1080×1080 Instagram listing images for the **MOTRK cars4sale**
dealership (Bahrain). Fill a car form, upload + crop a photo, and download a
polished gold-on-navy listing card.

## Stack

- **client/** — React (Vite) + Tailwind, RTL Arabic UI, `react-easy-crop`
- **server/** — Express + Puppeteer; renders an HTML/CSS template to PNG

## Quick start

```bash
cd motrk-generator
npm install                # root (concurrently)
npm --prefix server install   # installs Puppeteer + downloads Chromium
npm --prefix client install
npm run dev                # runs server (3001) + client (5173) together
```

Then open http://localhost:5173

> First `server install` downloads a Chromium build for Puppeteer (~150 MB).

### Run separately

```bash
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173  (proxies /api -> 3001)
```

## How it works

1. **Step 1 — Form:** Arabic RTL form collects car specs, price, phone, optional tagline.
2. **Step 2 — Crop:** Upload a photo, pick **مستطيل (horizontal)** or **مربع (square)**,
   pan/zoom with `react-easy-crop`.
3. **Step 3 — Preview:** Frontend POSTs form data + cropped base64 image to
   `POST /api/generate`. The server injects values into
   [server/src/templates/render.js](server/src/templates/render.js), renders with
   Puppeteer at `deviceScaleFactor: 2`, and returns a crisp 1080×1080 PNG.

## Swapping the logo

The logo is a placeholder SVG in
[server/src/assets/logo.js](server/src/assets/logo.js). Replace `logoSvg` with the
client's real PNG, e.g.:

```js
export const logoSvg = `<img src="data:image/png;base64,..." style="width:100%;height:100%"/>`;
```

## Static / hardcoded elements

- Bottom footer bar (Instagram / WhatsApp / location) — always identical.
- Specs panel footer note — always present.
- "للبيع" badge, "المواصفات" header.

## Notes

- Fonts (Cairo / Tajawal / Montserrat) load from Google Fonts; Puppeteer waits for
  `document.fonts.ready` before screenshotting. For fully offline rendering, download
  the font files and `@font-face` them locally in the template.
- Square mode uses a 1:1 crop and a slightly narrower specs column.

## Phase 2 ideas

Background removal (rembg / Remove.bg), batch processing, WhatsApp bot, multiple
templates, client admin panel.

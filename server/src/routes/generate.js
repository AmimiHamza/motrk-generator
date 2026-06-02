import { Router } from "express";
import puppeteer from "puppeteer";
import { renderTemplate } from "../templates/render.js";

export const generateRouter = Router();

// Reuse a single browser across requests — launching is the slow part.
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

const REQUIRED = [
  "carNameEn",
  "year",
  "model",
  "brand",
  "category",
  "engine",
  "transmission",
  "fuel",
  "color",
  "price",
  "currency",
  "phone",
];

generateRouter.post("/", async (req, res) => {
  try {
    const data = req.body || {};

    const missing = REQUIRED.filter(
      (k) => !data[k] || String(data[k]).trim() === ""
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!data.carImage || !String(data.carImage).startsWith("data:image")) {
      return res.status(400).json({ error: "Missing or invalid carImage" });
    }

    const cropMode = data.cropMode === "square" ? "square" : "horizontal";
    const html = renderTemplate({ ...data, cropMode });

    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      await page.setViewport({
        width: 1080,
        height: 1080,
        deviceScaleFactor: 2,
      });
      await page.setContent(html, { waitUntil: "networkidle0" });
      // Ensure web fonts are fully loaded before screenshotting.
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      });
      const shot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1080, height: 1080 },
      });
      // Puppeteer v23 returns a Uint8Array; wrap in a Buffer so Express sends
      // raw bytes instead of JSON-serializing the typed array.
      const buffer = Buffer.from(shot);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } finally {
      await page.close();
    }
  } catch (err) {
    console.error("Generation failed:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

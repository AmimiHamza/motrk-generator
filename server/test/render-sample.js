// Smoke test: render the template to a PNG with sample data + a generated
// car photo, without needing the frontend. Run: node test/render-sample.js
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import puppeteer from "puppeteer";
import { renderTemplate } from "../src/templates/render.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// A simple gradient "car photo" placeholder as base64 PNG (1x1 scaled by cover).
const samplePhoto =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#dfe6ef'/><stop offset='1' stop-color='#9fb3c8'/>
       </linearGradient></defs>
       <rect width='800' height='500' fill='url(#g)'/>
       <text x='400' y='260' font-family='sans-serif' font-size='48' fill='#3a4a60'
         text-anchor='middle'>CAR PHOTO</text>
     </svg>`
  ).toString("base64");

const data = {
  carNameEn: "HYUNDAI SONATA",
  year: "2019",
  model: "2011",
  brand: "هونداي",
  category: "سوناتا",
  engine: "4 سلندر",
  transmission: "اوتوماتيك",
  fuel: "بترول",
  color: "اسود",
  price: "6,700",
  currency: "دينار بحريني",
  phone: "37777840",
  tagline: "ريق الأساطير لا يندثر",
  carImage: samplePhoto,
  cropMode: process.argv[2] === "square" ? "square" : "horizontal",
};

const html = renderTemplate(data);
writeFileSync(join(__dirname, "preview.html"), html);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
const out = join(__dirname, `sample-${data.cropMode}.png`);
await page.screenshot({
  path: out,
  clip: { x: 0, y: 0, width: 1080, height: 1080 },
});
await browser.close();
console.log("Wrote", out);

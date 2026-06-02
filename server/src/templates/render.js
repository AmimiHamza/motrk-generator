import { icons } from "./icons.js";
import { logoSvg } from "../assets/logo.js";

// Basic HTML escaping for injected user text.
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function specRow(icon, label, value) {
  return `
    <div class="spec-row">
      <div class="spec-text">
        <span class="spec-label">${esc(label)}</span>
        <span class="spec-value">${esc(value)}</span>
      </div>
      <div class="spec-icon">${icon}</div>
    </div>`;
}

export function renderTemplate(data) {
  const {
    carNameEn,
    year,
    model,
    brand,
    category,
    engine,
    transmission,
    fuel,
    color,
    price,
    currency,
    phone,
    tagline,
    carImage,
    cropMode,
  } = data;

  const specs = [
    specRow(icons.model, "الموديل", model),
    specRow(icons.brand, "الماركة", brand),
    specRow(icons.category, "الفئة", category),
    specRow(icons.engine, "المحرك", engine),
    specRow(icons.transmission, "ناقل الحركة", transmission),
    specRow(icons.fuel, "نوع الوقود", fuel),
    specRow(icons.color, "اللون", color),
  ].join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --navy: #0a1628;
    --navy2: #0d1b2a;
    --panel: rgba(13, 27, 42, 0.72);
    --bar: #0b1a30;
    --gold: #c8a84e;
    --gold-light: #f0d078;
    --gold-dark: #9c7c2e;
  }
  html, body { width: 1080px; height: 1080px; }
  body {
    font-family: 'Tajawal', 'Cairo', sans-serif;
    background: var(--navy);
    color: #fff;
    overflow: hidden;
    position: relative;
  }
  .gold-text {
    background: linear-gradient(180deg, var(--gold-light), var(--gold));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* ---------- canvas + background ---------- */
  .canvas {
    position: relative;
    width: 1080px;
    height: 1080px;
    background:
      radial-gradient(120% 90% at 85% 0%, #16243d 0%, rgba(22,36,61,0) 55%),
      linear-gradient(160deg, #0c1a2e 0%, #0a1628 60%, #081120 100%);
    overflow: hidden;
  }
  /* faint city skyline top-right */
  .skyline {
    position: absolute; top: 0; right: 0; width: 720px; height: 360px;
    opacity: 0.16; pointer-events: none;
  }
  /* dotted decorations */
  .dots {
    position: absolute; opacity: 0.5; pointer-events: none;
    background-image: radial-gradient(var(--gold) 1.4px, transparent 1.4px);
    background-size: 14px 14px;
  }
  .dots.tr { top: 36px; right: 40px; width: 120px; height: 70px; opacity: .35; }
  .dots.mr { top: 470px; right: 8px; width: 40px; height: 230px; opacity: .25; }
  .sparkle { position: absolute; color: var(--gold); opacity: .6; font-size: 22px; }

  /* ---------- header ---------- */
  .header {
    position: absolute; top: 40px; left: 44px; right: 44px;
    display: flex; align-items: flex-start; justify-content: space-between;
    direction: ltr; /* keep logo left, title right regardless of RTL canvas */
  }
  .logo { width: 200px; height: 200px; flex: none; filter: drop-shadow(0 4px 10px rgba(0,0,0,.4)); }
  .title-block { text-align: right; padding-top: 18px; max-width: 640px; }
  .title-row { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
  .car-name {
    font-family: 'Montserrat', sans-serif;
    font-weight: 900; font-size: 60px; line-height: 1.02;
    color: #fff; letter-spacing: 1px; text-transform: uppercase;
    direction: ltr; white-space: nowrap;
    text-shadow: 0 2px 8px rgba(0,0,0,.4);
  }
  .year-row { display: flex; align-items: center; justify-content: flex-end; gap: 14px; margin-top: 8px; }
  .year {
    font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 46px;
  }
  .badge-sale {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 6px 26px; border-radius: 10px;
    font-family: 'Tajawal', sans-serif; font-weight: 800; font-size: 30px;
    color: #15233c;
    background: linear-gradient(180deg, var(--gold-light), var(--gold) 70%, var(--gold-dark));
    box-shadow: 0 4px 12px rgba(0,0,0,.35);
    border: 1px solid #ffe9a8;
  }
  .tagline {
    margin-top: 14px; font-family: 'Cairo', sans-serif; font-weight: 600;
    font-size: 27px; color: #e7ecf3; text-align: right; direction: rtl;
  }

  /* ---------- body ---------- */
  .body {
    position: absolute; top: 300px; left: 44px; right: 44px; bottom: 110px;
    display: flex; gap: 22px; align-items: stretch;
    direction: ltr; /* image column left, specs column right */
  }
  .left-col { display: flex; flex-direction: column; gap: 18px; }
  .canvas.horizontal .left-col { flex: 1 1 600px; }
  .canvas.square .left-col { flex: 1 1 560px; }

  .car-frame {
    position: relative; flex: 1 1 auto; min-height: 0;
    border-radius: 16px; overflow: hidden;
    border: 2px solid var(--gold);
    box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 0 0 4px rgba(10,22,40,.6);
    background: #060d18;
  }
  .car-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* gold gradient line along the top edge */
  .car-frame::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 5px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold-light), var(--gold-dark));
    z-index: 2;
  }
  /* decorative diagonal cut top-right */
  .car-frame::after {
    content: ""; position: absolute; top: -2px; right: -2px;
    border-width: 0 64px 64px 0; border-style: solid;
    border-color: transparent var(--gold) transparent transparent;
    z-index: 2;
  }
  .diag-inner {
    position: absolute; top: 6px; right: 6px; width: 0; height: 0;
    border-width: 0 44px 44px 0; border-style: solid;
    border-color: transparent #0a1628 transparent transparent; z-index: 3;
  }

  .meta-row { display: flex; gap: 18px; align-items: stretch; height: 132px; flex: none; }
  .price-tag {
    flex: none; width: 240px;
    border-radius: 14px; border: 2px solid var(--gold);
    background: linear-gradient(160deg, #102036, #0a1628);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 6px 18px rgba(0,0,0,.4);
    padding: 8px;
  }
  .price-tag .lbl { font-family:'Cairo',sans-serif; font-weight:700; font-size: 22px; color:#dfe5ee; }
  .price-tag .num { font-family:'Montserrat',sans-serif; font-weight:900; font-size: 50px; line-height:1; margin: 2px 0; }
  .price-tag .cur { font-family:'Tajawal',sans-serif; font-weight:600; font-size: 21px; color:#fff; }
  .phone-box {
    flex: 1 1 auto; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 6px;
  }
  .phone-box .lbl { font-family:'Cairo',sans-serif; font-weight:700; font-size: 26px; color:#fff; direction: rtl; }
  .phone-line { display:flex; align-items:center; gap: 14px; direction: ltr; }
  .phone-line .ic { width: 40px; height: 40px; color: var(--gold); }
  .phone-line .num { font-family:'Montserrat',sans-serif; font-weight:800; font-size: 46px; color:#fff; letter-spacing:1px; }

  /* ---------- specs panel ---------- */
  .specs-col { flex: none; width: 392px; display: flex; flex-direction: column; }
  .canvas.square .specs-col { width: 360px; }
  .specs-header {
    text-align: center; font-family:'Tajawal',sans-serif; font-weight: 800; font-size: 32px;
    color: #15233c; padding: 10px 0; border-radius: 12px 12px 0 0;
    background: linear-gradient(180deg, var(--gold-light), var(--gold) 75%, var(--gold-dark));
    border: 1px solid #ffe9a8;
  }
  .specs-body {
    flex: 1 1 auto; display: flex; flex-direction: column;
    background: var(--panel); border: 1.5px solid var(--gold);
    border-top: none; border-radius: 0 0 12px 12px;
    padding: 4px 18px 12px; overflow: hidden;
  }
  .spec-row {
    display: flex; align-items: center; justify-content: flex-end; gap: 14px;
    flex: 1 1 0; min-height: 0;
    padding: 4px; border-bottom: 1px solid rgba(200,168,78,.28);
  }
  .spec-text { display: flex; flex-direction: column; align-items: flex-end; text-align: right; line-height: 1.18; direction: rtl; }
  .spec-label { font-family:'Tajawal',sans-serif; font-weight:700; font-size: 24px; color:#fff; }
  .spec-value { font-family:'Tajawal',sans-serif; font-weight:800; font-size: 23px; }
  .spec-icon { width: 38px; height: 38px; color: var(--gold); flex: none; }
  .specs-footer {
    margin-top: 10px; padding-top: 10px; border-top: 1.5px solid rgba(200,168,78,.5);
    font-family:'Tajawal',sans-serif; font-weight:700; font-size: 18px; line-height: 1.45;
    color: var(--gold); text-align: right; direction: rtl;
  }

  /* ---------- footer bar ---------- */
  .footer {
    position: absolute; left: 0; right: 0; bottom: 0; height: 110px;
    background: linear-gradient(180deg, #0c1c34, #081325);
    border-top: 2px solid var(--gold);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    padding: 6px 44px;
  }
  .footer .cta { font-family:'Cairo',sans-serif; font-weight:700; font-size: 25px; color:#fff; direction: rtl; }
  .footer .row { display: flex; align-items: center; gap: 18px; direction: ltr; }
  .footer .item { display: flex; align-items: center; gap: 10px; font-family:'Tajawal',sans-serif; font-weight:700; font-size: 23px; color:#fff; direction: ltr; }
  .footer .item .ic { width: 30px; height: 30px; color: var(--gold); }
  .footer .sep { width: 2px; height: 26px; background: linear-gradient(var(--gold-light), var(--gold-dark)); opacity:.8; }
</style>
</head>
<body>
  <div class="canvas ${cropMode}">
    <svg class="skyline" viewBox="0 0 720 360" preserveAspectRatio="xMaxYMin slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="#9fb8d6">
        <rect x="40" y="180" width="34" height="180"/><rect x="80" y="120" width="40" height="240"/>
        <rect x="126" y="200" width="28" height="160"/><rect x="160" y="90" width="46" height="270"/>
        <rect x="212" y="160" width="30" height="200"/><rect x="248" y="60" width="38" height="300"/>
        <rect x="292" y="140" width="34" height="220"/><rect x="332" y="110" width="44" height="250"/>
        <rect x="382" y="190" width="28" height="170"/><rect x="416" y="70" width="40" height="290"/>
        <rect x="462" y="150" width="32" height="210"/><rect x="500" y="100" width="46" height="260"/>
        <rect x="552" y="170" width="30" height="190"/><rect x="588" y="120" width="42" height="240"/>
        <rect x="636" y="200" width="30" height="160"/><rect x="672" y="150" width="34" height="210"/>
      </g>
    </svg>
    <div class="dots tr"></div>
    <div class="dots mr"></div>
    <div class="sparkle" style="top:300px; right:18px;">✦</div>
    <div class="sparkle" style="bottom:150px; left:24px; font-size:16px;">✦</div>

    <!-- header -->
    <div class="header">
      <div class="logo">${logoSvg}</div>
      <div class="title-block">
        <div class="title-row">
          <div class="car-name">${esc(carNameEn)}</div>
        </div>
        <div class="year-row">
          <div class="year gold-text">${esc(year)}</div>
          <div class="badge-sale">للبيع</div>
        </div>
        ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ""}
      </div>
    </div>

    <!-- body -->
    <div class="body">
      <div class="left-col">
        <div class="car-frame">
          <div class="diag-inner"></div>
          <img src="${carImage}" alt="car" />
        </div>
        <div class="meta-row">
          <div class="price-tag">
            <div class="lbl">السعر</div>
            <div class="num gold-text">${esc(price)}</div>
            <div class="cur">${esc(currency)}</div>
          </div>
          <div class="phone-box">
            <div class="lbl">رقم صاحب السيارة</div>
            <div class="phone-line">
              <div class="ic">${icons.phone}</div>
              <div class="num">${esc(phone)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="specs-col">
        <div class="specs-header">المواصفات</div>
        <div class="specs-body">
          ${specs}
          <div class="specs-footer">للمزيد من المواصفات التفصيلية، يرجى مراجعة التعليق/الكابشن ادناه.</div>
        </div>
      </div>
    </div>

    <!-- footer -->
    <div class="footer">
      <div class="cta">لعرض سيارتك عندي تواصل على</div>
      <div class="row">
        <div class="item"><div class="ic">${icons.instagram}</div><span>@motrk.cars4sale</span></div>
        <div class="sep"></div>
        <div class="item"><div class="ic">${icons.whatsapp}</div><span>+973 3300 1234</span></div>
        <div class="sep"></div>
        <div class="item"><div class="ic">${icons.location}</div><span>مملكة البحرين</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

import { useState } from "react";
import ThemeSelector from "./ThemeSelector.jsx";

const OTHER = "أخرى";

// Model years, newest first: 2030 down to 1960.
const YEARS = Array.from({ length: 2030 - 1960 + 1 }, (_, i) => 2030 - i);
const DEFAULT_YEAR = "2026";

const BRANDS = [
  "تويوتا", "هونداي", "نيسان", "بي إم دبليو", "مرسيدس", "كيا", "شيفروليه",
  "هوندا", "ميتسوبيشي", "لكزس", "فورد", "مازدا", "سوزوكي", "فولكس واجن",
  "أودي", "بورشه", "جيب", "لاند روفر", "جاغوار", "بنتلي", "رولز رويس",
  "فيراري", "لامبورغيني", OTHER,
];

// Categories / trims per brand.
const CATEGORIES = {
  "تويوتا": ["يارس", "كورولا", "كامري", "لاند كروزر", "برادو", "هايلكس", "فورتشنر", "أفالون", "راف فور", "سيكويا", "تاندرا", "C-HR", "راش", "إنوفا", "كراون"],
  "هونداي": ["سوناتا", "توسان", "إلنترا", "أكسنت", "سانتافي", "كريتا", "باليسيد", "فينيو", "كونا", "i10", "i20", "i30", "ستاريا"],
  "نيسان": ["ألتيما", "باترول", "صني", "سنترا", "إكس تريل", "كيكس", "جوك", "مكسيما", "نافارا", "باثفايندر"],
  "بي إم دبليو": ["سيريا 1", "سيريا 2", "سيريا 3", "سيريا 4", "سيريا 5", "سيريا 6", "سيريا 7", "سيريا 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7"],
  "مرسيدس": ["A كلاس", "C كلاس", "E كلاس", "S كلاس", "GLA", "GLB", "GLC", "GLE", "GLS", "G كلاس", "CLA", "CLS", "AMG GT"],
  "كيا": ["سبورتاج", "سيراتو", "K5", "سورينتو", "سيلتوس", "بيكانتو", "ستينجر", "كرنفال", "EV6", "نيرو"],
  "شيفروليه": ["ماليبو", "كابتيفا", "تاهو", "سوبربان", "سلفرادو", "تريل بليزر", "إكوينوكس", "كمارو", "كورفيت", "سبارك"],
  "هوندا": ["سيفيك", "أكورد", "CR-V", "HR-V", "بايلوت", "سيتي", "جاز", "أوديسي"],
  "ميتسوبيشي": ["لانسر", "باجيرو", "أوتلاندر", "ASX", "L200", "أتراج", "إكليبس كروس", "مونتيرو"],
  "لكزس": ["IS", "ES", "LS", "NX", "RX", "GX", "LX", "UX", "LC", "RC"],
  "فورد": ["فيوجن", "إكسبلورر", "إكسبيديشن", "رينجر", "فوكس", "إيدج", "برونكو", "F-150", "موستانج", "إسكيب"],
  "مازدا": ["مازدا 3", "مازدا 6", "CX-3", "CX-5", "CX-9", "CX-30", "MX-5"],
  "سوزوكي": ["سويفت", "فيتارا", "جيمني", "إرتيجا", "بالينو", "سياز", "ديزاير"],
  "فولكس واجن": ["جولف", "باسات", "تيغوان", "توارق", "جيتا", "أطلس", "بولو", "ID.4"],
  "أودي": ["A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron", "RS"],
  "بورشه": ["كايين", "ماكان", "باناميرا", "911", "تايكان", "بوكستر", "كايمان"],
  "جيب": ["رانجلر", "جراند شيروكي", "شيروكي", "كومباس", "رينيجيد", "جلادياتور"],
  "لاند روفر": ["رينج روفر", "رينج روفر سبورت", "ديفندر", "ديسكفري", "إيفوك", "فيلار"],
  "جاغوار": ["XE", "XF", "XJ", "F-PACE", "E-PACE", "F-TYPE"],
  "بنتلي": ["كونتيننتال", "فلاينج سبير", "بينتايغا"],
  "رولز رويس": ["فانتوم", "غوست", "ريث", "كولينان", "داون"],
  "فيراري": ["488", "F8", "SF90", "روما", "بورتوفينو", "296"],
  "لامبورغيني": ["أوروس", "هوراكان", "أفنتادور", "ريفويلتو"],
};

const ENGINES = ["4 سلندر", "6 سلندر", "8 سلندر", "12 سلندر", "كهربائية", OTHER];
const FUELS = ["بترول", "ديزل", "كهرباء", "هايبرد"];
const TRANSMISSIONS = ["أوتوماتيك", "عادي"];
const COLORS = ["أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "أخضر", "أصفر", "برتقالي", "بني", "بيج", "ذهبي", OTHER];
const CURRENCIES = ["دينار بحريني", "ريال سعودي", "درهم إماراتي", "دينار كويتي", "ريال عماني", "ريال قطري", "دولار أمريكي", OTHER];
const DEFAULT_CURRENCY = "دينار بحريني";

// Rebuild the raw editing state (dropdown choice + custom text) from a possibly
// resolved `initial` value so the form repopulates correctly on back-navigation.
function buildState(initial = {}) {
  const brandKnown = BRANDS.includes(initial.brand);
  const brand = initial.brand ? (brandKnown ? initial.brand : OTHER) : "";
  const brandOther = brandKnown ? "" : initial.brand || "";

  const catList = CATEGORIES[brand] || [];
  const catKnown = catList.includes(initial.category);
  const isBrandOther = brand === OTHER;
  // Category is a free-text "other" when the brand is other, OR when a known brand
  // has a category that isn't one of its listed trims.
  const category = !initial.category
    ? ""
    : isBrandOther
    ? ""
    : catKnown
    ? initial.category
    : OTHER;
  const categoryOther = isBrandOther
    ? initial.category || ""
    : catKnown
    ? ""
    : initial.category || "";

  const engineKnown = ENGINES.includes(initial.engine);
  const engine = initial.engine ? (engineKnown ? initial.engine : OTHER) : "";
  const engineOther = engineKnown ? "" : initial.engine || "";

  const colorKnown = COLORS.includes(initial.color);
  const color = initial.color ? (colorKnown ? initial.color : OTHER) : "";
  const colorOther = colorKnown ? "" : initial.color || "";

  const curKnown = CURRENCIES.includes(initial.currency);
  const currency = initial.currency
    ? (curKnown ? initial.currency : OTHER)
    : DEFAULT_CURRENCY;
  const currencyOther = curKnown ? "" : initial.currency || "";

  return {
    theme: initial.theme || "dark",
    carNameEn: initial.carNameEn || "",
    year: initial.year || DEFAULT_YEAR,
    brand,
    brandOther,
    category,
    categoryOther,
    engine,
    engineOther,
    fuel: initial.fuel || "",
    transmission: initial.transmission || "",
    color,
    colorOther,
    price: initial.price || "",
    currency,
    currencyOther,
    phone: initial.phone || "",
    tagline: initial.tagline || "",
  };
}

export default function CarForm({ initial, onSubmit }) {
  const [v, setV] = useState(() => buildState(initial));
  const [touched, setTouched] = useState({});

  const isBrandOther = v.brand === OTHER;
  const isCategoryOther = v.category === OTHER;
  const isEngineOther = v.engine === OTHER;
  const isColorOther = v.color === OTHER;
  const isCurrencyOther = v.currency === OTHER;
  const hasPrice = String(v.price || "").trim() !== "";
  const catList = CATEGORIES[v.brand] || [];

  function set(name, value) {
    setV((prev) => ({ ...prev, [name]: value }));
  }

  function touch(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  // Changing the brand resets the dependent category selection.
  function setBrand(value) {
    setV((prev) => ({ ...prev, brand: value, category: "", categoryOther: "" }));
  }

  // Field-level "is this required field empty" check.
  function missing(name) {
    switch (name) {
      case "brand":
        return isBrandOther ? !v.brandOther.trim() : !v.brand;
      case "category":
        return isBrandOther || isCategoryOther ? !v.categoryOther.trim() : !v.category;
      case "engine":
        return isEngineOther ? !v.engineOther.trim() : !v.engine;
      case "color":
        return isColorOther ? !v.colorOther.trim() : !v.color;
      default:
        return !String(v[name] || "").trim();
    }
  }

  const REQUIRED = ["carNameEn", "year", "brand", "category", "engine", "fuel", "transmission", "color", "phone"];

  function invalid(name) {
    return touched[name] && missing(name);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const allTouched = {};
    REQUIRED.forEach((n) => (allTouched[n] = true));
    setTouched(allTouched);

    const firstMissing = REQUIRED.find(missing);
    if (firstMissing) {
      const el = document.querySelector(`[data-field="${firstMissing}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return;
    }

    onSubmit({
      theme: v.theme,
      carNameEn: v.carNameEn.trim(),
      year: v.year,
      model: v.year, // single model-year feeds both the photo year and المواصفات row
      brand: isBrandOther ? v.brandOther.trim() : v.brand,
      category: isBrandOther || isCategoryOther ? v.categoryOther.trim() : v.category,
      engine: isEngineOther ? v.engineOther.trim() : v.engine,
      fuel: v.fuel,
      transmission: v.transmission,
      color: isColorOther ? v.colorOther.trim() : v.color,
      price: v.price.trim(),
      currency: hasPrice ? (isCurrencyOther ? v.currencyOther.trim() : v.currency) : "",
      phone: v.phone.trim(),
      tagline: v.tagline.trim(),
    });
  }

  const errMsg = "هذا الحقل مطلوب";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Theme picker — first thing in the form */}
      <ThemeSelector value={v.theme} onChange={(t) => set("theme", t)} />

      <div className="border-t border-gold/15" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1 — Car name (English, auto-uppercase) — full width */}
        <div className="sm:col-span-2" data-field="carNameEn">
          <label className="field-label" htmlFor="carNameEn">
            اسم السيارة بالإنجليزي <span className="text-gold">*</span>
          </label>
          <input
            id="carNameEn"
            type="text"
            dir="ltr"
            style={{ textTransform: "uppercase" }}
            className={"field-input " + (invalid("carNameEn") ? "invalid" : "")}
            placeholder="TOYOTA YARIS"
            value={v.carNameEn}
            onChange={(e) => set("carNameEn", e.target.value.toUpperCase())}
            onBlur={() => touch("carNameEn")}
          />
          {invalid("carNameEn") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 2 — Model year */}
        <div data-field="year">
          <label className="field-label" htmlFor="year">
            سنة الموديل <span className="text-gold">*</span>
          </label>
          <select
            id="year"
            dir="ltr"
            className={"field-input " + (invalid("year") ? "invalid" : "")}
            value={v.year}
            onChange={(e) => set("year", e.target.value)}
            onBlur={() => touch("year")}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* 3 — Brand */}
        <div data-field="brand">
          <label className="field-label" htmlFor="brand">
            الماركة <span className="text-gold">*</span>
          </label>
          <select
            id="brand"
            dir="rtl"
            className={"field-input " + (invalid("brand") ? "invalid" : "")}
            value={v.brand}
            onChange={(e) => setBrand(e.target.value)}
            onBlur={() => touch("brand")}
          >
            <option value="" disabled>اختر الماركة</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {isBrandOther && (
            <input
              type="text"
              dir="rtl"
              className={"field-input fade-slide mt-2 " + (invalid("brand") ? "invalid" : "")}
              placeholder="اكتب اسم الماركة"
              value={v.brandOther}
              onChange={(e) => set("brandOther", e.target.value)}
              onBlur={() => touch("brand")}
            />
          )}
          {invalid("brand") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 4 — Category / trim (depends on brand) */}
        <div data-field="category">
          <label className="field-label" htmlFor="category">
            الفئة / النسخة <span className="text-gold">*</span>
          </label>
          {isBrandOther ? (
            <input
              id="category"
              type="text"
              dir="rtl"
              className={"field-input " + (invalid("category") ? "invalid" : "")}
              placeholder="اكتب اسم الفئة"
              value={v.categoryOther}
              onChange={(e) => set("categoryOther", e.target.value)}
              onBlur={() => touch("category")}
            />
          ) : (
            <select
              id="category"
              dir="rtl"
              disabled={!v.brand}
              className={"field-input " + (invalid("category") ? "invalid" : "")}
              value={v.category}
              onChange={(e) => set("category", e.target.value)}
              onBlur={() => touch("category")}
            >
              <option value="" disabled>
                {v.brand ? "اختر الفئة" : "اختر الماركة أولاً"}
              </option>
              {catList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {v.brand && <option value={OTHER}>{OTHER}</option>}
            </select>
          )}
          {!isBrandOther && isCategoryOther && (
            <input
              type="text"
              dir="rtl"
              className={"field-input fade-slide mt-2 " + (invalid("category") ? "invalid" : "")}
              placeholder="اكتب اسم الفئة"
              value={v.categoryOther}
              onChange={(e) => set("categoryOther", e.target.value)}
              onBlur={() => touch("category")}
            />
          )}
          {invalid("category") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 5 — Engine */}
        <div data-field="engine">
          <label className="field-label" htmlFor="engine">
            المحرك <span className="text-gold">*</span>
          </label>
          <select
            id="engine"
            dir="rtl"
            className={"field-input " + (invalid("engine") ? "invalid" : "")}
            value={v.engine}
            onChange={(e) => set("engine", e.target.value)}
            onBlur={() => touch("engine")}
          >
            <option value="" disabled>اختر المحرك</option>
            {ENGINES.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {isEngineOther && (
            <input
              type="text"
              dir="rtl"
              className={"field-input fade-slide mt-2 " + (invalid("engine") ? "invalid" : "")}
              placeholder="اكتب نوع المحرك"
              value={v.engineOther}
              onChange={(e) => set("engineOther", e.target.value)}
              onBlur={() => touch("engine")}
            />
          )}
          {invalid("engine") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 6 — Fuel type */}
        <div data-field="fuel">
          <label className="field-label" htmlFor="fuel">
            نوع الوقود <span className="text-gold">*</span>
          </label>
          <select
            id="fuel"
            dir="rtl"
            className={"field-input " + (invalid("fuel") ? "invalid" : "")}
            value={v.fuel}
            onChange={(e) => set("fuel", e.target.value)}
            onBlur={() => touch("fuel")}
          >
            <option value="" disabled>اختر نوع الوقود</option>
            {FUELS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {invalid("fuel") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 7 — Transmission */}
        <div data-field="transmission">
          <label className="field-label" htmlFor="transmission">
            ناقل الحركة <span className="text-gold">*</span>
          </label>
          <select
            id="transmission"
            dir="rtl"
            className={"field-input " + (invalid("transmission") ? "invalid" : "")}
            value={v.transmission}
            onChange={(e) => set("transmission", e.target.value)}
            onBlur={() => touch("transmission")}
          >
            <option value="" disabled>اختر ناقل الحركة</option>
            {TRANSMISSIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {invalid("transmission") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 8 — Color */}
        <div data-field="color">
          <label className="field-label" htmlFor="color">
            اللون <span className="text-gold">*</span>
          </label>
          <select
            id="color"
            dir="rtl"
            className={"field-input " + (invalid("color") ? "invalid" : "")}
            value={v.color}
            onChange={(e) => set("color", e.target.value)}
            onBlur={() => touch("color")}
          >
            <option value="" disabled>اختر اللون</option>
            {COLORS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {isColorOther && (
            <input
              type="text"
              dir="rtl"
              className={"field-input fade-slide mt-2 " + (invalid("color") ? "invalid" : "")}
              placeholder="اكتب اللون"
              value={v.colorOther}
              onChange={(e) => set("colorOther", e.target.value)}
              onBlur={() => touch("color")}
            />
          )}
          {invalid("color") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 9 — Price (optional) */}
        <div data-field="price">
          <label className="field-label" htmlFor="price">السعر</label>
          <input
            id="price"
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="field-input"
            placeholder="مثال: 6,700"
            value={v.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>

        {/* 10 — Currency (only when a price is entered) */}
        {hasPrice && (
          <div className="fade-slide" data-field="currency">
            <label className="field-label" htmlFor="currency">العملة</label>
            <select
              id="currency"
              dir="rtl"
              className="field-input"
              value={v.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {CURRENCIES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {isCurrencyOther && (
              <input
                type="text"
                dir="rtl"
                className="field-input fade-slide mt-2"
                placeholder="اكتب العملة"
                value={v.currencyOther}
                onChange={(e) => set("currencyOther", e.target.value)}
              />
            )}
          </div>
        )}

        {/* 11 — Owner phone */}
        <div data-field="phone">
          <label className="field-label" htmlFor="phone">
            رقم صاحب السيارة <span className="text-gold">*</span>
          </label>
          <input
            id="phone"
            type="text"
            inputMode="tel"
            dir="ltr"
            className={"field-input " + (invalid("phone") ? "invalid" : "")}
            placeholder="مثال: 37777840"
            value={v.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => touch("phone")}
          />
          {invalid("phone") && <p className="field-error">{errMsg}</p>}
        </div>

        {/* 12 — Optional tagline — full width */}
        <div className="sm:col-span-2" data-field="tagline">
          <label className="field-label" htmlFor="tagline">وصف إضافي (اختياري)</label>
          <input
            id="tagline"
            type="text"
            dir="rtl"
            className="field-input"
            placeholder="مثال: ريق الأساطير لا يندثر"
            value={v.tagline}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-gold px-10 text-lg">
          التالي ←
        </button>
      </div>
    </form>
  );
}

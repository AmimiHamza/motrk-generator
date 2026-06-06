import { useState } from "react";
import ThemeSelector from "./ThemeSelector.jsx";

const OTHER = "أخرى";
const ERR = "هذا الحقل مطلوب";

// Model years, newest first: 2030 down to 1960.
const YEARS = Array.from({ length: 2030 - 1960 + 1 }, (_, i) => String(2030 - i));
const DEFAULT_YEAR = "2026";

const BRANDS = [
  "تويوتا", "هونداي", "نيسان", "بي إم دبليو", "مرسيدس", "كيا", "شيفروليه",
  "هوندا", "ميتسوبيشي", "لكزس", "فورد", "مازدا", "سوزوكي", "فولكس واجن",
  "أودي", "بورشه", "جيب", "لاند روفر", "جاغوار", "بنتلي", "رولز رويس",
  "فيراري", "لامبورغيني",
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

const ENGINES = ["4 سلندر", "6 سلندر", "8 سلندر", "12 سلندر", "كهربائية"];
const FUELS = ["بترول", "ديزل", "كهرباء", "هايبرد"];
const TRANSMISSIONS = ["أوتوماتيك", "عادي"];
const COLORS = ["أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "أخضر", "أصفر", "برتقالي", "بني", "بيج", "ذهبي"];
const CURRENCIES = ["دينار بحريني", "ريال سعودي", "درهم إماراتي", "دينار كويتي", "ريال عماني", "ريال قطري", "دولار أمريكي"];
const DEFAULT_CURRENCY = "دينار بحريني";

// Price modes.
const PRICE_NUMBER = "number";
const PRICE_AFTER = "بعد المعاينة";
const PRICE_CONTACT = "عند التواصل";
const PRICE_NUMERIC_RE = /^[\d\s.,]*$/;

// Reconstruct dropdown choice + custom text from a possibly-resolved value:
// if `value` isn't one of `options`, treat it as a custom "أخرى" entry.
function splitOther(value, options) {
  if (!value) return { sel: "", other: "" };
  return options.includes(value) ? { sel: value, other: "" } : { sel: OTHER, other: value };
}

// Rebuild the full editing state from a (resolved) initial form, so the form
// repopulates correctly on back-navigation.
function buildState(initial = {}) {
  const brand = splitOther(initial.brand, BRANDS);
  // Category: free text when brand is "أخرى" or value isn't a known trim of that brand.
  const catList = CATEGORIES[brand.sel] || [];
  const category = brand.sel === OTHER ? { sel: OTHER, other: initial.category || "" }
    : splitOther(initial.category, catList);
  const color = splitOther(initial.color, COLORS);
  const year = splitOther(initial.year || DEFAULT_YEAR, YEARS);
  const engine = splitOther(initial.engine, ENGINES);
  const fuel = splitOther(initial.fuel, FUELS);
  const transmission = splitOther(initial.transmission, TRANSMISSIONS);
  const currency = splitOther(initial.currency || DEFAULT_CURRENCY, CURRENCIES);

  // Price mode from the resolved price string.
  const p = (initial.price || "").trim();
  let priceType = PRICE_NUMBER, priceNumber = "", priceOther = "";
  if (p === PRICE_AFTER || p === PRICE_CONTACT) priceType = p;
  else if (p && !PRICE_NUMERIC_RE.test(p)) { priceType = OTHER; priceOther = p; }
  else priceNumber = p;

  return {
    theme: initial.theme || "dark",
    carNameEn: initial.carNameEn || "",
    yearSel: year.sel, yearOther: year.other,
    brandSel: brand.sel, brandOther: brand.other,
    categorySel: category.sel, categoryOther: category.other,
    engineSel: engine.sel, engineOther: engine.other,
    fuelSel: fuel.sel, fuelOther: fuel.other,
    transmissionSel: transmission.sel, transmissionOther: transmission.other,
    colorSel: color.sel, colorOther: color.other,
    priceType, priceNumber, priceOther,
    currencySel: currency.sel, currencyOther: currency.other,
    phone: initial.phone || "",
    tagline: initial.tagline || "",
  };
}

// A <select> that grows a custom text input when "أخرى" is chosen.
function SelectField({ id, label, required, dir = "rtl", options, placeholder,
                      otherPlaceholder, disabled, value, other, invalid,
                      onValue, onOther, onBlur }) {
  return (
    <div data-field={id}>
      <label className="field-label" htmlFor={id}>
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <select
        id={id}
        dir={dir}
        disabled={disabled}
        className={"field-input " + (invalid ? "invalid" : "")}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        onBlur={onBlur}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value={OTHER}>{OTHER}</option>
      </select>
      {value === OTHER && (
        <input
          type="text"
          dir={dir}
          className={"field-input fade-slide mt-2 " + (invalid ? "invalid" : "")}
          placeholder={otherPlaceholder}
          value={other}
          onChange={(e) => onOther(e.target.value)}
          onBlur={onBlur}
        />
      )}
      {invalid && <p className="field-error">{ERR}</p>}
    </div>
  );
}

export default function CarForm({ initial, onSubmit }) {
  const [v, setV] = useState(() => buildState(initial));
  const [touched, setTouched] = useState({});

  const set = (name, value) => setV((p) => ({ ...p, [name]: value }));
  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }));

  // Resolve a select-with-other pair to its effective value.
  const eff = (sel, other) => (v[sel] === OTHER ? v[other].trim() : v[sel]);

  // Changing brand resets the dependent category.
  function setBrand(value) {
    setV((p) => ({ ...p, brandSel: value, categorySel: "", categoryOther: "" }));
  }

  const isBrandOther = v.brandSel === OTHER;
  const catList = CATEGORIES[v.brandSel] || [];
  const priceNumeric = v.priceType === PRICE_NUMBER && v.priceNumber.trim() !== "";

  // Required-field emptiness, accounting for the "أخرى" custom inputs.
  function missing(name) {
    switch (name) {
      case "carNameEn": return !v.carNameEn.trim();
      case "phone": return !v.phone.trim();
      case "year": return !eff("yearSel", "yearOther");
      case "brand": return !eff("brandSel", "brandOther");
      case "category":
        return isBrandOther ? !v.categoryOther.trim() : !eff("categorySel", "categoryOther");
      case "engine": return !eff("engineSel", "engineOther");
      case "fuel": return !eff("fuelSel", "fuelOther");
      case "transmission": return !eff("transmissionSel", "transmissionOther");
      case "color": return !eff("colorSel", "colorOther");
      default: return false;
    }
  }

  const REQUIRED = ["carNameEn", "year", "brand", "category", "engine", "fuel", "transmission", "color", "phone"];
  const invalid = (name) => touched[name] && missing(name);

  // Resolve the price string + whether a currency applies.
  function resolvePrice() {
    if (v.priceType === PRICE_AFTER) return { price: PRICE_AFTER, currency: "" };
    if (v.priceType === PRICE_CONTACT) return { price: PRICE_CONTACT, currency: "" };
    if (v.priceType === OTHER) return { price: v.priceOther.trim(), currency: "" };
    const num = v.priceNumber.trim();
    return { price: num, currency: num ? eff("currencySel", "currencyOther") : "" };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const all = {};
    REQUIRED.forEach((n) => (all[n] = true));
    setTouched(all);

    const first = REQUIRED.find(missing);
    if (first) {
      const el = document.querySelector(`[data-field="${first}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("select,input")?.focus();
      return;
    }

    const { price, currency } = resolvePrice();
    onSubmit({
      theme: v.theme,
      carNameEn: v.carNameEn.trim(),
      year: eff("yearSel", "yearOther"),
      model: eff("yearSel", "yearOther"),
      brand: eff("brandSel", "brandOther"),
      category: isBrandOther ? v.categoryOther.trim() : eff("categorySel", "categoryOther"),
      engine: eff("engineSel", "engineOther"),
      fuel: eff("fuelSel", "fuelOther"),
      transmission: eff("transmissionSel", "transmissionOther"),
      color: eff("colorSel", "colorOther"),
      price,
      currency,
      phone: v.phone.trim(),
      tagline: v.tagline.trim(),
    });
  }

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
          {invalid("carNameEn") && <p className="field-error">{ERR}</p>}
        </div>

        {/* 2 — Model year */}
        <SelectField
          id="year" label="سنة الموديل" required dir="ltr" options={YEARS}
          otherPlaceholder="اكتب سنة الموديل"
          value={v.yearSel} other={v.yearOther} invalid={invalid("year")}
          onValue={(x) => set("yearSel", x)} onOther={(x) => set("yearOther", x)}
          onBlur={() => touch("year")}
        />

        {/* 3 — Brand */}
        <SelectField
          id="brand" label="الماركة" required options={BRANDS}
          placeholder="اختر الماركة" otherPlaceholder="اكتب اسم الماركة"
          value={v.brandSel} other={v.brandOther} invalid={invalid("brand")}
          onValue={setBrand} onOther={(x) => set("brandOther", x)}
          onBlur={() => touch("brand")}
        />

        {/* 4 — Category / trim (depends on brand) */}
        {isBrandOther ? (
          <div data-field="category">
            <label className="field-label" htmlFor="category">
              الفئة / النسخة <span className="text-gold">*</span>
            </label>
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
            {invalid("category") && <p className="field-error">{ERR}</p>}
          </div>
        ) : (
          <SelectField
            id="category" label="الفئة / النسخة" required options={catList}
            placeholder={v.brandSel ? "اختر الفئة" : "اختر الماركة أولاً"}
            otherPlaceholder="اكتب اسم الفئة" disabled={!v.brandSel}
            value={v.categorySel} other={v.categoryOther} invalid={invalid("category")}
            onValue={(x) => set("categorySel", x)} onOther={(x) => set("categoryOther", x)}
            onBlur={() => touch("category")}
          />
        )}

        {/* 5 — Engine */}
        <SelectField
          id="engine" label="المحرك" required options={ENGINES}
          placeholder="اختر المحرك" otherPlaceholder="اكتب نوع المحرك"
          value={v.engineSel} other={v.engineOther} invalid={invalid("engine")}
          onValue={(x) => set("engineSel", x)} onOther={(x) => set("engineOther", x)}
          onBlur={() => touch("engine")}
        />

        {/* 6 — Fuel type */}
        <SelectField
          id="fuel" label="نوع الوقود" required options={FUELS}
          placeholder="اختر نوع الوقود" otherPlaceholder="اكتب نوع الوقود"
          value={v.fuelSel} other={v.fuelOther} invalid={invalid("fuel")}
          onValue={(x) => set("fuelSel", x)} onOther={(x) => set("fuelOther", x)}
          onBlur={() => touch("fuel")}
        />

        {/* 7 — Transmission */}
        <SelectField
          id="transmission" label="ناقل الحركة" required options={TRANSMISSIONS}
          placeholder="اختر ناقل الحركة" otherPlaceholder="اكتب ناقل الحركة"
          value={v.transmissionSel} other={v.transmissionOther} invalid={invalid("transmission")}
          onValue={(x) => set("transmissionSel", x)} onOther={(x) => set("transmissionOther", x)}
          onBlur={() => touch("transmission")}
        />

        {/* 8 — Color */}
        <SelectField
          id="color" label="اللون" required options={COLORS}
          placeholder="اختر اللون" otherPlaceholder="اكتب اللون"
          value={v.colorSel} other={v.colorOther} invalid={invalid("color")}
          onValue={(x) => set("colorSel", x)} onOther={(x) => set("colorOther", x)}
          onBlur={() => touch("color")}
        />

        {/* 9 — Price (mode selector) */}
        <div data-field="price">
          <label className="field-label" htmlFor="priceType">السعر</label>
          <select
            id="priceType"
            dir="rtl"
            className="field-input"
            value={v.priceType}
            onChange={(e) => set("priceType", e.target.value)}
          >
            <option value={PRICE_NUMBER}>السعر بالأرقام</option>
            <option value={PRICE_AFTER}>{PRICE_AFTER}</option>
            <option value={PRICE_CONTACT}>{PRICE_CONTACT}</option>
            <option value={OTHER}>{OTHER}</option>
          </select>
          {v.priceType === PRICE_NUMBER && (
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="field-input fade-slide mt-2"
              placeholder="مثال: 6,700"
              value={v.priceNumber}
              onChange={(e) => set("priceNumber", e.target.value)}
            />
          )}
          {v.priceType === OTHER && (
            <input
              type="text"
              dir="rtl"
              className="field-input fade-slide mt-2"
              placeholder="اكتب نص السعر"
              value={v.priceOther}
              onChange={(e) => set("priceOther", e.target.value)}
            />
          )}
        </div>

        {/* 10 — Currency (only with a numeric price) */}
        {priceNumeric ? (
          <SelectField
            id="currency" label="العملة" dir="rtl" options={CURRENCIES}
            otherPlaceholder="اكتب العملة"
            value={v.currencySel} other={v.currencyOther}
            onValue={(x) => set("currencySel", x)} onOther={(x) => set("currencyOther", x)}
          />
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
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
          {invalid("phone") && <p className="field-error">{ERR}</p>}
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

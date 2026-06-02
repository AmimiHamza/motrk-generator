import { useState } from "react";

const FIELDS = [
  { name: "carNameEn", label: "اسم السيارة بالانجليزي", placeholder: "HYUNDAI SONATA", ltr: true },
  { name: "year", label: "سنة الموديل (بالانجليزي)", placeholder: "2019", ltr: true },
  { name: "model", label: "الموديل", placeholder: "2011" },
  { name: "brand", label: "الماركة", placeholder: "هونداي" },
  { name: "category", label: "الفئة / النسخة", placeholder: "سوناتا" },
  { name: "engine", label: "المحرك", placeholder: "4 سلندر" },
  { name: "transmission", label: "ناقل الحركة", placeholder: "اوتوماتيك" },
  { name: "fuel", label: "نوع الوقود", placeholder: "بترول" },
  { name: "color", label: "اللون", placeholder: "اسود" },
  { name: "price", label: "السعر", placeholder: "6,700", ltr: true },
  { name: "phone", label: "رقم صاحب السيارة", placeholder: "37777840", ltr: true },
];

const CURRENCIES = [
  "دينار بحريني",
  "ريال سعودي",
  "درهم اماراتي",
  "ريال قطري",
  "دينار كويتي",
  "ريال عماني",
];

export default function CarForm({ initial, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});

  const required = FIELDS.map((f) => f.name).concat("currency");

  function set(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  function isInvalid(name) {
    return touched[name] && !String(values[name] || "").trim();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const allTouched = {};
    required.forEach((n) => (allTouched[n] = true));
    setTouched(allTouched);

    const missing = required.filter((n) => !String(values[n] || "").trim());
    if (missing.length) {
      const el = document.querySelector(`[name="${missing[0]}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === "carNameEn" ? "sm:col-span-2" : ""}>
            <label className="field-label" htmlFor={f.name}>
              {f.label} <span className="text-gold">*</span>
            </label>
            <input
              id={f.name}
              name={f.name}
              type="text"
              dir={f.ltr ? "ltr" : "rtl"}
              className={"field-input " + (isInvalid(f.name) ? "invalid" : "")}
              placeholder={f.placeholder}
              value={values[f.name] || ""}
              onChange={(e) => set(f.name, e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
            />
          </div>
        ))}

        <div>
          <label className="field-label" htmlFor="currency">
            العملة <span className="text-gold">*</span>
          </label>
          <select
            id="currency"
            name="currency"
            className={"field-input " + (isInvalid("currency") ? "invalid" : "")}
            value={values.currency || ""}
            onChange={(e) => set("currency", e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="tagline">
            وصف إضافي (اختياري)
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            className="field-input"
            placeholder="ريق الأساطير لا يندثر"
            value={values.tagline || ""}
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

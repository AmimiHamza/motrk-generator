import { useState } from "react";
import StepIndicator from "./components/StepIndicator.jsx";
import CarForm from "./components/CarForm.jsx";
import ImageCropper from "./components/ImageCropper.jsx";
import Preview from "./components/Preview.jsx";

const EMPTY_FORM = {
  theme: "dark",
  carNameEn: "",
  year: "",
  model: "",
  brand: "",
  category: "",
  engine: "",
  transmission: "",
  fuel: "",
  color: "",
  price: "",
  currency: "دينار بحريني",
  phone: "",
  tagline: "",
};

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [cropMode, setCropMode] = useState("horizontal");
  const [resultUrl, setResultUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  function handleFormSubmit(values) {
    setForm(values);
    setStep(2);
  }

  async function handleGenerate({ file, crop, cropMode: mode }) {
    setCropMode(mode);
    setGenerating(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      // map camelCase form -> snake_case API fields
      fd.append("car_name_en", form.carNameEn);
      fd.append("year", form.year);
      fd.append("model", form.model);
      fd.append("brand", form.brand);
      fd.append("category", form.category);
      fd.append("engine", form.engine);
      fd.append("transmission", form.transmission);
      fd.append("fuel", form.fuel);
      fd.append("color", form.color);
      fd.append("price", form.price);
      fd.append("currency", form.currency || "");
      fd.append("phone", form.phone);
      fd.append("tagline", form.tagline || "");
      fd.append("theme", form.theme || "dark");
      fd.append("crop_x", Math.round(crop?.x ?? 0));
      fd.append("crop_y", Math.round(crop?.y ?? 0));
      fd.append("crop_width", Math.round(crop?.width ?? 0));
      fd.append("crop_height", Math.round(crop?.height ?? 0));
      fd.append("crop_mode", mode);

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.detail || `خطأ ${res.status}`);
      }
      const blob = await res.blob();
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setStep(3);
    } catch (e) {
      setError(e.message || "فشل إنشاء الصورة");
    } finally {
      setGenerating(false);
    }
  }

  function restart() {
    setForm(EMPTY_FORM);
    setCropMode("horizontal");
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
    setStep(1);
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* brand header */}
      <header className="text-center mb-6">
        <h1 className="font-en font-extrabold text-3xl sm:text-4xl tracking-wide">
          MOTRK <span className="gold-text">cars4sale</span>
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          مولّد إعلانات السيارات — مملكة البحرين
        </p>
      </header>

      <main className="w-full max-w-3xl bg-navy2/70 backdrop-blur rounded-3xl border border-gold/25 shadow-2xl p-5 sm:p-8">
        <StepIndicator current={step} />

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/50 bg-red-500/10 text-red-200 px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 && <CarForm initial={form} onSubmit={handleFormSubmit} />}

        {step === 2 && (
          <ImageCropper
            initialMode={cropMode}
            generating={generating}
            onBack={() => setStep(1)}
            onGenerate={handleGenerate}
          />
        )}

        {step === 3 && resultUrl && (
          <Preview
            imageUrl={resultUrl}
            carNameEn={form.carNameEn}
            onBack={() => setStep(2)}
            onRestart={restart}
          />
        )}
      </main>

      <footer className="text-slate-500 text-xs mt-6 text-center">
        @motrk.cars4sale · +973 3300 1234
      </footer>
    </div>
  );
}

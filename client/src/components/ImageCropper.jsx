import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../lib/cropImage.js";

const ASPECTS = {
  horizontal: 16 / 10,
  square: 1,
};

export default function ImageCropper({ initialMode, onBack, onGenerate, generating }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [mode, setMode] = useState(initialMode || "horizontal");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setPixels(areaPixels);
  }, []);

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!imageSrc || !pixels) return;
    const cropped = await getCroppedImg(imageSrc, pixels);
    onGenerate({ carImage: cropped, cropMode: mode });
  }

  return (
    <div className="space-y-5">
      {!imageSrc ? (
        <label className="flex flex-col items-center justify-center gap-3 py-16 px-6 rounded-2xl border-2 border-dashed border-gold/50 bg-navy2/60 cursor-pointer hover:border-gold transition-colors text-center">
          <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-2xl">
            📷
          </div>
          <span className="font-bold text-lg">اضغط لرفع صورة السيارة</span>
          <span className="text-sm text-slate-400">JPG أو PNG</span>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      ) : (
        <>
          {/* mode toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-slate-300 font-bold">نوع الاقتصاص:</span>
            <div className="inline-flex rounded-xl overflow-hidden border border-gold/40">
              {[
                { key: "horizontal", label: "مستطيل ▭" },
                { key: "square", label: "مربع ◻" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={
                    "px-5 py-2 text-sm font-bold transition-colors " +
                    (mode === m.key
                      ? "bg-gradient-to-b from-gold-light to-gold text-navy"
                      : "bg-navy2 text-slate-300")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* crop surface */}
          <div className="crop-area" style={{ height: 360 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={ASPECTS[mode]}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid
            />
          </div>

          {/* zoom slider */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">تكبير</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-gold"
            />
            <label className="btn-ghost text-sm py-2 px-4 cursor-pointer">
              صورة أخرى
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-ghost px-8" disabled={generating}>
          → رجوع
        </button>
        <button
          onClick={handleGenerate}
          className="btn-gold px-10 text-lg"
          disabled={!imageSrc || !pixels || generating}
        >
          {generating ? "...جاري الإنشاء" : "إنشاء الصورة"}
        </button>
      </div>
    </div>
  );
}

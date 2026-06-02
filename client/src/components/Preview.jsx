export default function Preview({ imageUrl, carNameEn, onBack, onRestart }) {
  function download() {
    const a = document.createElement("a");
    a.href = imageUrl;
    const safe = (carNameEn || "motrk").replace(/[^\w]+/g, "_").toLowerCase();
    a.download = `motrk_${safe}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden border border-gold/40 shadow-2xl bg-navy2 max-w-[520px] mx-auto">
        <img src={imageUrl} alt="إعلان السيارة" className="w-full block" />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button onClick={download} className="btn-gold px-10 text-lg">
          ⬇ تحميل الصورة (PNG)
        </button>
        <button onClick={onBack} className="btn-ghost px-8">
          تعديل الصورة
        </button>
        <button onClick={onRestart} className="btn-ghost px-8">
          إعلان جديد
        </button>
      </div>
      <p className="text-center text-sm text-slate-400">
        مقاس الصورة 1080×1080 جاهزة للنشر على انستقرام
      </p>
    </div>
  );
}

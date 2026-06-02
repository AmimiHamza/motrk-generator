const STEPS = [
  { id: 1, label: "بيانات السيارة" },
  { id: 2, label: "الصورة والاقتصاص" },
  { id: 3, label: "المعاينة والتحميل" },
];

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
      {STEPS.map((s, i) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <div key={s.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors " +
                  (active
                    ? "bg-gradient-to-b from-gold-light to-gold text-navy border-gold-light"
                    : done
                    ? "bg-gold/20 text-gold border-gold"
                    : "bg-navy2 text-slate-400 border-white/15")
                }
              >
                {done ? "✓" : s.id}
              </div>
              <span
                className={
                  "text-xs sm:text-sm font-bold hidden sm:inline " +
                  (active ? "text-white" : done ? "text-gold" : "text-slate-400")
                }
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={
                  "w-6 sm:w-12 h-0.5 " + (done ? "bg-gold" : "bg-white/15")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

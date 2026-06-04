import darkThumb from "../assets/theme_dark.png";
import lightThumb from "../assets/theme_light.png";

const THEMES = [
  { id: "dark", label: "داكن", thumb: darkThumb },
  { id: "light", label: "فاتح", thumb: lightThumb },
];

// Visual theme picker: two template thumbnails side by side. The selected one
// gets a gold highlight. Default selection is "dark".
export default function ThemeSelector({ value, onChange }) {
  return (
    <div>
      <label className="field-label">نمط التصميم</label>
      <div className="grid grid-cols-2 gap-4">
        {THEMES.map((t) => {
          const selected = value === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-pressed={selected}
              className={"theme-card " + (selected ? "theme-card-active" : "")}
            >
              <img src={t.thumb} alt={t.label} className="theme-thumb" />
              <span className="theme-label">
                {t.label}
                {selected && <span className="text-gold"> ✓</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

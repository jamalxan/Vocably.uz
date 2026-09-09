// Yoq/o'chir tugmasi (masalan Profil sahifasidagi "Tungi rejim"). Native
// checkbox'ga asoslangan — klaviatura va skrinriderlar bepul ishlaydi.
export default function Switch({ checked, onChange, label, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <span className="relative inline-flex h-6 w-11 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          aria-label={label}
        />
        <span className="absolute inset-0 rounded-full bg-border peer-checked:bg-accent transition-colors duration-200" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}

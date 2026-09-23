// Yoq/o'chir tugmasi (masalan Profil sahifasidagi "Tungi rejim"). Native
// checkbox'ga asoslangan — klaviatura va skrinriderlar bepul ishlaydi.
// role="switch" — "checkbox" emas, "switch" deb o'qiladi; ko'rinadigan label bo'lsa
// aria-label qo'yilmaydi (nom ikki marta o'qilmasin). Qolgan props (disabled, name, id) input'ga.
export default function Switch({ checked, onChange, label, className = '', ...props }) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 min-h-11 md:min-h-0 cursor-pointer select-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${className}`}
    >
      <span className="relative inline-flex h-6 w-11 flex-shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <span className="absolute inset-0 rounded-full bg-border-strong peer-checked:bg-accent transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface-2 border border-border-strong shadow transition-transform duration-200 peer-checked:translate-x-5 peer-checked:border-transparent" />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}

// Deep-merlot wash for the "dark chapters".
// Without WebGL (or before it loads) this veil alone carries text contrast,
// so it defaults to strong (--landing-veil: .72 → on-primary text ≥5.8:1 on
// the cream fallback). Once the WebGL backdrop is running it paints its own
// dark band exactly behind these sections, and ExperienceCanvas drops
// --landing-veil to a light touch so the 3D core isn't washed out.
export default function DarkVeil({ edge = 10 }) {
  const mask = `linear-gradient(to bottom, transparent 0, #000 ${edge}%, #000 ${100 - edge}%, transparent 100%)`;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 transition-[background-color] duration-700"
      style={{
        backgroundColor: 'rgb(var(--color-primary) / var(--landing-veil, 0.72))',
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}

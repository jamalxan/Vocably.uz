// CSS-only stand-in for the WebGL backdrop: shown while the 3D bundle loads
// (static) and as the permanent background when WebGL is unavailable
// (animated). Blobs move with transform only, so the animation stays on the
// compositor instead of repainting every frame.
export default function FallbackBackdrop({ animated = false }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg">
      <div
        className={`absolute -top-[20%] -left-[10%] w-[70vmax] h-[70vmax] rounded-full blur-3xl opacity-70 ${animated ? 'landing-blob-a' : ''}`}
        style={{ background: 'radial-gradient(circle, rgb(var(--color-accent-soft)), transparent 65%)' }}
      />
      <div
        className={`absolute top-[20%] -right-[20%] w-[60vmax] h-[60vmax] rounded-full blur-3xl opacity-80 ${animated ? 'landing-blob-b' : ''}`}
        style={{ background: 'radial-gradient(circle, rgb(var(--color-primary-soft)), transparent 65%)' }}
      />
      <div
        className={`absolute -bottom-[25%] left-[20%] w-[55vmax] h-[55vmax] rounded-full blur-3xl opacity-30 ${animated ? 'landing-blob-c' : ''}`}
        style={{ background: 'radial-gradient(circle, rgb(var(--color-accent) / .5), transparent 65%)' }}
      />
    </div>
  );
}

'use client';

// Static, CSS-only rendering of the Learning Core — used when WebGL is
// unavailable, and reused (smaller) as the lightweight reprise in FinalCTA
// (brief §21 forbids "excessive" 3D everywhere; §25/§26 require a graceful
// fallback and a cheap mobile/no-WebGL path). No text lives only in here —
// it's decorative, the real copy sits in the surrounding HTML.
export default function LearningCoreFallback({ size = 420 }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, maxWidth: '100%' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{ background: 'radial-gradient(circle, rgb(var(--color-accent) / .35), transparent 70%)' }}
      />
      <div
        className="absolute inset-[12%] rounded-full border"
        style={{ borderColor: 'rgb(var(--color-accent) / .35)' }}
      />
      <div
        className="absolute inset-[22%] rounded-full shadow-glow"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, rgb(var(--color-surface-2) / .9), rgb(var(--color-accent-soft)) 55%, rgb(var(--color-primary) / .55) 100%)',
        }}
      />
      {['Reading', 'Listening', 'Speaking', 'Writing'].map((label, i) => {
        const angle = 45 + i * 90;
        const rad = (angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * 42;
        const y = 50 + Math.sin(rad) * 42;
        return (
          <span
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border bg-surface/90 px-2.5 py-1 text-[11px] font-landing-body font-medium text-ink backdrop-blur-sm"
            style={{ left: `${x}%`, top: `${y}%`, borderColor: 'rgb(var(--color-border))' }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

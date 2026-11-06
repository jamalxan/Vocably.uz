'use client';
import { memo } from 'react';

// So'z tunneli without WebGL (no WebGL2, reduced motion, a slow device, or a scene error): the same
// game drawn with DOM. Concentric frames suggest the tunnel; the word being typed sits in the middle
// as glyph tiles, and the last words float above it in their verdict colours. Pure props from the
// controller's HUD state — it never reads the scene ref during render.

const TONE = {
  pending: 'bg-white/15 text-white border-white/30',
  ok: 'bg-emerald-500/90 text-white border-emerald-300',
  bad: 'bg-rose-500/85 text-white border-rose-300 line-through decoration-2',
  none: 'bg-white/10 text-white/60 border-white/20',
};

function TunnelScene2D({ typed = '', trail = [], hue = 0, calm = false }) {
  const chars = Array.from(typed);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070a18]" aria-hidden="true">
      <div className="absolute inset-0 grid place-items-center">
        {[100, 78, 58, 40, 25].map((size, i) => (
          <div
            key={size}
            className={`absolute rounded-[28%] border ${calm ? '' : 'motion-safe:animate-pulse'}`}
            style={{
              width: `${size}%`,
              aspectRatio: '1 / 1',
              maxHeight: `${size + 10}%`,
              borderColor: `hsla(${(hue + i * 28) % 360}, 80%, 65%, ${0.18 + i * 0.1})`,
              animationDelay: `${i * 160}ms`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-3 top-3 flex flex-wrap justify-center gap-1.5">
        {trail.slice(-5).map((t) => (
          <span key={t.key} className={`rounded-full border px-2.5 py-0.5 text-xs font-bold font-word ${TONE[t.s] || TONE.pending}`}>
            {t.text || '—'}
          </span>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="flex flex-wrap justify-center gap-1 max-w-full">
          {chars.map((ch, i) => (
            <span
              key={`${i}-${ch}`}
              className="min-w-8 h-11 sm:min-w-10 sm:h-14 px-1 rounded-lg grid place-items-center text-2xl sm:text-3xl font-black font-word text-white shadow-[0_0_18px_rgba(124,92,255,.45)]"
              style={{ background: `hsla(${(hue + i * 23) % 360}, 85%, 45%, .85)` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(TunnelScene2D);

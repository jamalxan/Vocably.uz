'use client';
import { useMemo } from 'react';

const EMOJI = ['✨', '⭐', '🎉', '💫'];

// Vazifa muvaffaqiyatli bajarilganda (masalan AI orqali so'zlar qo'shilganda) markazdan
// atrofga sochiladigan zarrachalar — src/app/globals.css'dagi .sparkle-particle animatsiyasi.
// Sof CSS, tashqi kutubxonasiz (bundle og'irlashmaydi).
export default function SparkleBurst({ count = 14 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const distance = 60 + Math.random() * 50;
        return {
          id: i,
          emoji: EMOJI[i % EMOJI.length],
          tx: `${Math.cos(angle) * distance}px`,
          ty: `${Math.sin(angle) * distance}px`,
          delay: `${Math.random() * 120}ms`,
          size: 12 + Math.random() * 10,
        };
      }),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkle-particle"
          style={{ '--tx': p.tx, '--ty': p.ty, '--delay': p.delay, fontSize: p.size }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

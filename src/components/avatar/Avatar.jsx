'use client';
import { useEffect, useState } from 'react';
import { avatarGradient, avatarInitials, avatarUrl } from '@/lib/avatarShared';

// Telegram uslubidagi yagona avatar komponenti — butun ilovada (suhbatlar ro'yxati,
// sarlavha, qidiruv, sidebar, profil) shu ishlatiladi. Rasm bo'lsa — dumaloq rasm,
// bo'lmasa (yoki yuklanmasa) — userId'dan barqaror tanlangan gradient fonda bosh
// harflar. `online` — pastki o'ng burchakda yashil nuqta.
export default function Avatar({
  userId,
  photoId,
  name,
  username,
  size = 40,
  online = false,
  ringClass = 'border-bg',
  className = '',
  alt,
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photoId]);

  // Katta avatarlarda (retina ekranda 160px'dan katta chiqadi) 640px nusxasi.
  const src = !failed && avatarUrl(userId, photoId, size > 80 ? 'full' : 'small');
  const [from, to] = avatarGradient(userId || username || name);
  const dot = Math.max(10, Math.round(size * 0.28));

  return (
    <span
      className={`relative inline-block flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || name || username || 'Profil rasmi'}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="w-full h-full rounded-full object-cover bg-bg-sunken"
        />
      ) : (
        <span
          aria-hidden="true"
          className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold leading-none"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${from}, ${to})`,
            fontSize: Math.max(10, Math.round(size * 0.4)),
          }}
        >
          {avatarInitials(name, username)}
        </span>
      )}
      {online && (
        <span
          title="Onlayn"
          className={`absolute bottom-0 right-0 rounded-full bg-success border-2 ${ringClass}`}
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
}

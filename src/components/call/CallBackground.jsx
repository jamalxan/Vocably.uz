'use client';
import { useState } from 'react';
import { avatarGradient, avatarUrl } from '@/lib/avatarShared';

// Qo'ng'iroq ekrani foni: suhbatdoshning to'liq rasmi xiralashtirilgan holda yoki gradient (CALLS_SPEC §10.2).
export default function CallBackground({ peer }) {
  const [failed, setFailed] = useState(false);
  const src = !failed && peer?.photoId ? avatarUrl(peer.id, peer.photoId, 'full') : null;
  const [from, to] = avatarGradient(peer?.id || peer?.username || peer?.name);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} className="w-full h-full object-cover scale-110 blur-2xl opacity-60" />
      ) : (
        <div className="w-full h-full opacity-70" style={{ backgroundImage: `linear-gradient(to bottom, ${from}, ${to})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
    </div>
  );
}

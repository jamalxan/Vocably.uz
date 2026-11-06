'use client';
import { useAuthedMediaUrl } from '@/lib/useAuthedMedia';

// Iqtibosdagi kichik rasm (PARITY_PLAN WP8.11): pufakchadagi javob iqtibosi va Composer'dagi
// javob banneri bir xil komponentdan foydalanadi. `size` — px.
export default function ReplyThumb({ mediaKey, size = 32 }) {
  const { url } = useAuthedMediaUrl(mediaKey);
  const style = { width: size, height: size };
  if (!url) return <span className="rounded bg-black/10 flex-shrink-0" style={style} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="rounded object-cover flex-shrink-0" style={style} />;
}

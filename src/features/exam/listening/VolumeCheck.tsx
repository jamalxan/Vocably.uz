'use client';
import { useEffect, useRef, useState } from 'react';
import { Headphones, Play, Pause, Volume2 } from 'lucide-react';

// TZ-vocably-v2.md §7.2 — "Bu ekran audio.play() uchun user gesture beradi va
// real IELTS'dagi qadamni takrorlaydi." Imtihondan OLDIN ko'rsatiladi, shuning
// uchun §5.1 qoidasi bo'yicha ODDIY exam-neutral emas — ilovaning o'z
// (Deep Merlot) uslubida.
export interface VolumeCheckProps {
  sampleAudioUrl: string;
  volume: number;
  onVolumeChange: (v: number) => void;
  onStart: () => void;
}

export default function VolumeCheck({ sampleAudioUrl, volume, onVolumeChange, onStart }: VolumeCheckProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);

  // Slayder sinov ovoziga ham ta'sir qilishi kerak — aks holda tanlangan balandlikni tekshirib bo'lmaydi.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  const toggleSample = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
      <div className="min-h-full flex items-center justify-center px-4 py-6">
        <audio
          ref={audioRef}
          src={sampleAudioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <div className="w-full max-w-sm bg-surface rounded-2xl shadow-card border border-border p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow">
            <Headphones className="text-on-accent" size={26} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink font-display">Ovozni tekshirish</h1>
            <p className="text-sm text-muted mt-1.5">
              Naushnik taqing va quyidagi tugmani bosib ovoz balandligini sozlang.
            </p>
          </div>

          <button
            onClick={toggleSample}
            type="button"
            className="w-full min-h-11 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-on-accent font-semibold rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "To'xtatish" : 'Sinov ovozini eshitish'}
          </button>

          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-muted flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full accent-accent"
              aria-label="Ovoz balandligi"
            />
          </div>

          <label className="flex items-center gap-2 min-h-11 text-sm text-ink cursor-pointer justify-center">
            <input type="checkbox" checked={heard} onChange={(e) => setHeard(e.target.checked)} className="w-4 h-4 accent-accent" />
            Ovozni eshitdim va tayyorman
          </label>

          <button
            onClick={onStart}
            disabled={!heard}
            type="button"
            className="w-full min-h-11 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-on-primary font-semibold rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Imtihonni boshlash
          </button>
        </div>
      </div>
    </div>
  );
}

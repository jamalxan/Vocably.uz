'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { speakText } from '@/lib/speech';
import { DEMO_WORDS } from '@/lib/demoWords';

const RATING_BUTTONS = [
  { rating: 1, label: 'Bilmadim', emoji: '🔁', className: 'bg-danger-soft hover:bg-danger/15 border-danger/30 text-danger' },
  { rating: 2, label: 'Qiynaldim', emoji: '😓', className: 'bg-warning-soft hover:bg-warning/15 border-warning/30 text-warning' },
  { rating: 3, label: 'Bildim', emoji: '✅', className: 'bg-success-soft hover:bg-success/15 border-success/30 text-success' },
  { rating: 4, label: 'Juda oson', emoji: '⚡', className: 'bg-info-soft hover:bg-info/15 border-info/30 text-info' },
];

// /demo — ro'yxatdan o'tmasdan sinab ko'rish (VOCABLY-TZ.md §3.1 IA). Haqiqiy
// Kartochka rejimining (src/components/FlashcardMode.jsx) vizual naqshini
// takrorlaydi, lekin ATAYLAB mustaqil: SRS/reviewWord/AppContext'ga bog'liq
// emas — bosilgan baho hech qayerga saqlanmaydi (login yo'q, saqlaydigan joy
// yo'q), faqat "his qildirish" uchun. Oxirida ro'yxatdan o'tish CTA'si bilan
// yakunlanadi.
export default function DemoExperience() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const cardRef = useRef(null);

  const current = DEMO_WORDS[index];

  const answer = () => {
    if (index + 1 >= DEMO_WORDS.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
      // Baho tugmalari yo'qolgach fokus keyingi kartaga o'tadi
      cardRef.current?.focus();
    }
  };

  const onCardKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((v) => !v);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent flex items-center justify-center text-on-accent shadow-glow mb-5">
          <Sparkles size={28} />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink mb-2">Ajoyib!</h2>
        <p className="text-sm text-muted mb-8">
          Bu — {DEMO_WORDS.length} ta so'zlik kichik namuna edi. Haqiqiy Vocably'da tizim
          har bir so'zni qachon takrorlash kerakligini o'zi hisoblaydi (FSRS), va yodlagan
          so'zlaringiz Reading/Listening/Speaking mashqlarida ham qaytadan uchraydi.
        </p>
        <Link
          href="/royxat"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-on-accent font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-glow"
        >
          Bepul boshlash <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center text-xs text-muted mb-2">
        <span>
          {index + 1} / {DEMO_WORDS.length}
        </span>
        <span className="text-accent font-medium">Ro'yxatdan o'tmasdan sinov</span>
      </div>

      <div className="w-full h-64 sm:h-72" style={{ perspective: '1200px' }}>
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          onClick={() => setFlipped((v) => !v)}
          onKeyDown={onCardKeyDown}
          className="relative w-full h-full cursor-pointer select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-transform duration-[400ms]"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <div
            className="absolute inset-0 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8"
            style={{ backfaceVisibility: 'hidden' }}
            aria-hidden={flipped}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(current.word);
              }}
              aria-label="Talaffuzni eshitish"
              tabIndex={flipped ? -1 : 0}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors"
            >
              <Volume2 size={16} />
            </button>
            <p className="text-2xl sm:text-3xl font-bold text-ink font-word text-center break-words">{current.word}</p>
            <p className="text-sm text-muted italic mt-1">{current.pronunciation}</p>
            <span className="mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-accent-soft text-accent">
              {current.enrichment.cefr}
            </span>
            <p className="text-xs text-muted mt-6 font-semibold">Ko'rish uchun bosing</p>
          </div>
          <div
            className="absolute inset-0 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            aria-hidden={!flipped}
          >
            <p className="text-xs text-muted font-word mb-2">{current.word}</p>
            <p className="text-lg sm:text-xl font-medium text-accent text-center break-words">{current.syns.join(', ')}</p>
            <p className="text-xs text-muted mt-3 text-center italic px-4">"{current.enrichment.examples[0].en}"</p>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 min-[360px]:grid-cols-4 gap-2 mt-6 w-full">
          {RATING_BUTTONS.map((b) => (
            <button
              key={b.rating}
              type="button"
              onClick={answer}
              className={`flex flex-col items-center gap-0.5 px-1 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${b.className}`}
            >
              <span className="text-base leading-none">{b.emoji}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 w-full h-[54px] flex items-center justify-center">
          <p className="text-[11px] text-muted">Kartani bosib javobni ko'ring</p>
        </div>
      )}
    </div>
  );
}

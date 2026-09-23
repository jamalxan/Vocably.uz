'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import { cardFromStats, nextReviewState, dueWordsInCategory } from '@/lib/srs';
import RangeSetupForm from './shared/RangeSetupForm';
import SessionCompleteCard from './shared/SessionCompleteCard';
import Badge from './ui/Badge';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatDuration(ms) {
  if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MINUTE_MS))} daq`;
  if (ms < DAY_MS) return `${Math.round(ms / HOUR_MS)} soat`;
  const days = ms / DAY_MS;
  if (days < 30) return `${Math.round(days)} kun`;
  if (days < 365) return `${Math.round(days / 30)} oy`;
  return `${Math.round(days / 365)} yil`;
}

const RATING_BUTTONS = [
  { rating: 1, key: '1', label: 'Bilmadim', emoji: '🔁', className: 'bg-danger-soft border-danger/25 hover:border-danger/60 text-danger' },
  { rating: 2, key: '2', label: 'Qiynaldim', emoji: '😓', className: 'bg-warning-soft border-warning/25 hover:border-warning/60 text-warning' },
  { rating: 3, key: '3', label: 'Bildim', emoji: '✅', className: 'bg-success-soft border-success/25 hover:border-success/60 text-success' },
  { rating: 4, key: '4', label: 'Juda oson', emoji: '⚡', className: 'bg-info-soft border-info/25 hover:border-info/60 text-info' },
];

// 6.1.1 (VOCABLY-TZ.md) — to'liq qayta yozildi: 3D flip animatsiya, 4 tugmali baholash
// (endi haqiqiy SRS signali beradi — ilgari Oldingi/Keyingi hech narsani saqlamas edi,
// bu U2'ning aynan o'zi edi), keyingi interval oldindan ko'rsatiladi, audio avtomatik.
export default function FlashcardMode() {
  const { activeCategory, activeCatIndex, categories, writeResetNonce, reviewWord } = useApp();

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [muted, setMuted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [setupError, setSetupError] = useState('');

  const dueWords = useMemo(
    () => dueWordsInCategory(activeCategory.words || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCategory.words, activeCatIndex]
  );

  useEffect(() => {
    setActive(false);
  }, [activeCatIndex, writeResetNonce]);

  const beginSession = (selected) => {
    if (selected.length === 0) return setSetupError("Avval so'z qo'shing");
    setSetupError('');
    setWords(selected);
    setCardIndex(0);
    setFlipped(false);
    setCorrectCount(0);
    setComplete(false);
    setActive(true);
  };

  const startFlashcards = (e) => {
    e?.preventDefault();
    const all = activeCategory.words || [];
    const sliceFrom = Math.max(1, range.from) - 1;
    const sliceTo = Math.min(all.length, range.to);
    const selected = all.slice(sliceFrom, sliceTo);
    if (selected.length === 0) return setSetupError("Oraliq noto'g'ri");
    beginSession(selected);
  };

  const startDueQueue = () => beginSession(dueWords);

  const current = words[cardIndex];

  const previews = useMemo(() => {
    if (!current) return null;
    const prevCard = cardFromStats(current.stats || {});
    const now = new Date();
    const map = {};
    for (const { rating } of RATING_BUTTONS) {
      map[rating] = formatDuration(nextReviewState(prevCard, rating, now).dueAt.getTime() - now.getTime());
    }
    return map;
  }, [current]);

  // Audio avtomatik — karta ochilganda (yoki flip qilinganda emas, faqat old tarafi
  // ko'rsatilganda) UK talaffuzi eshittiriladi, `muted` bilan o'chirish mumkin.
  useEffect(() => {
    if (active && current && !flipped && !muted) speakText(current.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, active, muted]);

  const answer = useCallback(
    (rating) => {
      if (!current) return;
      reviewWord(activeCategory._id, current._id, rating >= 2, { rating, mode: 'flashcard' });
      if (rating >= 2) setCorrectCount((n) => n + 1);
      if (cardIndex + 1 >= words.length) {
        setComplete(true);
      } else {
        setCardIndex((i) => i + 1);
        setFlipped(false);
      }
    },
    [current, activeCategory._id, reviewWord, cardIndex, words.length]
  );

  useEffect(() => {
    if (!active || complete) return undefined;
    const onKeyDown = (e) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
        // Fokusdagi tugma/havola Enter/Space'ni o'zi bajaradi (masalan baholash tugmasi).
        if ((e.key === ' ' || e.key === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((v) => !v);
        return;
      }
      if (!flipped) return;
      const btn = RATING_BUTTONS.find((b) => b.key === e.key);
      if (btn) {
        e.preventDefault();
        answer(btn.rating);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, complete, flipped, answer]);

  // So'zlar soni o'zgarganda (masalan o'chirilganda) kartochka indexini to'g'irlash.
  useEffect(() => {
    if (cardIndex >= words.length && words.length > 0) setCardIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  if (!active) {
    return (
      <RangeSetupForm
        title="Kartochka oraliqlari"
        range={range}
        onRangeChange={(r) => {
          setRange(r);
          setSetupError('');
        }}
        onSubmit={startFlashcards}
        error={setupError}
        maxWords={activeCategory.words?.length || 0}
        onQuickStart={startDueQueue}
        quickStartCount={dueWords.length}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center text-xs text-muted mb-2">
          <span>
            {cardIndex + 1} / {words.length}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
              title={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
              className="inline-flex items-center justify-center w-11 h-11 -my-3.5 md:w-8 md:h-8 md:-my-2 rounded-lg text-muted hover:text-accent hover:bg-accent-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setActive(false)}
              className="inline-flex items-center min-h-11 -my-3.5 md:min-h-0 md:my-0 text-accent hover:text-accent-hover font-semibold"
            >
              Oraliqni o'zgartirish
            </button>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72" style={{ perspective: '1200px' }}>
          <div
            role="button"
            tabIndex={0}
            aria-label={flipped ? 'Kartani old tarafga qaytarish' : "Javobni ko'rish"}
            onClick={() => setFlipped((v) => !v)}
            className="relative w-full h-full cursor-pointer select-none rounded-2xl transition-transform duration-[400ms] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)',
            }}
          >
            {/* Old tarafi — so'z */}
            <div
              className="absolute inset-0 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(current?.word);
                }}
                className="absolute top-4 right-4 p-2 bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors"
                title="Talaffuzni eshitish"
                aria-label="Talaffuzni eshitish"
              >
                <Volume2 size={16} />
              </button>
              <p className="text-2xl sm:text-3xl font-bold text-ink font-word text-center break-words">
                {current?.word}
              </p>
              {current?.pronunciation && <p className="text-sm text-muted italic mt-1">{current.pronunciation}</p>}
              {current?.enrichment?.cefr && (
                <Badge tone="accent" className="mt-2">
                  {current.enrichment.cefr}
                </Badge>
              )}
              <p className="text-xs text-muted mt-6 font-semibold">
                Ko'rish uchun bosing <span className="hidden sm:inline">(yoki Space)</span>
              </p>
            </div>

            {/* Orqa tarafi — javob */}
            <div
              className="absolute inset-0 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-lg sm:text-xl font-medium text-accent text-center break-words">
                {current?.syns.join(', ')}
              </p>
              {current?.enrichment?.examples?.[0] && (
                <p className="text-xs text-muted mt-3 text-center italic px-4">
                  "{current.enrichment.examples[0].en}"
                </p>
              )}
            </div>
          </div>
        </div>

        {flipped ? (
          <div className="grid grid-cols-4 gap-2 mt-6 w-full">
            {RATING_BUTTONS.map((b) => (
              <button
                key={b.rating}
                onClick={() => answer(b.rating)}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 min-w-0 rounded-xl border font-semibold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${b.className}`}
              >
                <span className="text-base leading-none">{b.emoji}</span>
                <span className="max-w-full break-words text-center">{b.label}</span>
                <span className="text-[11px] leading-4 font-normal opacity-80">{previews?.[b.rating]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 w-full h-[74px] flex items-center justify-center">
            <p className="text-[11px] text-muted hidden sm:block">Klaviatura: Space — ochish, 1-4 — baholash</p>
          </div>
        )}
      </div>

      <SessionCompleteCard
        open={complete}
        title="Sessiya yakunlandi!"
        score={correctCount}
        total={words.length}
        onClose={() => setActive(false)}
        onRestart={() => beginSession(words)}
      />
    </div>
  );
}

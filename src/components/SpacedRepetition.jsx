'use client';
import { useState, useMemo, useEffect } from 'react';
import { Volume2, Flame, Trophy, CalendarCheck, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';
import { cardFromStats, nextReviewState } from '@/lib/srs';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Har bir baho tugmasi bosilsa keyingi takrorlash qachonligini taxminiy ko'rsatish uchun
// (Anki'dagi kabi) — foydalanuvchi "Oson" bilan "Qiyin" orasidagi farqni ko'rib turadi.
function formatDuration(ms) {
  if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MINUTE_MS))} daq`;
  if (ms < DAY_MS) return `${Math.round(ms / HOUR_MS)} soat`;
  const days = ms / DAY_MS;
  if (days < 30) return `${Math.round(days)} kun`;
  if (days < 365) return `${Math.round(days / 30)} oy`;
  return `${Math.round(days / 365)} yil`;
}

// 1=Qayta(bilmadim) 2=Qiyin 3=Bildim 4=Oson — standart SM-2 baholash shkalasi (src/lib/srs.ts).
const RATING_BUTTONS = [
  { rating: 1, key: '1', label: 'Qayta', emoji: '🔁', className: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' },
  { rating: 2, key: '2', label: 'Qiyin', emoji: '😓', className: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700' },
  { rating: 3, key: '3', label: 'Bildim', emoji: '✅', className: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
  { rating: 4, key: '4', label: 'Oson', emoji: '⚡', className: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
];

export default function SpacedRepetition({ active }) {
  const { categories, reviewWord, reviewStreak, practiceWordIds, clearPracticeQueue } = useApp();
  const [showAnswer, setShowAnswer] = useState(false);
  // A5/A13 (docs/AUDIT_FINDINGS.md): "Navbatda: N" bilan sarlavhadagi "Jami so'zlar" ziddiyatli
  // ko'rinardi. reviewedCount + qolgan dueWords.length'dan "X / Total" sessiya progressi
  // hisoblanadi — FlashcardMode/ListeningMode'dagi progress bilan bir xil uslub.
  const [reviewedCount, setReviewedCount] = useState(0);

  // Dashboard'dagi "Qiynalayotgan so'zlar" → "Shularni mashq qilish" shu ro'yxatni to'ldiradi.
  // Bo'lsa, oddiy due-navbat o'rniga faqat shu so'zlar ko'rsatiladi (due muddatidan qat'iy nazar).
  const practiceSet = practiceWordIds ? new Set(practiceWordIds) : null;

  const dueWords = useMemo(() => {
    const now = Date.now();
    const list = [];
    categories.forEach((c) => {
      (c.words || []).forEach((w) => {
        if (practiceSet) {
          if (practiceSet.has(w._id)) list.push({ categoryId: c._id, categoryName: c.name, word: w });
          return;
        }
        const next = w.stats?.nextReview ? new Date(w.stats.nextReview).getTime() : 0;
        if (next <= now) list.push({ categoryId: c._id, categoryName: c.name, word: w });
      });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, practiceWordIds]);

  // Maxsus mashq ro'yxati tugagach, avtomatik oddiy due-navbatga qaytamiz.
  useEffect(() => {
    if (practiceSet && dueWords.length === 0 && reviewedCount > 0) clearPracticeQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueWords.length]);

  const masteredCount = useMemo(
    () => categories.reduce((sum, c) => sum + (c.words || []).filter((w) => (w.stats?.level || 0) >= 5).length, 0),
    [categories]
  );

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return categories.reduce(
      (sum, c) =>
        sum +
        (c.words || []).filter((w) => w.stats?.lastReviewed && String(w.stats.lastReviewed).slice(0, 10) === today)
          .length,
      0
    );
  }, [categories]);

  const current = dueWords[0];

  // Har bir baho tugmasi ostida "keyingi safar qachon" taxminini ko'rsatish uchun — haqiqiy
  // saqlanadigan natija emas (fuzz tasodifiy), lekin foydalanuvchiga farqni his qildiradi.
  const previews = useMemo(() => {
    if (!current) return null;
    const prevCard = cardFromStats(current.word.stats || {});
    const now = new Date();
    const map = {};
    for (const { rating } of RATING_BUTTONS) {
      map[rating] = formatDuration(nextReviewState(prevCard, rating, now).dueAt.getTime() - now.getTime());
    }
    return map;
  }, [current]);

  const answer = (rating) => {
    if (!current) return;
    // rating===1 (Qayta) — eslay olmadi, hisobda "xato" sifatida yoziladi; 2-4 — "to'g'ri".
    reviewWord(current.categoryId, current.word._id, rating >= 2, { rating });
    setReviewedCount((n) => n + 1);
    setShowAnswer(false);
  };

  // A12 (docs/AUDIT_FINDINGS.md): klaviatura yorliqlari — Space kartani ochadi, 1-4 baholaydi.
  // Dashboard hamma rejimlarni bir vaqtda mount qilib, faqat CSS bilan yashiradi (B14), shuning
  // uchun `active` (view === 'review') tekshirilmasa, boshqa bo'limda ham bu tugmalar ishlab
  // ketardi.
  useEffect(() => {
    if (!active || !current) return undefined;
    const onKeyDown = (e) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer((v) => !v);
        return;
      }
      if (!showAnswer) return;
      const btn = RATING_BUTTONS.find((b) => b.key === e.key);
      if (btn) {
        e.preventDefault();
        answer(btn.rating);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, current, showAnswer]);

  return (
    <div className="flex flex-col items-center">
      {practiceSet && (
        <div className="w-full max-w-md flex items-center justify-between gap-3 bg-accent-soft border border-accent/20 text-accent text-xs rounded-lg px-3 py-2 mb-4">
          <span>Maxsus mashq: qiynalayotgan so'zlar ({dueWords.length} qoldi)</span>
          <button
            onClick={clearPracticeQueue}
            className="flex items-center gap-1 font-semibold hover:text-accent-hover flex-shrink-0"
          >
            <X size={12} /> Chiqish
          </button>
        </div>
      )}

      <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-surface border border-border rounded-xl py-3 shadow-sm">
          <CalendarCheck className="mx-auto text-accent mb-1" size={16} />
          <p className="text-lg font-bold text-primary">{todayCount}</p>
          <p className="text-[10px] text-muted">Bugun ko'rildi</p>
        </div>
        <div className="bg-surface border border-border rounded-xl py-3 shadow-sm">
          <Flame className="mx-auto text-orange-500 mb-1" size={16} />
          <p className="text-lg font-bold text-primary">{reviewStreak}</p>
          <p className="text-[10px] text-muted">Kunlik ketma-ket</p>
        </div>
        <div className="bg-surface border border-border rounded-xl py-3 shadow-sm">
          <Trophy className="mx-auto text-accent mb-1" size={16} />
          <p className="text-lg font-bold text-primary">{masteredCount}</p>
          <p className="text-[10px] text-muted">O'zlashtirilgan</p>
        </div>
      </div>

      {!current ? (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm text-muted">Bugungi takrorlash uchun so'z qolmadi!</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center text-xs text-muted mb-2">
            <span>{current.categoryName}</span>
            <span>
              {reviewedCount + 1} / {reviewedCount + dueWords.length}
            </span>
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full h-64 sm:h-72 bg-surface rounded-2xl shadow-premium border border-border flex flex-col justify-center items-center p-6 sm:p-8 cursor-pointer relative select-none transition-transform hover:scale-[1.01]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(current.word.word);
              }}
              className="absolute top-4 right-4 p-2 bg-accent-soft text-accent hover:bg-accent/20 rounded-full transition-colors"
              title="Talaffuzni eshitish"
            >
              <Volume2 size={16} />
            </button>
            <p className="text-2xl sm:text-3xl font-bold text-primary font-word text-center break-words">
              {current.word.word}
            </p>
            {current.word.pronunciation && (
              <p className="text-sm text-muted italic mt-1">{current.word.pronunciation}</p>
            )}
            {showAnswer ? (
              <p className="text-lg sm:text-xl font-medium text-accent mt-6 text-center">
                {current.word.syns.join(', ')}
              </p>
            ) : (
              <p className="text-xs text-muted mt-6 font-semibold">
                Ko'rish uchun bosing <span className="hidden sm:inline">(yoki Space)</span>
              </p>
            )}
          </div>

          {showAnswer ? (
            <div className="grid grid-cols-4 gap-2 mt-6 w-full">
              {RATING_BUTTONS.map((b) => (
                <button
                  key={b.rating}
                  onClick={() => answer(b.rating)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${b.className}`}
                >
                  <span className="text-base leading-none">{b.emoji}</span>
                  <span>{b.label}</span>
                  <span className="text-[10px] font-normal opacity-70">{previews?.[b.rating]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 w-full h-[62px] flex items-center justify-center">
              <p className="text-[10px] text-muted hidden sm:block">Klaviatura: Space — ochish, 1-4 — baholash</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

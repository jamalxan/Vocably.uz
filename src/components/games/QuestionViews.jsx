'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';
import { speakText } from '@/lib/speech';
import { optionStateClass, answerStateClass, OPTION_BUTTON_CLASS } from '@/lib/lugatQuiz';

const SPEEDS = [0.75, 1, 1.25];

// ---------------------------------------------------------------------------
// Audio tugmasi: Eshitish / Qayta / tezlik 0.75x-1x-1.25x (TZ §54). Audio ishlamasa zaxira xabar.
// ---------------------------------------------------------------------------
export function AudioPlayer({ text, autoPlay = true }) {
  const [speed, setSpeed] = useState(1);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const play = useCallback(() => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9 * speed;
      u.onstart = () => setPlaying(true);
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(u);
    } catch {
      setPlaying(false);
    }
  }, [text, speed]);

  // Yangi savol ochilganda bir marta avtomatik (brauzer bloklasa — tugma bor).
  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(play, 250);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  if (!supported) {
    return (
      <p role="alert" className="text-sm text-warning bg-warning-soft border border-warning/30 rounded-xl px-3 py-2">
        Bu brauzerda audio qo'llab-quvvatlanmaydi. Chrome, Edge yoki Safari'dan foydalaning.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={play}
        aria-label={playing ? 'Audio ijro etilmoqda' : 'Audioni eshitish'}
        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm shadow-glow hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Volume2 size={18} aria-hidden="true" className={playing ? 'motion-safe:animate-pulse' : ''} />
        {playing ? 'Eshitilmoqda…' : 'Eshitish'}
      </button>
      <div role="group" aria-label="Audio tezligi" className="inline-flex rounded-xl border border-border overflow-hidden">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className={`px-3 py-2 min-h-11 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
              speed === s ? 'bg-accent-soft text-accent-hover' : 'bg-surface text-muted hover:bg-bg-sunken'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Javobdan keyingi fikr-mulohaza bloki (jazolamaydigan ohang, TZ §65)
// ---------------------------------------------------------------------------
export function Feedback({ result, near }) {
  if (!result) return null;
  const ok = result.isCorrect;
  const partial = !ok && result.totalParts != null && (result.correctParts || 0) > 0;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-xl border px-4 py-3 text-sm ${ok ? 'border-success/40 bg-success-soft text-success' : partial ? 'border-warning/40 bg-warning-soft text-warning' : 'border-danger/30 bg-danger-soft text-danger'}`}
    >
      <p className="font-semibold flex items-center gap-2">
        {ok ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
        {ok
          ? "To'g'ri!"
          : partial
            ? `${result.correctParts}/${result.totalParts} juftlik to'g'ri — yaxshi urinish`
            : near
              ? "Deyarli to'g'ri — bitta harfda xato"
              : "Xato qilish o'rganishning bir qismi — bu so'zni yana uchratamiz"}
      </p>
      {!ok && result.correctDisplay && result.totalParts == null && (
        <p className="mt-1 text-ink">
          To'g'ri javob: <strong>{result.correctDisplay}</strong>
        </p>
      )}
      {result.explanation && <p className="mt-1 text-muted">{result.explanation}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variantli savol (mc_meaning, mc_word, definition, syn_ant, fill_choice, listen_choose)
// ---------------------------------------------------------------------------
export function ChoiceQuestion({ question, result, locked, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const optionRefs = useRef([]);

  useEffect(() => setPicked(null), [question.qid]);

  const choose = useCallback(
    (opt) => {
      if (locked || result) return;
      setPicked(opt.id);
      onAnswer(opt.id);
    },
    [locked, result, onAnswer]
  );

  // Klaviatura: 1-5 raqamlari variantni tanlaydi (TZ §40)
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= (question.options || []).length) {
        e.preventDefault();
        choose(question.options[n - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, choose]);

  const imageOptions = (question.options || []).some((o) => o.imageUrl);
  return (
    <div role="radiogroup" aria-label="Javob variantlari" className={imageOptions ? 'grid grid-cols-2 gap-2.5' : 'grid gap-2.5'}>
      {(question.options || []).map((opt, i) => {
        const isCorrectOpt = !!result && opt.text === result.correctDisplay;
        const isSelected = picked === opt.id;
        return (
          <button
            key={opt.id}
            ref={(el) => (optionRefs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={locked || !!result}
            onClick={() => choose(opt)}
            className={`${OPTION_BUTTON_CLASS} flex items-center gap-3 disabled:cursor-default ${optionStateClass(!!result, isCorrectOpt, isSelected)}`}
          >
            <span aria-hidden="true" className="w-6 h-6 rounded-md border border-border text-xs font-semibold flex items-center justify-center text-muted flex-shrink-0">
              {i + 1}
            </span>
            {opt.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={opt.imageUrl} alt={opt.text} loading="lazy" className="flex-1 min-w-0 h-28 object-contain rounded-lg" />
            ) : (
              <span className="flex-1 min-w-0 break-words">{opt.text}</span>
            )}
            {result && isCorrectOpt && <Check size={16} aria-label="To'g'ri javob" />}
            {result && isSelected && !isCorrectOpt && <X size={16} aria-label="Sizning javobingiz" />}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Yozma savol (fill_typed, listen_type, spell_drop)
// ---------------------------------------------------------------------------
export function TypedQuestion({ question, result, locked, onAnswer, near }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setValue('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [question.qid]);

  const submit = (e) => {
    e?.preventDefault();
    if (locked || result) return;
    onAnswer(value.trim());
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label htmlFor={`typed-${question.qid}`} className="sr-only">
        Javobingizni yozing
      </label>
      <input
        id={`typed-${question.qid}`}
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={locked || !!result}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Javobni yozing…"
        className={`w-full px-4 py-3 border rounded-xl text-base bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${result ? answerStateClass(result.isCorrect) : 'border-border'}`}
      />
      {question.hint && <p className="text-xs text-muted">Maslahat: {question.hint}</p>}
      {!result && (
        <button
          type="submit"
          disabled={locked || !value.trim()}
          className="self-start px-5 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Tekshirish
        </button>
      )}
      {near && !result?.isCorrect && <p className="text-xs text-warning">Deyarli to'g'ri!</p>}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Jumla quruvchi (sentence_build)
// ---------------------------------------------------------------------------
export function ArrangeQuestion({ question, result, locked, onAnswer }) {
  const [chosen, setChosen] = useState([]); // token indekslari
  useEffect(() => setChosen([]), [question.qid]);

  const tokens = question.tokens || [];
  const available = tokens.map((t, i) => ({ t, i })).filter(({ i }) => !chosen.includes(i));
  const disabled = locked || !!result;

  return (
    <div className="grid gap-4">
      <div
        aria-label="Sizning jumlangiz"
        className={`min-h-14 flex flex-wrap gap-2 p-3 rounded-xl border border-dashed ${result ? answerStateClass(result.isCorrect) : 'border-border bg-bg-sunken'}`}
      >
        {chosen.length === 0 && <span className="text-sm text-muted">So'zlarni bosib jumla tuzing…</span>}
        {chosen.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            disabled={disabled}
            onClick={() => setChosen((c) => c.filter((x) => x !== i))}
            className="px-3 py-2 min-h-11 rounded-lg bg-accent-soft text-accent-hover text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${tokens[i]} — olib tashlash`}
          >
            {tokens[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Mavjud so'zlar">
        {available.map(({ t, i }) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => setChosen((c) => [...c, i])}
            className="px-3 py-2 min-h-11 rounded-lg border border-border bg-surface text-ink text-sm hover:border-accent/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t}
          </button>
        ))}
      </div>
      {!result && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled || chosen.length !== tokens.length}
            onClick={() => onAnswer(chosen.map((i) => tokens[i]))}
            className="px-5 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Tekshirish
          </button>
          <button
            type="button"
            disabled={disabled || chosen.length === 0}
            onClick={() => setChosen([])}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-11 rounded-xl border border-border text-sm text-muted hover:bg-bg-sunken disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw size={14} aria-hidden="true" /> Tozalash
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Juftlash (match_pairs): chap -> o'ng
// ---------------------------------------------------------------------------
const PAIR_COLORS = ['bg-accent-soft border-accent/50', 'bg-info-soft border-info/50', 'bg-success-soft border-success/50', 'bg-warning-soft border-warning/50', 'bg-danger-soft border-danger/40', 'bg-primary-soft border-border'];

export function MatchQuestion({ question, result, locked, onAnswer }) {
  const [pairs, setPairs] = useState({}); // leftId -> rightId
  const [activeLeft, setActiveLeft] = useState(null);
  useEffect(() => {
    setPairs({});
    setActiveLeft(null);
  }, [question.qid]);

  const lefts = useMemo(() => question.lefts || [], [question.lefts]);
  const rights = question.rights || [];
  const disabled = locked || !!result;
  const colorOf = useMemo(() => Object.fromEntries(lefts.map((l, i) => [l.id, PAIR_COLORS[i % PAIR_COLORS.length]])), [lefts]);
  const rightOwner = useMemo(() => Object.fromEntries(Object.entries(pairs).map(([l, r]) => [r, l])), [pairs]);

  const clickLeft = (l) => {
    if (disabled) return;
    if (pairs[l.id]) {
      // bog'langan juftlikni bekor qilish
      setPairs((p) => {
        const n = { ...p };
        delete n[l.id];
        return n;
      });
      setActiveLeft(l.id);
      return;
    }
    setActiveLeft((cur) => (cur === l.id ? null : l.id));
  };

  const clickRight = (r) => {
    if (disabled) return;
    if (rightOwner[r.id]) {
      const owner = rightOwner[r.id];
      setPairs((p) => {
        const n = { ...p };
        delete n[owner];
        return n;
      });
      return;
    }
    if (!activeLeft) return;
    setPairs((p) => ({ ...p, [activeLeft]: r.id }));
    setActiveLeft(null);
  };

  const allPaired = lefts.length > 0 && lefts.every((l) => pairs[l.id]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <ul className="grid gap-2" aria-label="So'zlar">
          {lefts.map((l) => {
            const part = result?.partResults?.[l.id];
            return (
              <li key={l.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => clickLeft(l)}
                  aria-pressed={activeLeft === l.id}
                  className={`w-full text-left px-3 py-3 min-h-11 border rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    result
                      ? part
                        ? 'border-success/40 bg-success-soft text-success'
                        : 'border-danger/40 bg-danger-soft text-danger'
                      : pairs[l.id]
                        ? colorOf[l.id]
                        : activeLeft === l.id
                          ? 'border-accent bg-accent-soft text-accent-hover'
                          : 'border-border bg-surface text-ink hover:border-accent/30'
                  }`}
                >
                  {l.text}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="grid gap-2" aria-label="Tarjimalar">
          {rights.map((r) => {
            const owner = rightOwner[r.id];
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => clickRight(r)}
                  className={`w-full text-left px-3 py-3 min-h-11 border rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    owner ? colorOf[owner] : 'border-border bg-surface text-ink hover:border-accent/30'
                  }`}
                >
                  {r.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {!result && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={disabled || !allPaired}
            onClick={() => onAnswer(pairs)}
            className="px-5 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Tekshirish
          </button>
          <span className="text-xs text-muted">
            {Object.keys(pairs).length}/{lefts.length} juftlik
          </span>
        </div>
      )}
      {result?.correctMap && (
        <ul className="text-sm text-muted grid gap-1" aria-label="To'g'ri juftliklar">
          {lefts.map((l) => {
            const rid = result.correctMap[l.id];
            const right = rights.find((r) => r.id === rid);
            return (
              <li key={l.id}>
                <strong className="text-ink">{l.text}</strong> — {right?.text}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Xotira kartalari (memory_pairs): juftlik mosligi mijozda (memoryMap) tekshiriladi, natija serverda tasdiqlanadi.
// ---------------------------------------------------------------------------
export function MemoryQuestion({ question, result, locked, onAnswer, reducedMotion }) {
  const map = question.memoryMap || {};
  const cards = useMemo(() => {
    const arr = [
      ...(question.lefts || []).map((l) => ({ key: `l-${l.id}`, side: 'l', id: l.id, text: l.text })),
      ...(question.rights || []).map((r) => ({ key: `r-${r.id}`, side: 'r', id: r.id, text: r.text })),
    ];
    // barqaror aralashtirish (qid asosida) — qayta render qilganda joylar o'zgarmasin
    let seed = 0;
    for (const ch of question.qid + arr.length) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [question]);

  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [tries, setTries] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    setFlipped([]);
    setMatched([]);
    setTries(0);
    return () => clearTimeout(timer.current);
  }, [question.qid]);

  const pairCount = (question.lefts || []).length;

  useEffect(() => {
    if (pairCount && matched.length === pairCount * 2 && !result) onAnswer(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched.length]);

  const flip = (card) => {
    if (locked || result || flipped.includes(card.key) || matched.includes(card.key) || flipped.length >= 2) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length === 2) {
      setTries((t) => t + 1);
      const [a, b] = next.map((k) => cards.find((c) => c.key === k));
      const left = a.side === 'l' ? a : b;
      const right = a.side === 'r' ? a : b;
      const ok = a.side !== b.side && map[left.id] === right.id;
      timer.current = setTimeout(
        () => {
          if (ok) setMatched((m) => [...m, a.key, b.key]);
          setFlipped([]);
        },
        ok ? 350 : reducedMotion ? 600 : 900
      );
    }
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {cards.map((c) => {
          const isUp = flipped.includes(c.key) || matched.includes(c.key);
          const isMatched = matched.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(c)}
              disabled={locked || !!result || isMatched}
              aria-label={isUp ? c.text : 'Yopiq karta'}
              aria-pressed={isUp}
              className={`min-h-16 px-2 py-3 rounded-xl border text-sm font-medium text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isMatched
                  ? 'border-success/40 bg-success-soft text-success'
                  : isUp
                    ? 'border-accent bg-accent-soft text-accent-hover'
                    : 'border-border bg-primary-soft text-transparent hover:border-accent/40'
              }`}
            >
              {isUp ? c.text : '?'}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted" aria-live="polite">
        {matched.length / 2}/{pairCount} juftlik topildi · {tries} ta urinish
      </p>
    </div>
  );
}

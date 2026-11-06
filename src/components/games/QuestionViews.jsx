'use client';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';
import { speakText } from '@/lib/speech';
import { optionStateClass, answerStateClass, OPTION_BUTTON_CLASS } from '@/lib/lugatQuiz';
import { useT } from '@/context/LocaleContext';

const SPEEDS = [0.75, 1, 1.25];

const subscribeNoop = () => () => {};
const getSpeechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// ---------------------------------------------------------------------------
// Audio tugmasi: Eshitish / Qayta / tezlik 0.75x-1x-1.25x (TZ §54). Audio ishlamasa zaxira xabar.
// ---------------------------------------------------------------------------
export function AudioPlayer({ text, autoPlay = true }) {
  const { t: tx } = useT();
  const [speed, setSpeed] = useState(1);
  const supported = useSyncExternalStore(subscribeNoop, getSpeechSupported, () => true);
  const [playing, setPlaying] = useState(false);

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
        {tx('q.audioUnsupported')}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={play}
        aria-label={playing ? tx('q.audioPlaying') : tx('q.audioListen')}
        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm shadow-glow hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Volume2 size={18} aria-hidden="true" className={playing ? 'motion-safe:animate-pulse' : ''} />
        {playing ? tx('q.listening') : tx('q.listen')}
      </button>
      <div role="group" aria-label={tx('q.audioSpeed')} className="inline-flex rounded-xl border border-border overflow-hidden">
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
  const { t: tx } = useT();
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
          ? tx('q.correct')
          : partial
            ? tx('q.partial', { a: result.correctParts, b: result.totalParts })
            : near
              ? tx('q.near')
              : tx('q.wrong')}
      </p>
      {!ok && result.correctDisplay && result.totalParts == null && (
        <p className="mt-1 text-ink">
          {tx('q.correctAnswer')} <strong>{result.correctDisplay}</strong>
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
  const { t: tx } = useT();
  const [picked, setPicked] = useState(null);
  const optionRefs = useRef([]);

  // Yangi savolda tanlov render vaqtida tozalanadi.
  const [prevQid, setPrevQid] = useState(question.qid);
  if (prevQid !== question.qid) {
    setPrevQid(question.qid);
    setPicked(null);
  }

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

  return (
    <div role="radiogroup" aria-label={tx('q.optionsAria')} className="grid gap-2.5">
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
            <span className="flex-1 min-w-0 break-words">{opt.text}</span>
            {result && isCorrectOpt && <Check size={16} aria-label={tx('q.rightAnswerAria')} />}
            {result && isSelected && !isCorrectOpt && <X size={16} aria-label={tx('q.yourAnswerAria')} />}
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
  const { t: tx } = useT();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Yangi savolda qiymat render vaqtida tozalanadi.
  const [prevQid, setPrevQid] = useState(question.qid);
  if (prevQid !== question.qid) {
    setPrevQid(question.qid);
    setValue('');
  }

  useEffect(() => {
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
        {tx('q.typeLabel')}
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
        placeholder={tx('q.typePlaceholder')}
        className={`w-full px-4 py-3 border rounded-xl text-base bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${result ? answerStateClass(result.isCorrect) : 'border-border'}`}
      />
      {question.hint && <p className="text-xs text-muted">{tx('q.hintLabel', { hint: question.hint })}</p>}
      {!result && (
        <button
          type="submit"
          disabled={locked || !value.trim()}
          className="self-start px-5 py-2.5 min-h-11 rounded-xl bg-accent text-on-accent font-semibold text-sm hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {tx('q.check')}
        </button>
      )}
      {near && !result?.isCorrect && <p className="text-xs text-warning">{tx('q.nearShort')}</p>}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Jumla quruvchi (sentence_build)
// ---------------------------------------------------------------------------
export function ArrangeQuestion({ question, result, locked, onAnswer }) {
  const { t: tx } = useT();
  const [chosen, setChosen] = useState([]); // token indekslari
  const [prevQid, setPrevQid] = useState(question.qid);
  if (prevQid !== question.qid) {
    setPrevQid(question.qid);
    setChosen([]);
  }

  const tokens = question.tokens || [];
  const available = tokens.map((t, i) => ({ t, i })).filter(({ i }) => !chosen.includes(i));
  const disabled = locked || !!result;

  return (
    <div className="grid gap-4">
      <div
        aria-label={tx('q.yourSentence')}
        className={`min-h-14 flex flex-wrap gap-2 p-3 rounded-xl border border-dashed ${result ? answerStateClass(result.isCorrect) : 'border-border bg-bg-sunken'}`}
      >
        {chosen.length === 0 && <span className="text-sm text-muted">{tx('q.tapWords')}</span>}
        {chosen.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            disabled={disabled}
            onClick={() => setChosen((c) => c.filter((x) => x !== i))}
            className="px-3 py-2 min-h-11 rounded-lg bg-accent-soft text-accent-hover text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={tx('q.remove', { word: tokens[i] })}
          >
            {tokens[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" aria-label={tx('q.availableWords')}>
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
            {tx('q.check')}
          </button>
          <button
            type="button"
            disabled={disabled || chosen.length === 0}
            onClick={() => setChosen([])}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-11 rounded-xl border border-border text-sm text-muted hover:bg-bg-sunken disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <RotateCcw size={14} aria-hidden="true" /> {tx('q.clear')}
          </button>
        </div>
      )}
    </div>
  );
}

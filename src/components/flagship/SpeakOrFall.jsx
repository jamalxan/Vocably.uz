'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, Shuffle, RotateCcw, ArrowRight, Loader2, Square } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { SPEAK, PART2_TOPICS, pickTopic, silenceLimitAt, dangerLevel, rmsLevel, createVad, createSilenceTracker, speakSummary } from '@/lib/flagship/speak';
import { beep, readFx } from '@/lib/flagship/client';
import ShareCard from './ShareCard';

// "Gapir yoki yiqil" (TZ 2.0 §7). Voice activity is measured on the device from the microphone
// level (Web Audio) — no audio is uploaded by us. Filler words need a transcript: when the
// browser has speech recognition and the user leaves it on, we count fillers from it (in Chrome
// that recognition runs on Google's servers — the intro says so).

const COPY = {
  uz: {
    title: 'Gapir yoki yiqil',
    tagline: "60 soniya IELTS Part 2 mavzusida gapiring. Jim qolsangiz, qahramon jarga yaqinlashadi.",
    rules: ['Ruxsat etilgan pauza har 15 soniyada qisqaradi: 12 → 8 → 5 → 3 s.', "Gapirsangiz — qahramon xavfsiz joyga qaytadi.", '60 soniya chidasangiz — g‘alaba.'],
    privacy: "Ovoz balandligi faqat qurilmangizda o'lchanadi, yozib olinmaydi.",
    asrLabel: "Filler so'zlarni sanash (um, uh, you know…)",
    asrNote: "Buning uchun brauzerning nutqni aniqlash xizmati ishlatiladi (Chrome'da — Google serverlari).",
    asrMissing: "Brauzeringizda nutqni aniqlash yo'q — filler so'zlar sanalmaydi.",
    start: 'Mavzuni olish',
    topic: 'Mavzu',
    youShould: 'Gapiring:',
    another: 'Boshqa mavzu',
    go: 'Gapirishni boshlash',
    calibrating: "Jim turing — xona shovqini o'lchanmoqda…",
    allowed: (s) => `Ruxsat etilgan pauza: ${s} s`,
    silent: (s) => `Jimlik: ${s} s`,
    speaking: 'Gapiryapsiz',
    stop: 'Tugatish',
    fell: 'Yiqildingiz!',
    stopped: "To'xtatildi",
    survived: 'Chidadingiz!',
    seconds: 'soniya chidadingiz',
    pauses: 'Pauzalar',
    longest: 'Eng uzun pauza',
    fillers: "Filler so'zlar",
    wpm: "So'z/daqiqa",
    pauseMap: 'Pauza xaritasi',
    noPauses: "1 soniyadan uzun pauza bo'lmadi.",
    again: 'Yana urinish',
    saveCta: 'Natijangni saqlash va rejangni olish',
    practice: 'Speaking mashqlari',
    micDenied: "Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering va qayta urining.",
    micMissing: "Mikrofon topilmadi yoki brauzer qo'llab-quvvatlamaydi.",
    level: 'Ovoz darajasi',
    na: '—',
  },
  en: {
    title: 'Speak or Fall',
    tagline: 'Speak for 60 seconds on an IELTS Part 2 topic. Go quiet and your character walks toward the cliff.',
    rules: ['The pause you are allowed shrinks every 15 s: 12 → 8 → 5 → 3 s.', 'Speak and the character walks back to safety.', 'Last 60 seconds to win.'],
    privacy: 'Loudness is measured on your device only; nothing is recorded.',
    asrLabel: 'Count filler words (um, uh, you know…)',
    asrNote: "This uses the browser's speech recognition (in Chrome, Google's servers).",
    asrMissing: 'Your browser has no speech recognition — filler words will not be counted.',
    start: 'Get a topic',
    topic: 'Topic',
    youShould: 'You should say:',
    another: 'Another topic',
    go: 'Start speaking',
    calibrating: 'Stay quiet — measuring room noise…',
    allowed: (s) => `Allowed pause: ${s} s`,
    silent: (s) => `Silence: ${s} s`,
    speaking: 'Speaking',
    stop: 'Stop',
    fell: 'You fell!',
    stopped: 'Stopped',
    survived: 'You made it!',
    seconds: 'seconds survived',
    pauses: 'Pauses',
    longest: 'Longest pause',
    fillers: 'Filler words',
    wpm: 'Words/min',
    pauseMap: 'Pause map',
    noPauses: 'No pause longer than 1 second.',
    again: 'Try again',
    saveCta: 'Save your result and get your plan',
    practice: 'Speaking practice',
    micDenied: 'Microphone access was blocked. Allow it in your browser settings and try again.',
    micMissing: 'No microphone found, or the browser does not support it.',
    level: 'Voice level',
    na: '—',
  },
  ru: {
    title: 'Speak or Fall',
    tagline: 'Говорите 60 секунд на тему IELTS Part 2. Замолчите — и персонаж пойдёт к обрыву.',
    rules: ['Допустимая пауза сокращается каждые 15 с: 12 → 8 → 5 → 3 с.', 'Говорите — и персонаж вернётся в безопасное место.', 'Продержитесь 60 секунд, чтобы победить.'],
    privacy: 'Громкость измеряется только на вашем устройстве, ничего не записывается.',
    asrLabel: 'Считать слова-паразиты (um, uh, you know…)',
    asrNote: 'Используется распознавание речи браузера (в Chrome — серверы Google).',
    asrMissing: 'В вашем браузере нет распознавания речи — слова-паразиты считаться не будут.',
    start: 'Получить тему',
    topic: 'Тема',
    youShould: 'Расскажите:',
    another: 'Другая тема',
    go: 'Начать говорить',
    calibrating: 'Помолчите — измеряем шум в комнате…',
    allowed: (s) => `Допустимая пауза: ${s} с`,
    silent: (s) => `Тишина: ${s} с`,
    speaking: 'Говорите',
    stop: 'Стоп',
    fell: 'Вы упали!',
    stopped: 'Остановлено',
    survived: 'Вы справились!',
    seconds: 'секунд продержались',
    pauses: 'Паузы',
    longest: 'Самая длинная пауза',
    fillers: 'Слова-паразиты',
    wpm: 'Слов/мин',
    pauseMap: 'Карта пауз',
    noPauses: 'Ни одной паузы дольше 1 секунды.',
    again: 'Ещё раз',
    saveCta: 'Сохраните результат и получите план',
    practice: 'Тренировка речи',
    micDenied: 'Доступ к микрофону заблокирован. Разрешите его в настройках браузера и попробуйте снова.',
    micMissing: 'Микрофон не найден или браузер его не поддерживает.',
    level: 'Уровень голоса',
    na: '—',
  },
};

const Recognition = () => (typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);

function Cliff({ danger, fallen, speaking }) {
  // Character walks from x=40 (safe) to the edge at x=250; past the edge it drops.
  const x = 40 + Math.min(1, danger) * 210;
  return (
    <svg viewBox="0 0 320 180" className="w-full h-auto" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2350" />
          <stop offset="1" stopColor="#0b1020" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sky)" />
      <path d="M0 120 H262 L270 180 H0 Z" fill="#2b3170" />
      <path d="M0 120 H262" stroke="#e0566a" strokeWidth="2" />
      <path d="M262 120 L270 180" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" opacity={0.4 + danger * 0.6} />
      <g
        style={{
          transform: `translate(${fallen ? 290 : x}px, ${fallen ? 210 : 0}px) rotate(${fallen ? 70 : 0}deg)`,
          transformOrigin: '0 110px',
          transition: fallen ? 'transform 900ms cubic-bezier(.5,0,.9,.4)' : 'transform 200ms linear',
        }}
      >
        <circle cx="0" cy="84" r="8" fill="#f2d1b3" />
        <rect x="-6" y="92" width="12" height="18" rx="5" fill={speaking ? '#22c55e' : danger > 0.66 ? '#ef4444' : '#e0566a'} />
        <path d="M-4 110 L-6 120 M4 110 L6 120" stroke="#e5e7ff" strokeWidth="3" strokeLinecap="round" />
        {speaking && <path d="M12 80 q6 4 0 8 M17 76 q9 8 0 16" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />}
      </g>
    </svg>
  );
}

function PauseMap({ pauses, c }) {
  return (
    <div>
      <div className="relative h-6 rounded-lg bg-success-soft border border-border overflow-hidden" role="img" aria-label={`${c.pauseMap}: ${pauses.map((p) => `${(p.startMs / 1000).toFixed(0)}–${(p.endMs / 1000).toFixed(0)} s`).join(', ') || c.noPauses}`}>
        {pauses.map((p) => (
          <span
            key={p.startMs}
            className="absolute inset-y-0 bg-danger/70"
            style={{ left: `${(p.startMs / SPEAK.roundMs) * 100}%`, width: `${Math.max(0.6, ((p.endMs - p.startMs) / SPEAK.roundMs) * 100)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1 tabular-nums" aria-hidden="true">
        <span>0s</span><span>15s</span><span>30s</span><span>45s</span><span>60s</span>
      </div>
    </div>
  );
}

export default function SpeakOrFall() {
  const c = useCopy(COPY);
  const [phase, setPhase] = useState('intro'); // intro | topic | calibrating | speaking | result
  const [topicIdx, setTopicIdx] = useState(0);
  const [asrOn, setAsrOn] = useState(true);
  const [asrAvailable, setAsrAvailable] = useState(false);
  const [live, setLive] = useState({ elapsed: 0, silentMs: 0, speaking: false, level: 0, fallen: false });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [guest, setGuest] = useState(true);
  const r = useRef({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser capabilities once
    setAsrAvailable(!!Recognition());
    setTopicIdx(pickTopic());
    fetch('/api/onboarding', { credentials: 'same-origin' }).then((res) => setGuest(!res.ok)).catch(() => {});
  }, []);

  const cleanup = useCallback(() => {
    const s = r.current;
    cancelAnimationFrame(s.raf);
    s.stream?.getTracks().forEach((t) => t.stop());
    s.audio?.close?.().catch(() => {});
    try {
      s.rec?.stop();
    } catch { /* already stopped */ }
    r.current = { transcript: s.transcript || '' };
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const end = useCallback((fell) => {
    const s = r.current;
    if (s.done) return;
    s.done = true;
    const elapsed = Math.min(SPEAK.roundMs, performance.now() - s.t0);
    const pauses = s.tracker.finish(elapsed);
    const transcript = s.transcript || '';
    const asr = !!s.rec;
    cleanup();
    beep(fell ? 'wrong' : 'end', readFx());
    const sum = speakSummary({ survivedMs: elapsed, pauses, transcript, fell });
    setLive((l) => ({ ...l, fallen: fell, speaking: false }));
    setTimeout(() => {
      setResult({ ...sum, pausesList: pauses, asr });
      setPhase('result');
    }, fell ? 1100 : 300);
  }, [cleanup]);

  const loopRef = useRef(() => {});
  const loop = useCallback(() => {
    const s = r.current;
    if (s.done) return;
    const now = performance.now();
    s.analyser.getFloatTimeDomainData(s.buf);
    const level = rmsLevel(s.buf);
    const v = s.vad.feed(level, now);
    if (v.calibrating) {
      s.raf = requestAnimationFrame(() => loopRef.current());
      return;
    }
    if (!s.t0) {
      s.t0 = now;
      setPhase('speaking');
    }
    const elapsed = now - s.t0;
    const st = s.tracker.tick(v.speaking, elapsed);
    if (now - (s.lastUi || 0) > 90) {
      s.lastUi = now;
      setLive({ elapsed, silentMs: st.silentMs, speaking: v.speaking, level: Math.min(1, level / Math.max(v.threshold * 3, 0.05)), fallen: false });
    }
    if (st.fallen) return end(true);
    if (elapsed >= SPEAK.roundMs) return end(false);
    s.raf = requestAnimationFrame(() => loopRef.current());
  }, [end]);
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const begin = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(c.micMissing);
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      setError(e?.name === 'NotAllowedError' ? c.micDenied : c.micMissing);
      return;
    }
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audio.createAnalyser();
    analyser.fftSize = 2048;
    audio.createMediaStreamSource(stream).connect(analyser);
    const s = { stream, audio, analyser, buf: new Float32Array(analyser.fftSize), vad: createVad(), tracker: createSilenceTracker(), t0: 0, transcript: '', done: false };
    const Rec = asrOn ? Recognition() : null;
    if (Rec) {
      try {
        const rec = new Rec();
        rec.lang = 'en-US';
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = (ev) => {
          for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) s.transcript += ` ${ev.results[i][0].transcript}`;
        };
        // Chrome ends continuous recognition after silence — restart while the round runs.
        rec.onend = () => {
          if (!s.done && r.current === s) {
            try { rec.start(); } catch { /* ignore */ }
          }
        };
        rec.start();
        s.rec = rec;
      } catch { /* no transcript — fillers stay unknown */ }
    }
    r.current = s;
    setLive({ elapsed: 0, silentMs: 0, speaking: false, level: 0, fallen: false });
    setPhase('calibrating');
    s.raf = requestAnimationFrame(() => loopRef.current());
  };

  const topic = PART2_TOPICS[topicIdx];
  const limitS = Math.round(silenceLimitAt(live.elapsed) / 1000);
  const danger = dangerLevel(live.silentMs, live.elapsed);
  const left = Math.max(0, Math.ceil((SPEAK.roundMs - live.elapsed) / 1000));

  return (
    <div className="w-full max-w-md mx-auto">
      {phase === 'intro' && (
        <section aria-labelledby="sof-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5"><Mic size={13} aria-hidden="true" /> IELTS Speaking</p>
          <h1 id="sof-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
          <p className="text-muted mt-2">{c.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            {c.rules.map((x) => <li key={x} className="flex gap-2"><span className="text-accent" aria-hidden="true">•</span>{x}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted">{c.privacy}</p>
          {asrAvailable ? (
            <label className="mt-3 flex items-start gap-2.5 rounded-xl bg-bg border border-border px-3.5 py-3 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={asrOn} onChange={(e) => setAsrOn(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[rgb(var(--color-accent))]" />
              <span>{c.asrLabel}<span className="block text-xs text-muted mt-0.5">{c.asrNote}</span></span>
            </label>
          ) : (
            <p className="mt-3 text-xs text-muted">{c.asrMissing}</p>
          )}
          <button type="button" onClick={() => setPhase('topic')} className="mt-6 w-full min-h-14 rounded-2xl bg-accent text-on-accent text-lg font-bold hover:bg-accent-hover inline-flex items-center justify-center gap-2">
            {c.start} <ArrowRight size={20} aria-hidden="true" />
          </button>
        </section>
      )}

      {phase === 'topic' && (
        <section aria-labelledby="sof-topic" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{c.topic}</p>
          <h2 id="sof-topic" className="text-xl font-bold text-ink mt-1 leading-snug">{topic.title}</h2>
          <p className="text-sm text-muted mt-4">{c.youShould}</p>
          <ul className="mt-1 space-y-1 text-sm text-ink list-disc pl-5">{topic.points.map((p) => <li key={p}>{p}</li>)}</ul>
          {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
          <div className="mt-6 grid gap-2">
            <button type="button" onClick={begin} className="w-full min-h-14 rounded-2xl bg-accent text-on-accent text-lg font-bold hover:bg-accent-hover inline-flex items-center justify-center gap-2">
              <Mic size={20} aria-hidden="true" /> {c.go}
            </button>
            <button type="button" onClick={() => setTopicIdx((i) => pickTopic(Math.random, i))} className="w-full min-h-12 rounded-2xl border border-border bg-bg text-ink font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40">
              <Shuffle size={16} aria-hidden="true" /> {c.another}
            </button>
          </div>
        </section>
      )}

      {(phase === 'calibrating' || phase === 'speaking') && (
        <section aria-label={c.title} className="rounded-3xl overflow-hidden border border-border shadow-card bg-[#0b1020] text-white">
          <div className="px-4 pt-4">
            <p className="text-xs text-white/60 line-clamp-2">{topic.title}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-4xl font-black tabular-nums leading-none">{left}<span className="text-base font-bold text-white/50">s</span></p>
              <p className="text-right text-xs tabular-nums">
                <span className="block text-white/60">{c.allowed(limitS)}</span>
                <span className={`block font-bold ${live.speaking ? 'text-emerald-400' : danger > 0.66 ? 'text-rose-400' : 'text-amber-300'}`} aria-live="off">
                  {live.speaking ? c.speaking : c.silent((live.silentMs / 1000).toFixed(1))}
                </span>
              </p>
            </div>
          </div>
          <Cliff danger={phase === 'calibrating' ? 0 : danger} fallen={live.fallen} speaking={live.speaking} />
          <div className="px-4 pb-4">
            {phase === 'calibrating' ? (
              <p className="text-center text-sm text-white/80 py-2 flex items-center justify-center gap-2" role="status"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {c.calibrating}</p>
            ) : (
              <>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden" role="meter" aria-label={c.level} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(live.level * 100)}>
                  <div className={`h-full transition-[width] duration-100 ${live.speaking ? 'bg-emerald-400' : 'bg-white/40'}`} style={{ width: `${Math.round(live.level * 100)}%` }} />
                </div>
                <button type="button" onClick={() => end(false)} className="mt-3 w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-sm inline-flex items-center justify-center gap-2">
                  <Square size={14} aria-hidden="true" /> {c.stop}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {phase === 'result' && result && (
        <section aria-labelledby="sof-res" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${result.survived ? 'text-success' : result.stopped ? 'text-muted' : 'text-danger'}`}>{result.survived ? c.survived : result.stopped ? c.stopped : c.fell}</p>
          <h2 id="sof-res" className="mt-1 text-5xl font-black text-ink tabular-nums">{result.seconds}<span className="text-xl text-muted font-bold"> / 60</span></h2>
          <p className="text-sm text-muted">{c.seconds}</p>
          <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
            {[
              [c.pauses, result.pauses],
              [c.longest, `${result.longestPauseSec}s`],
              [c.fillers, result.asr ? result.fillers.total : c.na],
              [c.wpm, result.asr && result.wpm ? result.wpm : c.na],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-bg border border-border px-1 py-2.5">
                <dd className="text-lg font-bold text-ink tabular-nums">{v}</dd>
                <dt className="text-[10px] text-muted leading-tight">{k}</dt>
              </div>
            ))}
          </dl>
          {result.asr && result.fillers.total > 0 && (
            <p className="mt-3 text-xs text-muted">
              {Object.entries(result.fillers.byWord).map(([w, n]) => `“${w}” ×${n}`).join(' · ')}
            </p>
          )}
          <h3 className="mt-6 text-sm font-semibold text-ink mb-2">{c.pauseMap}</h3>
          <PauseMap pauses={result.pausesList} c={c} />
          {result.pausesList.length === 0 && <p className="mt-1 text-xs text-muted">{c.noPauses}</p>}
          <ShareCard game="speak" result={result} />
          <div className="mt-6 grid gap-2">
            {guest ? (
              <Link href="/start" className="w-full min-h-14 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover text-center px-4">
                {c.saveCta} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <Link href="/app/speaking" className="w-full min-h-12 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover">
                {c.practice} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
            <button type="button" onClick={() => { setResult(null); setTopicIdx((i) => pickTopic(Math.random, i)); setPhase('topic'); }} className="w-full min-h-12 rounded-2xl border border-border bg-bg text-ink font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40">
              <RotateCcw size={16} aria-hidden="true" /> {c.again}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

'use client';
// Modified work: the game loop around the tunnel mechanic is adapted from Boom123bam/cooltypinggame
// (Apache License 2.0); changed by Vocably for server-graded vocabulary rounds. See THIRD_PARTY_NOTICES.md.
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Pause, Play, RotateCcw, Volume2, VolumeX, Smartphone, ArrowRight, Loader2, Keyboard, SkipForward, Box, RefreshCw } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';
import { translationLangFor } from '@/lib/i18n';
import { TUNNEL, initialTunnel, resolveWord, summary } from '@/lib/flagship/tunnel';
import { guestTypedQuestions, fromServerQuestion, slotsFor, hasCyrillic, canSkip, scheduleCounted, createSendHold } from '@/lib/flagship/typing';
import { RUN_BANK, bankMeaning } from '@/lib/flagship/runBank';
import { beep } from '@/lib/flagship/client';
import { createFpsWatchdog, stepDown, writeRenderPref, readRenderPref, detectRenderTier } from '@/lib/flagship/gpu';
import { abandonGame } from '@/components/games/api';
import { useFlagshipAudience, startRound, gradeTyped, completeRound, useVisualViewport, waitUntil, finishDeadline, FINISH_BUDGET_MS } from './useFlagshipRound';
import TypingInput, { LetterSlots, keepTypingFocus } from './TypingInput';
import TunnelScene2D from './TunnelScene2D';
import SceneBoundary from './SceneBoundary';
import PauseOverlay from './PauseOverlay';
import ShareCard from './ShareCard';

// So'z tunneli (flagship typing game). The Uzbek meaning (or an English definition) is shown; the
// player types the English word and every character becomes a ring of that glyph in a tunnel the
// camera flies through (mechanic adapted from Boom123bam/cooltypinggame, Apache-2.0 — see
// THIRD_PARTY_NOTICES.md). One controller for both audiences (see useFlagshipRound):
//  - signed in: questions from the user's own words; every typed word is graded on the server
//    (the answer never reaches the browser before the first attempt); XP only on the server.
//  - guest / practice: the public bank, graded on the device, no XP.
// The round state lives in refs (g, sceneRef); React state only carries the HUD. The stage is a
// fixed overlay sized to the visual viewport, so the prompt, the tunnel and the input stay in view
// above a phone keyboard. The 3D Canvas stays mounted once started; it is paused, never unmounted
// from a frame callback, and the controller's own rAF loop drives the FPS watchdog (3D → lighter
// 3D → 2D).

const loadScene = () => import('./TunnelScene3D');
const TunnelScene3D = dynamic(loadScene, { ssr: false, loading: () => null });

const COUNT_MS = 700;
const FEEDBACK_MS = 1800;
const SUBMIT_GUARD_MS = 300;
const STAGE_PHASES = new Set(['loading', 'countdown', 'playing', 'finishing']);
const INITIAL_HUD = { score: 0, combo: 0, timeLeft: TUNNEL.roundMs / 1000, prompt: '', promptKind: 'meaning', slots: null, canSkip: false, count: 0, total: 0, countdown: 0, feedback: null, ending: false, allDone: false };
/** Below this stage height (a phone with the keyboard open) the prompt card is compacted. */
const COMPACT_PX = 440;
const LONG_PROMPT = 60;
const promptSize = (text, compact) => ((text || '').length > LONG_PROMPT ? (compact ? 'text-sm' : 'text-base sm:text-lg') : compact ? 'text-base' : 'text-lg sm:text-xl');

const COPY = {
  uz: {
    title: "So'z tunneli",
    kicker: 'IELTS spelling',
    tagline: "O'zbekcha ma'no chiqadi — inglizcha so'zni yozing. Har bir harf tunnelga aylanadi.",
    rules: [
      "90 soniya: iloji boricha ko'p so'zni to'g'ri yozing.",
      "Tez va ketma-ket to'g'ri yozsangiz — kombo va qo'shimcha ball.",
      "Hamma so'zni vaqtidan oldin tugatsangiz — qolgan har soniya uchun 10 tagacha bonus ball (aniqligingizga qarab).",
    ],
    controls: "Yozing va Enter (telefonda «Go») bosing. Bilmasangiz — «O'tkazish». Esc — pauza.",
    guestNote: "Ro'yxatdan o'tmasdan o'ynaysiz. Xato so'zlaringiz saqlanadi — hisob ochsangiz, takrorlashga qo'shiladi.",
    userNote: "So'zlar o'z lug'atingizdan olinadi. Har javob serverda tekshiriladi va takrorlash jadvaliga yoziladi.",
    start: 'Boshlash',
    again: 'Yana o‘ynash',
    loading: 'Tayyorlanmoqda…',
    getReady: "Tayyor turing — birinchi so'z chiqyapti",
    meaning: "Ma'nosi",
    definition: 'Definition',
    score: 'Ball',
    combo: 'Kombo',
    time: 'Vaqt',
    pause: 'Pauza',
    resume: 'Davom etish',
    paused: 'Pauza',
    endRound: 'Tugatish',
    sound: 'Ovoz',
    vibrate: 'Tebranish',
    inputLabel: "Inglizcha so'zni yozing",
    placeholder: "inglizcha so'z…",
    submit: 'Yuborish',
    skip: "O'tkazish",
    right: "To'g'ri!",
    wrong: "Xato. To'g'risi:",
    near: "Deyarli! To'g'risi:",
    skipped: "O'tkazildi. To'g'risi:",
    offline: "Javob hali kelmadi — aloqa tiklanganda tekshiriladi",
    offlinePause: "Internet aloqasi uzildi. Ulanishni tekshiring va davom eting.",
    cyrillic: "Klaviaturani lotin (English) yozuviga o'tkazing",
    letters: (n) => `${n} ta harf`,
    firstLetter: (ch, n) => `«${ch}» harfi bilan boshlanadi, ${n} ta harf`,
    timeUp: 'Vaqt tugadi',
    allDone: "Hamma so'z yozildi!",
    finished: 'Raund tugadi',
    expired: 'Sessiya muddati tugadi',
    correct: "To'g'ri",
    accuracy: 'Aniqlik',
    maxCombo: 'Eng uzun kombo',
    cpm: 'Harf/daq',
    bonus: (n) => `vaqt bonusi +${n}`,
    xp: (n) => `+${n} XP`,
    flagged: 'Bu raund tekshiruv uchun belgilandi — XP berilmadi.',
    notSaved: 'Natija hali serverga yetmadi. Internet aloqasini tekshirib, qayta yuboring — javoblaringiz shu oynada saqlanib turadi.',
    resend: 'Qayta yuborish',
    resending: 'Yuborilmoqda…',
    missedTitle: "Xato qilingan so'zlar",
    yours: 'Siz yozdingiz:',
    noMissed: "Birorta ham xato yo'q — zo'r!",
    reviewNow: 'Hozir takrorlash',
    saveCta: 'Natijangni saqlash va rejangni olish',
    saveNote: (n) => `${n} ta xato so'z hisobingizdagi takrorlashga qo'shiladi.`,
    practiceFewWords: "Lug'atingizda yoziladigan so'z kam — umumiy so'zlar bilan mashq qilyapsiz (natija saqlanmaydi).",
    practiceLimit: "Bugungi bepul o'yinlar tugadi — bu mashq raundi, XP berilmaydi.",
    pricing: 'Tariflarni ko‘rish',
    errorStart: "O'yinni boshlab bo'lmadi",
    claimed: (n) => `Oldingi o'yindagi ${n} ta xato so'z takrorlashga qo'shildi.`,
    lite: "Qurilma sekinlashdi — yengil (2D) rejimga o'tdik.",
    liteLost: "3D grafika to'xtadi — 2D rejimda davom etamiz.",
    try3d: "3D rejimni qayta sinash",
    credit: 'Tunnel mexanikasi Boom123bam/cooltypinggame (Apache-2.0) asosida qilingan.',
    licenses: 'Litsenziyalar',
  },
  en: {
    title: 'Word Tunnel',
    kicker: 'IELTS spelling',
    tagline: 'The Uzbek meaning appears — type the English word. Every letter becomes part of the tunnel.',
    rules: [
      '90 seconds: type as many words correctly as you can.',
      'Fast correct answers in a row build a combo and bonus points.',
      'Finish every word early and each second left is worth up to +10 points, scaled by your accuracy.',
    ],
    controls: "Type, then press Enter (or “Go” on a phone). Don't know it? Skip. Esc pauses.",
    guestNote: 'No account needed. Your missed words are kept — sign up and they go into your reviews.',
    userNote: 'Words come from your own vocabulary. Every answer is checked on the server and updates your review schedule.',
    start: 'Start',
    again: 'Play again',
    loading: 'Getting ready…',
    getReady: 'Get ready — the first word is coming',
    meaning: 'Meaning',
    definition: 'Definition',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    endRound: 'End round',
    sound: 'Sound',
    vibrate: 'Vibration',
    inputLabel: 'Type the English word',
    placeholder: 'English word…',
    submit: 'Submit',
    skip: 'Skip',
    right: 'Correct!',
    wrong: 'Wrong. Answer:',
    near: 'Almost! Answer:',
    skipped: 'Skipped. Answer:',
    offline: 'No verdict yet — it will be checked once you are back online',
    offlinePause: 'The connection dropped. Check your internet and continue.',
    cyrillic: 'Switch your keyboard to Latin (English)',
    letters: (n) => `${n} letters`,
    firstLetter: (ch, n) => `Starts with “${ch}”, ${n} letters`,
    timeUp: "Time's up",
    allDone: 'Every word typed!',
    finished: 'Round over',
    expired: 'The session expired',
    correct: 'Correct',
    accuracy: 'Accuracy',
    maxCombo: 'Best combo',
    cpm: 'Chars/min',
    bonus: (n) => `time bonus +${n}`,
    xp: (n) => `+${n} XP`,
    flagged: 'This round was flagged for review — no XP was awarded.',
    notSaved: "Your result hasn't reached the server yet. Check your connection and send it again — your answers are kept in this tab.",
    resend: 'Send again',
    resending: 'Sending…',
    missedTitle: 'Words you missed',
    yours: 'You typed:',
    noMissed: 'No mistakes at all — great!',
    reviewNow: 'Review now',
    saveCta: 'Save your result and get your plan',
    saveNote: (n) => `${n} missed words will go into your reviews once you have an account.`,
    practiceFewWords: 'You have few typeable words yet — practising with common words (not saved).',
    practiceLimit: "Today's free games are used up — this is a practice round, no XP.",
    pricing: 'See plans',
    errorStart: 'Could not start the game',
    claimed: (n) => `${n} missed words from your last game were added to your reviews.`,
    lite: 'Your device slowed down — switched to light (2D) mode.',
    liteLost: '3D graphics stopped — continuing in 2D.',
    try3d: 'Try 3D mode again',
    credit: 'The tunnel mechanic is adapted from Boom123bam/cooltypinggame (Apache-2.0).',
    licenses: 'Licences',
  },
  ru: {
    title: 'Word Tunnel',
    kicker: 'Правописание для IELTS',
    tagline: 'Появляется значение — напечатайте английское слово. Каждая буква становится частью тоннеля.',
    rules: [
      '90 секунд: напечатайте правильно как можно больше слов.',
      'Быстрые верные ответы подряд дают комбо и бонусные очки.',
      'Успеете пройти все слова раньше — каждая оставшаяся секунда даст до +10 очков с учётом точности.',
    ],
    controls: 'Напечатайте слово и нажмите Enter (или «Готово» на телефоне). Не знаете? Пропустите. Esc — пауза.',
    guestNote: 'Аккаунт не нужен. Слова с ошибками сохранятся — зарегистрируйтесь, и они попадут в повторения.',
    userNote: 'Слова берутся из вашего словаря. Каждый ответ проверяется на сервере и обновляет график повторений.',
    start: 'Начать',
    again: 'Ещё раз',
    loading: 'Готовим…',
    getReady: 'Приготовьтесь — сейчас будет первое слово',
    meaning: 'Значение',
    definition: 'Определение',
    score: 'Очки',
    combo: 'Комбо',
    time: 'Время',
    pause: 'Пауза',
    resume: 'Продолжить',
    paused: 'Пауза',
    endRound: 'Завершить раунд',
    sound: 'Звук',
    vibrate: 'Вибрация',
    inputLabel: 'Напечатайте английское слово',
    placeholder: 'Английское слово…',
    submit: 'Отправить',
    skip: 'Пропустить',
    right: 'Верно!',
    wrong: 'Неверно. Ответ:',
    near: 'Почти! Ответ:',
    skipped: 'Пропущено. Ответ:',
    offline: 'Ответ пока не проверен — проверим, когда появится связь',
    offlinePause: 'Связь пропала. Проверьте интернет и продолжайте.',
    cyrillic: 'Переключите клавиатуру на латиницу (английский)',
    letters: (n) => `Букв: ${n}`,
    firstLetter: (ch, n) => `Начинается на «${ch}», букв: ${n}`,
    timeUp: 'Время вышло',
    allDone: 'Все слова напечатаны!',
    finished: 'Раунд окончен',
    expired: 'Сессия истекла',
    correct: 'Верно',
    accuracy: 'Точность',
    maxCombo: 'Лучшее комбо',
    cpm: 'Знаков/мин',
    bonus: (n) => `бонус за время +${n}`,
    xp: (n) => `+${n} XP`,
    flagged: 'Раунд отправлен на проверку — XP не начислен.',
    notSaved: 'Результат ещё не дошёл до сервера. Проверьте связь и отправьте снова — ответы сохранены в этой вкладке.',
    resend: 'Отправить снова',
    resending: 'Отправляем…',
    missedTitle: 'Слова с ошибками',
    yours: 'Вы ввели:',
    noMissed: 'Ни одной ошибки — отлично!',
    reviewNow: 'Повторить сейчас',
    saveCta: 'Сохраните результат и получите план',
    saveNote: (n) => `Слова с ошибками (${n}) попадут в повторения, как только у вас появится аккаунт.`,
    practiceFewWords: 'У вас пока мало слов для набора — тренируемся на частых словах (без сохранения).',
    practiceLimit: 'Бесплатные игры на сегодня закончились — это тренировочный раунд, без XP.',
    pricing: 'Посмотреть тарифы',
    errorStart: 'Не удалось запустить игру',
    claimed: (n) => `Слова с ошибками из прошлой игры (${n}) добавлены в повторения.`,
    lite: 'Устройство тормозит — включён облегчённый режим (2D).',
    liteLost: '3D-графика остановилась — продолжаем в 2D.',
    try3d: 'Снова попробовать 3D',
    credit: 'Механика тоннеля адаптирована из Boom123bam/cooltypinggame (Apache-2.0).',
    licenses: 'Лицензии',
  },
};

export default function WordTunnel() {
  const c = useCopy(COPY);
  const tLang = translationLangFor(useT().locale); // guest meanings: Russian UI -> Russian
  const [notice, setNotice] = useState('');
  const onClaimed = useCallback((n) => setNotice(c.claimed(n)), [c]);
  const { audience, fx, fxRef, toggleFx, tier, setTier } = useFlagshipAudience('word_tunnel', onClaimed);
  const [phase, setPhase] = useState('intro'); // intro | loading | countdown | playing | finishing | result
  const [everStarted, setEverStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offline, setOffline] = useState(false);
  const [typed, setTyped] = useState('');
  const [warn, setWarn] = useState('');
  const [trail, setTrail] = useState([]);
  const [hud, setHud] = useState(INITIAL_HUD);
  const [result, setResult] = useState(null);
  const [resending, setResending] = useState(false); // "send again" of a result the server has not got yet
  const [error, setError] = useState('');
  const [practice, setPractice] = useState(null); // null | 'few_words' | 'limit'
  const [lite, setLite] = useState(''); // '' | 'slow' (the watchdog's last step) | 'lost' (WebGL context lost)
  const [pref2d, setPref2d] = useState(false);
  const [calm, setCalm] = useState(false);
  const [sayPrompt, setSayPrompt] = useState('');
  const [sayVerdict, setSayVerdict] = useState('');

  const inputRef = useRef(null);
  const sceneRef = useRef({ rings: [], head: 0, gates: [], words: {}, pulse: null, combo: 0, contextLost: false });
  const g = useRef({ active: false });
  const tierRef = useRef(tier);
  const startingRef = useRef(false);
  const disposedRef = useRef(false); // the page was left (a start request may still be in flight)
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read device preferences once
    setPref2d(readRenderPref() === '2d');
    setCalm(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const stageActive = STAGE_PHASES.has(phase);
  const box = useVisualViewport(stageActive);

  // ---------- renderer fallbacks (all from the controller, never from inside a frame) ----------
  const to2d = useCallback(() => {
    tierRef.current = 'none';
    setTier('none');
  }, [setTier]);

  const onLowFps = useCallback(() => {
    const next = stepDown(tierRef.current);
    tierRef.current = next;
    setTier(next);
    if (next === 'none') {
      writeRenderPref('2d');
      setPref2d(true);
      setLite('slow');
    }
    g.current.watchdog?.reset(performance.now());
  }, [setTier]);

  // A lost WebGL context counts like the watchdog's last step (design §12): 2D from here on, a
  // notice, and "try 3D again" on the intro and result screens. The stored preference is left
  // alone: a context loss can be transient (a GPU reset), unlike a device that is too slow.
  const onContextLost = useCallback(() => {
    to2d();
    setPref2d(true);
    setLite('lost');
  }, [to2d]);

  const try3d = () => {
    writeRenderPref('auto');
    setPref2d(false);
    const next = detectRenderTier({ ignorePref: true });
    tierRef.current = next;
    setTier(next);
  };

  // ---------- round ----------
  const showPrompt = useCallback(
    (s, now) => {
      const q = s.qs[s.idx];
      s.shownAt = now;
      s.wordStart = s.ringNext;
      s.curRings = [];
      s.typed = '';
      s.skipShown = false;
      sceneRef.current.head = s.wordStart;
      setHud((h) => ({ ...h, prompt: q.prompt, promptKind: q.promptKind, slots: slotsFor(q), canSkip: false, count: s.idx + 1 }));
      setSayPrompt(`${q.promptKind === 'definition' ? c.definition : c.meaning}: ${q.prompt}`);
    },
    [c]
  );

  /** Merges a save outcome into the result of round s, only while that result is still the one shown. */
  const applyDone = useCallback((s, done) => {
    if (g.current !== s || disposedRef.current) return;
    setResult((r) => (r ? { ...r, xp: done.xp, flagged: done.flagged, missed: done.missed, retry: done.retry } : r));
  }, []);

  const finish = useCallback(
    async (why) => {
      const s = g.current;
      if (!s.active) return;
      s.active = false;
      cancelAnimationFrame(s.raf);
      s.hold.release(); // answers still held for the timing floor are sent now; their verdicts are awaited below
      const now = performance.now();
      const pausedNow = s.pausedAt ? now - s.pausedAt : 0;
      const playMs = s.roundStart ? Math.max(0, (s.endAt || now) - s.roundStart - s.pausedTotal - (s.endAt ? 0 : pausedNow)) : 0;
      const stopped = why === 'stopped' || why === 'expired';
      setPaused(false);
      setOffline(false);
      // Settle: a verdict still held or in flight belongs to this round (the server counts it), so the
      // summary waits for it, bounded like the time-up wait (already spent when endAt is set).
      // Meanwhile onVerdict applies only its score. A guest verdict lands in a microtask.
      if (s.inflight > 0) {
        setPhase('finishing');
        await waitUntil(() => s.inflight === 0 || g.current !== s || disposedRef.current, (s.endAt || now) + TUNNEL.gradeTimeoutMs + 500 - now);
        if (g.current !== s) return;
      }
      s.closed = true; // the summary below is final: later verdicts are ignored
      // Stopped before a single word was sent: no result screen (and no empty session left open).
      if (stopped && !s.state.results.length && !s.inflight) {
        if (s.round.session && why === 'stopped') abandonGame(s.round.session.sessionId).catch(() => {});
        if (disposedRef.current) return;
        if (why === 'expired') setError(c.expired);
        inputRef.current?.blur();
        setPhase('intro');
        return;
      }
      const msLeft = s.allSubmitted ? Math.max(0, TUNNEL.roundMs - s.lastSubmitElapsed) : 0;
      const sum = summary(s.state, playMs, { msLeft, allAnswered: s.allSubmitted && !stopped });
      const reason = why === 'expired' ? c.expired : why === 'stopped' ? c.finished : s.allSubmitted ? c.allDone : c.timeUp;
      const local = sum.missed.map((m) => ({ word: m.word, prompt: m.prompt, yours: m.yours, note: s.round.session ? m.prompt : bankMeaning(m.word, tLang) || m.prompt }));
      s.local = local; // kept for "send again"
      if (disposedRef.current) {
        completeRound(s.round, local); // the page was left while the round settled: save it all the same
        return;
      }
      beep('end', fxRef.current);
      setPhase('finishing');
      // The spinner (the settle wait included) stays up for FINISH_BUDGET_MS at most; a save that
      // takes longer goes on in the background and is merged into the result when it lands.
      const done = await completeRound(s.round, local, { deadlineMs: finishDeadline(performance.now() - now) });
      if (g.current !== s || disposedRef.current) return;
      inputRef.current?.blur();
      setResult({
        ...sum,
        reason,
        why,
        xp: done.xp,
        flagged: done.flagged,
        retry: done.retry,
        guest: s.round.saveGuest,
        practice: s.round.practice ? s.round.reason || 'few_words' : null,
        missed: done.missed,
      });
      setPhase('result');
      done.later?.then((late) => applyDone(s, late));
    },
    [applyDone, c, fxRef, tLang]
  );

  // "Send again" for a result the server has not got yet: the same round's save once more (joining
  // one still running in the background), merged into the result on screen.
  const resend = useCallback(async () => {
    const s = g.current;
    if (!s.closed || !s.local || s.resending) return;
    s.resending = true;
    setResending(true);
    const done = await completeRound(s.round, s.local, { deadlineMs: FINISH_BUDGET_MS });
    s.resending = false;
    if (g.current !== s || disposedRef.current) return;
    setResending(false);
    applyDone(s, done);
    done.later?.then((late) => applyDone(s, late));
  }, [applyDone]);

  const pauseRound = useCallback((isOffline = false) => {
    const s = g.current;
    if (!s.active || s.pausedAt || s.endAt) return;
    s.pausedAt = performance.now();
    setPaused(true);
    setOffline(isOffline === true);
  }, []);

  const resumeRound = useCallback(() => {
    const s = g.current;
    if (!s.active || !s.pausedAt) return;
    const now = performance.now();
    const d = now - s.pausedAt;
    s.pausedAt = 0;
    // Only the round clock skips the pause. The answer clock (shownAt) keeps running: the server
    // sees wall-clock time, and a pause must never make a looked-up word look fast (design §12).
    s.pausedTotal += d;
    if (s.stage === 'countdown') s.countdownEnd += d;
    s.nullStreak = 0;
    s.watchdog.reset(now);
    setPaused(false);
    setOffline(false);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onVerdict = useCallback(
    (s, { q, w, typed: answer, responseMs, res }) => {
      if (g.current !== s || s.closed) return;
      s.inflight = Math.max(0, s.inflight - 1);
      const word = res.correctDisplay || q.word || '';
      if (!s.active) {
        // The round is settling (finish waits for the verdicts in flight): only the score changes,
        // no scene, HUD, sound or pause. A fatal verdict (the session is gone) just counts as landed.
        if (!res.fatal) s.state = resolveWord(s.state, { ok: res.ok, qid: q.qid, word, prompt: q.prompt, typed: answer, responseMs, near: res.near });
        return;
      }
      if (res.fatal) {
        finish('expired');
        return;
      }
      const before = s.state.score;
      s.state = resolveWord(s.state, { ok: res.ok, qid: q.qid, word, prompt: q.prompt, typed: answer, responseMs, near: res.near });
      const now = performance.now();
      const st = res.ok ? 'ok' : res.ok === false ? 'bad' : 'none';
      const sc = sceneRef.current;
      sc.words[w] = { s: st, at: now };
      if (res.ok !== null) sc.pulse = { ok: res.ok, at: now };
      sc.combo = s.state.combo;
      s.nullStreak = res.ok === null ? s.nullStreak + 1 : 0;
      if (res.ok !== null) beep(res.ok ? 'ok' : 'wrong', fxRef.current);
      const points = s.state.score - before;
      s.feedbackAt = now;
      const label = res.ok ? `${c.right} +${points}` : res.ok === false ? `${!answer ? c.skipped : res.near ? c.near : c.wrong} ${word}` : c.offline;
      setTrail((t) => t.map((x) => (x.key === w ? { ...x, s: st } : x)));
      setHud((h) => ({ ...h, score: s.state.score, combo: s.state.combo, feedback: { key: w, ok: res.ok, label } }));
      setSayVerdict(label);
      if (s.nullStreak >= 2 && !s.endAt) pauseRound(true);
    },
    [c, finish, fxRef, pauseRound]
  );

  const sendWord = useCallback(
    (s, answer, now) => {
      const q = s.qs[s.idx];
      const w = s.wordSeq;
      // Signed in, the server holds every answer's time to a plausibility floor for its prompt, and a
      // round with too many faster answers earns no XP. So, as in Word Defense, the reported interval
      // runs from the later of (this prompt appeared, the previous send) and a quick answer is held
      // until the floor has passed. Only its verdict waits; the next word is on screen meanwhile.
      // Guest rounds are graded on the device and are not timed by the server.
      const { sendAt, responseMs } = s.round.session
        ? scheduleCounted({ now, spawnedAt: s.shownAt, lastCountedAt: s.lastCountedAt, prompt: q.prompt })
        : { sendAt: now, responseMs: Math.max(0, now - s.shownAt) };
      s.lastCountedAt = sendAt;
      s.lastSubmitAt = now;
      // The word's rings are final; a gate closes it and the next word starts after a one-ring gap.
      const gateAt = s.wordStart + s.curRings.length;
      s.doneRings = s.doneRings.concat(s.curRings).slice(-TUNNEL.maxRings);
      s.gates = s.gates.concat({ i: gateAt, w }).slice(-8);
      s.ringNext = gateAt + 2;
      s.curRings = [];
      s.typed = '';
      const sc = sceneRef.current;
      sc.words[w] = { s: 'pending', at: now };
      delete sc.words[w - 12];
      sc.rings = s.doneRings;
      sc.gates = s.gates;
      sc.head = s.ringNext;
      s.inflight += 1;
      setTyped('');
      setWarn('');
      setTrail((t) => [...t, { key: w, text: answer, s: 'pending' }].slice(-6));
      s.wordSeq += 1;
      if (s.idx + 1 < s.qs.length) {
        s.idx += 1;
        showPrompt(s, now); // the verdict arrives while the next word is being typed
      } else {
        s.allSubmitted = true;
        s.lastSubmitElapsed = now - s.roundStart - s.pausedTotal;
        s.endAt = now;
        setHud((h) => ({ ...h, ending: true, allDone: true }));
      }
      s.hold.at(sendAt, now, () =>
        gradeTyped(s.round, q, answer, responseMs, { timeoutMs: TUNNEL.gradeTimeoutMs }).then((res) => onVerdict(s, { q, w, typed: answer, responseMs, res }))
      );
    },
    [onVerdict, showPrompt]
  );

  const tickRef = useRef(() => {});
  const tick = useCallback(() => {
    const s = g.current;
    if (!s.active) return;
    const now = performance.now();
    if (sceneRef.current.contextLost) {
      sceneRef.current.contextLost = false;
      onContextLost();
    }
    if (!s.pausedAt) {
      if (s.stage === 'countdown') {
        const left = Math.ceil((s.countdownEnd - now) / COUNT_MS);
        if (left <= 0) {
          s.stage = 'playing';
          s.roundStart = now;
          s.pausedTotal = 0;
          showPrompt(s, now);
          setHud((h) => ({ ...h, countdown: 0 }));
          setPhase('playing');
          s.watchdog.reset(now);
        } else if (left !== s.lastCount) {
          s.lastCount = left;
          setHud((h) => ({ ...h, countdown: left }));
        }
      } else {
        const elapsed = now - s.roundStart - s.pausedTotal;
        if (!s.endAt && elapsed >= TUNNEL.roundMs) {
          // Time is up: the prompt on screen is not sent; verdicts still in flight are awaited.
          s.endAt = s.roundStart + s.pausedTotal + TUNNEL.roundMs;
          setHud((h) => ({ ...h, ending: true, timeLeft: 0 }));
        }
        if (s.endAt) {
          if (s.inflight === 0 || now - s.endAt > TUNNEL.gradeTimeoutMs + 500) {
            finish('time');
            return;
          }
        } else if (now - s.lastHud > 200) {
          s.lastHud = now;
          const left = Math.max(0, Math.ceil((TUNNEL.roundMs - elapsed) / 1000));
          const skippable = canSkip(s.qs[s.idx].prompt, s.shownAt, now);
          if (left !== s.hudLeft || skippable !== s.skipShown) {
            s.hudLeft = left;
            s.skipShown = skippable;
            setHud((h) => ({ ...h, timeLeft: left, canSkip: skippable }));
          }
        }
        if (s.feedbackAt && now - s.feedbackAt > FEEDBACK_MS) {
          s.feedbackAt = 0;
          setHud((h) => ({ ...h, feedback: null }));
        }
      }
      if (tierRef.current !== 'none' && document.visibilityState === 'visible') s.watchdog.sample(now);
    }
    s.raf = requestAnimationFrame(() => tickRef.current());
  }, [finish, onContextLost, showPrompt]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const begin = async () => {
    let round;
    try {
      round = await startRound({
        gameKey: 'word_tunnel',
        audience,
        toQuestion: fromServerQuestion,
        guestQuestions: () => guestTypedQuestions(RUN_BANK, Math.random, TUNNEL.guestQuestions, tLang),
      });
    } catch (e) {
      if (disposedRef.current) return;
      setError(e?.message || c.errorStart);
      inputRef.current?.blur();
      setPhase('intro');
      return;
    }
    if (disposedRef.current) {
      // The page was left while the round was being prepared: close the session, start nothing.
      if (round.session) abandonGame(round.session.sessionId).catch(() => {});
      return;
    }
    const now = performance.now();
    g.current = {
      active: true,
      stage: 'countdown',
      countdownEnd: now + 3 * COUNT_MS,
      lastCount: 3,
      qs: round.qs,
      idx: 0,
      round,
      state: initialTunnel(),
      roundStart: 0,
      pausedTotal: 0,
      pausedAt: 0,
      shownAt: now,
      wordSeq: 0,
      wordStart: 0,
      ringNext: 0,
      curRings: [],
      doneRings: [],
      gates: [],
      typed: '',
      lastCountedAt: 0,
      hold: createSendHold(),
      inflight: 0,
      closed: false, // set by finish once the round has settled and its summary is made
      local: null, // that summary's missed list, kept for "send again"
      resending: false,
      nullStreak: 0,
      lastSubmitAt: 0,
      lastSubmitElapsed: 0,
      allSubmitted: false,
      endAt: 0,
      lastHud: 0,
      hudLeft: TUNNEL.roundMs / 1000,
      skipShown: false,
      feedbackAt: 0,
      watchdog: createFpsWatchdog({ onLow: onLowFps }),
    };
    Object.assign(sceneRef.current, { rings: [], head: 0, gates: [], words: {}, pulse: null, combo: 0 });
    // A context lost between rounds (and not given back) is only noticed here: play this round in 2D.
    if (sceneRef.current.contextLost) {
      sceneRef.current.contextLost = false;
      if (tierRef.current !== 'none') onContextLost();
    }
    setPractice(round.practice ? round.reason || 'few_words' : null);
    setTrail([]);
    setHud({ ...INITIAL_HUD, countdown: 3, total: round.qs.length });
    setPhase('countdown');
    g.current.raf = requestAnimationFrame(() => tickRef.current());
  };

  const start = () => {
    if (!audience || startingRef.current || STAGE_PHASES.has(phase)) return;
    startingRef.current = true;
    setError('');
    setNotice('');
    setResult(null);
    setResending(false);
    setPaused(false);
    setOffline(false);
    setLite('');
    setWarn('');
    // Mount the stage synchronously and focus the input inside this click: iOS only opens the
    // keyboard for a focus() that happens within the user gesture. The HUD is reset in the same
    // commit, so the input is no longer disabled by the last round's "ending" when focus() runs.
    flushSync(() => {
      setEverStarted(true);
      setTyped('');
      setHud(INITIAL_HUD);
      setPhase('loading');
    });
    inputRef.current?.focus({ preventScroll: true });
    if (tierRef.current !== 'none') loadScene().catch(() => {});
    begin().finally(() => {
      startingRef.current = false;
    });
  };

  const prefetch = () => {
    if (tierRef.current !== 'none') loadScene().catch(() => {});
  };

  // ---------- input ----------
  const onType = useCallback((value) => {
    const s = g.current;
    if (!s.active || s.stage !== 'playing' || s.pausedAt || s.endAt) return; // countdown / pause: ignored
    s.typed = value;
    setTyped(value);
    setWarn(hasCyrillic(value) ? 'cyrillic' : '');
    // Rings are a pure function of the input's value (Android keyboards send composition events, not
    // keys): the common prefix keeps its rings (and their age), the rest is rebuilt.
    const now = performance.now();
    const chars = Array.from(value);
    const prev = s.curRings;
    let k = 0;
    while (k < prev.length && k < chars.length && prev[k].ch === chars[k]) k++;
    const next = prev.slice(0, k);
    for (let j = k; j < chars.length; j++) next.push({ i: s.wordStart + j, ch: chars[j], w: s.wordSeq, born: now });
    s.curRings = next;
    const sc = sceneRef.current;
    sc.rings = s.doneRings.length ? s.doneRings.concat(next) : next;
    sc.head = s.wordStart + next.length;
  }, []);

  const submit = useCallback(() => {
    const s = g.current;
    if (!s.active || s.stage !== 'playing' || s.pausedAt || s.endAt) return;
    const now = performance.now();
    if (now - s.lastSubmitAt < SUBMIT_GUARD_MS) return;
    const raw = s.typed || '';
    if (!raw.trim()) return; // Enter on an empty field does nothing (Skip is the explicit "I don't know")
    if (hasCyrillic(raw)) {
      setWarn('cyrillic');
      return;
    }
    sendWord(s, raw, now);
  }, [sendWord]);

  const skip = useCallback(() => {
    const s = g.current;
    if (!s.active || s.stage !== 'playing' || s.pausedAt || s.endAt) return;
    const now = performance.now();
    if (now - s.lastSubmitAt < SUBMIT_GUARD_MS || !canSkip(s.qs[s.idx].prompt, s.shownAt, now)) return;
    sendWord(s, '', now);
    inputRef.current?.focus({ preventScroll: true });
  }, [sendWord]);

  // ---------- keyboard, tab visibility, unmount ----------
  useEffect(() => {
    if (!stageActive) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (g.current.pausedAt) resumeRound();
      else pauseRound();
    };
    const onVis = () => document.visibilityState === 'hidden' && pauseRound();
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [stageActive, pauseRound, resumeRound]);

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      g.current.active = false;
      cancelAnimationFrame(g.current.raf);
      g.current.hold?.cancel();
    };
  }, []);

  const playing = phase === 'playing';
  const use3d = tier !== 'none';
  const compact = !!box && box.height < COMPACT_PX;
  const fb = hud.feedback;
  const fbTone = fb ? (fb.ok ? 'bg-emerald-700 text-white' : fb.ok === false ? 'bg-rose-700 text-white' : 'bg-white/90 text-[#0b1020]') : '';
  const slotsLabel = hud.slots ? (hud.slots.first ? c.firstLetter(hud.slots.first, hud.slots.length) : c.letters(hud.slots.length)) : '';

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="sr-only" aria-live="polite">{sayPrompt}</p>
      <p className="sr-only" aria-live="polite">{sayVerdict}</p>

      {(phase === 'intro' || phase === 'loading') && (
        <section aria-labelledby="tunnel-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Keyboard size={13} aria-hidden="true" /> {c.kicker}
          </p>
          <h1 id="tunnel-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
          <p className="text-muted mt-2">{c.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            {c.rules.map((r) => (
              <li key={r} className="flex gap-2"><span className="text-accent" aria-hidden="true">•</span>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{c.controls}</p>
          {audience && <p className="mt-4 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">{audience === 'user' ? c.userNote : c.guestNote}</p>}
          {notice && <p role="status" className="mt-3 rounded-xl bg-success-soft px-3.5 py-2.5 text-xs text-ink">{notice}</p>}
          {error && <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <FxToggle on={fx.sound} label={c.sound} Icon={fx.sound ? Volume2 : VolumeX} onClick={() => toggleFx('sound')} />
            <FxToggle on={fx.vibrate} label={c.vibrate} Icon={Smartphone} onClick={() => toggleFx('vibrate')} />
            {pref2d && tier === 'none' && (
              <button type="button" onClick={try3d} className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border border-border text-xs font-semibold text-muted hover:text-ink">
                <Box size={14} aria-hidden="true" /> {c.try3d}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={start}
            onPointerEnter={prefetch}
            onFocus={prefetch}
            onTouchStart={prefetch}
            disabled={!audience || phase === 'loading'}
            className="mt-6 w-full min-h-14 rounded-2xl bg-accent text-on-accent text-lg font-bold hover:bg-accent-hover disabled:opacity-50 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {phase === 'loading' || !audience ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
            {phase === 'loading' ? c.loading : c.start}
          </button>
          <p className="mt-4 text-center text-[11px] text-muted">
            {c.credit} <a href="/third-party-notices.txt" className="underline underline-offset-2 hover:text-ink">{c.licenses}</a>
          </p>
        </section>
      )}

      {/* The stage: a fixed overlay over the visual viewport. Kept mounted (hidden + inert) between
          rounds so the 3D Canvas is created once. */}
      <div
        className={stageActive ? 'fixed inset-x-0 top-0 z-[60] flex flex-col bg-[#070a18] text-white overscroll-contain' : 'fixed inset-0 -z-10 invisible pointer-events-none'}
        style={stageActive ? { top: box ? box.top : 0, height: box ? box.height : '100dvh' } : undefined}
        inert={!stageActive}
        onMouseDown={keepTypingFocus}
        role="region"
        aria-label={c.title}
      >
        {/* Scrolls only on very short screens; the input row then stays pinned at the bottom. */}
        {/* The tunnel fills the whole stage (like Vocably Run); the HUD, the prompt and the input float
            above it in a readable column. */}
        <div className="absolute inset-0 overflow-hidden select-none">
          {everStarted && use3d && (
            <SceneBoundary onError={to2d}>
              <TunnelScene3D sceneRef={sceneRef} running={stageActive && !paused} visible={stageActive} tier={tier} />
            </SceneBoundary>
          )}
          {!use3d && (
            <div className="absolute top-44 bottom-32 left-1/2 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl">
              <TunnelScene2D typed={typed} trail={trail} hue={(hud.count * 47) % 360} calm={calm} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070a18]/85 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070a18] via-[#070a18]/70 to-transparent" aria-hidden="true" />
        </div>
        <div className="relative z-10 flex-1 min-h-0 flex flex-col w-full max-w-xl mx-auto overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* HUD */}
          <div className="flex items-center justify-between gap-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 select-none">
            <div className="min-w-20">
              <p className="text-2xl font-black tabular-nums leading-none"><span className="sr-only">{c.score}: </span>{hud.score}</p>
              <p className="h-4 text-[11px] font-bold text-amber-300 tabular-nums">{hud.combo >= 2 ? `${c.combo} ×${hud.combo}` : ''}</p>
            </div>
            <p className="text-xs font-semibold text-white/60 tabular-nums" aria-hidden="true">{hud.total && hud.count ? `${Math.min(hud.count, hud.total)} / ${hud.total}` : ''}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tabular-nums ${hud.timeLeft <= 10 ? 'text-rose-300' : ''}`}><span className="sr-only">{c.time}: </span>{hud.timeLeft}s</span>
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pauseRound()}
                disabled={!(playing || phase === 'countdown') || hud.ending}
                className="min-h-11 min-w-11 grid place-items-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40"
                aria-label={c.pause}
              >
                <Pause size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* prompt (the card is white in both themes, so its colours are fixed, not theme tokens) */}
          <div className={`mx-3 mt-1 rounded-2xl bg-white/95 text-[#0b1020] text-center shadow-lg ${compact ? 'px-3 py-1.5' : 'px-4 py-2.5'}`}>
            {playing || hud.ending ? (
              <>
                {!compact && <p className="text-[10px] font-bold uppercase tracking-wider text-[#B8394A]">{hud.promptKind === 'definition' ? c.definition : c.meaning}</p>}
                <p className={`${promptSize(hud.prompt, compact)} font-bold leading-snug break-words line-clamp-3`}>{hud.prompt}</p>
                <LetterSlots slots={hud.slots} typed={typed} label={slotsLabel} compact={compact} />
              </>
            ) : (
              <p className={`${compact ? 'py-1' : 'py-3'} text-sm font-semibold text-[#0b1020]/60`}>{phase === 'loading' ? c.loading : c.getReady}</p>
            )}
          </div>
          {lite && <p className="mx-4 mt-1 text-center text-[11px] text-white/55">{lite === 'lost' ? c.liteLost : c.lite}</p>}

          {/* scene */}
          <div className={`relative flex-1 overflow-hidden select-none ${compact ? 'min-h-12' : 'min-h-28'}`}>
            {phase === 'loading' && <Loader2 className="absolute inset-0 m-auto w-8 h-8 animate-spin text-white/80" aria-hidden="true" />}
            {phase === 'countdown' && hud.countdown > 0 && (
              <p className="absolute inset-0 grid place-items-center text-7xl font-black tabular-nums drop-shadow-[0_0_24px_rgba(124,92,255,.85)]" aria-hidden="true">{hud.countdown}</p>
            )}
            {practice && phase === 'countdown' && (
              <p className="absolute inset-x-3 top-3 rounded-xl bg-white/10 px-3 py-2 text-center text-xs text-white/85">{practice === 'limit' ? c.practiceLimit : c.practiceFewWords}</p>
            )}
            {hud.ending && (
              <p className="absolute inset-x-0 top-1/3 text-center text-2xl font-black drop-shadow-[0_0_18px_rgba(0,0,0,.8)]">{hud.allDone ? c.allDone : c.timeUp}</p>
            )}
            {fb && (
              <p key={fb.key} className={`absolute left-1/2 -translate-x-1/2 bottom-3 max-w-[92%] rounded-full px-4 py-1.5 text-center text-sm font-bold font-word shadow-lg ${fbTone}`}>{fb.label}</p>
            )}
          </div>

          {/* input */}
          <div className="sticky bottom-0 z-10 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {warn === 'cyrillic' && <p role="alert" className="mb-1.5 text-center text-xs font-semibold text-amber-300">{c.cyrillic}</p>}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0">
                <TypingInput
                  inputRef={inputRef}
                  value={typed}
                  onChange={onType}
                  onSubmit={submit}
                  disabled={phase === 'finishing' || hud.ending}
                  label={c.inputLabel}
                  submitLabel={c.submit}
                  placeholder={c.placeholder}
                  tone={warn ? 'bad' : 'idle'}
                />
              </div>
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={skip}
                disabled={!playing || !hud.canSkip || hud.ending}
                className="shrink-0 min-h-14 min-w-16 px-2 rounded-2xl border-2 border-white/20 bg-[#0b1020]/60 backdrop-blur-sm text-white/85 text-[11px] font-bold inline-flex flex-col items-center justify-center gap-0.5 hover:border-white/40 disabled:opacity-35"
              >
                <SkipForward size={18} aria-hidden="true" />
                {c.skip}
              </button>
            </div>
          </div>

        </div>
        {(paused || phase === 'finishing') && (
          <PauseOverlay idPrefix="tunnel" finishing={phase === 'finishing'} offline={offline} c={c} onResume={resumeRound} onEnd={() => finish('stopped')} />
        )}
      </div>

      {phase === 'result' && result && (
        <TunnelResult c={c} result={result} onAgain={start} canTry3d={pref2d && tier === 'none'} onTry3d={try3d} onResend={resend} resending={resending} />
      )}
    </div>
  );
}

function FxToggle({ on, label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border text-xs font-semibold ${on ? 'border-accent/40 bg-accent-soft text-ink' : 'border-border text-muted'}`}
    >
      <Icon size={14} aria-hidden="true" /> {label}
    </button>
  );
}

/** The result has not reached the server yet: say so, and offer to send it again. */
function RetryNotice({ c, onResend, resending }) {
  return (
    <div className="mt-3 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">
      <p role="status">{c.notSaved}</p>
      <button
        type="button"
        onClick={onResend}
        disabled={resending}
        aria-busy={resending}
        className="mt-2 inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:border-accent/40 disabled:opacity-60"
      >
        {resending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
        {resending ? c.resending : c.resend}
      </button>
    </div>
  );
}

function TunnelResult({ c, result, onAgain, canTry3d, onTry3d, onResend, resending }) {
  const stats = [
    [c.correct, result.correct],
    [c.accuracy, `${result.accuracy}%`],
    [c.maxCombo, result.maxCombo],
    [c.cpm, result.cpm],
  ];
  const extra = [result.xp ? c.xp(result.xp) : '', result.bonus ? c.bonus(result.bonus) : ''].filter(Boolean);
  // The stage (and the focused input) just went away: move focus to the result, which also reads
  // out how the round ended and the score.
  const headRef = useRef(null);
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <section aria-labelledby="tunnel-res-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent" aria-hidden="true">{result.reason}</p>
      <h2 id="tunnel-res-h" ref={headRef} tabIndex={-1} className="mt-1 text-5xl font-black text-ink tabular-nums focus:outline-none">
        <span className="sr-only">{`${result.reason}. ${c.score}: `}</span>
        {result.score}
      </h2>
      <p className="text-sm text-muted">{[c.score, ...extra].join(' · ')}</p>
      {result.flagged && <p role="status" className="mt-3 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">{c.flagged}</p>}
      {result.retry && <RetryNotice c={c} onResend={onResend} resending={resending} />}
      {result.practice && (
        <p className="mt-3 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">
          {result.practice === 'limit' ? c.practiceLimit : c.practiceFewWords}
          {result.practice === 'limit' && (
            <>
              {' '}
              <Link href="/pricing" className="font-semibold text-accent underline underline-offset-2">{c.pricing}</Link>
            </>
          )}
        </p>
      )}
      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {stats.map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse rounded-xl bg-bg border border-border px-1 py-2.5">
            <dt className="text-[10px] text-muted leading-tight">{k}</dt>
            <dd className="text-lg font-bold text-ink tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <ShareCard game="tunnel" result={result} />

      <h3 className="mt-6 text-sm font-semibold text-ink">{c.missedTitle}</h3>
      {result.missed.length ? (
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-bg">
          {result.missed.slice(0, 15).map((m, i) => (
            <li key={`${i}-${m.word}`} className="px-3.5 py-2.5">
              <span className="font-word font-semibold text-ink">{m.word}</span>
              {m.note && <span className="block text-xs text-muted break-words">{m.note}</span>}
              {m.yours && (
                <span className="block text-xs text-muted">
                  {c.yours} <s className="font-word text-danger">{m.yours}</s>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{c.noMissed}</p>
      )}

      <div className="mt-6 grid gap-2">
        {result.guest ? (
          <>
            <Link href="/start" className="w-full min-h-14 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover text-center px-4">
              {c.saveCta} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {result.missed.length > 0 && <p className="text-xs text-muted text-center">{c.saveNote(result.missed.length)}</p>}
          </>
        ) : (
          !result.practice &&
          result.missed.length > 0 && (
            <Link href="/app/vocabulary/review" className="w-full min-h-12 rounded-2xl bg-accent text-on-accent font-bold inline-flex items-center justify-center gap-2 hover:bg-accent-hover">
              {c.reviewNow} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )
        )}
        <button type="button" onClick={onAgain} className="w-full min-h-12 rounded-2xl border border-border bg-bg text-ink font-semibold inline-flex items-center justify-center gap-2 hover:border-accent/40">
          <RotateCcw size={16} aria-hidden="true" /> {c.again}
        </button>
        {canTry3d && (
          <button type="button" onClick={onTry3d} className="w-full min-h-10 rounded-2xl text-xs font-semibold text-muted inline-flex items-center justify-center gap-1.5 hover:text-ink">
            <Box size={14} aria-hidden="true" /> {c.try3d}
          </button>
        )}
      </div>
    </section>
  );
}

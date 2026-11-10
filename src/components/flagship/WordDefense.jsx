'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX, Smartphone, ArrowRight, Loader2, Crosshair, Box, RefreshCw } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';
import { translationLangFor } from '@/lib/i18n';
import {
  DEFENSE,
  initialDefense,
  travelMsFor,
  spawnIntervalFor,
  maxAliveFor,
  pickNextQuestion,
  pickSlot,
  advance,
  frontTarget,
  cycleTarget,
  breachResponseMs,
  resolveShot,
  resolveCorrection,
  resolveBreach,
  noteWord,
  summary,
} from '@/lib/flagship/defense';
import { guestTypedQuestions, fromServerQuestion, slotsFor, hasCyrillic, matchesRevealed, scheduleCounted, createSendHold } from '@/lib/flagship/typing';
import { RUN_BANK, bankMeaning } from '@/lib/flagship/runBank';
import { beep } from '@/lib/flagship/client';
import { createFpsWatchdog, stepDown, writeRenderPref, readRenderPref, detectRenderTier } from '@/lib/flagship/gpu';
import { abandonGame } from '@/components/games/api';
import { useFlagshipAudience, startRound, gradeTyped, completeRound, useVisualViewport, waitUntil, finishDeadline, FINISH_BUDGET_MS } from './useFlagshipRound';
import TypingInput, { LetterSlots, keepTypingFocus } from './TypingInput';
import DefenseScene2D from './DefenseScene2D';
import SceneBoundary from './SceneBoundary';
import PauseOverlay from './PauseOverlay';
import ShareCard from './ShareCard';

// Word Defense (flagship typing game). Word-carriers come down the lane toward the base, each with
// an Uzbek meaning (or an English definition); typing the English word for the targeted one shoots
// it. Original design — the "educational tower defence" idea is credited to pshenok/server-survival
// (MIT) in THIRD_PARTY_NOTICES.md. Rules live in lib/flagship/defense.js (tested); this controller
// owns the round in refs and drives both renderers (3D scene / DOM lane) from its own rAF loop.
//
// Grading: signed in, the FIRST answer for an enemy is graded on the server (the word is unknown
// to the browser until then); a miss reveals the word and retyping it is a correction kill graded
// on the device (never sent, never counted). Guests and practice rounds are graded on the device.
// While an answer waits for its verdict the enemy is frozen behind a shield and cannot breach.
//
// Timing (server anti-cheat): each counted answer reports the time since the later of (its enemy
// appeared, the previous counted answer), so the intervals never overlap; a send is held back until
// the server's plausibility floor for that prompt has passed, so a fast typist is never flagged.

const loadScene = () => import('./DefenseScene3D');
const DefenseScene3D = dynamic(loadScene, { ssr: false, loading: () => null });

const COUNT_MS = 700;
const FEEDBACK_MS = 1800;
const SUBMIT_GUARD_MS = 300;
const DONE_ANIM_MS = 650;
const STAGE_PHASES = new Set(['loading', 'countdown', 'playing', 'finishing']);
const INITIAL_HUD = { hp: DEFENSE.hp, score: 0, combo: 0, timeLeft: DEFENSE.roundMs / 1000, countdown: 0, enemies: [], targetId: null, feedback: null, ending: false, endWhy: '', hitKey: 0 };
/** Below this stage height (a phone with the keyboard open) the target card is compacted. */
const COMPACT_PX = 440;
const LONG_PROMPT = 60;
const promptSize = (text, compact) => ((text || '').length > LONG_PROMPT ? (compact ? 'text-sm' : 'text-base sm:text-lg') : compact ? 'text-base' : 'text-lg sm:text-xl');

const COPY = {
  uz: {
    title: 'Word Defense',
    kicker: 'IELTS spelling',
    tagline: "Dushmanlar o'zbekcha ma'no olib bazangizga kelyapti. Inglizcha so'zni yozing — va otib tashlang.",
    rules: [
      "5 ta jon. Dushman bazaga yetib kelsa — bitta jon ketadi.",
      "Yozishni boshlaganingizda eng yaqin dushman nishonga olinadi. Boshqasini tanlash: pastdagi raqamli tugmasini bosing yoki Tab.",
      "Xato yozsangiz — to'g'ri so'z ko'rsatiladi. Uni yozib, dushmanni baribir yo'q qiling.",
      "Raund 150 soniya. Qancha ko'p yo'q qilsangiz, dushmanlar shuncha tezlashadi.",
    ],
    controls: "Yozing va Enter bosing. Tab yoki ↑ ↓ — nishonni almashtirish. Esc — pauza.",
    guestNote: "Ro'yxatdan o'tmasdan o'ynaysiz. Xato so'zlaringiz saqlanadi — hisob ochsangiz, takrorlashga qo'shiladi.",
    userNote: "So'zlar o'z lug'atingizdan olinadi. Har javob serverda tekshiriladi va takrorlash jadvaliga yoziladi.",
    start: 'Boshlash',
    again: 'Yana o‘ynash',
    loading: 'Tayyorlanmoqda…',
    getReady: 'Tayyor turing — dushmanlar kelyapti',
    meaning: "Ma'nosi",
    definition: 'Definition',
    score: 'Ball',
    combo: 'Kombo',
    time: 'Vaqt',
    lives: 'Jon',
    pause: 'Pauza',
    resume: 'Davom etish',
    paused: 'Pauza',
    endRound: 'Tugatish',
    sound: 'Ovoz',
    vibrate: 'Tebranish',
    inputLabel: "Nishondagi so'zni inglizcha yozing",
    placeholder: "inglizcha so'z…",
    fire: 'Otish',
    target: 'Nishon',
    noTarget: 'Dushman kutilmoqda…',
    enemy: (n) => `${n}-dushman`,
    chip: (n, p) => `${n}-dushmanni nishonga olish: ${p}`,
    retype: "To'g'risi:",
    retypeHint: "shu so'zni yozing",
    hit: (n) => `Yo'q qilindi! +${n}`,
    correction: (n) => `Tuzatildi! +${n}`,
    wrong: "Xato. To'g'risi:",
    near: "Deyarli! To'g'risi:",
    notQuite: "Yana bir bor yozing:",
    lost: "Javob kelmadi — dushman olib tashlandi, so'z aloqa tiklanganda tekshiriladi",
    breach: (hp) => `Baza zarba oldi! ${hp} ta jon qoldi`,
    offlinePause: 'Internet aloqasi uzildi. Ulanishni tekshiring va davom eting.',
    cyrillic: "Klaviaturani lotin (English) yozuviga o'tkazing",
    letters: (n) => `${n} ta harf`,
    firstLetter: (ch, n) => `«${ch}» harfi bilan boshlanadi, ${n} ta harf`,
    timeUp: 'Vaqt tugadi — baza saqlandi',
    cleared: "Hamma dushman yo'q qilindi!",
    held: 'Dushmanlar tugadi — baza saqlandi',
    over: 'Baza quladi',
    finished: 'Raund tugadi',
    expired: 'Sessiya muddati tugadi',
    kills: "Yo'q qilindi",
    accuracy: 'Aniqlik',
    maxCombo: 'Eng uzun kombo',
    hpLeft: 'Qolgan jon',
    corrections: (n) => `${n} ta tuzatish`,
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
    try3d: '3D rejimni qayta sinash',
  },
  en: {
    title: 'Word Defense',
    kicker: 'IELTS spelling',
    tagline: 'Enemies carry Uzbek meanings toward your base. Type the English word — and shoot them down.',
    rules: [
      '5 lives. An enemy that reaches the base costs one.',
      'When you start typing, the closest enemy is targeted. Pick another: tap its numbered button below the lane, or press Tab.',
      'Miss, and the right word is shown. Type it to destroy the enemy anyway.',
      '150-second round. The more you destroy, the faster they come.',
    ],
    controls: 'Type, then press Enter. Tab or ↑ ↓ switches target. Esc pauses.',
    guestNote: 'No account needed. Your missed words are kept — sign up and they go into your reviews.',
    userNote: 'Words come from your own vocabulary. Every answer is checked on the server and updates your review schedule.',
    start: 'Start',
    again: 'Play again',
    loading: 'Getting ready…',
    getReady: 'Get ready — enemies incoming',
    meaning: 'Meaning',
    definition: 'Definition',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    lives: 'Lives',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    endRound: 'End round',
    sound: 'Sound',
    vibrate: 'Vibration',
    inputLabel: 'Type the English word for the target',
    placeholder: 'English word…',
    fire: 'Fire',
    target: 'Target',
    noTarget: 'Waiting for enemies…',
    enemy: (n) => `Enemy ${n}`,
    chip: (n, p) => `Target enemy ${n}: ${p}`,
    retype: 'Answer:',
    retypeHint: 'type this word',
    hit: (n) => `Destroyed! +${n}`,
    correction: (n) => `Corrected! +${n}`,
    wrong: 'Wrong. Answer:',
    near: 'Almost! Answer:',
    notQuite: 'Type it once more:',
    lost: 'No verdict yet — enemy removed; the word is checked once you are back online',
    breach: (hp) => `The base was hit! ${hp} lives left`,
    offlinePause: 'The connection dropped. Check your internet and continue.',
    cyrillic: 'Switch your keyboard to Latin (English)',
    letters: (n) => `${n} letters`,
    firstLetter: (ch, n) => `Starts with “${ch}”, ${n} letters`,
    timeUp: "Time's up — base held",
    cleared: 'Every enemy destroyed!',
    held: 'No enemies left — base held',
    over: 'The base fell',
    finished: 'Round over',
    expired: 'The session expired',
    kills: 'Destroyed',
    accuracy: 'Accuracy',
    maxCombo: 'Best combo',
    hpLeft: 'HP left',
    corrections: (n) => `${n} corrections`,
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
  },
  ru: {
    title: 'Word Defense',
    kicker: 'Правописание для IELTS',
    tagline: 'Враги несут значения к вашей базе. Напечатайте английское слово — и сбейте их.',
    rules: [
      '5 жизней. Враг, дошедший до базы, отнимает одну.',
      'Когда вы начинаете печатать, выбирается ближайший враг. Чтобы выбрать другого, нажмите его кнопку с номером под дорожкой или Tab.',
      'Ошиблись — покажем правильное слово. Напечатайте его, чтобы всё равно уничтожить врага.',
      'Раунд — 150 секунд. Чем больше уничтожаете, тем быстрее они идут.',
    ],
    controls: 'Напечатайте слово и нажмите Enter. Tab или ↑ ↓ — сменить цель. Esc — пауза.',
    guestNote: 'Аккаунт не нужен. Слова с ошибками сохранятся — зарегистрируйтесь, и они попадут в повторения.',
    userNote: 'Слова берутся из вашего словаря. Каждый ответ проверяется на сервере и обновляет график повторений.',
    start: 'Начать',
    again: 'Ещё раз',
    loading: 'Готовим…',
    getReady: 'Приготовьтесь — враги на подходе',
    meaning: 'Значение',
    definition: 'Определение',
    score: 'Очки',
    combo: 'Комбо',
    time: 'Время',
    lives: 'Жизни',
    pause: 'Пауза',
    resume: 'Продолжить',
    paused: 'Пауза',
    endRound: 'Завершить раунд',
    sound: 'Звук',
    vibrate: 'Вибрация',
    inputLabel: 'Напечатайте английское слово для цели',
    placeholder: 'Английское слово…',
    fire: 'Огонь',
    target: 'Цель',
    noTarget: 'Ждём врагов…',
    enemy: (n) => `Враг ${n}`,
    chip: (n, p) => `Цель — враг ${n}: ${p}`,
    retype: 'Ответ:',
    retypeHint: 'напечатайте это слово',
    hit: (n) => `Уничтожен! +${n}`,
    correction: (n) => `Исправлено! +${n}`,
    wrong: 'Неверно. Ответ:',
    near: 'Почти! Ответ:',
    notQuite: 'Напечатайте ещё раз:',
    lost: 'Ответ пока не проверен — враг убран, слово проверим, когда появится связь',
    breach: (hp) => `Базу атаковали! Осталось жизней: ${hp}`,
    offlinePause: 'Связь пропала. Проверьте интернет и продолжайте.',
    cyrillic: 'Переключите клавиатуру на латиницу (английский)',
    letters: (n) => `Букв: ${n}`,
    firstLetter: (ch, n) => `Начинается на «${ch}», букв: ${n}`,
    timeUp: 'Время вышло — база выстояла',
    cleared: 'Все враги уничтожены!',
    held: 'Враги закончились — база выстояла',
    over: 'База пала',
    finished: 'Раунд окончен',
    expired: 'Сессия истекла',
    kills: 'Уничтожено',
    accuracy: 'Точность',
    maxCombo: 'Лучшее комбо',
    hpLeft: 'Осталось HP',
    corrections: (n) => `Исправлений: ${n}`,
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
  },
};

const isLive = (e) => e.state === 'walk' || e.state === 'pending' || e.state === 'revealed';
const playable = (s) => s.active && s.stage === 'playing' && !s.pausedAt && !s.endAt;

export default function WordDefense() {
  const c = useCopy(COPY);
  const tLang = translationLangFor(useT().locale); // guest meanings: Russian UI -> Russian
  const [notice, setNotice] = useState('');
  const onClaimed = useCallback((n) => setNotice(c.claimed(n)), [c]);
  const { audience, fx, fxRef, toggleFx, tier, setTier } = useFlagshipAudience('word_defense', onClaimed);
  const [phase, setPhase] = useState('intro'); // intro | loading | countdown | playing | finishing | result
  const [everStarted, setEverStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [offline, setOffline] = useState(false);
  const [typed, setTyped] = useState('');
  const [warn, setWarn] = useState('');
  const [hud, setHud] = useState(INITIAL_HUD);
  const [result, setResult] = useState(null);
  const [resending, setResending] = useState(false); // "send again" of a result the server has not got yet
  const [error, setError] = useState('');
  const [practice, setPractice] = useState(null); // null | 'few_words' | 'limit'
  const [lite, setLite] = useState(''); // '' | 'slow' (the watchdog's last step) | 'lost' (WebGL context lost)
  const [pref2d, setPref2d] = useState(false);
  const [sayTarget, setSayTarget] = useState('');
  const [sayVerdict, setSayVerdict] = useState('');

  const inputRef = useRef(null);
  const sceneRef = useRef({ enemies: [], targetId: null, shot: null, hit: null, pulse: null, contextLost: false });
  const g = useRef({ active: false });
  const idSeq = useRef(0); // enemy ids stay unique across rounds (the scene keys its bursts on them)
  const tierRef = useRef(tier);
  const startingRef = useRef(false);
  const disposedRef = useRef(false); // the page was left (a start request may still be in flight)
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the device preference once
    setPref2d(readRenderPref() === '2d');
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

  // ---------- HUD ----------
  const syncHud = useCallback((s) => {
    const enemies = s.enemies.map((e) => ({
      id: e.id,
      slot: e.slot,
      state: e.state,
      prompt: e.q.prompt,
      kind: e.q.promptKind,
      revealed: e.revealed,
      slots: e.slots,
      progress: Math.min(1, e.progress || 0),
    }));
    const timeLeft = s.stage === 'playing' ? Math.max(0, Math.ceil((DEFENSE.roundMs - s.gameMs) / 1000)) : DEFENSE.roundMs / 1000;
    setHud((h) => ({ ...h, enemies, targetId: s.targetId, hp: s.state.hp, score: s.state.score, combo: s.state.combo, timeLeft }));
  }, []);

  const feedback = useCallback((s, key, tone, label) => {
    s.feedbackAt = performance.now();
    setHud((h) => ({ ...h, feedback: { key, tone, label } }));
    setSayVerdict(label);
  }, []);

  const clearInput = useCallback((s) => {
    s.typed = '';
    s.locked = false;
    setTyped('');
    setWarn('');
  }, []);

  /** Keeps a target: the one being typed at (locked) or picked by hand, else the closest to the base. */
  const retarget = useCallback(
    (s) => {
      const cur = s.enemies.find((e) => e.id === s.targetId);
      const valid = !!cur && cur.alive && !cur.pending;
      if (valid && (s.locked || s.manual)) return;
      if (!valid) {
        s.manual = false;
        if (s.locked) clearInput(s);
      }
      const next = frontTarget(s.enemies);
      if (next === s.targetId) return;
      s.targetId = next;
      sceneRef.current.targetId = next;
      const e = s.enemies.find((x) => x.id === next);
      if (e) setSayTarget(`${c.enemy(e.slot + 1)}. ${e.state === 'revealed' ? `${c.retype} ${e.revealed}` : `${e.q.promptKind === 'definition' ? c.definition : c.meaning}: ${e.q.prompt}`}`);
    },
    [c, clearInput]
  );

  // ---------- round ----------
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
      const stopped = why === 'stopped' || why === 'expired';
      setPaused(false);
      setOffline(false);
      // Settle: a shot still held or in flight belongs to this round (the server counts it), so the
      // summary waits for its verdict, bounded like the time-up / base-fell wait (already spent when
      // endAt is set). Meanwhile onShot applies only its score. A guest verdict lands in a microtask.
      if (s.inflight > 0) {
        setPhase('finishing');
        await waitUntil(() => s.inflight === 0 || g.current !== s || disposedRef.current, (s.endAt || now) + DEFENSE.gradeTimeoutMs + 500 - now);
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
      const resolved = s.enemies.filter((e) => !isLive(e)).length + s.resolvedGone;
      const sum = summary(s.state, s.gameMs, { resolved });
      const reason = why === 'expired' ? c.expired : why === 'stopped' ? c.finished : why === 'over' ? c.over : why === 'cleared' ? c.cleared : why === 'held' ? c.held : c.timeUp;
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
    s.pausedTotal += d;
    s.lastFrame = now;
    // Only the game clock skips the pause (the lane froze). The answer clock (spawnedAt,
    // lastCountedAt) keeps running in wall-clock time, as the server sees it (design §12).
    if (s.stage === 'countdown') s.countdownEnd += d;
    s.nullStreak = 0;
    s.watchdog.reset(now);
    setPaused(false);
    setOffline(false);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const breach = useCallback(
    (s, e, now) => {
      e.alive = false;
      e.state = 'breach';
      e.at = now;
      e.doneAt = now;
      const answered = e.answered;
      s.state = resolveBreach(s.state, { qid: e.qid, word: e.revealed || e.q.word || '', prompt: e.q.prompt, answered });
      sceneRef.current.hit = { at: now };
      beep('wrong', fxRef.current);
      setHud((h) => ({ ...h, hitKey: h.hitKey + 1 }));
      feedback(s, `b${e.id}`, 'bad', c.breach(s.state.hp));
      if (!answered) {
        // The breach is this enemy's counted (empty) answer: the word was not known in time. It goes
        // to the server for the review schedule and reveals the word for the missed list; its time
        // is fixed just above the plausibility floor and does not move the answer partition.
        e.answered = true;
        gradeTyped(s.round, e.q, '', breachResponseMs(e.q.prompt), { timeoutMs: DEFENSE.gradeTimeoutMs }).then((res) => {
          if (g.current === s && res.correctDisplay) s.state = noteWord(s.state, e.qid, res.correctDisplay);
        });
      }
      if (s.targetId === e.id) {
        s.manual = false;
        clearInput(s);
      }
    },
    [c, clearInput, feedback, fxRef]
  );

  const spawn = useCallback((s, now) => {
    if (s.gameMs < DEFENSE.firstSpawnMs) return false;
    const alive = s.enemies.filter((e) => e.alive);
    if (alive.length >= maxAliveFor(s.state.kills)) return false;
    if (alive.length > 0 && s.gameMs < s.nextSpawnAt) return false;
    const i = pickNextQuestion(s.qs, s.spawned, alive.map((e) => e.q.prompt));
    if (i < 0) return false;
    const q = s.qs[i];
    // Free lanes among the living only: an enemy still playing its death animation does not hold one.
    const slot = pickSlot(alive.map((e) => e.slot));
    idSeq.current += 1;
    s.enemies.push({
      id: idSeq.current,
      q,
      qid: q.qid,
      slot,
      x: DEFENSE.slots[slot],
      spawnedAt: now,
      born: now,
      travelMs: travelMsFor(s.state.kills),
      travelled: 0,
      progress: 0,
      alive: true,
      pending: false,
      answered: false,
      state: 'walk',
      at: now,
      revealed: '',
      doneAt: 0,
      slots: slotsFor(q),
    });
    s.spawned.add(q.qid);
    s.nextSpawnAt = s.gameMs + spawnIntervalFor(s.state.kills);
    return true;
  }, []);

  const onShot = useCallback(
    (s, e, answer, responseMs, progress, res) => {
      if (g.current !== s || s.closed) return;
      s.inflight = Math.max(0, s.inflight - 1);
      const word = res.correctDisplay || e.q.word || '';
      if (!s.active) {
        // The round is settling (finish waits for the shots in flight): only the score changes, no
        // scene, HUD, sound or pause. A fatal verdict (the session is gone) just counts as landed.
        if (!res.fatal) s.state = resolveShot(s.state, { ok: res.ok, qid: e.qid, word, prompt: e.q.prompt, typed: answer, responseMs, progress });
        return;
      }
      if (res.fatal) {
        finish('expired');
        return;
      }
      const now = performance.now();
      const before = s.state.score;
      s.state = resolveShot(s.state, { ok: res.ok, qid: e.qid, word, prompt: e.q.prompt, typed: answer, responseMs, progress });
      e.pending = false;
      e.at = now;
      if (res.ok) {
        e.state = 'dead';
        e.alive = false;
        e.doneAt = now;
        sceneRef.current.pulse = { ok: true, at: now };
        beep('ok', fxRef.current);
        feedback(s, `v${e.id}`, 'ok', c.hit(s.state.score - before));
      } else if (res.ok === false) {
        e.state = 'revealed';
        e.revealed = word;
        sceneRef.current.pulse = { ok: false, at: now };
        beep('wrong', fxRef.current);
        feedback(s, `v${e.id}`, 'bad', `${res.near ? c.near : c.wrong} ${word}`);
      } else {
        e.state = 'lost';
        e.alive = false;
        e.doneAt = now;
        feedback(s, `v${e.id}`, 'none', c.lost);
      }
      s.nullStreak = res.ok === null ? s.nullStreak + 1 : 0;
      retarget(s);
      syncHud(s);
      if (s.nullStreak >= 2 && !s.endAt) pauseRound(true);
    },
    [c, feedback, finish, fxRef, pauseRound, retarget, syncHud]
  );

  /** First (counted) answer for an enemy: freeze it, then send once the timing floor has passed. */
  const fire = useCallback(
    (s, e, answer, now) => {
      e.state = 'pending';
      e.pending = true;
      e.answered = true;
      e.at = now;
      sceneRef.current.shot = { id: e.id, at: now };
      const { sendAt, responseMs } = scheduleCounted({ now, spawnedAt: e.spawnedAt, lastCountedAt: s.lastCountedAt, prompt: e.q.prompt });
      s.lastCountedAt = sendAt;
      const progress = e.progress;
      s.inflight += 1;
      const send = () =>
        gradeTyped(s.round, e.q, answer, responseMs, { timeoutMs: DEFENSE.gradeTimeoutMs }).then((res) => onShot(s, e, answer, responseMs, progress, res));
      s.hold.at(sendAt, now, send);
    },
    [onShot]
  );

  const tickRef = useRef(() => {});
  const tick = useCallback(() => {
    const s = g.current;
    if (!s.active) return;
    const now = performance.now();
    const dt = Math.min(100, Math.max(0, now - s.lastFrame));
    s.lastFrame = now;
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
          s.gameMs = 0;
          setHud((h) => ({ ...h, countdown: 0 }));
          setPhase('playing');
          s.watchdog.reset(now);
        } else if (left !== s.lastCount) {
          s.lastCount = left;
          setHud((h) => ({ ...h, countdown: left }));
        }
      } else {
        s.gameMs += dt;
        let changed = false;
        for (const e of s.enemies) {
          if (e.state !== 'walk' && e.state !== 'revealed') continue;
          advance(e, dt);
          if (e.progress >= 1 && !s.endAt) {
            breach(s, e, now);
            changed = true;
          }
        }
        if (s.enemies.some((e) => e.doneAt && now - e.doneAt > DONE_ANIM_MS)) {
          const keep = s.enemies.filter((e) => !(e.doneAt && now - e.doneAt > DONE_ANIM_MS));
          s.resolvedGone += s.enemies.length - keep.length;
          s.enemies = keep;
          sceneRef.current.enemies = keep;
          changed = true;
        }
        if (!s.endAt && spawn(s, now)) changed = true;
        if (!s.endAt) {
          const why = s.state.over ? 'over' : s.gameMs >= DEFENSE.roundMs ? 'time' : s.spawned.size >= s.qs.length && !s.enemies.some((e) => e.alive) ? (s.state.kills + s.state.corrections >= s.qs.length ? 'cleared' : 'held') : '';
          if (why) {
            // Enemies still on the lane are not sent; verdicts already in flight are awaited.
            s.endAt = now;
            s.why = why;
            setHud((h) => ({ ...h, ending: true, endWhy: why }));
            changed = true;
          }
        }
        if (s.endAt && (s.inflight === 0 || now - s.endAt > DEFENSE.gradeTimeoutMs + 500)) {
          finish(s.why);
          return;
        }
        if (changed || now - s.lastHud > 200) {
          s.lastHud = now;
          retarget(s);
          syncHud(s);
        }
        if (s.feedbackAt && now - s.feedbackAt > FEEDBACK_MS) {
          s.feedbackAt = 0;
          setHud((h) => ({ ...h, feedback: null }));
        }
      }
      if (tierRef.current !== 'none' && document.visibilityState === 'visible') s.watchdog.sample(now);
    }
    s.raf = requestAnimationFrame(() => tickRef.current());
  }, [breach, finish, onContextLost, retarget, spawn, syncHud]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const begin = async () => {
    let round;
    try {
      round = await startRound({
        gameKey: 'word_defense',
        audience,
        toQuestion: fromServerQuestion,
        guestQuestions: () => guestTypedQuestions(RUN_BANK, Math.random, DEFENSE.guestQuestions, tLang),
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
    const enemies = [];
    g.current = {
      active: true,
      stage: 'countdown',
      countdownEnd: now + 3 * COUNT_MS,
      lastCount: 3,
      lastFrame: now,
      qs: round.qs,
      round,
      state: initialDefense(),
      spawned: new Set(),
      enemies,
      resolvedGone: 0,
      roundStart: 0,
      pausedTotal: 0,
      pausedAt: 0,
      gameMs: 0,
      nextSpawnAt: DEFENSE.firstSpawnMs,
      targetId: null,
      locked: false,
      manual: false,
      typed: '',
      lastCountedAt: 0,
      hold: createSendHold(),
      inflight: 0,
      closed: false, // set by finish once the round has settled and its summary is made
      local: null, // that summary's missed list, kept for "send again"
      resending: false,
      nullStreak: 0,
      lastSubmitAt: 0,
      endAt: 0,
      why: '',
      lastHud: 0,
      feedbackAt: 0,
      watchdog: createFpsWatchdog({ onLow: onLowFps }),
    };
    Object.assign(sceneRef.current, { enemies, targetId: null, shot: null, hit: null, pulse: null });
    // A context lost between rounds (and not given back) is only noticed here: play this round in 2D.
    if (sceneRef.current.contextLost) {
      sceneRef.current.contextLost = false;
      if (tierRef.current !== 'none') onContextLost();
    }
    setPractice(round.practice ? round.reason || 'few_words' : null);
    setHud({ ...INITIAL_HUD, countdown: 3 });
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

  const onType = useCallback(
    (value) => {
      const s = g.current;
      if (!playable(s)) return; // countdown / pause: ignored
      s.typed = value;
      setTyped(value);
      setWarn(hasCyrillic(value) ? 'cyrillic' : '');
      if (!value) {
        s.locked = false;
        return;
      }
      if (!s.locked) {
        // The first character locks the current target, so a closer enemy can't steal the word.
        const cur = s.enemies.find((e) => e.id === s.targetId && e.alive && !e.pending);
        if (!cur) {
          s.targetId = frontTarget(s.enemies);
          sceneRef.current.targetId = s.targetId;
        }
        s.locked = s.targetId != null;
        if (s.locked) setHud((h) => ({ ...h, targetId: s.targetId }));
      }
    },
    []
  );

  const selectTarget = useCallback(
    (id) => {
      const s = g.current;
      if (!playable(s)) return;
      const e = s.enemies.find((x) => x.id === id && x.alive && !x.pending);
      if (!e) return;
      clearInput(s); // a manual switch starts the word over
      s.targetId = id;
      s.manual = true;
      sceneRef.current.targetId = id;
      setHud((h) => ({ ...h, targetId: id }));
      setSayTarget(`${c.enemy(e.slot + 1)}. ${e.state === 'revealed' ? `${c.retype} ${e.revealed}` : `${e.q.promptKind === 'definition' ? c.definition : c.meaning}: ${e.q.prompt}`}`);
      inputRef.current?.focus({ preventScroll: true });
    },
    [c, clearInput]
  );

  const submit = useCallback(() => {
    const s = g.current;
    if (!playable(s)) return;
    const now = performance.now();
    if (now - s.lastSubmitAt < SUBMIT_GUARD_MS) return;
    const raw = s.typed || '';
    if (!raw.trim()) return; // Enter on an empty field does nothing
    if (hasCyrillic(raw)) {
      setWarn('cyrillic');
      return;
    }
    const e = s.enemies.find((x) => x.id === s.targetId && x.alive && !x.pending);
    if (!e) {
      retarget(s);
      return;
    }
    s.lastSubmitAt = now;
    if (e.state === 'revealed') {
      // Correction: the word was revealed after a miss; retyping it is checked on the device and is
      // never sent (only the first answer counts).
      clearInput(s);
      if (matchesRevealed(raw, e.revealed)) {
        e.state = 'dead';
        e.alive = false;
        e.doneAt = now;
        e.at = now;
        s.state = resolveCorrection(s.state);
        sceneRef.current.shot = { id: e.id, at: now };
        sceneRef.current.pulse = { ok: true, at: now };
        beep('ok', fxRef.current);
        feedback(s, `c${e.id}`, 'ok', c.correction(DEFENSE.correctionPoints));
        s.manual = false;
      } else {
        beep('wrong', fxRef.current);
        feedback(s, `c${e.id}-${now}`, 'bad', `${c.notQuite} ${e.revealed}`);
        s.manual = true; // stay on this enemy for another try
      }
      retarget(s);
      syncHud(s);
      return;
    }
    clearInput(s);
    s.manual = false;
    fire(s, e, raw, now);
    retarget(s);
    syncHud(s);
  }, [c, clearInput, feedback, fire, fxRef, retarget, syncHud]);

  const onKeyDown = useCallback(
    (ev) => {
      if (ev.key !== 'Tab' && ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
      ev.preventDefault();
      const s = g.current;
      if (!playable(s)) return;
      const dir = ev.key === 'ArrowUp' || (ev.key === 'Tab' && !ev.shiftKey) ? 1 : -1;
      const next = cycleTarget(s.enemies, s.targetId, dir);
      if (next != null) selectTarget(next);
    },
    [selectTarget]
  );

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
  const target = hud.enemies.find((e) => e.id === hud.targetId && (e.state === 'walk' || e.state === 'revealed')) || null;
  const chips = hud.enemies.filter((e) => e.state === 'walk' || e.state === 'pending' || e.state === 'revealed').sort((a, b) => a.slot - b.slot);
  const fb = hud.feedback;
  const fbTone = fb ? (fb.tone === 'ok' ? 'bg-emerald-700 text-white' : fb.tone === 'bad' ? 'bg-rose-700 text-white' : 'bg-white/90 text-[#0b1020]') : '';
  const slotsLabel = target?.slots ? (target.slots.first ? c.firstLetter(target.slots.first, target.slots.length) : c.letters(target.slots.length)) : '';

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="sr-only" aria-live="polite">{sayTarget}</p>
      <p className="sr-only" aria-live="polite">{sayVerdict}</p>

      {(phase === 'intro' || phase === 'loading') && (
        <section aria-labelledby="defense-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Crosshair size={13} aria-hidden="true" /> {c.kicker}
          </p>
          <h1 id="defense-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
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
        </section>
      )}

      {/* The stage: a fixed overlay over the visual viewport, kept mounted (hidden + inert) between
          rounds so the 3D Canvas is created once. */}
      <div
        className={stageActive ? 'fixed inset-x-0 top-0 z-[60] flex flex-col bg-[#070a18] text-white overscroll-contain' : 'fixed inset-0 -z-10 invisible pointer-events-none'}
        style={stageActive ? { top: box ? box.top : 0, height: box ? box.height : '100dvh' } : undefined}
        inert={!stageActive}
        onMouseDown={keepTypingFocus}
      >
        {/* Scrolls only on very short screens; the chips and the input then stay pinned at the bottom. */}
        {/* The scene fills the whole stage (like Vocably Run); the HUD, the target card, the chips and
            the input float above it in a readable column. */}
        <div className="absolute inset-0 overflow-hidden select-none">
          {everStarted && use3d && (
            <SceneBoundary onError={to2d}>
              <DefenseScene3D sceneRef={sceneRef} running={stageActive && !paused} visible={stageActive} tier={tier} />
            </SceneBoundary>
          )}
          {!use3d && (
            <div className="absolute inset-y-0 left-1/2 w-full max-w-xl -translate-x-1/2">
              <DefenseScene2D sceneRef={sceneRef} enemies={hud.enemies} targetId={hud.targetId} running={stageActive && !paused} hitKey={hud.hitKey} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#050716]/90 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#050716] via-[#050716]/75 to-transparent" aria-hidden="true" />
        </div>
        <section aria-label={c.title} className="relative z-10 flex-1 min-h-0 flex flex-col w-full max-w-xl mx-auto overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* HUD */}
          <div className="flex items-center justify-between gap-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 select-none">
            <div className="flex items-center gap-0.5" role="img" aria-label={`${c.lives}: ${hud.hp}`}>
              {Array.from({ length: DEFENSE.hp }, (_, i) => (
                <Heart key={i} size={16} className={i < hud.hp ? 'fill-rose-500 text-rose-500' : 'text-white/25'} aria-hidden="true" />
              ))}
            </div>
            <div className="text-center">
              <p className="text-2xl font-black tabular-nums leading-none"><span className="sr-only">{c.score}: </span>{hud.score}</p>
              <p className="h-4 text-[11px] font-bold text-amber-300 tabular-nums">{hud.combo >= 2 ? `${c.combo} ×${hud.combo}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tabular-nums ${hud.timeLeft <= 15 ? 'text-rose-300' : ''}`}><span className="sr-only">{c.time}: </span>{hud.timeLeft}s</span>
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

          {/* target (the card is white in both themes, so its colours are fixed, not theme tokens) */}
          <div className={`mx-3 mt-1 rounded-2xl bg-white/95 text-[#0b1020] px-3 shadow-lg ${compact ? 'py-1.5' : 'py-2.5'}`}>
            {target ? (
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 grid place-items-center rounded-full bg-[#0b1020] text-white font-black ${compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`} aria-hidden="true">{target.slot + 1}</span>
                <div className={`flex-1 min-w-0 text-center ${compact ? 'pr-6' : 'pr-8'}`}>
                  {(!compact || target.state === 'revealed') && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#B8394A]">
                      {c.target} · {target.state === 'revealed' ? c.retypeHint : target.kind === 'definition' ? c.definition : c.meaning}
                    </p>
                  )}
                  {target.state === 'revealed' ? (
                    <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold leading-snug break-words`}>
                      {c.retype} <span className="font-word text-rose-700">{target.revealed}</span>
                    </p>
                  ) : (
                    <>
                      <p className={`${promptSize(target.prompt, compact)} font-bold leading-snug break-words line-clamp-3`}>{target.prompt}</p>
                      <LetterSlots slots={target.slots} typed={typed} label={slotsLabel} compact={compact} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className={`${compact ? 'py-1' : 'py-3'} text-center text-sm font-semibold text-[#0b1020]/60`}>{phase === 'loading' ? c.loading : phase === 'countdown' ? c.getReady : c.noTarget}</p>
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
              <p className="absolute inset-x-0 top-1/3 px-4 text-center text-2xl font-black drop-shadow-[0_0_18px_rgba(0,0,0,.8)]">
                {hud.endWhy === 'over' ? c.over : hud.endWhy === 'cleared' ? c.cleared : hud.endWhy === 'held' ? c.held : c.timeUp}
              </p>
            )}
            {fb && (
              <p key={fb.key} className={`absolute left-1/2 -translate-x-1/2 bottom-3 max-w-[92%] rounded-full px-4 py-1.5 text-center text-sm font-bold font-word shadow-lg ${fbTone}`}>{fb.label}</p>
            )}
          </div>

          <div className="sticky bottom-0 z-10">
            {/* enemy chips: the accessible way to pick a target, mirrored by the numbers in the scene */}
            <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto select-none [scrollbar-width:none]" role="group" aria-label={c.target}>
              {chips.map((e) => {
                const isTarget = e.id === hud.targetId;
                const tone = e.state === 'pending' ? 'border-white/40 bg-white/20' : e.state === 'revealed' ? 'border-rose-300/70 bg-rose-500/30' : isTarget ? 'border-amber-300 bg-amber-300/20' : 'border-white/20 bg-[#0b1020]/60';
                const label = e.state === 'revealed' ? e.revealed : e.prompt;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onPointerDown={(ev) => ev.preventDefault()}
                    onClick={() => selectTarget(e.id)}
                    disabled={e.state === 'pending' || !playing}
                    aria-pressed={isTarget}
                    aria-label={c.chip(e.slot + 1, label)}
                    className={`relative shrink-0 min-h-11 max-w-[11rem] rounded-xl border-2 pl-1.5 pr-2.5 py-1 inline-flex items-center gap-1.5 text-left overflow-hidden backdrop-blur-sm ${tone}`}
                  >
                    <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-white/15 text-xs font-black" aria-hidden="true">{e.slot + 1}</span>
                    <span className={`truncate text-xs font-semibold ${e.state === 'revealed' ? 'font-word text-rose-100' : 'text-white/90'}`}>{label}</span>
                    <span className="absolute left-0 bottom-0 h-[3px] bg-rose-400/80" style={{ width: `${Math.round(e.progress * 100)}%` }} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {/* input */}
            <div className="px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {warn === 'cyrillic' && <p role="alert" className="mb-1.5 text-center text-xs font-semibold text-amber-300">{c.cyrillic}</p>}
              <TypingInput
                inputRef={inputRef}
                value={typed}
                onChange={onType}
                onSubmit={submit}
                onKeyDown={onKeyDown}
                disabled={phase === 'finishing' || hud.ending}
                label={c.inputLabel}
                submitLabel={c.fire}
                placeholder={c.placeholder}
                tone={warn ? 'bad' : 'idle'}
                SubmitIcon={Crosshair}
              />
            </div>
          </div>
        </section>
        {(paused || phase === 'finishing') && (
          <PauseOverlay idPrefix="defense" finishing={phase === 'finishing'} offline={offline} c={c} onResume={resumeRound} onEnd={() => finish('stopped')} />
        )}
      </div>

      {phase === 'result' && result && (
        <DefenseResult c={c} result={result} onAgain={start} canTry3d={pref2d && tier === 'none'} onTry3d={try3d} onResend={resend} resending={resending} />
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

function DefenseResult({ c, result, onAgain, canTry3d, onTry3d, onResend, resending }) {
  const stats = [
    [c.kills, result.kills],
    [c.accuracy, `${result.accuracy}%`],
    [c.maxCombo, result.maxCombo],
    [c.hpLeft, result.hp],
  ];
  const extra = [result.xp ? c.xp(result.xp) : '', result.corrections ? c.corrections(result.corrections) : ''].filter(Boolean);
  // The stage (and the focused input) just went away: move focus to the result, which also reads
  // out how the round ended and the score.
  const headRef = useRef(null);
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <section aria-labelledby="defense-res-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent" aria-hidden="true">{result.reason}</p>
      <h2 id="defense-res-h" ref={headRef} tabIndex={-1} className="mt-1 text-5xl font-black text-ink tabular-nums focus:outline-none">
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
      <ShareCard game="defense" result={result} />

      <h3 className="mt-6 text-sm font-semibold text-ink">{c.missedTitle}</h3>
      {result.missed.length ? (
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-bg">
          {result.missed.slice(0, 15).map((m, i) => (
            <li key={`${i}-${m.word}`} className="px-3.5 py-2.5">
              <span className="font-word font-semibold text-ink">{m.word || '—'}</span>
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

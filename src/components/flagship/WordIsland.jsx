'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Pause, Play, RotateCcw, Volume2, VolumeX, Smartphone, ArrowRight, Loader2, TreePalm, Box, ArrowLeft, Square, LogOut, RefreshCw, Navigation2, Lock, Sparkles } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';
import { ISLAND, BEACONS, initialIsland, resolveBeacon, allResolved, summary, stepHero, beaconInReach, nextBeacon, unlockMsFor } from '@/lib/flagship/island';
import { guestQuestions } from '@/lib/flagship/run';
import { RUN_BANK, bankMeaning } from '@/lib/flagship/runBank';
import { beep } from '@/lib/flagship/client';
import { createFpsWatchdog, stepDown, writeRenderPref, readRenderPref, detectRenderTier } from '@/lib/flagship/gpu';
import { translationLangFor } from '@/lib/i18n';
import { abandonGame } from '@/components/games/api';
import { TouchJoystick } from '@/components/games/world/TouchJoystick';
import { useFlagshipAudience, startRound, completeRound, gradeViaQueue, finishDeadline, FINISH_BUDGET_MS } from './useFlagshipRound';
import SceneBoundary from './SceneBoundary';
import { trapTab } from './PauseOverlay';
import ShareCard from './ShareCard';

const loadScene = () => import('./IslandScene3D');
const IslandScene3D = dynamic(loadScene, { ssr: false, loading: () => null });

// So'z oroli: the exploration game. The player walks a small 3D island (stick, keys, or a tap on
// the ground); each of its beacons asks one word — an Uzbek meaning or an English definition and
// three English words. The right word lights the beacon; a wrong one breaks it and costs a heart.
// One controller for both audiences, like the other flagship games:
//  - signed in: a regular game session (POST /api/games/word_island/start, one question per beacon,
//    no answers in the client); every pick is graded on the server and feeds SRS; XP once at the end.
//  - guest (or a signed-in player with too few words → practice): words from the public bank,
//    graded on the device; missed words are kept and saved after sign-up.
// The controller owns the whole simulation (the hero's position included) in refs and its own rAF
// loop; the scene only draws `sceneRef.current`. React state carries the HUD and the question sheet.
// Timing: `responseMs` is wall-clock time from the moment a beacon opened, pauses included, and the
// words stay locked past the server's plausibility floor (island.js unlockMsFor).

const PAUSE_BTN = 'min-h-12 px-6 rounded-2xl inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020]';
const GRADE_TIMEOUT_MS = 3000;
const KEY_DIR = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };

const COPY = {
  uz: {
    title: "So'z oroli",
    kicker: 'IELTS vocabulary · sarguzasht',
    tagline: "Orolda yuring, mayoqlarni toping va so'zini topib ularni yoqing.",
    rules: ["Har mayoq bitta so'z so'raydi: ma'no yoki ta'rif va 3 ta inglizcha so'z.", "To'g'ri so'z mayoqni yoqadi. Xato so'z uni sindiradi va bitta jon oladi (jami 3 ta).", "Hamma mayoq yonsa — minora chirog'i yonadi. Raund 180 soniya."],
    controls: "Yurish: joystik, WASD yoki strelkalar, yoki yerga bosing. Javob: so'zni bosing yoki 1 / 2 / 3.",
    guestNote: "Ro'yxatdan o'tmasdan o'ynaysiz. Xato so'zlaringiz saqlanadi — hisob ochsangiz, takrorlashga qo'shiladi.",
    userNote: "So'zlar o'z lug'atingizdan olinadi. Har javob takrorlash jadvaliga yoziladi.",
    start: 'Boshlash',
    again: "Yana o'ynash",
    loading: 'Tayyorlanmoqda…',
    meaning: "Ma'nosi",
    definition: 'Definition',
    beacons: 'Mayoqlar',
    hearts: 'Jon',
    score: 'Ball',
    combo: 'Kombo',
    time: 'Vaqt',
    pause: 'Pauza',
    resume: 'Davom etish',
    paused: 'Pauza',
    back: 'Orqaga',
    endRound: 'Raundni tugatish',
    exit: "O'yinlardan chiqish",
    sound: 'Ovoz',
    vibrate: 'Tebranish',
    joystick: 'Yurish joystigi',
    goTo: (m) => `Eng yaqin mayoq: ${m} m`,
    option: (n, w) => `${n}-so'z: ${w}`,
    wait: "So'zlar ochilmoqda…",
    right: "To'g'ri! Mayoq yondi",
    wrong: "Xato. To'g'risi:",
    offline: "Aloqa yo'q — bu javob hisoblanmadi. Mayoqqa keyinroq qayting.",
    over: 'Jonlar tugadi',
    timeUp: 'Vaqt tugadi',
    allLit: 'Butun orol yondi!',
    cleared: 'Hamma mayoqqa bordingiz',
    finished: 'Raund tugadi',
    expired: 'Sessiya muddati tugadi',
    correct: 'Yongan mayoq',
    accuracy: 'Aniqlik',
    maxCombo: 'Eng uzun kombo',
    seconds: 'Soniya',
    xp: (n) => `+${n} XP`,
    flagged: "Bu raund tekshiruv uchun belgilandi — XP berilmadi.",
    missedTitle: "Xato qilingan so'zlar",
    noMissed: "Birorta ham xato yo'q — zo'r!",
    reviewNow: 'Hozir takrorlash',
    saveCta: 'Natijangni saqlash va rejangni olish',
    saveNote: (n) => `${n} ta xato so'z hisobingizdagi takrorlashga qo'shiladi.`,
    practiceFewWords: "Lug'atingizda so'z kam — umumiy so'zlar bilan o'ynayapsiz (natija saqlanmaydi).",
    practiceLimit: "Bugungi bepul o'yinlar tugadi — mashq raundi (XP berilmaydi).",
    errorStart: "O'yinni boshlab bo'lmadi",
    claimed: (n) => `Oldingi o'yindagi ${n} ta xato so'z takrorlashga qo'shildi.`,
    lite: "Qurilma sekinlashdi — yengil (2D xarita) rejimga o'tdik.",
    liteLost: "3D grafika to'xtadi — 2D xaritada davom etamiz.",
    try3d: '3D rejimni qayta sinash',
    notSaved: "Natija hali serverga yetib bormadi (aloqa sust). XP shu sabab ko'rinmayapti.",
    resend: 'Qayta yuborish',
    resending: 'Yuborilmoqda…',
  },
  en: {
    title: 'Word Island',
    kicker: 'IELTS vocabulary · adventure',
    tagline: 'Walk the island, find the beacons and light each one by finding its word.',
    rules: ['Every beacon asks one word: a meaning or a definition, and 3 English words.', 'The right word lights the beacon. A wrong one breaks it and costs one of your 3 hearts.', 'Light them all and the lighthouse comes on. 180-second round.'],
    controls: 'Walk: the stick, WASD or the arrow keys, or tap the ground. Answer: tap a word or press 1 / 2 / 3.',
    guestNote: 'No account needed. Your missed words are kept — sign up and they go into your reviews.',
    userNote: 'Words come from your own vocabulary. Every answer updates your review schedule.',
    start: 'Start',
    again: 'Play again',
    loading: 'Getting ready…',
    meaning: 'Meaning',
    definition: 'Definition',
    beacons: 'Beacons',
    hearts: 'Hearts',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    back: 'Back',
    endRound: 'End round',
    exit: 'Leave to games',
    sound: 'Sound',
    vibrate: 'Vibration',
    joystick: 'Walking stick',
    goTo: (m) => `Nearest beacon: ${m} m`,
    option: (n, w) => `Word ${n}: ${w}`,
    wait: 'The words are opening…',
    right: 'Correct! The beacon is lit',
    wrong: 'Wrong. Answer:',
    offline: 'No connection — this answer was not counted. Come back to the beacon later.',
    over: 'Out of hearts',
    timeUp: "Time's up",
    allLit: 'The whole island is lit!',
    cleared: 'You reached every beacon',
    finished: 'Round over',
    expired: 'The session expired',
    correct: 'Beacons lit',
    accuracy: 'Accuracy',
    maxCombo: 'Best combo',
    seconds: 'Seconds',
    xp: (n) => `+${n} XP`,
    flagged: 'This round was marked for review — no XP was given.',
    missedTitle: 'Words you missed',
    noMissed: 'No mistakes at all — great!',
    reviewNow: 'Review now',
    saveCta: 'Save your result and get your plan',
    saveNote: (n) => `${n} missed words will go into your reviews once you have an account.`,
    practiceFewWords: 'You have few words yet — playing with common words (not saved).',
    practiceLimit: "Today's free games are used up — this is a practice round (no XP).",
    errorStart: 'Could not start the game',
    claimed: (n) => `${n} missed words from an earlier game were added to your reviews.`,
    lite: 'Your device slowed down — switched to light (2D map) mode.',
    liteLost: '3D graphics stopped — continuing on the 2D map.',
    try3d: 'Try 3D mode again',
    notSaved: 'The result has not reached the server yet (slow connection), so no XP is shown.',
    resend: 'Send again',
    resending: 'Sending…',
  },
  ru: {
    title: 'Word Island',
    kicker: 'IELTS vocabulary · приключение',
    tagline: 'Гуляйте по острову, находите маяки и зажигайте их, выбирая нужное слово.',
    rules: ['Каждый маяк спрашивает одно слово: значение или определение и 3 английских слова.', 'Верное слово зажигает маяк. Неверное ломает его и отнимает одну из 3 жизней.', 'Зажгите все — и загорится главный маяк. Раунд — 180 секунд.'],
    controls: 'Ходьба: джойстик, WASD или стрелки, либо нажатие на землю. Ответ: нажмите слово или 1 / 2 / 3.',
    guestNote: 'Аккаунт не нужен. Слова с ошибками сохранятся — зарегистрируйтесь, и они попадут в повторения.',
    userNote: 'Слова берутся из вашего словаря. Каждый ответ обновляет график повторений.',
    start: 'Начать',
    again: 'Ещё раз',
    loading: 'Готовим…',
    meaning: 'Значение',
    definition: 'Определение',
    beacons: 'Маяки',
    hearts: 'Жизни',
    score: 'Очки',
    combo: 'Комбо',
    time: 'Время',
    pause: 'Пауза',
    resume: 'Продолжить',
    paused: 'Пауза',
    back: 'Назад',
    endRound: 'Завершить раунд',
    exit: 'Выйти к играм',
    sound: 'Звук',
    vibrate: 'Вибрация',
    joystick: 'Джойстик для ходьбы',
    goTo: (m) => `Ближайший маяк: ${m} м`,
    option: (n, w) => `Слово ${n}: ${w}`,
    wait: 'Слова открываются…',
    right: 'Верно! Маяк зажжён',
    wrong: 'Неверно. Ответ:',
    offline: 'Нет связи — этот ответ не засчитан. Вернитесь к маяку позже.',
    over: 'Жизни закончились',
    timeUp: 'Время вышло',
    allLit: 'Весь остров зажжён!',
    cleared: 'Вы дошли до каждого маяка',
    finished: 'Раунд окончен',
    expired: 'Сессия истекла',
    correct: 'Зажжено маяков',
    accuracy: 'Точность',
    maxCombo: 'Лучшее комбо',
    seconds: 'Секунды',
    xp: (n) => `+${n} XP`,
    flagged: 'Этот раунд отмечен для проверки — XP не начислен.',
    missedTitle: 'Слова с ошибками',
    noMissed: 'Ни одной ошибки — отлично!',
    reviewNow: 'Повторить сейчас',
    saveCta: 'Сохраните результат и получите план',
    saveNote: (n) => `Слова с ошибками (${n}) попадут в повторения, как только у вас появится аккаунт.`,
    practiceFewWords: 'У вас пока мало слов — играем с частыми словами (без сохранения).',
    practiceLimit: 'Бесплатные игры на сегодня закончились — это тренировочный раунд (без XP).',
    errorStart: 'Не удалось запустить игру',
    claimed: (n) => `Слова с ошибками из прошлой игры (${n}) добавлены в повторения.`,
    lite: 'Устройство тормозит — включён облегчённый режим (2D-карта).',
    liteLost: '3D-графика остановилась — продолжаем на 2D-карте.',
    try3d: 'Снова попробовать 3D',
    notSaved: 'Результат ещё не дошёл до сервера (медленная связь), поэтому XP не показан.',
    resend: 'Отправить снова',
    resending: 'Отправляем…',
  },
};

const MAP_HALF = ISLAND.walkRadius + 4.5; // world units from the centre to the edge of the 2D map
const mapPct = (v) => `${50 + (v / MAP_HALF) * 50}%`;
const BEACON_2D = { idle: 'bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,.9)]', lit: 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,1)] scale-125', broken: 'bg-slate-500 opacity-60' };

/** The island without WebGL (render tier 'none', see gpu.js): a top-down map; tap it to walk. */
function Island2D({ sceneRef, beacons, open, running }) {
  const hero = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    let id;
    const loop = () => {
      const h = sceneRef.current.hero;
      if (hero.current && h) {
        hero.current.style.left = mapPct(h.x);
        hero.current.style.top = mapPct(h.z);
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, sceneRef]);
  const onTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * MAP_HALF;
    const z = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * MAP_HALF;
    sceneRef.current.onTap?.(x, z);
  };
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#141a4a_0%,#3a3f8f_30%,#1f6f93_62%,#123b5c_100%)]" aria-hidden="true">
      <div className="relative w-[min(92vw,62vh,30rem)] aspect-square touch-none" onPointerDown={onTap}>
        <div className="absolute rounded-full bg-[#f0d6a0]" style={{ inset: `${50 - ((ISLAND.walkRadius + 3) / MAP_HALF) * 50}%` }} />
        <div className="absolute rounded-full bg-[radial-gradient(circle_at_40%_35%,#86d07a,#3f9b5b)]" style={{ inset: `${50 - ((ISLAND.walkRadius + 1) / MAP_HALF) * 50}%` }} />
        <span className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-rose-400 bg-white" style={{ left: '50%', top: '50%' }} />
        {beacons.map((b, i) => (
          <span
            key={i}
            className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] transition-transform ${BEACON_2D[b] || BEACON_2D.idle} ${open === i ? 'ring-4 ring-amber-200' : ''}`}
            style={{ left: mapPct(BEACONS[i].x), top: mapPct(BEACONS[i].z) }}
          />
        ))}
        <span ref={hero} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#e0566a] shadow-lg" style={{ left: mapPct(ISLAND.spawn.x), top: mapPct(ISLAND.spawn.z) }} />
      </div>
    </div>
  );
}

export default function WordIsland() {
  const c = useCopy(COPY);
  const tLang = translationLangFor(useT().locale);
  const router = useRouter();
  const exitHref = usePathname()?.startsWith('/app') ? '/app/games' : '/';
  const [notice, setNotice] = useState('');
  const { audience, fx, fxRef, toggleFx, tier, setTier } = useFlagshipAudience('word_island', (added) => setNotice(c.claimed(added)));
  const [phase, setPhase] = useState('intro'); // intro | loading | playing | finishing | result
  const [paused, setPaused] = useState(false);
  const [pref2d, setPref2d] = useState(false);
  const [lite, setLite] = useState('');
  const [everStarted, setEverStarted] = useState(false);
  const [practice, setPractice] = useState(null);
  const [hud, setHud] = useState({ hearts: ISLAND.hearts, score: 0, combo: 0, timeLeft: ISLAND.roundMs / 1000, beacons: [], lit: 0, q: null, picked: null, unlocked: false, feedback: null, dist: null });
  const [result, setResult] = useState(null);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [announce, setAnnounce] = useState('');

  const sceneRef = useRef({ hero: { ...ISLAND.spawn, angle: 0, moving: false }, beacons: [], near: -1, open: -1, feedback: null, dest: null, allLit: null, onTap: null, contextLost: false });
  const g = useRef({ active: false });
  const joy = useRef({ x: 0, y: 0 });
  const keys = useRef(new Set());
  const arrow = useRef(null);
  const tierRef = useRef(tier);
  const disposedRef = useRef(false);
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read a stored preference once
    setPref2d(readRenderPref() === '2d');
  }, []);

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
  const prefetchScene = () => {
    if (tierRef.current !== 'none') loadScene().catch(() => {});
  };

  // ---------- round ----------
  const applyDone = useCallback((s, done) => {
    if (g.current !== s || disposedRef.current) return;
    setResult((r) => (r ? { ...r, xp: done.xp, flagged: done.flagged, retry: done.retry, missed: done.missed } : r));
  }, []);

  const finish = useCallback(
    async (why) => {
      const s = g.current;
      if (!s.active) return;
      s.active = false;
      cancelAnimationFrame(s.raf);
      const now = performance.now();
      const pausedNow = s.pausedAt ? now - s.pausedAt : 0;
      const playMs = Math.max(0, now - s.roundStart - s.pausedTotal - pausedNow);
      setPaused(false);
      // Left before a single answer: no result screen, and no empty session left open.
      if ((why === 'stopped' || why === 'expired') && !s.state.results.length && !s.picked) {
        if (s.round.session && why === 'stopped') abandonGame(s.round.session.sessionId).catch(() => {});
        if (disposedRef.current) return;
        if (why === 'expired') setError(c.expired);
        setPhase('intro');
        return;
      }
      setPhase('finishing');
      if (s.pending) await Promise.race([s.pending, new Promise((r) => setTimeout(r, GRADE_TIMEOUT_MS + 300))]);
      if (g.current !== s) return;
      s.closed = true;
      const sum = summary(s.state, playMs);
      const reason = why === 'expired' ? c.expired : why === 'over' ? c.over : why === 'time' ? c.timeUp : sum.allLit ? c.allLit : why === 'cleared' ? c.cleared : c.finished;
      const local = sum.missed.map((m) => ({ word: m.word, prompt: m.prompt, note: s.round.session ? m.prompt : bankMeaning(m.word, tLang) || m.prompt }));
      s.local = local;
      if (disposedRef.current) {
        completeRound(s.round, local);
        return;
      }
      beep('end', fxRef.current);
      const done = await completeRound(s.round, local, { deadlineMs: finishDeadline(performance.now() - now) });
      if (g.current !== s || disposedRef.current) return;
      setResult({ ...sum, reason, why, xp: done.xp, flagged: done.flagged, retry: done.retry, guest: s.round.saveGuest, practice: s.round.practice ? s.round.reason || 'few_words' : null, missed: done.missed });
      setPhase('result');
      done.later?.then((late) => applyDone(s, late));
    },
    [applyDone, c, fxRef, tLang]
  );

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

  /** Grades one pick → { ok, word, correct (option index), fatal }. ok === null: no verdict arrived. */
  const grade = useCallback((s, q, optionId, responseMs) => {
    if (!s.round.session) {
      return Promise.resolve({ ok: optionId === q.answer, word: q.word, correct: q.options.findIndex((o) => o.id === q.answer), fatal: false });
    }
    const verdict = gradeViaQueue(s.round.queue, { qid: q.qid, answer: optionId, responseMs, attempt: 1 }).then(({ r, fatal }) =>
      r ? { ok: !!r.isCorrect, word: r.correctDisplay || '', correct: q.options.findIndex((o) => o.text === r.correctDisplay), fatal: false } : { ok: null, word: '', correct: -1, fatal: !!fatal }
    );
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ ok: null, word: '', correct: -1, fatal: false }), GRADE_TIMEOUT_MS);
    });
    return Promise.race([verdict, timeout]).finally(() => clearTimeout(timer));
  }, []);

  const openBeacon = useCallback(
    (s, index, now) => {
      const q = s.qs[index];
      s.open = index;
      s.openAt = now;
      s.unlockAt = now + unlockMsFor(q.prompt);
      s.unlocked = false;
      s.picked = false;
      s.gap = false;
      s.dest = null;
      s.hero = { ...s.hero, moving: false };
      Object.assign(sceneRef.current, { open: index, near: index, feedback: null, dest: null, hero: s.hero });
      setHud((h) => ({ ...h, q: { index, prompt: q.prompt, kind: q.promptKind, options: q.options }, picked: null, unlocked: false, feedback: null }));
      setAnnounce(`${q.promptKind === 'definition' ? c.definition : c.meaning}: ${q.prompt}`);
    },
    [c]
  );

  const pick = useCallback(
    (k) => {
      const s = g.current;
      if (!s.active || s.pausedAt || s.open < 0 || s.picked || s.gap) return;
      const now = performance.now();
      if (now < s.unlockAt) return;
      const index = s.open;
      const q = s.qs[index];
      if (!q.options[k]) return;
      s.picked = true;
      const responseMs = Math.round(now - s.openAt);
      const timeLeft = 1 - Math.min(1, (now - s.roundStart - s.pausedTotal) / ISLAND.roundMs);
      setHud((h) => ({ ...h, picked: k }));
      s.pending = grade(s, q, q.options[k].id, responseMs).then((res) => {
        s.pending = null;
        if (g.current !== s || s.closed) return;
        s.state = resolveBeacon(s.state, { index, ok: res.ok, qid: q.qid, word: res.word || q.word || '', prompt: q.prompt, responseMs, timeLeft });
        const at = performance.now();
        const feedback = { index, ok: res.ok, chosen: k, correct: res.correct, word: res.word, at };
        Object.assign(sceneRef.current, { beacons: s.state.beacons, feedback });
        if (res.ok === null) s.cooldown[index] = at + 4000; // walk away and come back; do not reopen at once
        else beep(res.ok ? 'ok' : 'wrong', fxRef.current);
        if (res.ok && s.state.lit === s.state.beacons.length) sceneRef.current.allLit = { at };
        setHud((h) => ({ ...h, hearts: s.state.hearts, score: s.state.score, combo: s.state.combo, beacons: s.state.beacons, lit: s.state.lit, feedback }));
        setAnnounce(res.ok === null ? c.offline : res.ok ? c.right : `${c.wrong} ${res.word}`);
        s.gap = true;
        s.gapUntil = at + ISLAND.gapMs + (res.ok === false ? 500 : 0); // a little longer to read the right word
        if (res.fatal) s.fatal = true;
      });
    },
    [c, fxRef, grade]
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
      const dt = Math.min(0.05, Math.max(0, (now - s.lastT) / 1000));
      const elapsed = now - s.roundStart - s.pausedTotal;
      if (s.open < 0) {
        let dx = joy.current.x || 0;
        let dz = joy.current.y || 0;
        for (const code of keys.current) {
          dx += KEY_DIR[code][0];
          dz += KEY_DIR[code][1];
        }
        const next = stepHero(s.hero, { dir: { x: dx, z: dz }, dest: s.dest, dt });
        s.hero = { x: next.x, z: next.z, angle: next.angle, moving: next.moving };
        s.dest = next.dest;
        const scene = sceneRef.current;
        scene.hero = s.hero;
        scene.dest = s.dest;
        const reach = beaconInReach(s.hero.x, s.hero.z, s.state.beacons);
        const guide = nextBeacon(s.hero.x, s.hero.z, s.state.beacons);
        scene.near = guide && guide.distance < ISLAND.reach * 2 ? guide.index : -1;
        if (arrow.current && guide) arrow.current.style.transform = `rotate(${guide.bearing}rad)`;
        s.guide = guide;
        if (reach >= 0 && !(s.cooldown[reach] > now)) openBeacon(s, reach, now);
        else if (elapsed >= ISLAND.roundMs) {
          finish('time');
          return;
        }
      } else {
        if (!s.unlocked && now >= s.unlockAt) {
          s.unlocked = true;
          setHud((h) => ({ ...h, unlocked: true }));
        }
        if (s.gap && now >= s.gapUntil) {
          s.open = -1;
          s.gap = false;
          Object.assign(sceneRef.current, { open: -1 });
          setHud((h) => ({ ...h, q: null, picked: null, feedback: null }));
          if (s.fatal) {
            finish('expired');
            return;
          }
          if (s.state.over || allResolved(s.state)) {
            finish(s.state.over ? 'over' : 'cleared');
            return;
          }
        } else if (!s.picked && elapsed >= ISLAND.roundMs) {
          finish('time');
          return;
        }
      }
      if (now - s.lastHud > 250) {
        s.lastHud = now;
        const left = Math.max(0, Math.ceil((ISLAND.roundMs - elapsed) / 1000));
        const dist = s.guide ? Math.max(1, Math.round(s.guide.distance)) : null;
        setHud((h) => (h.timeLeft === left && h.dist === dist ? h : { ...h, timeLeft: left, dist }));
      }
      if (tierRef.current !== 'none' && document.visibilityState === 'visible') s.watchdog.sample(now);
    }
    s.lastT = now;
    s.raf = requestAnimationFrame(() => tickRef.current());
  }, [finish, onContextLost, openBeacon]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // Taps on the ground (3D) or the map (2D) arrive through sceneRef, never through React.
  useEffect(() => {
    sceneRef.current.onTap = (x, z) => {
      const s = g.current;
      if (!s.active || s.pausedAt || s.open >= 0) return;
      s.dest = { x, z };
    };
  }, []);

  const start = async () => {
    setError('');
    setNotice('');
    setResult(null);
    setLite('');
    prefetchScene();
    setPhase('loading');
    let round;
    try {
      round = await startRound({
        gameKey: 'word_island',
        audience,
        toQuestion: (q) => ({ qid: q.qid, prompt: q.prompt, promptKind: q.kind === 'definition' ? 'definition' : 'meaning', options: q.options || [] }),
        guestQuestions: () => guestQuestions(RUN_BANK, Math.random, BEACONS.length, tLang),
      });
    } catch (e) {
      setError(e?.message || c.errorStart);
      setPhase('intro');
      return;
    }
    if (disposedRef.current) return;
    const qs = round.qs.filter((q) => q.options.length >= 2).slice(0, BEACONS.length);
    if (!qs.length) {
      setError(c.errorStart);
      setPhase('intro');
      return;
    }
    const now = performance.now();
    const state = initialIsland(qs.length);
    g.current = {
      active: true,
      qs,
      state,
      round,
      hero: { ...ISLAND.spawn, angle: 0, moving: false },
      dest: null,
      open: -1,
      cooldown: {},
      guide: null,
      roundStart: now,
      pausedTotal: 0,
      pausedAt: 0,
      lastHud: 0,
      lastT: now,
      pending: null,
      watchdog: createFpsWatchdog({ onLow: onLowFps }),
    };
    keys.current.clear();
    joy.current = { x: 0, y: 0 };
    Object.assign(sceneRef.current, { hero: g.current.hero, beacons: state.beacons, near: -1, open: -1, feedback: null, dest: null, allLit: null });
    if (sceneRef.current.contextLost) {
      sceneRef.current.contextLost = false;
      if (tierRef.current !== 'none') onContextLost();
    }
    setPractice(round.practice ? round.reason || 'few_words' : null);
    setHud({ hearts: ISLAND.hearts, score: 0, combo: 0, timeLeft: ISLAND.roundMs / 1000, beacons: state.beacons, lit: 0, q: null, picked: null, unlocked: false, feedback: null, dist: null });
    setPaused(false);
    setEverStarted(true);
    setPhase('playing');
    g.current.raf = requestAnimationFrame(() => tickRef.current());
  };

  const pause = useCallback(() => {
    const s = g.current;
    if (!s.active || s.pausedAt) return;
    s.pausedAt = performance.now();
    keys.current.clear();
    setPaused(true);
  }, []);
  const resume = useCallback(() => {
    const s = g.current;
    if (!s.active || !s.pausedAt) return;
    const now = performance.now();
    const d = now - s.pausedAt;
    s.pausedAt = 0;
    s.pausedTotal += d;
    // The lock and the gap wait out the pause; the answer clock (openAt) does not — see the header.
    if (s.open >= 0) s.unlockAt += d;
    if (s.gapUntil) s.gapUntil += d;
    s.lastT = now;
    s.watchdog.reset(now);
    setPaused(false);
  }, []);
  const leave = useCallback(() => {
    const s = g.current;
    if (s.active) {
      s.active = false;
      cancelAnimationFrame(s.raf);
      if (s.round?.session && !s.state.results.length) abandonGame(s.round.session.sessionId).catch(() => {});
      else if (s.round) completeRound(s.round, summary(s.state, 0).missed);
    }
    router.push(exitHref);
  }, [router, exitHref]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const held = keys.current;
    const onDown = (e) => {
      if (e.target?.closest?.('input,textarea,select')) return;
      const s = g.current;
      if (e.key === 'Escape') (s.pausedAt ? resume : pause)();
      else if (s.pausedAt) return;
      else if (s.open >= 0 && ['1', '2', '3'].includes(e.key)) pick(Number(e.key) - 1);
      else if (Object.hasOwn(KEY_DIR, e.code)) {
        if (s.open < 0) held.add(e.code);
      } else return;
      e.preventDefault();
    };
    const onUp = (e) => held.delete(e.code);
    const reset = () => held.clear(); // a lost keyup (window blur) must not leave the hero walking
    const onVis = () => document.visibilityState === 'hidden' && pause();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onVis);
      held.clear();
    };
  }, [phase, pick, pause, resume]);

  useEffect(() => {
    disposedRef.current = false;
    return () => {
      disposedRef.current = true;
      const s = g.current;
      if (s.active) {
        s.active = false;
        cancelAnimationFrame(s.raf);
        if (s.round?.session && s.state.results.length) completeRound(s.round, summary(s.state, 0).missed);
      }
    };
  }, []);

  const playing = phase === 'playing';
  const showStage = playing || phase === 'finishing';
  const use3d = tier !== 'none';
  const fb = hud.feedback;
  const q = hud.q;

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="sr-only" aria-live="polite">{announce}</p>

      {phase === 'intro' || phase === 'loading' ? (
        <section aria-labelledby="island-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <TreePalm size={13} aria-hidden="true" /> {c.kicker}
          </p>
          <h1 id="island-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
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
            onPointerEnter={prefetchScene}
            onFocus={prefetchScene}
            onTouchStart={prefetchScene}
            disabled={!audience || phase === 'loading'}
            className="mt-6 w-full min-h-14 rounded-2xl bg-accent text-on-accent text-lg font-bold hover:bg-accent-hover disabled:opacity-50 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {phase === 'loading' || !audience ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
            {phase === 'loading' ? c.loading : c.start}
          </button>
        </section>
      ) : null}

      {/* The stage stays mounted (hidden) between rounds once a round started, so the 3D Canvas is
          created once and only paused (frameloop "never"), never unmounted from a frame. */}
      {everStarted && (
        <section aria-label={c.title} className={showStage ? 'fixed inset-0 z-[60] h-dvh flex flex-col bg-[#0b1020] text-white select-none overscroll-contain' : 'hidden'}>
          <div className="absolute inset-0">
            {use3d ? (
              <SceneBoundary onError={to2d}>
                <IslandScene3D sceneRef={sceneRef} running={playing && !paused} visible={showStage} tier={tier} />
              </SceneBoundary>
            ) : (
              <Island2D sceneRef={sceneRef} beacons={hud.beacons} open={q ? q.index : -1} running={playing && !paused} />
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0b1020]/80 to-transparent" aria-hidden="true" />

          {/* HUD */}
          <div className="pointer-events-none relative z-10 w-full max-w-xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2">
              <button type="button" onClick={pause} disabled={!playing} className="pointer-events-auto min-h-11 min-w-11 grid place-items-center rounded-xl bg-[#0b1020]/55 backdrop-blur-sm hover:bg-[#0b1020]/75 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={c.back}>
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <div className="flex items-center gap-0.5" aria-label={`${c.hearts}: ${hud.hearts}`} role="img">
                {Array.from({ length: ISLAND.hearts }, (_, i) => (
                  <Heart key={i} size={18} className={i < hud.hearts ? 'fill-rose-500 text-rose-500 drop-shadow' : 'text-white/40'} aria-hidden="true" />
                ))}
              </div>
            </div>
            <div className="text-center drop-shadow-[0_1px_6px_rgba(11,16,32,.8)]">
              <p className="text-2xl font-black tabular-nums leading-none"><span className="sr-only">{c.score}: </span>{hud.score}</p>
              <p className="h-4 text-[11px] font-bold text-amber-300 tabular-nums">{hud.combo >= 2 ? `${c.combo} ×${hud.combo}` : ''}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className={`text-sm font-bold tabular-nums drop-shadow-[0_1px_6px_rgba(11,16,32,.8)] ${hud.timeLeft <= 20 ? 'text-rose-300' : ''}`} aria-label={`${c.time}: ${hud.timeLeft}`}>{hud.timeLeft}s</span>
              <button type="button" onClick={pause} disabled={!playing} className="pointer-events-auto min-h-11 min-w-11 grid place-items-center rounded-xl bg-[#0b1020]/55 backdrop-blur-sm hover:bg-[#0b1020]/75 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={c.pause}>
                <Pause size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* progress: one diamond per beacon, and where the nearest unlit one is */}
          <div className="pointer-events-none relative z-10 w-full max-w-xl mx-auto px-3 mt-2 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[#0b1020]/60 px-3 py-1.5 backdrop-blur-sm" role="img" aria-label={`${c.beacons}: ${hud.lit} / ${hud.beacons.length}`}>
              {hud.beacons.map((b, i) => (
                <span key={i} className={`h-2.5 w-2.5 rotate-45 rounded-[2px] ${b === 'lit' ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.9)]' : b === 'broken' ? 'bg-slate-500' : 'bg-white/30'}`} aria-hidden="true" />
              ))}
            </div>
            {!q && hud.dist !== null && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1020]/60 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
                <span ref={arrow} className="inline-block text-sky-300" aria-hidden="true">
                  <Navigation2 size={13} className="fill-current" />
                </span>
                {c.goTo(hud.dist)}
              </p>
            )}
          </div>
          {(practice || lite) && !q && (
            <p className="pointer-events-none relative z-10 mx-auto mt-1.5 max-w-xl rounded-xl bg-[#0b1020]/60 px-3 py-1.5 text-center text-[11px] text-white/85 backdrop-blur-sm">
              {lite ? (lite === 'lost' ? c.liteLost : c.lite) : practice === 'limit' ? c.practiceLimit : c.practiceFewWords}
            </p>
          )}

          <div className="flex-1" />

          {/* the walking stick (touch); keys and taps on the ground work everywhere */}
          {playing && !q && !paused && (
            <div className="relative z-10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] [@media(hover:hover)_and_(pointer:fine)]:hidden">
              <TouchJoystick valueRef={joy} label={c.joystick} size={124} />
            </div>
          )}

          {/* the beacon's question: a sheet over the lower part of the scene */}
          {q && !paused && (
            <div className="relative z-10 w-full max-w-xl mx-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="rounded-3xl border border-white/15 bg-[#0b1020]/90 p-3 shadow-2xl backdrop-blur-md">
                <div className="rounded-2xl bg-white/95 px-4 py-3 text-center text-[#0b1020]">
                  <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#B8394A]">
                    <Sparkles size={11} aria-hidden="true" /> {q.kind === 'definition' ? c.definition : c.meaning}
                  </p>
                  <p className="mt-0.5 text-lg sm:text-xl font-bold leading-snug break-words">{q.prompt}</p>
                </div>
                <div className="mt-2 h-8 grid place-items-center">
                  {fb ? (
                    <p className={`max-w-full truncate rounded-full px-4 py-1 text-sm font-bold ${fb.ok ? 'bg-emerald-500 text-white' : fb.ok === false ? 'bg-rose-500 text-white' : 'bg-white/90 text-[#0b1020]'}`}>
                      {fb.ok ? c.right : fb.ok === false ? `${c.wrong} ${fb.word}` : c.offline}
                    </p>
                  ) : (
                    !hud.unlocked && (
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/65">
                        <Lock size={11} aria-hidden="true" /> {c.wait}
                      </p>
                    )
                  )}
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {q.options.map((o, i) => {
                    const tone = fb
                      ? i === fb.correct ? 'bg-emerald-500 text-white border-emerald-300' : i === fb.chosen && fb.ok === false ? 'bg-rose-500 text-white border-rose-300' : 'bg-white/5 text-white/45 border-white/10'
                      : hud.picked === i ? 'bg-amber-400 text-[#0b1020] border-amber-200' : hud.picked !== null ? 'bg-white/5 text-white/45 border-white/10' : 'bg-white/10 text-white border-white/25 hover:border-sky-300 hover:bg-sky-500/20';
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => pick(i)}
                        disabled={!hud.unlocked || hud.picked !== null || !!fb}
                        aria-label={c.option(i + 1, o.text)}
                        className={`min-h-14 rounded-xl border-2 px-1.5 text-sm sm:text-base font-bold font-word break-words leading-tight transition-colors disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${tone} ${!hud.unlocked && !fb ? 'opacity-60' : ''}`}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(paused || phase === 'finishing') && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#0b1020]/95 backdrop-blur-sm px-6">
              {phase === 'finishing' ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" aria-label={c.loading} />
              ) : (
                <div className="w-full max-w-xs text-center" role="dialog" aria-modal="true" aria-labelledby="island-pause-h" onKeyDown={trapTab}>
                  <p id="island-pause-h" className="text-xl font-bold">{c.paused}</p>
                  <div className="mt-5 grid gap-2">
                    <button type="button" onClick={resume} autoFocus className={`${PAUSE_BTN} font-bold bg-accent text-on-accent`}>
                      <Play size={18} aria-hidden="true" /> {c.resume}
                    </button>
                    <button type="button" onClick={() => finish('stopped')} className={`${PAUSE_BTN} font-semibold border border-white/25 hover:border-white/50`}>
                      <Square size={15} aria-hidden="true" /> {c.endRound}
                    </button>
                    <button type="button" onClick={leave} className={`${PAUSE_BTN} font-semibold text-white/75 hover:text-white`}>
                      <LogOut size={16} aria-hidden="true" /> {c.exit}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {phase === 'result' && result && <IslandResult c={c} result={result} onAgain={start} canTry3d={pref2d && tier === 'none'} onTry3d={try3d} onResend={resend} resending={resending} />}
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

function IslandResult({ c, result, onAgain, canTry3d, onTry3d, onResend, resending }) {
  const stats = [
    [c.correct, `${result.correct}/${result.total}`],
    [c.accuracy, `${result.accuracy}%`],
    [c.maxCombo, result.maxCombo],
    [c.seconds, result.seconds],
  ];
  const headRef = useRef(null);
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <section aria-labelledby="island-res-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{result.reason}</p>
      <h2 id="island-res-h" ref={headRef} tabIndex={-1} className="mt-1 text-5xl font-black text-ink tabular-nums outline-none">
        {result.score}
      </h2>
      <p className="text-sm text-muted">{c.score}{result.xp ? ` · ${c.xp(result.xp)}` : ''}</p>
      {result.flagged && <p role="status" className="mt-3 rounded-xl bg-warning-soft px-3.5 py-2.5 text-xs text-ink">{c.flagged}</p>}
      {result.retry && (
        <div className="mt-3 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">
          <p role="status">{c.notSaved}</p>
          <button type="button" onClick={onResend} disabled={resending} aria-busy={resending} className="mt-2 inline-flex items-center gap-1.5 min-h-10 px-3 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:border-accent/40 disabled:opacity-60">
            {resending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
            {resending ? c.resending : c.resend}
          </button>
        </div>
      )}
      {result.practice && <p className="mt-3 rounded-xl bg-bg border border-border px-3.5 py-2.5 text-xs text-muted">{result.practice === 'limit' ? c.practiceLimit : c.practiceFewWords}</p>}
      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-bg border border-border px-1 py-2.5">
            <dd className="text-lg font-bold text-ink tabular-nums">{v}</dd>
            <dt className="text-[10px] text-muted leading-tight">{k}</dt>
          </div>
        ))}
      </dl>
      <ShareCard game="island" result={result} />

      <h3 className="mt-6 text-sm font-semibold text-ink">{c.missedTitle}</h3>
      {result.missed.length ? (
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-bg">
          {result.missed.slice(0, 12).map((m) => (
            <li key={m.word} className="px-3.5 py-2.5">
              <span className="font-word font-semibold text-ink">{m.word}</span>
              {m.note && <span className="block text-xs text-muted break-words">{m.note}</span>}
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
          !result.practice && result.missed.length > 0 && (
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

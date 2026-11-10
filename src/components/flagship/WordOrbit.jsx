'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Pause, Play, RotateCcw, Volume2, VolumeX, Smartphone, ArrowRight, Loader2, Orbit, Box, ArrowLeft, Square, LogOut, Languages, RefreshCw, Lock } from 'lucide-react';
import useCopy from '@/components/landing/useCopy';
import { useT } from '@/context/LocaleContext';
import { ORBIT, initialOrbit, resolveAnswer, summary, guestQuestions, questionMsFor, unlockMsFor, splitAtBlank } from '@/lib/flagship/orbit';
import { ORBIT_SENTENCES } from '@/lib/flagship/orbitBank';
import { RUN_BANK, bankMeaning } from '@/lib/flagship/runBank';
import { beep } from '@/lib/flagship/client';
import { createFpsWatchdog, stepDown, writeRenderPref, readRenderPref, detectRenderTier } from '@/lib/flagship/gpu';
import { translationLangFor } from '@/lib/i18n';
import { abandonGame } from '@/components/games/api';
import { useFlagshipAudience, startRound, completeRound, gradeViaQueue, finishDeadline, FINISH_BUDGET_MS } from './useFlagshipRound';
import SceneBoundary from './SceneBoundary';
import { trapTab } from './PauseOverlay';
import ShareCard from './ShareCard';

const loadScene = () => import('./OrbitScene3D');
const OrbitScene3D = dynamic(loadScene, { ssr: false, loading: () => null });

// So'z orbitasi: the context game. An English sentence with one word missing is shown; three planets
// each carry a word; the player sends the ship to the planet whose word completes the sentence.
// One controller for both audiences, like the other flagship games:
//  - signed in: a regular game session (POST /api/games/word_orbit/start, kind `fill_choice`). The
//    questions arrive without answers, every pick is graded on the server and feeds SRS, and the
//    round completes like any game (XP once, the plan's "game" task).
//  - guest (or a signed-in player with too few example sentences → practice): sentences from the
//    public bank, graded on the device; missed words are kept and saved after sign-up.
// The game loop lives in refs; React state only carries the HUD. The 3D scene (OrbitScene3D) is
// picked by render tier (gpu.js); the controller's own rAF loop runs the FPS watchdog (3D → lighter
// 3D → 2D) and handles a lost WebGL context. The stage, and its Canvas, stay mounted once a round
// started. Timing rule: `responseMs` is wall-clock time from the moment a sentence appeared, pauses
// included (a pause must never make a looked-up answer look fast), and the planets stay locked past
// the server's plausibility floor (orbit.js unlockMsFor), so an honest quick pick is never flagged.

const PAUSE_BTN = 'min-h-12 px-6 rounded-2xl inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050716]';
const GRADE_TIMEOUT_MS = 3000;

const COPY = {
  uz: {
    title: "So'z orbitasi",
    kicker: 'IELTS vocabulary · kontekst',
    tagline: "Gapda bitta so'z yetishmaydi. Mos so'z turgan sayyoraga uching.",
    rules: ["3 ta qalqon. Xato sayyora yoki yoqilg'i tugashi — bitta qalqon ketadi.", "Har 4 to'g'ri javobda yoqilg'i (vaqt) biroz kamayadi.", "Ball = to'g'ri javob × kombo × qolgan yoqilg'i. Raund 120 soniya."],
    controls: 'Boshqaruv: sayyorani yoki pastdagi so‘zni bosing; klaviaturada 1 / 2 / 3 yoki ← → va Enter.',
    guestNote: "Ro'yxatdan o'tmasdan o'ynaysiz. Xato so'zlaringiz saqlanadi — hisob ochsangiz, takrorlashga qo'shiladi.",
    userNote: "Gaplar o'z lug'atingizdagi so'zlarning misollaridan olinadi. Har javob takrorlash jadvaliga yoziladi.",
    start: 'Boshlash',
    again: "Yana o'ynash",
    loading: 'Tayyorlanmoqda…',
    task: "Gapni to'ldiring",
    hintShow: 'Tarjima',
    hintLabel: 'Tarjimasi',
    shields: 'Qalqon',
    score: 'Ball',
    combo: 'Kombo',
    time: 'Vaqt',
    fuel: "Yoqilg'i",
    pause: 'Pauza',
    resume: 'Davom etish',
    paused: 'Pauza',
    back: 'Orqaga',
    endRound: 'Raundni tugatish',
    exit: "O'yinlardan chiqish",
    sound: 'Ovoz',
    vibrate: 'Tebranish',
    planet: (n, w) => `${n}-sayyora: ${w}`,
    wait: 'Sayyoralar yaqinlashmoqda…',
    right: "To'g'ri!",
    wrong: "Xato. To'g'risi:",
    outOfFuel: "Yoqilg'i tugadi. To'g'risi:",
    offline: "Aloqa yo'q — bu javob hisoblanmadi",
    over: 'Qalqonlar tugadi',
    timeUp: 'Vaqt tugadi',
    cleared: "Barcha gaplar to'ldirildi",
    finished: 'Raund tugadi',
    expired: 'Sessiya muddati tugadi',
    correct: "To'g'ri",
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
    practiceFewWords: "Lug'atingizda misol gapli so'z kam — umumiy so'zlar bilan o'ynayapsiz (natija saqlanmaydi).",
    practiceLimit: "Bugungi bepul o'yinlar tugadi — mashq raundi (XP berilmaydi).",
    errorStart: "O'yinni boshlab bo'lmadi",
    claimed: (n) => `Oldingi o'yindagi ${n} ta xato so'z takrorlashga qo'shildi.`,
    lite: "Qurilma sekinlashdi — yengil (2D) rejimga o'tdik.",
    liteLost: "3D grafika to'xtadi — 2D rejimda davom etamiz.",
    try3d: '3D rejimni qayta sinash',
    notSaved: "Natija hali serverga yetib bormadi (aloqa sust). XP shu sabab ko'rinmayapti.",
    resend: 'Qayta yuborish',
    resending: 'Yuborilmoqda…',
  },
  en: {
    title: 'Word Orbit',
    kicker: 'IELTS vocabulary · context',
    tagline: 'One word is missing from the sentence. Fly to the planet that carries it.',
    rules: ['3 shields. A wrong planet or an empty tank costs one.', 'Every 4 correct answers you get a little less fuel (time).', 'Score = correct × combo × fuel left. 120-second round.'],
    controls: 'Controls: tap a planet or a word below; on a keyboard 1 / 2 / 3, or ← → and Enter.',
    guestNote: 'No account needed. Your missed words are kept — sign up and they go into your reviews.',
    userNote: 'Sentences come from the examples of your own words. Every answer updates your review schedule.',
    start: 'Start',
    again: 'Play again',
    loading: 'Getting ready…',
    task: 'Complete the sentence',
    hintShow: 'Translation',
    hintLabel: 'Translation',
    shields: 'Shields',
    score: 'Score',
    combo: 'Combo',
    time: 'Time',
    fuel: 'Fuel',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    back: 'Back',
    endRound: 'End round',
    exit: 'Leave to games',
    sound: 'Sound',
    vibrate: 'Vibration',
    planet: (n, w) => `Planet ${n}: ${w}`,
    wait: 'The planets are approaching…',
    right: 'Correct!',
    wrong: 'Wrong. Answer:',
    outOfFuel: 'Out of fuel. Answer:',
    offline: 'No connection — this answer was not counted',
    over: 'Out of shields',
    timeUp: "Time's up",
    cleared: 'Every sentence completed',
    finished: 'Round over',
    expired: 'The session expired',
    correct: 'Correct',
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
    practiceFewWords: 'Few of your words have an example sentence yet — playing with common words (not saved).',
    practiceLimit: "Today's free games are used up — this is a practice round (no XP).",
    errorStart: 'Could not start the game',
    claimed: (n) => `${n} missed words from an earlier game were added to your reviews.`,
    lite: 'Your device slowed down — switched to light (2D) mode.',
    liteLost: '3D graphics stopped — continuing in 2D.',
    try3d: 'Try 3D mode again',
    notSaved: 'The result has not reached the server yet (slow connection), so no XP is shown.',
    resend: 'Send again',
    resending: 'Sending…',
  },
  ru: {
    title: 'Word Orbit',
    kicker: 'IELTS vocabulary · контекст',
    tagline: 'В предложении не хватает слова. Летите к планете, на которой оно написано.',
    rules: ['3 щита. Неверная планета или пустой бак отнимают один.', 'Каждые 4 верных ответа топлива (времени) становится чуть меньше.', 'Очки = верные × комбо × остаток топлива. Раунд — 120 секунд.'],
    controls: 'Управление: нажмите на планету или слово внизу; на клавиатуре 1 / 2 / 3 или ← → и Enter.',
    guestNote: 'Аккаунт не нужен. Слова с ошибками сохранятся — зарегистрируйтесь, и они попадут в повторения.',
    userNote: 'Предложения берутся из примеров к вашим словам. Каждый ответ обновляет график повторений.',
    start: 'Начать',
    again: 'Ещё раз',
    loading: 'Готовим…',
    task: 'Дополните предложение',
    hintShow: 'Перевод',
    hintLabel: 'Перевод',
    shields: 'Щиты',
    score: 'Очки',
    combo: 'Комбо',
    time: 'Время',
    fuel: 'Топливо',
    pause: 'Пауза',
    resume: 'Продолжить',
    paused: 'Пауза',
    back: 'Назад',
    endRound: 'Завершить раунд',
    exit: 'Выйти к играм',
    sound: 'Звук',
    vibrate: 'Вибрация',
    planet: (n, w) => `Планета ${n}: ${w}`,
    wait: 'Планеты приближаются…',
    right: 'Верно!',
    wrong: 'Неверно. Ответ:',
    outOfFuel: 'Топливо закончилось. Ответ:',
    offline: 'Нет связи — этот ответ не засчитан',
    over: 'Щиты закончились',
    timeUp: 'Время вышло',
    cleared: 'Все предложения дополнены',
    finished: 'Раунд окончен',
    expired: 'Сессия истекла',
    correct: 'Верно',
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
    practiceFewWords: 'У ваших слов пока мало примеров — играем с частыми словами (без сохранения).',
    practiceLimit: 'Бесплатные игры на сегодня закончились — это тренировочный раунд (без XP).',
    errorStart: 'Не удалось запустить игру',
    claimed: (n) => `Слова с ошибками из прошлой игры (${n}) добавлены в повторения.`,
    lite: 'Устройство тормозит — включён облегчённый режим (2D).',
    liteLost: '3D-графика остановилась — продолжаем в 2D.',
    try3d: 'Снова попробовать 3D',
    notSaved: 'Результат ещё не дошёл до сервера (медленная связь), поэтому XP не показан.',
    resend: 'Отправить снова',
    resending: 'Отправляем…',
  },
};

const PLANET_2D = [
  'radial-gradient(circle at 32% 30%, #ffd7a8, #e0566a 58%, #6d1f33)',
  'radial-gradient(circle at 32% 30%, #d6f6ff, #2a8fd6 58%, #142c6b)',
  'radial-gradient(circle at 32% 30%, #ede9fe, #7c4dff 58%, #2c1a6b)',
];

/** The scene without WebGL (render tier 'none', see gpu.js): the same three planets drawn with CSS. */
function Orbit2D({ options, sel, picked, feedback }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#1b2a6b_0%,#0b1030_48%,#050716_82%)]" aria-hidden="true">
      <div className="absolute inset-x-0 top-[44%] -translate-y-1/2 mx-auto w-full max-w-xl flex items-center justify-around px-4">
        {options.map((o, i) => {
          const fb = feedback;
          const state = fb ? (i === fb.correct ? 'ok' : i === fb.chosen && fb.ok === false ? 'bad' : 'dim') : picked === i ? 'locked' : picked !== null ? 'dim' : sel === i ? 'focus' : 'idle';
          const ring = state === 'ok' ? 'ring-4 ring-emerald-300' : state === 'bad' ? 'ring-4 ring-rose-400' : state === 'locked' ? 'ring-4 ring-amber-300' : state === 'focus' ? 'ring-4 ring-sky-300' : '';
          return (
            <span
              key={o.id}
              className={`block rounded-full shadow-[0_0_40px_rgba(125,211,252,.25)] transition-[transform,opacity] duration-300 ${ring} ${state === 'dim' ? 'opacity-35 scale-90' : state === 'bad' ? 'scale-75' : state === 'ok' || state === 'focus' ? 'scale-110' : ''}`}
              style={{ width: 'min(22vw, 104px)', aspectRatio: '1', background: PLANET_2D[i % 3], marginTop: i === 1 ? '-2.5rem' : 0 }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** The sentence with its gap; after the verdict the gap shows the right word. */
function Sentence({ prompt, feedback, compact }) {
  const [before, after] = splitAtBlank(prompt);
  if (after === null) return <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold leading-snug break-words`}>{before}</p>;
  // The gap always shows the right word, so it is green whether or not the player found it.
  const tone = feedback ? (feedback.word ? 'bg-emerald-100 text-emerald-800 border-emerald-500' : 'bg-slate-100 text-slate-600 border-slate-400') : 'bg-[#0b1020]/[0.06] text-transparent border-[#B8394A]';
  return (
    <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold leading-snug break-words font-word`}>
      {before}
      <span className={`inline-block min-w-[4.5rem] mx-1 px-2 rounded-lg border-b-[3px] text-center align-baseline transition-colors ${tone}`}>
        {feedback?.word || ' '}
      </span>
      {after}
    </p>
  );
}

export default function WordOrbit() {
  const c = useCopy(COPY);
  const tLang = translationLangFor(useT().locale);
  const router = useRouter();
  const exitHref = usePathname()?.startsWith('/app') ? '/app/games' : '/';
  const [notice, setNotice] = useState('');
  const { audience, fx, fxRef, toggleFx, tier, setTier } = useFlagshipAudience('word_orbit', (added) => setNotice(c.claimed(added)));
  const [phase, setPhase] = useState('intro'); // intro | loading | playing | finishing | result
  const [paused, setPaused] = useState(false);
  const [pref2d, setPref2d] = useState(false);
  const [lite, setLite] = useState(''); // '' | 'slow' | 'lost'
  const [everStarted, setEverStarted] = useState(false);
  const [practice, setPractice] = useState(null); // null | 'few_words' | 'limit'
  const [hud, setHud] = useState({ shields: ORBIT.shields, score: 0, combo: 0, timeLeft: ORBIT.roundMs / 1000, prompt: '', hint: '', options: [], sel: null, picked: null, unlocked: false, feedback: null, count: 0, total: 0, showHint: false });
  const [result, setResult] = useState(null);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [announce, setAnnounce] = useState('');

  const sceneRef = useRef({ options: [], shownAt: 0, unlockAt: 0, sel: null, pick: null, feedback: null, fuel: 1, onPick: null, contextLost: false });
  const g = useRef({ active: false });
  const fuelBar = useRef(null);
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
  const showQuestion = useCallback(
    (s, now) => {
      const q = s.qs[s.idx];
      s.gap = false;
      s.picked = false;
      s.sel = null;
      s.unlocked = false;
      s.shownAt = now;
      s.unlockAt = now + unlockMsFor(q.prompt);
      s.fuelMs = questionMsFor(s.state.correct);
      s.deadline = s.unlockAt + s.fuelMs;
      Object.assign(sceneRef.current, { options: q.options, shownAt: now, unlockAt: s.unlockAt, sel: null, pick: null, feedback: null, fuel: 1 });
      setHud((h) => ({ ...h, prompt: q.prompt, hint: q.hint || '', options: q.options, sel: null, picked: null, unlocked: false, feedback: null, count: s.idx + 1, total: s.qs.length, showHint: false }));
      setAnnounce(`${c.task}: ${q.prompt.replace(ORBIT.blank, '…')}`);
    },
    [c]
  );

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
      // Stopped before a single answer: no result screen, and no empty session left open.
      if ((why === 'stopped' || why === 'expired') && !s.state.results.length && !s.picked) {
        if (s.round.session && why === 'stopped') abandonGame(s.round.session.sessionId).catch(() => {});
        if (disposedRef.current) return;
        if (why === 'expired') setError(c.expired);
        setPhase('intro');
        return;
      }
      setPhase('finishing');
      // An answer still being graded belongs to this round: wait for its verdict (bounded).
      if (s.pending) await Promise.race([s.pending, new Promise((r) => setTimeout(r, GRADE_TIMEOUT_MS + 300))]);
      if (g.current !== s) return;
      s.closed = true;
      const sum = summary(s.state, playMs);
      const reason = why === 'expired' ? c.expired : why === 'over' ? c.over : why === 'time' ? c.timeUp : why === 'cleared' ? c.cleared : c.finished;
      const local = sum.missed.map((m) => ({ word: m.word, prompt: m.prompt, note: s.round.session ? m.prompt : bankMeaning(m.word, tLang) || m.prompt }));
      s.local = local;
      if (disposedRef.current) {
        completeRound(s.round, local); // the page was left while the round settled: save it all the same
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

  /** Grades one pick → { ok, word, correct (planet index), fatal }. ok === null: no verdict arrived. */
  const grade = useCallback((s, q, optionId, responseMs) => {
    if (!s.round.session) {
      return Promise.resolve({ ok: !!optionId && optionId === q.answer, word: q.word, correct: q.options.findIndex((o) => o.id === q.answer), fatal: false });
    }
    const verdict = gradeViaQueue(s.round.queue, { qid: q.qid, answer: optionId || '', responseMs, attempt: 1 }).then(({ r, fatal }) =>
      r ? { ok: !!r.isCorrect, word: r.correctDisplay || '', correct: q.options.findIndex((o) => o.text === r.correctDisplay), fatal: false } : { ok: null, word: '', correct: -1, fatal: !!fatal }
    );
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ ok: null, word: '', correct: -1, fatal: false }), GRADE_TIMEOUT_MS);
    });
    return Promise.race([verdict, timeout]).finally(() => clearTimeout(timer));
  }, []);

  const pick = useCallback(
    (i, { timeout = false } = {}) => {
      const s = g.current;
      if (!s.active || s.pausedAt || s.picked || s.gap) return;
      const now = performance.now();
      if (!timeout && now < s.unlockAt) return;
      const q = s.qs[s.idx];
      if (!timeout && !q.options[i]) return;
      s.picked = true;
      const chosen = timeout ? -1 : i;
      const responseMs = Math.round(now - s.shownAt);
      const fuelLeft = timeout ? 0 : Math.min(1, Math.max(0, (s.deadline - now) / s.fuelMs));
      sceneRef.current.pick = { i: chosen, at: now };
      sceneRef.current.sel = chosen >= 0 ? chosen : null;
      setHud((h) => ({ ...h, picked: chosen, sel: chosen >= 0 ? chosen : h.sel }));
      s.pending = grade(s, q, timeout ? '' : q.options[i].id, responseMs).then((res) => {
        s.pending = null;
        if (g.current !== s || s.closed) return;
        s.state = resolveAnswer(s.state, { ok: res.ok, qid: q.qid, word: res.word || q.word || '', prompt: q.prompt, responseMs, chosen, fuelLeft, timeout });
        const at = performance.now();
        const feedback = { ok: res.ok, chosen, correct: res.correct, word: res.word, timeout, at };
        sceneRef.current.feedback = feedback;
        if (res.ok !== null) beep(res.ok ? 'ok' : 'wrong', fxRef.current);
        setHud((h) => ({ ...h, shields: s.state.shields, score: s.state.score, combo: s.state.combo, feedback }));
        setAnnounce(res.ok === null ? c.offline : res.ok ? c.right : `${timeout ? c.outOfFuel : c.wrong} ${res.word}`);
        s.gap = true;
        s.gapUntil = at + ORBIT.gapMs;
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
      const elapsed = now - s.roundStart - s.pausedTotal;
      if (!s.gap) {
        if (!s.picked) {
          const fuel = now < s.unlockAt ? 1 : Math.max(0, (s.deadline - now) / s.fuelMs);
          sceneRef.current.fuel = fuel;
          if (fuelBar.current) {
            fuelBar.current.style.transform = `scaleX(${fuel})`;
            fuelBar.current.style.backgroundColor = fuel < 0.25 ? '#fb7185' : fuel < 0.5 ? '#fbbf24' : '#7dd3fc';
          }
          if (!s.unlocked && now >= s.unlockAt) {
            s.unlocked = true;
            setHud((h) => ({ ...h, unlocked: true }));
          }
          if (now >= s.deadline) pick(-1, { timeout: true });
          else if (elapsed >= ORBIT.roundMs) {
            finish('time');
            return;
          }
        }
      } else if (now >= s.gapUntil) {
        if (s.fatal) {
          finish('expired');
          return;
        }
        if (s.state.over || elapsed >= ORBIT.roundMs || s.idx + 1 >= s.qs.length) {
          finish(s.state.over ? 'over' : s.idx + 1 >= s.qs.length ? 'cleared' : 'time');
          return;
        }
        s.idx += 1;
        showQuestion(s, now);
      }
      if (now - s.lastHud > 250) {
        s.lastHud = now;
        const left = Math.max(0, Math.ceil((ORBIT.roundMs - elapsed) / 1000));
        setHud((h) => (h.timeLeft === left ? h : { ...h, timeLeft: left }));
      }
      if (tierRef.current !== 'none' && document.visibilityState === 'visible') s.watchdog.sample(now);
    }
    s.raf = requestAnimationFrame(() => tickRef.current());
  }, [finish, onContextLost, pick, showQuestion]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // The 3D planets are tappable too: the scene calls this through sceneRef (never through React).
  useEffect(() => {
    sceneRef.current.onPick = (i) => pick(i);
  }, [pick]);

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
        gameKey: 'word_orbit',
        audience,
        toQuestion: (q) => ({ qid: q.qid, prompt: q.prompt, hint: q.hint || '', options: q.options || [] }),
        guestQuestions: () => guestQuestions(RUN_BANK, ORBIT_SENTENCES, Math.random, ORBIT.guestQuestions),
      });
    } catch (e) {
      setError(e?.message || c.errorStart);
      setPhase('intro');
      return;
    }
    if (disposedRef.current) return;
    const qs = round.qs.filter((q) => q.options.length >= 2);
    if (!qs.length) {
      setError(c.errorStart);
      setPhase('intro');
      return;
    }
    const now = performance.now();
    g.current = {
      active: true,
      qs,
      idx: 0,
      state: initialOrbit(),
      round,
      roundStart: now,
      pausedTotal: 0,
      pausedAt: 0,
      lastHud: 0,
      pending: null,
      watchdog: createFpsWatchdog({ onLow: onLowFps }),
    };
    if (sceneRef.current.contextLost) {
      sceneRef.current.contextLost = false;
      if (tierRef.current !== 'none') onContextLost();
    }
    setPractice(round.practice ? round.reason || 'few_words' : null);
    setHud({ shields: ORBIT.shields, score: 0, combo: 0, timeLeft: ORBIT.roundMs / 1000, prompt: '', hint: '', options: [], sel: null, picked: null, unlocked: false, feedback: null, count: 0, total: qs.length, showHint: false });
    setPaused(false);
    setEverStarted(true);
    setPhase('playing');
    showQuestion(g.current, now);
    g.current.raf = requestAnimationFrame(() => tickRef.current());
  };

  const focusPlanet = useCallback((i) => {
    const s = g.current;
    if (!s.active || s.pausedAt || s.picked || s.gap) return;
    s.sel = i;
    sceneRef.current.sel = i;
    setHud((h) => (h.sel === i ? h : { ...h, sel: i }));
  }, []);

  const pause = useCallback(() => {
    const s = g.current;
    if (!s.active || s.pausedAt) return;
    s.pausedAt = performance.now();
    setPaused(true);
  }, []);
  const resume = useCallback(() => {
    const s = g.current;
    if (!s.active || !s.pausedAt) return;
    const now = performance.now();
    const d = now - s.pausedAt;
    s.pausedAt = 0;
    s.pausedTotal += d;
    // The fuel and the gap wait out the pause; the answer clock (shownAt) does not — see the header.
    s.unlockAt += d;
    s.deadline += d;
    if (s.gapUntil) s.gapUntil += d;
    sceneRef.current.unlockAt = s.unlockAt;
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
    const onKey = (e) => {
      if (e.target?.closest?.('input,textarea,select')) return;
      const s = g.current;
      if (e.key === 'Escape') (s.pausedAt ? resume : pause)();
      else if (s.pausedAt) return;
      else if (['1', '2', '3'].includes(e.key)) pick(Number(e.key) - 1);
      else if (e.key === 'ArrowLeft' || e.code === 'KeyA') focusPlanet(Math.max(0, (s.sel ?? 1) - 1));
      else if (e.key === 'ArrowRight' || e.code === 'KeyD') focusPlanet(Math.min(ORBIT.planets - 1, (s.sel ?? 1) + 1));
      else if ((e.key === 'Enter' || e.key === ' ') && s.sel !== null && s.sel !== undefined && !e.target?.closest?.('button')) pick(s.sel);
      else return;
      e.preventDefault();
    };
    const onVis = () => document.visibilityState === 'hidden' && pause();
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [phase, pick, focusPlanet, pause, resume]);

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

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="sr-only" aria-live="polite">{announce}</p>

      {phase === 'intro' || phase === 'loading' ? (
        <section aria-labelledby="orbit-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <Orbit size={13} aria-hidden="true" /> {c.kicker}
          </p>
          <h1 id="orbit-h" className="font-luxury text-3xl sm:text-4xl font-bold text-ink mt-1">{c.title}</h1>
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
        <section aria-label={c.title} className={showStage ? 'fixed inset-0 z-[60] h-dvh flex flex-col bg-[#050716] text-white select-none touch-manipulation overscroll-contain' : 'hidden'}>
          <div className="absolute inset-0">
            {use3d ? (
              <SceneBoundary onError={to2d}>
                <OrbitScene3D sceneRef={sceneRef} running={playing && !paused} visible={showStage} tier={tier} />
              </SceneBoundary>
            ) : (
              <Orbit2D options={hud.options} sel={hud.sel} picked={hud.picked} feedback={fb} />
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#050716]/85 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050716] via-[#050716]/70 to-transparent" aria-hidden="true" />

          {/* HUD */}
          <div className="relative z-10 w-full max-w-xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2">
              <button type="button" onClick={pause} disabled={!playing} className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={c.back}>
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <div className="flex items-center gap-0.5" aria-label={`${c.shields}: ${hud.shields}`} role="img">
                {Array.from({ length: ORBIT.shields }, (_, i) => (
                  <Shield key={i} size={18} className={i < hud.shields ? 'fill-sky-400 text-sky-300' : 'text-white/25'} aria-hidden="true" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black tabular-nums leading-none"><span className="sr-only">{c.score}: </span>{hud.score}</p>
              <p className="h-4 text-[11px] font-bold text-amber-300 tabular-nums">{hud.combo >= 2 ? `${c.combo} ×${hud.combo}` : hud.total ? `${hud.count} / ${hud.total}` : ''}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className={`text-sm font-bold tabular-nums ${hud.timeLeft <= 15 ? 'text-rose-300' : ''}`} aria-label={`${c.time}: ${hud.timeLeft}`}>{hud.timeLeft}s</span>
              <button type="button" onClick={pause} disabled={!playing} className="min-h-11 min-w-11 grid place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={c.pause}>
                <Pause size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* sentence (the card is white in both themes, so its colours are fixed, not theme tokens) */}
          <div className="relative z-10 w-full max-w-xl mx-auto px-3 mt-2">
            <div className="overflow-hidden rounded-2xl bg-white/95 text-[#0b1020] shadow-lg">
              <div className="px-4 pt-3 pb-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B8394A]">{c.task}</p>
                {paused ? <p className="py-2 text-sm font-semibold text-[#0b1020]/50">{c.paused}</p> : <Sentence prompt={hud.prompt} feedback={fb} />}
                {!paused && hud.hint && (
                  <div className="mt-1.5 min-h-7 grid place-items-center">
                    {hud.showHint || fb ? (
                      <p className="text-xs text-[#0b1020]/65 leading-snug break-words"><span className="sr-only">{c.hintLabel}: </span>{hud.hint}</p>
                    ) : (
                      <button type="button" onClick={() => setHud((h) => ({ ...h, showHint: true }))} className="inline-flex items-center gap-1 min-h-7 px-2.5 rounded-full bg-[#0b1020]/[0.07] text-[11px] font-semibold text-[#0b1020]/70 hover:bg-[#0b1020]/[0.12]">
                        <Languages size={12} aria-hidden="true" /> {c.hintShow}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="h-1.5 bg-[#0b1020]/10" role="img" aria-label={c.fuel}>
                <div ref={fuelBar} className="h-full origin-left bg-sky-300 will-change-transform" style={{ transform: 'scaleX(1)' }} />
              </div>
            </div>
            {practice && hud.count <= 1 && <p className="mt-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-center text-[11px] text-white/85">{practice === 'limit' ? c.practiceLimit : c.practiceFewWords}</p>}
            {lite && <p className="mt-1 text-center text-[11px] text-white/60">{lite === 'lost' ? c.liteLost : c.lite}</p>}
          </div>

          <div className="flex-1" />

          {/* verdict + the three words: the accessible control and the one-thumb control */}
          <div className="relative z-10 w-full max-w-xl mx-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="h-10 grid place-items-center">
              {fb ? (
                <p className={`max-w-full truncate rounded-full px-4 py-1.5 text-sm font-bold shadow-lg ${fb.ok ? 'bg-emerald-500 text-white' : fb.ok === false ? 'bg-rose-500 text-white' : 'bg-white/90 text-[#0b1020]'}`}>
                  {fb.ok ? c.right : fb.ok === false ? `${fb.timeout ? c.outOfFuel : c.wrong} ${fb.word}` : c.offline}
                </p>
              ) : (
                !hud.unlocked && playing && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                    <Lock size={11} aria-hidden="true" /> {c.wait}
                  </p>
                )
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {hud.options.map((o, i) => {
                const tone = fb
                  ? i === fb.correct ? 'bg-emerald-500 text-white border-emerald-300' : i === fb.chosen && fb.ok === false ? 'bg-rose-500 text-white border-rose-300' : 'bg-[#0b1020]/60 text-white/50 border-white/10'
                  : hud.picked === i ? 'bg-amber-400 text-[#0b1020] border-amber-200' : hud.picked !== null ? 'bg-[#0b1020]/60 text-white/50 border-white/10' : hud.sel === i ? 'bg-sky-500/30 text-white border-sky-300' : 'bg-[#0b1020]/65 text-white border-white/25';
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => pick(i)}
                    onPointerEnter={() => focusPlanet(i)}
                    onFocus={() => focusPlanet(i)}
                    disabled={!playing || !hud.unlocked || hud.picked !== null || !!fb}
                    aria-label={c.planet(i + 1, o.text)}
                    className={`min-h-14 rounded-xl border-2 px-1.5 text-sm sm:text-base font-bold font-word break-words leading-tight backdrop-blur-sm transition-colors disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${tone} ${!hud.unlocked && !fb ? 'opacity-60' : ''}`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
          </div>

          {(paused || phase === 'finishing') && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#050716]/95 backdrop-blur-sm px-6">
              {phase === 'finishing' ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" aria-label={c.loading} />
              ) : (
                <div className="w-full max-w-xs text-center" role="dialog" aria-modal="true" aria-labelledby="orbit-pause-h" onKeyDown={trapTab}>
                  <p id="orbit-pause-h" className="text-xl font-bold">{c.paused}</p>
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

      {phase === 'result' && result && <OrbitResult c={c} result={result} onAgain={start} canTry3d={pref2d && tier === 'none'} onTry3d={try3d} onResend={resend} resending={resending} />}
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

function OrbitResult({ c, result, onAgain, canTry3d, onTry3d, onResend, resending }) {
  const stats = [
    [c.correct, result.correct],
    [c.accuracy, `${result.accuracy}%`],
    [c.maxCombo, result.maxCombo],
    [c.seconds, result.seconds],
  ];
  const headRef = useRef(null);
  useEffect(() => {
    headRef.current?.focus();
  }, []);
  return (
    <section aria-labelledby="orbit-res-h" className="rounded-3xl border border-border bg-surface shadow-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{result.reason}</p>
      <h2 id="orbit-res-h" ref={headRef} tabIndex={-1} className="mt-1 text-5xl font-black text-ink tabular-nums outline-none">
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
      <ShareCard game="orbit" result={result} />

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

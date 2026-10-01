// O'yin sessiyasi hayot sikli: start -> answer (batch, idempotent) -> complete (idempotent).
// Barcha ball/XP/mastery hisobi SERVERda; klient faqat xom javob va vaqt yuboradi.
import mongoose from 'mongoose';
import { GameSession, User } from '@/lib/models';
import { localDateWithCutoff } from '@/lib/srs';
import { ANTI_CHEAT } from '@/lib/vocab/config';
import { applyStreakActivity } from '@/lib/vocab/streak';
import { computeSessionXp, idempotencyKeys, levelInfo } from '@/lib/vocab/xp';
import { questionUnits, scoreSession, suggestDifficulty, validateAnswer } from '@/lib/vocab/answering';
import { assessSession, minPlausibleMs } from '@/lib/vocab/antiCheat';
import { DIFFICULTIES } from '@/lib/vocab/config';
import { availabilityFor, buildGameSession, getGame, toClientQuestion } from '@/lib/vocab/games';
import { seededRandom } from '@/lib/vocab/rng';
import { selectWordsForGame } from '@/lib/vocab/selection';
import { checkGameAccess } from '@/lib/vocab/access';
import { evaluateAchievements } from '@/lib/vocab/achievements';
import { BADGE_DEFS } from '@/lib/gamification';
import { computeMastery } from '@/lib/vocab/mastery';
import { flattenUserWords, computeWordUpdate, applyWordUpdates, statsToInput } from './words';
import { awardXpOnce, gameXpSince, trackVocabEvents } from './ledger';
import { recordQuestEvents, refreshWeeklyAccuracyQuest } from './questService';

const PAIR_SIZE = { easy: 4, medium: 5, hard: 6, expert: 6 };
const MAX_ANSWERS_PER_REQUEST = 60;
const MAX_RESPONSE_MS = 10 * 60 * 1000;

export class ServiceError extends Error {
  constructor(status, message, code = 'error', extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export const tierOf = (user) => (user.role === 'admin' ? 'premium' : user.subscriptionTier || 'free');

const oid = (v) => new mongoose.Types.ObjectId(String(v));

function dayStartGuess(now) {
  return new Date(now.getTime() - 36 * 3600 * 1000);
}

// ---------------------------------------------------------------------------
// Klientga beriladigan ko'rinishlar
// ---------------------------------------------------------------------------
function revealFor(question, rec) {
  return {
    qid: rec.qid,
    attempt: rec.attempt,
    isCorrect: rec.isCorrect,
    counted: rec.counted !== false,
    correctParts: rec.correctParts ?? undefined,
    totalParts: rec.totalParts ?? undefined,
    correctDisplay: question.correctDisplay,
    explanation: question.explanation,
    // juftlik savollarida qaysi chap element to'g'ri bog'langanini ko'rsatamiz (klient UI uchun)
    correctMap: question.inputType === 'match' ? question.answerMap : undefined,
  };
}

export function clientSessionView(session) {
  const meta = session.metadata || {};
  const answered = {};
  for (const a of session.answers || []) {
    if (a.counted === false) continue;
    const q = session.questions.find((x) => x.qid === a.qid);
    if (q) answered[a.qid] = revealFor(q, a);
  }
  return {
    sessionId: String(session._id),
    gameKey: session.gameKey,
    difficulty: session.difficulty,
    status: session.status,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    instantFeedback: meta.instantFeedback !== false,
    lives: meta.lives ?? null,
    timePerQuestionSec: meta.timePerQuestionSec ?? null,
    questions: session.questions.map(toClientQuestion),
    answered,
  };
}

// ---------------------------------------------------------------------------
// START
// ---------------------------------------------------------------------------
/** @param user — lean User (categories, role, subscriptionTier, timezone kerak) */
export async function startGameSession({ user, gameKey, difficulty = 'auto', categoryId = '', mode = 'mixed', now = new Date() }) {
  const def = getGame(gameKey);
  if (!def) throw new ServiceError(404, "Noma'lum o'yin", 'unknown_game');
  const userId = oid(user._id);
  const tz = user.timezone || 'Asia/Tashkent';

  // --- tezlik va kunlik limit ---
  const recent = await GameSession.find({ userId, startedAt: { $gte: dayStartGuess(now) } }, { startedAt: 1, status: 1 }).lean();
  const today = localDateWithCutoff(now, tz);
  const startedToday = recent.filter((s) => localDateWithCutoff(new Date(s.startedAt), tz) === today).length;
  const lastMinute = recent.filter((s) => now.getTime() - new Date(s.startedAt).getTime() < 60_000).length;
  if (lastMinute >= ANTI_CHEAT.maxSessionStartsPerMinute) throw new ServiceError(429, "Juda tez-tez o'yin boshlayapsiz. Biroz kuting.", 'rate_limited');
  if (startedToday >= ANTI_CHEAT.maxSessionsPerDay) throw new ServiceError(429, "Bugungi o'yinlar chegarasiga yetdingiz.", 'rate_limited');

  const access = checkGameAccess(tierOf(user), gameKey, startedToday);
  if (!access.allowed) throw new ServiceError(403, access.message, access.code);

  // --- so'zlar va mavjudlik ---
  const words = flattenUserWords(user, { categoryId, now });
  const avail = availabilityFor(def, words);
  if (!avail.available) throw new ServiceError(422, avail.reason, 'not_enough_words');

  // --- qiyinlik ---
  let diff = difficulty;
  let suggested = null;
  if (!DIFFICULTIES.includes(diff)) {
    const hist = await GameSession.find({ userId, gameKey, status: 'completed', suspicious: false }, { difficulty: 1, correctCount: 1, wrongCount: 1, avgResponseMs: 1 })
      .sort({ completedAt: -1 })
      .limit(3)
      .lean();
    const history = hist.map((h) => ({
      difficulty: h.difficulty,
      accuracy: h.correctCount + h.wrongCount > 0 ? h.correctCount / (h.correctCount + h.wrongCount) : 0,
      avgResponseMs: h.avgResponseMs || 0,
    }));
    const avgMastery = words.length ? words.reduce((s, w) => s + (w.mastery || 0), 0) / words.length : null;
    diff = suggestDifficulty({ history, avgMastery });
    suggested = diff;
  }

  // --- tanlov va savollar ---
  const _id = new mongoose.Types.ObjectId();
  const rand = seededRandom(String(_id));
  const isPairs = gameKey === 'word_match' || gameKey === 'memory';
  const need = isPairs ? PAIR_SIZE[diff] * def.questionCount[diff] : gameKey === 'vocabulary_boss' ? Math.min(30, words.length) : def.questionCount[diff];
  const selMode = ['mixed', 'review', 'weak', 'new'].includes(mode) ? mode : 'mixed';
  const { selected, distractors } = selectWordsForGame(words, Math.min(need, words.length), selMode, rand, now);
  const built = buildGameSession({ gameKey, difficulty: diff, words: selected, distractorPool: distractors, rand });
  if (!built.questions.length) throw new ServiceError(422, built.shortfall || "Savollar tuzib bo'lmadi", 'no_questions');

  const wordMap = {};
  for (const w of words) wordMap[w.wordId] = w.categoryId;
  const unitCount = built.questions.reduce((s, q) => s + questionUnits(q), 0);

  const doc = await GameSession.create({
    _id,
    userId,
    gameKey,
    difficulty: diff,
    mode: selMode,
    categoryId: String(categoryId || ''),
    questions: built.questions,
    questionCount: built.questions.length,
    startedAt: now,
    expiresAt: new Date(now.getTime() + ANTI_CHEAT.sessionTtlMs),
    metadata: {
      wordMap,
      unitCount,
      instantFeedback: def.instantFeedback,
      lives: def.lives,
      timePerQuestionSec: def.timePerQuestionSec[diff],
      shortfall: built.shortfall || null,
    },
  });

  // Eski tugallanmagan sessiyalarni "abandoned" qilamiz (tozalik).
  await GameSession.updateMany(
    { userId, gameKey, status: 'active', _id: { $ne: _id }, startedAt: { $lt: new Date(now.getTime() - 30 * 60 * 1000) } },
    { $set: { status: 'abandoned' } }
  );

  await trackVocabEvents(userId, [{ name: 'game_started', payload: { game: gameKey, difficulty: diff, mode: selMode, questions: built.questions.length } }]);

  return { ...clientSessionView(doc.toObject()), suggestedDifficulty: suggested, shortfall: built.shortfall || null };
}

/** Faol (tugallanmagan) sessiyani qayta tiklash — sahifa yangilanganda. */
export async function getActiveSession({ userId, gameKey, now = new Date() }) {
  const s = await GameSession.findOne({ userId: oid(userId), gameKey, status: 'active', expiresAt: { $gt: now } }).sort({ startedAt: -1 }).lean();
  return s ? clientSessionView(s) : null;
}

export async function getSessionForUser({ userId, sessionId }) {
  if (!mongoose.isValidObjectId(sessionId)) throw new ServiceError(404, 'Sessiya topilmadi', 'not_found');
  const s = await GameSession.findOne({ _id: oid(sessionId), userId: oid(userId) }).lean();
  if (!s) throw new ServiceError(404, 'Sessiya topilmadi', 'not_found');
  return s;
}

// ---------------------------------------------------------------------------
// ANSWER (batch, idempotent)
// ---------------------------------------------------------------------------
export async function submitAnswers({ userId, sessionId, answers, now = new Date() }) {
  if (!Array.isArray(answers) || !answers.length) throw new ServiceError(400, "Javoblar ro'yxati bo'sh", 'bad_request');
  if (answers.length > MAX_ANSWERS_PER_REQUEST) throw new ServiceError(400, `Bir so'rovda ko'pi bilan ${MAX_ANSWERS_PER_REQUEST} ta javob`, 'bad_request');

  const session = await getSessionForUser({ userId, sessionId });
  if (session.status === 'completed') throw new ServiceError(409, 'Sessiya allaqachon yakunlangan', 'already_completed');
  if (session.status !== 'active' || new Date(session.expiresAt).getTime() <= now.getTime()) throw new ServiceError(410, 'Sessiya muddati tugagan', 'expired');

  const questions = new Map(session.questions.map((q) => [q.qid, q]));
  const wordMap = session.metadata?.wordMap || {};
  const results = [];
  const wordResults = new Map(); // wordId -> [{skill, secondarySkill, isCorrect, responseMs}]
  let dCorrect = 0;
  let dWrong = 0;
  let dContext = 0;
  const events = [];

  const stored = new Map();
  for (const a of session.answers || []) stored.set(`${a.qid}#${a.attempt}`, a);

  for (const item of answers) {
    const qid = String(item?.qid || '');
    const q = questions.get(qid);
    if (!q) {
      results.push({ qid, error: "Noma'lum savol" });
      continue;
    }
    const attempt = Number.isInteger(item.attempt) && item.attempt >= 1 && item.attempt <= 5 ? item.attempt : 1;
    const key = `${qid}#${attempt}`;
    if (stored.has(key)) {
      results.push(revealFor(q, stored.get(key))); // takroriy yuborish — saqlangan natija
      continue;
    }
    if (attempt > 1 && !stored.has(`${qid}#1`)) {
      results.push({ qid, error: "Avval birinchi urinish yuborilishi kerak" });
      continue;
    }

    let responseMs = Number(item.responseMs);
    if (!isFinite(responseMs) || responseMs < 0) responseMs = 0;
    responseMs = Math.min(responseMs, MAX_RESPONSE_MS);

    const verdict = validateAnswer(q, item.answer);
    const units = questionUnits(q);
    const implausible = responseMs < minPlausibleMs({ inputType: q.inputType, promptLength: (q.prompt || '').length, units });
    const counted = attempt === 1;
    const rec = {
      qid,
      attempt,
      answer: typeof item.answer === 'string' ? item.answer.slice(0, 200) : item.answer && typeof item.answer === 'object' ? JSON.parse(JSON.stringify(item.answer)) : null,
      isCorrect: verdict.isCorrect,
      counted,
      correctParts: verdict.correctParts ?? null,
      totalParts: verdict.totalParts ?? null,
      responseMs: Math.round(responseMs),
      implausible,
      createdAt: now,
    };

    // Atomik: aynan shu (qid, attempt) hali yo'q bo'lsa qo'shamiz (parallel takror yuborishdan himoya).
    const res = await GameSession.updateOne(
      { _id: session._id, status: 'active', answers: { $not: { $elemMatch: { qid, attempt } } } },
      { $push: { answers: rec } }
    );
    if (!res.modifiedCount) {
      const fresh = await GameSession.findOne({ _id: session._id }, { answers: 1 }).lean();
      const prev = (fresh?.answers || []).find((x) => x.qid === qid && x.attempt === attempt);
      results.push(prev ? revealFor(q, prev) : { qid, error: 'Yozib bo‘lmadi' });
      continue;
    }
    stored.set(key, rec);
    results.push({ ...revealFor(q, rec), near: verdict.near || undefined, partResults: verdict.partResults });

    if (!counted) continue;

    // --- so'z natijalari (faqat birinchi urinish) ---
    if (q.inputType === 'match') {
      for (const left of q.lefts || []) {
        const ok = verdict.partResults ? !!verdict.partResults[left.id] : false;
        const arr = wordResults.get(left.wordId) || [];
        arr.push({ skill: q.skill, isCorrect: ok, responseMs: Math.round(responseMs / Math.max(1, units)) });
        wordResults.set(left.wordId, arr);
        if (ok) dCorrect += 1;
        else dWrong += 1;
      }
    } else {
      const arr = wordResults.get(q.wordId) || [];
      arr.push({ skill: q.skill, secondarySkill: q.secondarySkill, isCorrect: verdict.isCorrect, responseMs });
      wordResults.set(q.wordId, arr);
      if (verdict.isCorrect) {
        dCorrect += 1;
        if (q.skill === 'context') dContext += 1;
      } else dWrong += 1;
    }
    events.push({ name: 'game_answered', payload: { game: session.gameKey, correct: verdict.isCorrect, kind: q.kind, ms: Math.round(responseMs) } });
  }

  // --- so'z statistikasini (SRS + mastery) yangilash ---
  let newWords = 0;
  let mastered = 0;
  const masteredWordIds = [];
  if (wordResults.size) {
    const userDoc = await User.findById(userId).select('categories').lean();
    const index = new Map();
    for (const cat of userDoc?.categories || []) for (const w of cat.words || []) index.set(String(w._id), { w, cat });
    const updates = [];
    for (const [wordId, rs] of wordResults) {
      const hit = index.get(wordId);
      if (!hit) continue;
      const out = computeWordUpdate(hit.w.stats || {}, rs, now);
      updates.push({ categoryId: String(hit.cat._id), wordId, set: out.set });
      if (out.firstCorrectOnNew) newWords += 1;
      if (out.newlyMastered) {
        mastered += 1;
        masteredWordIds.push({ wordId, word: hit.w.word });
      }
    }
    await applyWordUpdates(userId, updates);
  }

  // --- sessiya hisoblagichlari ---
  const inc = {};
  if (dCorrect) inc.correctCount = dCorrect;
  if (dWrong) inc.wrongCount = dWrong;
  if (newWords) inc.newWordsLearned = newWords;
  if (mastered) inc.wordsMastered = mastered;
  if (dContext) inc.contextCorrect = dContext;
  if (Object.keys(inc).length) await GameSession.updateOne({ _id: session._id }, { $inc: inc });

  if (events.length) {
    for (const m of masteredWordIds) events.push({ name: 'vocabulary_mastered', payload: { word: m.word } });
    await trackVocabEvents(oid(userId), events);
  }

  const answeredCount = stored.size ? new Set([...stored.values()].filter((a) => a.counted !== false).map((a) => a.qid)).size : 0;
  return { results, progress: { answered: answeredCount, total: session.questions.length } };
}

// ---------------------------------------------------------------------------
// COMPLETE (idempotent)
// ---------------------------------------------------------------------------
function buildMistakes(session) {
  const out = [];
  const byQ = new Map(session.questions.map((q) => [q.qid, q]));
  for (const a of session.answers || []) {
    if (a.counted === false) continue;
    const q = byQ.get(a.qid);
    if (!q) continue;
    const wrongAll = !a.isCorrect && !(a.totalParts != null && a.correctParts === a.totalParts);
    if (!wrongAll) continue;
    let yourAnswer = '';
    if (q.inputType === 'choice') yourAnswer = q.options?.find((o) => o.id === a.answer)?.text || '';
    else if (q.inputType === 'typed') yourAnswer = typeof a.answer === 'string' ? a.answer : '';
    else if (q.inputType === 'arrange') yourAnswer = Array.isArray(a.answer) ? a.answer.join(' ') : String(a.answer || '');
    else if (q.inputType === 'match') yourAnswer = `${a.correctParts ?? 0}/${a.totalParts ?? 0} juftlik to'g'ri`;
    out.push({
      qid: q.qid,
      kind: q.kind,
      wordId: q.wordId,
      categoryId: q.categoryId,
      word: q.word,
      prompt: q.prompt,
      yourAnswer,
      correctAnswer: q.correctDisplay,
      explanation: q.explanation,
    });
  }
  return out;
}

async function loadAchievementStats(userId) {
  const user = await User.findById(userId).select('categories gameStats reviewStreak longestReviewStreak badges').lean();
  let totalWords = 0;
  let masteredWords = 0;
  let advancedWords = 0;
  let ieltsWords = 0;
  for (const cat of user?.categories || []) {
    for (const w of cat.words || []) {
      totalWords += 1;
      if ((w.stats?.level || 0) >= 5) masteredWords += 1;
      if (computeMastery(statsToInput(w.stats || {})).score >= 81) advancedWords += 1;
      if (['B2', 'C1', 'C2'].includes(w.enrichment?.cefr)) ieltsWords += 1;
    }
  }
  const g = user?.gameStats || {};
  return {
    user,
    stats: {
      totalWords,
      masteredWords,
      advancedWords,
      ieltsWords,
      longestStreak: user?.longestReviewStreak || 0,
      gamesCompleted: g.gamesCompleted || 0,
      bossCompleted: g.bossCompleted || 0,
      listeningCorrect: g.listeningCorrect || 0,
      spellingCorrect: g.spellingCorrect || 0,
      hadPerfectSession: (g.perfectSessions || 0) > 0,
    },
  };
}

/** Yangi yutuqlarni idempotent beradi (badges.key bo'yicha). */
export async function grantAchievements(userId, stats, existingKeys) {
  const defs = [...BADGE_DEFS];
  const earned = new Set(existingKeys || []);
  const fresh = [];
  for (const def of defs) {
    if (earned.has(def.key)) continue;
    let ok = false;
    try {
      ok = !!def.check(stats);
    } catch {
      ok = false;
    }
    if (!ok) continue;
    const res = await User.updateOne({ _id: userId, 'badges.key': { $ne: def.key } }, { $push: { badges: { key: def.key, earnedAt: new Date() } } });
    if (res.modifiedCount) fresh.push({ key: def.key, label: def.label, icon: def.icon });
  }
  void evaluateAchievements; // (yangi def'lar BADGE_DEFS ichida birlashtirilgan)
  return fresh;
}

export async function completeSession({ userId, sessionId, now = new Date() }) {
  const uid = oid(userId);
  let session = await getSessionForUser({ userId, sessionId });

  if (session.status === 'active') {
    const flipped = await GameSession.findOneAndUpdate({ _id: session._id, status: 'active' }, { $set: { status: 'completed', completedAt: now } }, { new: true }).lean();
    session = flipped || (await GameSession.findById(session._id).lean());
  } else if (session.status === 'abandoned') {
    throw new ServiceError(410, 'Sessiya tugatilgan (abandoned)', 'expired');
  }
  if (session.finalized?.result && session.finalized.xp && session.finalized.streak && session.finalized.stats && session.finalized.quests) {
    return { ...session.finalized.result, duplicate: true };
  }

  const tz = (await User.findById(uid).select('timezone').lean())?.timezone || 'Asia/Tashkent';
  const completedAt = session.completedAt || now;

  // ---------- natijani hisoblash (sof) ----------
  const qById = new Map(session.questions.map((q) => [q.qid, q]));
  const counted = (session.answers || []).filter((a) => a.counted !== false);
  const scoreInput = counted.map((a) => {
    const q = qById.get(a.qid);
    return {
      isCorrect: a.isCorrect,
      responseMs: a.responseMs,
      timeLimitSec: q?.timeLimitSec,
      correctParts: a.correctParts ?? undefined,
      totalParts: a.totalParts ?? undefined,
    };
  });
  const score = scoreSession(scoreInput);
  const totalUnits = session.metadata?.unitCount || session.questions.reduce((s, q) => s + questionUnits(q), 0);
  const answeredUnits = score.correctUnits + score.wrongUnits;
  const skippedUnits = Math.max(0, totalUnits - answeredUnits);
  const answeredQuestions = new Set(counted.map((a) => a.qid)).size;
  const completedFully = answeredQuestions >= Math.max(1, Math.ceil(session.questions.length * 0.8));

  const assessment = assessSession({
    answers: counted.map((a) => {
      const q = qById.get(a.qid);
      return { responseMs: a.responseMs, inputType: q?.inputType || 'choice', promptLength: (q?.prompt || '').length, units: q ? questionUnits(q) : 1 };
    }),
    startedAt: session.startedAt,
    completedAt,
  });

  await GameSession.updateOne(
    { _id: session._id, 'finalized.result': { $exists: false } },
    {
      $set: {
        score: score.score,
        maxCombo: score.maxCombo,
        correctCount: score.correctUnits,
        wrongCount: score.wrongUnits,
        skippedCount: skippedUnits,
        avgResponseMs: score.avgResponseMs,
        suspicious: assessment.suspicious,
        flags: assessment.flags,
      },
    }
  );

  // ---------- XP ----------
  const userBefore = await User.findById(uid).select('xp').lean();
  const xpBefore = userBefore?.xp || 0;
  let xpResult = { awarded: false, duplicate: false, amount: 0, totalXp: xpBefore };
  let xpBreakdown = null;
  if (!session.finalized?.xp) {
    const earnedToday = await gameXpSince(uid, dayStartGuess(now));
    xpBreakdown = computeSessionXp({
      difficulty: session.difficulty,
      correctCount: score.correctUnits,
      wrongCount: score.wrongUnits,
      questionCount: totalUnits,
      completed: completedFully,
      suspicious: assessment.suspicious,
      earnedTodayFromGames: earnedToday,
      newWordsLearned: session.newWordsLearned || 0,
      wordsMastered: session.wordsMastered || 0,
    });
    xpResult = await awardXpOnce(uid, xpBreakdown.total, {
      reason: 'game',
      sourceType: 'game',
      sourceId: String(session._id),
      idempotencyKey: idempotencyKeys.gameComplete(String(session._id)),
      metadata: { game: session.gameKey, difficulty: session.difficulty, accuracy: Math.round(score.accuracy * 100) },
    });
    if (xpResult.awarded || xpResult.duplicate || xpBreakdown.total === 0) {
      await GameSession.updateOne({ _id: session._id }, { $set: { 'finalized.xp': true, xpEarned: xpResult.awarded ? xpResult.amount : xpBreakdown.total } });
    }
  }
  const xpAfter = xpResult.totalXp ?? (await User.findById(uid).select('xp').lean())?.xp ?? xpBefore;

  // ---------- streak ----------
  let streakInfo = null;
  if (!session.finalized?.streak) {
    if (answeredUnits > 0 && !assessment.suspicious) {
      const u = await User.findById(uid).select('reviewStreak lastReviewDate longestReviewStreak streakFreezes').lean();
      const r = applyStreakActivity(
        { streak: u?.reviewStreak || 0, lastDate: u?.lastReviewDate || null, freezes: u?.streakFreezes || 0, longest: u?.longestReviewStreak || 0 },
        completedAt,
        tz
      );
      if (!r.alreadyCounted) {
        await User.updateOne({ _id: uid }, { $set: { reviewStreak: r.streak, lastReviewDate: r.lastDate, longestReviewStreak: r.longest, streakFreezes: r.freezes } });
      }
      streakInfo = { streak: r.streak, extended: r.extended, milestone: r.milestone, usedFreezes: r.usedFreezes, earnedFreeze: r.earnedFreeze, broke: r.broke };
    }
    await GameSession.updateOne({ _id: session._id }, { $set: { 'finalized.streak': true } });
  }

  // ---------- statistika hisoblagichlari (at-most-once) ----------
  if (!session.finalized?.stats) {
    const claim = await GameSession.updateOne({ _id: session._id, 'finalized.stats': { $ne: true } }, { $set: { 'finalized.stats': true } });
    if (claim.modifiedCount && answeredUnits > 0 && !assessment.suspicious) {
      const inc = { 'gameStats.totalGameXp': xpResult.awarded ? xpResult.amount : 0 };
      if (completedFully) inc['gameStats.gamesCompleted'] = 1;
      if (completedFully && session.gameKey === 'vocabulary_boss') inc['gameStats.bossCompleted'] = 1;
      if (completedFully && score.wrongUnits === 0 && totalUnits >= 5) inc['gameStats.perfectSessions'] = 1;
      let listeningCorrect = 0;
      let spellingCorrect = 0;
      for (const a of counted) {
        const q = qById.get(a.qid);
        if (!q || !a.isCorrect) continue;
        if (q.skill === 'listening' || q.secondarySkill === 'listening') listeningCorrect += 1;
        if (q.skill === 'spelling') spellingCorrect += 1;
      }
      if (listeningCorrect) inc['gameStats.listeningCorrect'] = listeningCorrect;
      if (spellingCorrect) inc['gameStats.spellingCorrect'] = spellingCorrect;
      await User.updateOne({ _id: uid }, { $inc: inc, $set: { 'gameStats.lastSessionAt': completedAt } });
    }
  }

  // ---------- kvestlar ----------
  let questsCompleted = [];
  if (!session.finalized?.quests) {
    if (!assessment.suspicious && answeredUnits > 0) {
      const events = [];
      if (completedFully) events.push({ metric: 'games', amount: 1 });
      if (session.newWordsLearned) events.push({ metric: 'new_words', amount: session.newWordsLearned });
      if (session.contextCorrect) events.push({ metric: 'context_uses', amount: session.contextCorrect });
      if (session.wordsMastered) events.push({ metric: 'mastered_words', amount: session.wordsMastered });
      if (completedFully && session.gameKey === 'vocabulary_boss') events.push({ metric: 'boss_completed', amount: 1 });
      questsCompleted = await recordQuestEvents({ userId: uid, timeZone: tz, events, sourceId: `game:${session._id}`, now: completedAt });
      const acc = await refreshWeeklyAccuracyQuest({ userId: uid, timeZone: tz, now: completedAt });
      if (acc) questsCompleted.push(acc);
    }
    await GameSession.updateOne({ _id: session._id }, { $set: { 'finalized.quests': true } });
  }

  // ---------- yutuqlar ----------
  let newBadges = [];
  if (!assessment.suspicious && answeredUnits > 0) {
    const { user: fresh, stats } = await loadAchievementStats(uid);
    newBadges = await grantAchievements(uid, stats, (fresh?.badges || []).map((b) => b.key));
  }

  // ---------- natija ----------
  const mistakes = buildMistakes(session);
  const missedWordIds = new Set(mistakes.map((m) => m.wordId));
  const correctWordIds = new Set();
  for (const a of counted) {
    const q = qById.get(a.qid);
    if (q && a.isCorrect && q.inputType !== 'match') correctWordIds.add(q.wordId);
  }
  const lvBefore = levelInfo(xpBefore);
  const lvAfter = levelInfo(xpAfter);
  const result = {
    sessionId: String(session._id),
    gameKey: session.gameKey,
    difficulty: session.difficulty,
    score: score.score,
    maxCombo: score.maxCombo,
    accuracy: Math.round(score.accuracy * 100),
    correct: score.correctUnits,
    total: totalUnits,
    wrong: score.wrongUnits,
    skipped: skippedUnits,
    durationMs: Math.max(0, new Date(completedAt).getTime() - new Date(session.startedAt).getTime()),
    avgResponseMs: score.avgResponseMs,
    completed: completedFully,
    xp: {
      earned: xpResult.awarded ? xpResult.amount : xpBreakdown ? (xpResult.duplicate ? 0 : xpBreakdown.total) : session.xpEarned || 0,
      breakdown: xpBreakdown,
      total: xpAfter,
      levelBefore: lvBefore,
      level: lvAfter,
      levelUp: lvAfter.level > lvBefore.level,
    },
    wordsImproved: correctWordIds.size,
    weakWordCount: missedWordIds.size,
    mistakes,
    streak: streakInfo,
    newBadges,
    questsCompleted: questsCompleted.map((q) => ({ key: q.def.key, title: q.def.title, rewardXp: q.xp })),
    // Jazolamaydigan xabar: shubhali sessiya uchun sababni oshkor qilmaymiz.
    notice: assessment.suspicious ? "Sessiya tekshiruv uchun belgilandi — bu sessiya uchun XP berilmadi." : null,
    nextDifficulty: suggestDifficulty({
      history: [{ difficulty: session.difficulty, accuracy: score.accuracy, avgResponseMs: score.avgResponseMs }],
    }),
  };

  await GameSession.updateOne({ _id: session._id }, { $set: { 'finalized.result': result } });

  await trackVocabEvents(uid, [
    { name: 'game_completed', payload: { game: session.gameKey, difficulty: session.difficulty, score: score.score, accuracy: result.accuracy, xp: result.xp.earned, suspicious: assessment.suspicious } },
    ...questsCompleted.map((q) => ({ name: 'quest_completed', payload: { quest: q.def.key, xp: q.xp } })),
    ...newBadges.map((b) => ({ name: 'achievement_unlocked', payload: { badge: b.key } })),
    ...(streakInfo?.extended ? [{ name: 'streak_extended', payload: { streak: streakInfo.streak } }] : []),
  ]);

  return result;
}

/** Foydalanuvchi sessiyani tark etdi (yakunlamasdan) — statusni yangilaydi, XP bermaydi. */
export async function abandonSession({ userId, sessionId }) {
  const res = await GameSession.updateOne({ _id: oid(sessionId), userId: oid(userId), status: 'active' }, { $set: { status: 'abandoned' } });
  return { abandoned: res.modifiedCount > 0 };
}

// So'z dueli — server flow (TZ 2.0 §6.8.4, §7, §7.4). Rules: ./rules.js.
//
//   create  → random: join the oldest open random duel near my rating, else open a new one;
//             friend: invite by username (in-app notification + push); link: anyone with the link.
//             The creator plays right away; the opponent plays whenever they join.
//   next    → serves question i once and stamps servedAt[i] (asking again returns the same stamp,
//             so reloading never buys more time); an expired question is recorded as a timeout.
//   answer  → graded on the server with now − servedAt[i]; written only if answers.length === i.
//   finish  → both done (or the play deadline passed) → winner, ELO, XP (idempotent), notification.
// Stale duels are cleaned up lazily on every read (no cron needed).
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { Duel, User, XpEvent, Notification, VocabularyEntry, Block } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { addToSystemDeck } from '@/lib/vocab/server/systemDeck';
import { RUN_BANK } from '@/lib/flagship/runBank';
import {
  DUEL, DUEL_DECK_NAME, buildDuelQuestions, decideWinner, duelCode, eloUpdate, gradeAnswer, isSuspicious, missedWords,
  publicQuestion, resultFor, reviewRows, tally, timeoutAnswer, xpFor,
} from './rules';

const POOL_TTL_MS = 10 * 60_000;
let poolCache = { at: 0, pool: null };

/** Word pool: the public Run bank + published library words with an Uzbek translation (+ Russian when present). Cached 10 min. */
export async function duelPool(now = Date.now()) {
  if (poolCache.pool && now - poolCache.at < POOL_TTL_MS) return poolCache.pool;
  const bank = RUN_BANK.map((e) => ({ word: e.word, uz: e.uz, ru: e.ru || '', cefr: e.cefr }));
  let lib = [];
  try {
    lib = await VocabularyEntry.aggregate([
      { $match: { status: 'PUBLISHED', translationUz: { $nin: ['', null] }, cefr: { $in: ['A2', 'B1', 'B2', 'C1'] } } },
      { $sample: { size: 300 } },
      { $project: { _id: 0, word: 1, uz: '$translationUz', ru: '$translationRu', cefr: 1 } },
    ]);
  } catch {
    lib = [];
  }
  poolCache = { at: now, pool: [...bank, ...lib] };
  return poolCache.pool;
}
export function resetDuelPoolCache() {
  poolCache = { at: 0, pool: null };
}

const err = (code, status) => ({ error: code, status });
const oid = (id) => new mongoose.Types.ObjectId(String(id));
const sideOf = (duel, userId) => (String(duel.a.userId) === String(userId) ? 'a' : duel.b && String(duel.b.userId) === String(userId) ? 'b' : null);
const other = (side) => (side === 'a' ? 'b' : 'a');
const displayName = (u) => (u?.name || u?.username || 'Vocably').slice(0, 40);

function newPlayer(user, now) {
  return { userId: user._id, name: displayName(user), rating: user.duel?.rating ?? DUEL.startRating, joinedAt: now, deadline: new Date(now.getTime() + DUEL.playTtlMs), servedAt: [], answers: [] };
}

async function notify(userId, title, body, link) {
  await Notification.create({ userId, type: 'duel', title, body, link }).catch(() => {});
  await sendPushToUser(userId, { title, body, url: link }).catch(() => {});
}

// ---------------------------------------------------------------- lifecycle helpers

/** Fills missing answers with timeouts and closes a player's run (idempotent). */
async function finishPlayer(duel, side, now) {
  const p = duel[side];
  if (!p || p.finishedAt) return;
  const answers = [...p.answers];
  while (answers.length < DUEL.words) answers.push(timeoutAnswer());
  const t = tally(answers);
  await Duel.updateOne(
    { _id: duel._id, [`${side}.finishedAt`]: null },
    { $set: { [`${side}.answers`]: answers, [`${side}.finishedAt`]: now, [`${side}.score`]: t.score, [`${side}.correct`]: t.correct, [`${side}.totalMs`]: t.totalMs, [`${side}.suspicious`]: isSuspicious(t) } }
  );
}

async function payXp(duelId, side, userId, amount) {
  try {
    await XpEvent.create({ userId, amount, reason: 'duel', sourceType: 'duel', sourceId: String(duelId), idempotencyKey: `duel:${duelId}:${side}` });
    await User.updateOne({ _id: userId }, { $inc: { xp: amount } });
    return amount;
  } catch (e) {
    if (e?.code === 11000) return 0;
    throw e;
  }
}

/** Both players done → winner, ratings, XP, notification. Exactly once (status claim). */
async function settle(duelId, now) {
  const duel = await Duel.findById(duelId).lean();
  if (!duel || duel.status !== 'active' || !duel.a.finishedAt || !duel.b?.finishedAt) return;
  const sa = !!duel.a.suspicious;
  const sb = !!duel.b.suspicious;
  let winner = decideWinner(duel.a, duel.b);
  if (sa && !sb) winner = 'b';
  else if (sb && !sa) winner = 'a';
  else if (sa && sb) winner = 'draw';
  const claimed = await Duel.updateOne({ _id: duel._id, status: 'active' }, { $set: { status: 'finished', winner, finishedAt: now } });
  if (!claimed.modifiedCount) return;

  const users = await User.find({ _id: { $in: [duel.a.userId, duel.b.userId] } }).select('duel.rating').lean();
  const ratingOf = (id) => users.find((u) => String(u._id) === String(id))?.duel?.rating ?? DUEL.startRating;
  const rated = !sa && !sb;
  const elo = rated ? eloUpdate(ratingOf(duel.a.userId), ratingOf(duel.b.userId), resultFor(winner, 'a')) : { deltaA: 0, deltaB: 0 };
  const outcome = (side) => (winner === 'draw' ? 'draws' : winner === side ? 'wins' : 'losses');

  const set = {};
  for (const side of ['a', 'b']) {
    const p = duel[side];
    const delta = side === 'a' ? elo.deltaA : elo.deltaB;
    // Pipeline update: atomic like $inc, but older accounts without a `duel` field start at 1000, not 0.
    const bump = (field, by) => ({ $add: [{ $ifNull: [`$duel.${field}`, field === 'rating' ? DUEL.startRating : 0] }, by] });
    await User.updateOne({ _id: p.userId }, [
      { $set: { 'duel.rating': bump('rating', delta), 'duel.played': bump('played', 1), [`duel.${outcome(side)}`]: bump(outcome(side), 1) } },
    ]);
    const xp = p.suspicious ? 0 : await payXp(duel._id, side, p.userId, xpFor(winner, side));
    set[`${side}.ratingDelta`] = delta;
    set[`${side}.xp`] = xp;
  }
  await Duel.updateOne({ _id: duel._id }, { $set: set });

  // The player who finished first is the one waiting for the result.
  const first = new Date(duel.a.finishedAt) <= new Date(duel.b.finishedAt) ? 'a' : 'b';
  const me = duel[first];
  const them = duel[other(first)];
  const verdict = winner === 'draw' ? 'Durang' : winner === first ? 'Siz yutdingiz' : 'Siz yutqazdingiz';
  await notify(me.userId, `⚔️ Duel natijasi: ${verdict}`, `${them.name} bilan: ${me.score} — ${them.score}`, `/app/duel/${duel.code}`);
}

const neverStarted = (p) => !p.finishedAt && !(p.servedAt?.length || p.answers?.length);

/**
 * Lazy maintenance: expire unanswered invites, close runs past their deadline, settle.
 * A creator who never looked at a question is never "finished with 0/10": once their play deadline
 * passes the duel expires instead, so nobody can join and beat a ghost.
 */
async function maintain(duel, now) {
  let changed = false;
  if (duel.status === 'waiting' && (now > new Date(duel.expiresAt) || (neverStarted(duel.a) && now > new Date(duel.a.deadline)))) {
    const r = await Duel.updateOne({ _id: duel._id, status: 'waiting' }, { $set: { status: 'expired' } });
    changed = changed || r.modifiedCount > 0;
    // A creator who did start keeps their partial run as a finished result.
    if (!neverStarted(duel.a)) await finishPlayer(duel, 'a', now);
    return true;
  }
  if (duel.status === 'expired' || duel.status === 'declined') return false;
  for (const side of ['a', 'b']) {
    const p = duel[side];
    if (p && !p.finishedAt && now > new Date(p.deadline)) {
      await finishPlayer(duel, side, now);
      changed = true;
    }
  }
  if (duel.status === 'active') {
    const fresh = changed ? await Duel.findById(duel._id).select('status a.finishedAt b.finishedAt').lean() : duel;
    if (fresh?.a?.finishedAt && fresh?.b?.finishedAt) {
      await settle(duel._id, now);
      changed = true;
    }
  }
  return changed;
}

async function load(code, now) {
  if (typeof code !== 'string' || !/^[a-z0-9]{8}$/.test(code)) return null;
  let duel = await Duel.findOne({ code }).lean();
  if (duel && (await maintain(duel, now))) duel = await Duel.findOne({ code }).lean();
  return duel;
}

// ---------------------------------------------------------------- views

function playerView(p, { full }) {
  if (!p) return null;
  const base = { name: p.name, rating: p.rating, finished: !!p.finishedAt, started: (p.servedAt?.length || 0) > 0, progress: Math.min(p.answers?.length || 0, DUEL.words) };
  if (!full) return base;
  return { ...base, score: p.score, correct: p.correct, totalMs: p.totalMs, ratingDelta: p.ratingDelta || 0, xp: p.xp || 0 };
}

const OVER = new Set(['finished', 'expired', 'declined']);
/** The word list (and saving missed words) opens only once nobody can still play these questions. */
const reviewOpen = (duel, me) => !!me?.finishedAt && (OVER.has(duel.status) || !!duel[other(sideOf(duel, me.userId))]?.finishedAt);

/** What `userId` may see of a duel. The opponent's score shows only after I finished. */
export function duelView(duel, userId, now = new Date()) {
  const side = sideOf(duel, userId);
  const isInvitee = duel.invitedUserId && String(duel.invitedUserId) === String(userId);
  const me = side ? duel[side] : null;
  const opp = side ? duel[other(side)] : duel.a;
  const iFinished = !!me?.finishedAt;
  const playing = me && !me.finishedAt && now <= new Date(me.deadline) && (duel.status === 'active' || (duel.status === 'waiting' && side === 'a'));
  const joinable =
    !side && duel.status === 'waiting' && now <= new Date(duel.expiresAt) && (duel.mode !== 'friend' || isInvitee) && !(neverStarted(duel.a) && now > new Date(duel.a.deadline));
  const canReview = reviewOpen(duel, me);
  return {
    code: duel.code,
    mode: duel.mode,
    status: duel.status,
    side,
    createdAt: duel.createdAt,
    expiresAt: duel.expiresAt,
    winner: duel.status === 'finished' && iFinished ? duel.winner : null,
    rated: duel.status === 'finished' ? !(duel.a.suspicious || duel.b?.suspicious) : null,
    me: me
      ? { ...playerView(me, { full: true }), review: canReview ? reviewRows(duel.questions, me.answers) : null, savedWords: !!me.savedWords, missed: canReview ? missedWords(duel.questions, me.answers).length : 0 }
      : null,
    opponent: playerView(opp, { full: iFinished || duel.status === 'finished' }),
    invitee: side === 'a' && duel.mode === 'friend' && !duel.b ? { pending: duel.status === 'waiting' } : null,
    canPlay: !!playing,
    canJoin: !!joinable,
    canDecline: !!(isInvitee && !side && duel.status === 'waiting'),
    words: DUEL.words,
    limitMs: DUEL.answerMs,
  };
}

// ---------------------------------------------------------------- actions

async function insertDuel(doc) {
  for (let i = 0; i < 4; i++) {
    try {
      return (await Duel.create({ ...doc, code: duelCode() })).toObject();
    } catch (e) {
      if (e?.code !== 11000) throw e;
    }
  }
  throw new Error('duel code collision');
}

/**
 * POST /api/duels — { mode: 'random' | 'friend' | 'link', username? }
 * @returns {Promise<{ duel: object, matched?: boolean } | { error: string, status: number }>}
 */
export async function createDuel(userId, { mode, username } = {}, now = new Date()) {
  if (!['random', 'friend', 'link'].includes(mode)) return err('bad_mode', 400);
  const user = await User.findById(userId).select('name username duel').lean();
  if (!user) return err('not_found', 404);
  const rating = user.duel?.rating ?? DUEL.startRating;

  if (mode === 'random') {
    const base = { mode: 'random', status: 'waiting', b: null, 'a.userId': { $ne: user._id }, expiresAt: { $gt: now } };
    const join = { $set: { status: 'active', b: newPlayer(user, now) } };
    const matched =
      (await Duel.findOneAndUpdate({ ...base, ratingAtCreate: { $gte: rating - DUEL.matchWindow, $lte: rating + DUEL.matchWindow } }, join, { sort: { createdAt: 1 }, new: true }).lean()) ||
      (await Duel.findOneAndUpdate(base, join, { sort: { createdAt: 1 }, new: true }).lean());
    if (matched) return { duel: duelView(matched, userId, now), matched: true };
  }

  const open = await Duel.countDocuments({ 'a.userId': user._id, status: 'waiting', expiresAt: { $gt: now } });
  if (open >= DUEL.maxOpen) return err('too_many_open', 429);

  let invitee = null;
  if (mode === 'friend') {
    const name = String(username || '').trim().replace(/^@/, '').toLowerCase();
    if (!/^[a-z0-9_.]{3,32}$/.test(name)) return err('bad_username', 400);
    invitee = await User.findOne({ username: name }).select('_id name username').lean();
    if (!invitee) return err('user_not_found', 404);
    if (String(invitee._id) === String(user._id)) return err('self', 400);
    // Invites are a push channel: respect chat blocks (without disclosing them), one pending invite
    // per pair, and no more after repeated declines — otherwise decline-and-reinvite is spam.
    if (await Block.exists({ blockerId: invitee._id, blockedId: user._id })) return err('user_not_found', 404);
    const pending = await Duel.exists({ 'a.userId': user._id, invitedUserId: invitee._id, status: 'waiting', expiresAt: { $gt: now } });
    if (pending) return err('already_invited', 409);
    const declined = await Duel.countDocuments({ 'a.userId': user._id, invitedUserId: invitee._id, status: 'declined', createdAt: { $gt: new Date(now.getTime() - 86400000) } });
    if (declined >= DUEL.maxDeclinedPerDay) return err('invite_limit', 429);
  }

  const seed = crypto.randomInt(1, 2 ** 31);
  const questions = buildDuelQuestions(await duelPool(now.getTime()), seed);
  if (!questions) return err('no_words', 503);
  const duel = await insertDuel({
    mode, status: 'waiting', seed, questions, a: newPlayer(user, now), b: null, invitedUserId: invitee?._id || null,
    ratingAtCreate: rating, expiresAt: new Date(now.getTime() + DUEL.inviteTtlMs), createdAt: now,
  });
  if (invitee) await notify(invitee._id, `⚔️ ${displayName(user)} sizni so'z dueliga chaqirdi`, "Bir xil 10 so'z, har biriga 7 soniya. Kim tezroq?", `/app/duel/${duel.code}`);
  return { duel: duelView(duel, userId, now), matched: false };
}

/** GET /api/duels/:code */
export async function getDuel(userId, code, now = new Date()) {
  const duel = await load(code, now);
  if (!duel) return err('not_found', 404);
  const view = duelView(duel, userId, now);
  // Someone else's friend duel is private.
  if (!view.side && duel.mode === 'friend' && !(duel.invitedUserId && String(duel.invitedUserId) === String(userId))) return err('not_found', 404);
  return { duel: view };
}

/** POST /api/duels/:code/join */
export async function joinDuel(userId, code, now = new Date()) {
  const duel = await load(code, now);
  if (!duel) return err('not_found', 404);
  if (sideOf(duel, userId)) return { duel: duelView(duel, userId, now) };
  if (!duelView(duel, userId, now).canJoin) return err(duel.status === 'waiting' ? 'not_invited' : 'closed', 409);
  const user = await User.findById(userId).select('name username duel').lean();
  if (!user) return err('not_found', 404);
  const joined = await Duel.findOneAndUpdate({ _id: duel._id, status: 'waiting', b: null }, { $set: { status: 'active', b: newPlayer(user, now) } }, { new: true }).lean();
  if (!joined) return err('closed', 409);
  return { duel: duelView(joined, userId, now) };
}

/** POST /api/duels/:code/decline — the invited friend says no. */
export async function declineDuel(userId, code, now = new Date()) {
  const duel = await load(code, now);
  if (!duel) return err('not_found', 404);
  if (!duelView(duel, userId, now).canDecline) return err('closed', 409);
  const r = await Duel.updateOne({ _id: duel._id, status: 'waiting' }, { $set: { status: 'declined' } });
  if (r.modifiedCount) {
    const who = await User.findById(userId).select('name username').lean();
    await notify(duel.a.userId, `⚔️ ${displayName(who)} duelni rad etdi`, 'Boshqa raqib tanlang yoki havola orqali duel oching.', '/app/duel');
  }
  return { ok: true };
}

async function playerState(code, userId, now) {
  const duel = await load(code, now);
  if (!duel) return { e: err('not_found', 404) };
  const side = sideOf(duel, userId);
  if (!side) return { e: err('not_player', 403) };
  if (!duelView(duel, userId, now).canPlay) return { duel, side, done: true };
  return { duel, side };
}

const limitMs = DUEL.answerMs + DUEL.graceMs;

/**
 * POST /api/duels/:code/next — the current question (served once; the clock starts on the server).
 * @returns {Promise<{ question?: object, remainingMs?: number, done?: boolean, duel?: object } | { error: string, status: number }>}
 */
export async function nextQuestion(userId, code, now = new Date()) {
  for (let guard = 0; guard < DUEL.words + 2; guard++) {
    const st = await playerState(code, userId, now);
    if (st.e) return st.e;
    const { duel, side } = st;
    if (st.done) return { done: true, duel: duelView(duel, userId, now) };
    const p = duel[side];
    const idx = p.answers.length;
    if (idx >= DUEL.words) {
      await finishPlayer(duel, side, now);
      await maintain(await Duel.findById(duel._id).lean(), now);
      return { done: true, duel: duelView(await Duel.findById(duel._id).lean(), userId, now) };
    }
    const served = p.servedAt[idx];
    if (served) {
      const elapsed = now.getTime() - new Date(served).getTime();
      if (elapsed > limitMs) {
        // Never answered in time → timeout, then serve the next one.
        await Duel.updateOne({ _id: duel._id, [`${side}.answers`]: { $size: idx } }, { $push: { [`${side}.answers`]: timeoutAnswer() } });
        continue;
      }
      return { question: publicQuestion(duel.questions[idx], idx), remainingMs: Math.max(0, DUEL.answerMs - elapsed) };
    }
    await Duel.updateOne({ _id: duel._id, [`${side}.answers`]: { $size: idx }, [`${side}.servedAt`]: { $size: idx } }, { $push: { [`${side}.servedAt`]: now } });
    // Re-read: a parallel request may have stamped it first — its stamp wins.
  }
  return err('busy', 409);
}

/**
 * POST /api/duels/:code/answer — { index, choice }. Graded with the server's clock.
 * @returns {Promise<{ ok: boolean, correct: number, points: number, ms: number, late: boolean, score: number, done: boolean } | { error: string, status: number }>}
 */
export async function answerQuestion(userId, code, { index, choice } = {}, now = new Date()) {
  const st = await playerState(code, userId, now);
  if (st.e) return st.e;
  if (st.done) return err('finished', 409);
  const { duel, side } = st;
  const p = duel[side];
  if (!Number.isInteger(index) || index !== p.answers.length || !p.servedAt[index]) return err('stale', 409);
  const q = duel.questions[index];
  const g = gradeAnswer(q, Number.isInteger(choice) ? choice : -1, now.getTime() - new Date(p.servedAt[index]).getTime());
  const res = await Duel.updateOne({ _id: duel._id, [`${side}.answers`]: { $size: index } }, { $push: { [`${side}.answers`]: { ...g, choice: Number.isInteger(choice) ? choice : null } } });
  if (!res.modifiedCount) return err('stale', 409);
  const score = tally([...p.answers, g]).score;
  let done = false;
  if (index === DUEL.words - 1) {
    const fresh = await Duel.findById(duel._id).lean();
    await finishPlayer(fresh, side, now);
    await maintain(await Duel.findById(duel._id).lean(), now);
    done = true;
  }
  return { ok: g.ok, correct: q.answer, points: g.points, ms: g.ms, late: g.late, score, done };
}

/** POST /api/duels/:code/save-words — my missed words → "So'z dueli: xatolar" deck (once). */
export async function saveMissedWords(userId, code, now = new Date()) {
  const duel = await load(code, now);
  if (!duel) return err('not_found', 404);
  const side = sideOf(duel, userId);
  if (!side) return err('not_player', 403);
  const p = duel[side];
  if (!reviewOpen(duel, p)) return err('not_finished', 409);
  if (p.savedWords) return { added: 0, already: true, deck: DUEL_DECK_NAME };
  const missed = missedWords(duel.questions, p.answers);
  if (!missed.length) return { added: 0, deck: DUEL_DECK_NAME };
  const claim = await Duel.updateOne({ _id: duel._id, [`${side}.savedWords`]: { $ne: true } }, { $set: { [`${side}.savedWords`]: true } });
  if (!claim.modifiedCount) return { added: 0, already: true, deck: DUEL_DECK_NAME };
  const unclaim = () => Duel.updateOne({ _id: duel._id }, { $set: { [`${side}.savedWords`]: false } }).catch(() => {});
  let out;
  try {
    out = await addToSystemDeck(userId, DUEL_DECK_NAME, missed.map((m) => ({ word: m.word, syns: [m.uz], ...(m.ru && m.ru !== m.uz ? { synsRu: [m.ru] } : {}), enrichment: m.cefr ? { cefr: m.cefr } : undefined })));
  } catch (e) {
    await unclaim();
    throw e;
  }
  if (out.error) {
    await unclaim();
    return out.error === 'word_limit' ? { error: 'word_limit', status: 409, room: out.room } : err('not_found', 404);
  }
  return { added: out.added, deck: DUEL_DECK_NAME };
}

/** GET /api/duels — my rating and recent duels (plus invites waiting for me). */
export async function listDuels(userId, now = new Date()) {
  const uid = oid(userId);
  if (!(await User.exists({ _id: uid }))) return err('not_found', 404);
  const rows = await Duel.find({ $or: [{ 'a.userId': uid }, { 'b.userId': uid }, { invitedUserId: uid, status: 'waiting' }] })
    .sort({ createdAt: -1 })
    .limit(30)
    .select('-questions')
    .lean();
  const out = [];
  for (const d of rows) {
    const live = !OVER.has(d.status);
    const stale =
      live && ((d.status === 'waiting' && now > new Date(d.expiresAt)) || ['a', 'b'].some((s) => d[s] && !d[s].finishedAt && now > new Date(d[s].deadline)) || (d.status === 'active' && d.a.finishedAt && d.b?.finishedAt));
    const fresh = stale ? (await load(d.code, now)) : d;
    if (!fresh) continue;
    const v = duelView(fresh, userId, now);
    // An invite that expired before I answered is nothing to show.
    if (v.side || v.canJoin) out.push(v);
  }
  const user = await User.findById(uid).select('duel').lean(); // after the loop: settling may have moved the rating
  const stats = { rating: DUEL.startRating, played: 0, wins: 0, draws: 0, losses: 0, ...(user.duel || {}) };
  return { stats, duels: out, yourTurn: out.filter((d) => d.canPlay || d.canJoin).length };
}

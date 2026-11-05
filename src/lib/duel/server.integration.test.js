// So'z dueli server flow against in-memory MongoDB (TZ 2.0 §6.8.4, §7, §7.4).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, S;

const T0 = new Date('2026-11-05T10:00:00Z');
const plus = (ms, base = T0) => new Date(base.getTime() + ms);

describeDb('word duel (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.Duel.init();
    await M.XpEvent.init();
    S = await import('./server');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    S.resetDuelPoolCache();
    await Promise.all([M.User, M.Duel, M.XpEvent, M.Notification].map((m) => m.deleteMany({})));
  });

  let n = 0;
  const mkUser = (over = {}) => {
    n += 1;
    return M.User.create({ phone: `+99890200${String(n).padStart(4, '0')}`, password: 'x', name: `P${n}`, username: `player${n}`, ...over });
  };

  /** Plays a whole run: `plan[i]` = { right: bool, ms } or null (skip → timeout). Returns the clock after. */
  async function play(user, code, plan, start) {
    let now = start;
    for (let i = 0; i < 10; i++) {
      const step = plan[i];
      const nx = await S.nextQuestion(user._id, code, now);
      expect(nx.question.index).toBe(i);
      expect(JSON.stringify(nx)).not.toContain('"answer"');
      if (!step) {
        now = plus(9000, now); // never answered — the next call records a timeout
        continue;
      }
      const duel = await M.Duel.findOne({ code }).lean();
      const q = duel.questions[i];
      now = plus(step.ms, now);
      const res = await S.answerQuestion(user._id, code, { index: i, choice: step.right ? q.answer : (q.answer + 1) % 4 }, now);
      expect(res.ok).toBe(step.right);
      expect(res.correct).toBe(q.answer);
      now = plus(300, now);
    }
    // A trailing skipped question is recorded when the player asks for the next one.
    if (!plan[9]) await S.nextQuestion(user._id, code, now);
    return now;
  }
  const all = (right, ms) => Array.from({ length: 10 }, () => ({ right, ms }));

  it('random matchmaking: an open duel is joined, otherwise a new one is opened', async () => {
    const [a, b, c] = [await mkUser(), await mkUser(), await mkUser()];
    const first = await S.createDuel(a._id, { mode: 'random' }, T0);
    expect(first).toMatchObject({ matched: false, duel: { status: 'waiting', side: 'a', canPlay: true, opponent: null } });
    const second = await S.createDuel(b._id, { mode: 'random' }, plus(1000));
    expect(second).toMatchObject({ matched: true, duel: { code: first.duel.code, status: 'active', side: 'b', canPlay: true } });
    const third = await S.createDuel(c._id, { mode: 'random' }, plus(2000));
    expect(third.matched).toBe(false);
    expect(third.duel.code).not.toBe(first.duel.code);
    // Never matched with yourself.
    const again = await S.createDuel(c._id, { mode: 'random' }, plus(3000));
    expect(again.matched).toBe(false);
  });

  it('rating window first: the closer player is preferred over the older open duel', async () => {
    const [far, near, me] = [await mkUser({ duel: { rating: 1600 } }), await mkUser({ duel: { rating: 1050 } }), await mkUser()];
    await S.createDuel(far._id, { mode: 'random' }, T0);
    // Two open random duels at once (a newcomer would otherwise just join the first one).
    const nearDuel = await S.createDuel(near._id, { mode: 'link' }, plus(1000));
    await M.Duel.updateOne({ code: nearDuel.duel.code }, { $set: { mode: 'random' } });
    const got = await S.createDuel(me._id, { mode: 'random' }, plus(2000));
    expect(got.duel.code).toBe(nearDuel.duel.code);
    // Nobody close → anyone (the far duel).
    const fallback = await S.createDuel((await mkUser())._id, { mode: 'random' }, plus(3000));
    expect(fallback.matched).toBe(true);
  });

  it('a full duel: same words, server-timed scores, winner, ELO, XP, notification', async () => {
    const [a, b] = [await mkUser(), await mkUser()];
    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    const endA = await play(a, duel.code, all(true, 1000), plus(1000));
    const mid = await S.getDuel(a._id, duel.code, endA);
    expect(mid.duel).toMatchObject({ status: 'waiting', me: { finished: true, correct: 10, score: 10 * 143 }, winner: null });

    const joined = await S.joinDuel(b._id, duel.code, plus(60_000, endA));
    expect(joined.duel).toMatchObject({ side: 'b', status: 'active', opponent: { finished: true } });
    expect(joined.duel.opponent.score).toBeUndefined(); // B can't see A's score before playing
    const endB = await play(b, duel.code, [...all(true, 3000).slice(0, 8), { right: false, ms: 2000 }, null], plus(61_000, endA));

    const resA = (await S.getDuel(a._id, duel.code, endB)).duel;
    const resB = (await S.getDuel(b._id, duel.code, endB)).duel;
    expect(resA).toMatchObject({ status: 'finished', winner: 'a', me: { ratingDelta: 16, xp: 30 }, opponent: { correct: 8, ratingDelta: -16, xp: 10 } });
    expect(resB).toMatchObject({ winner: 'a', me: { correct: 8, missed: 2, ratingDelta: -16 } });
    expect(resB.me.review).toHaveLength(10);

    const [ua, ub] = await Promise.all([M.User.findById(a._id).lean(), M.User.findById(b._id).lean()]);
    expect(ua.duel).toMatchObject({ rating: 1016, played: 1, wins: 1 });
    expect(ub.duel).toMatchObject({ rating: 984, played: 1, losses: 1 });
    expect(ua.xp).toBe(30);
    expect(await M.XpEvent.countDocuments({ sourceType: 'duel' })).toBe(2);
    // A finished first and was waiting → A gets the result notification.
    const notes = await M.Notification.find({ type: 'duel' }).lean();
    expect(notes).toHaveLength(1);
    expect(String(notes[0].userId)).toBe(String(a._id));
    expect(notes[0].title).toContain('Siz yutdingiz');

    // Settling again (another read) changes nothing.
    await S.getDuel(b._id, duel.code, plus(1000, endB));
    expect((await M.User.findById(a._id).lean()).duel.rating).toBe(1016);
  });

  it('anti-cheat: server clock, one answer per question, reload keeps the clock, skips time out', async () => {
    const a = await mkUser();
    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    const code = duel.code;
    expect(await S.answerQuestion(a._id, code, { index: 0, choice: 0 }, T0)).toMatchObject({ error: 'stale' }); // not served yet
    const q0 = await S.nextQuestion(a._id, code, plus(100));
    expect(q0.remainingMs).toBe(7000);
    const again = await S.nextQuestion(a._id, code, plus(5100));
    expect(again.question.index).toBe(0);
    expect(again.remainingMs).toBe(2000); // reload does not restart the clock
    const right = (await M.Duel.findOne({ code }).lean()).questions[0].answer;
    expect(await S.answerQuestion(a._id, code, { index: 1, choice: right }, plus(5200))).toMatchObject({ error: 'stale' });
    const late = await S.answerQuestion(a._id, code, { index: 0, choice: right }, plus(9000)); // 8.9 s after serving
    expect(late).toMatchObject({ ok: false, late: true, points: 0 });
    expect(await S.answerQuestion(a._id, code, { index: 0, choice: right }, plus(9100))).toMatchObject({ error: 'stale' });

    await S.nextQuestion(a._id, code, plus(10_000)); // q1 served
    const skip = await S.nextQuestion(a._id, code, plus(20_000)); // q1 never answered → timeout, q2 served
    expect(skip.question.index).toBe(2);
    const d = await M.Duel.findOne({ code }).lean();
    expect(d.a.answers).toHaveLength(2);
    expect(d.a.answers[1]).toMatchObject({ late: true, points: 0 });
    // Not a player → refused.
    const stranger = await mkUser();
    expect(await S.nextQuestion(stranger._id, code, plus(21_000))).toMatchObject({ error: 'not_player', status: 403 });
  });

  it('bot-speed answers: flagged, no rating change, the honest player wins', async () => {
    const [bot, human] = [await mkUser(), await mkUser()];
    const { duel } = await S.createDuel(bot._id, { mode: 'link' }, T0);
    const endBot = await play(bot, duel.code, all(true, 60), plus(10));
    await S.joinDuel(human._id, duel.code, endBot);
    const end = await play(human, duel.code, all(false, 2000), plus(1000, endBot));
    const v = (await S.getDuel(human._id, duel.code, end)).duel;
    expect(v).toMatchObject({ winner: 'b', me: { ratingDelta: 0, xp: 30 }, opponent: { ratingDelta: 0, xp: 0 } });
    expect((await M.User.findById(bot._id).lean()).duel.rating).toBe(1000);
  });

  it('friend duel: invite by username, private to the invitee, join or decline', async () => {
    const [a, friend, other] = [await mkUser(), await mkUser(), await mkUser()];
    expect(await S.createDuel(a._id, { mode: 'friend', username: 'nobody_here' }, T0)).toMatchObject({ error: 'user_not_found' });
    expect(await S.createDuel(a._id, { mode: 'friend', username: a.username }, T0)).toMatchObject({ error: 'self' });
    expect(await S.createDuel(a._id, { mode: 'friend', username: 'x y' }, T0)).toMatchObject({ error: 'bad_username' });
    const { duel } = await S.createDuel(a._id, { mode: 'friend', username: `@${friend.username}` }, T0);
    expect(duel.invitee).toEqual({ pending: true });
    const note = await M.Notification.findOne({ userId: friend._id }).lean();
    expect(note).toMatchObject({ type: 'duel', link: `/app/duel/${duel.code}` });

    expect(await S.getDuel(other._id, duel.code, plus(1000))).toMatchObject({ error: 'not_found' });
    expect(await S.joinDuel(other._id, duel.code, plus(1000))).toMatchObject({ error: 'not_invited', status: 409 });
    const seen = await S.getDuel(friend._id, duel.code, plus(1000));
    expect(seen.duel).toMatchObject({ canJoin: true, canDecline: true, side: null });
    expect((await S.listDuels(friend._id, plus(1000))).yourTurn).toBe(1);

    expect(await S.declineDuel(friend._id, duel.code, plus(2000))).toEqual({ ok: true });
    expect((await S.getDuel(a._id, duel.code, plus(3000))).duel.status).toBe('declined');
    expect(await S.joinDuel(friend._id, duel.code, plus(4000))).toMatchObject({ error: 'closed' });
  });

  it('expiry: an unanswered invite expires; an unfinished run is closed with timeouts and settled', async () => {
    const [a, b] = [await mkUser(), await mkUser()];
    const lonely = await S.createDuel(a._id, { mode: 'random' }, T0);
    const later = plus(49 * 3600_000);
    const exp = await S.getDuel(a._id, lonely.duel.code, later);
    expect(exp.duel).toMatchObject({ status: 'expired', canPlay: false, me: { finished: true } });
    expect(await S.joinDuel(b._id, lonely.duel.code, later)).toMatchObject({ error: 'closed' });

    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    const endA = await play(a, duel.code, all(true, 2000), plus(1000));
    await S.joinDuel(b._id, duel.code, endA);
    await S.nextQuestion(b._id, duel.code, plus(1000, endA)); // B looks at one question and leaves
    const list = await S.listDuels(a._id, plus(25 * 3600_000, endA));
    const row = list.duels.find((d) => d.code === duel.code);
    expect(row).toMatchObject({ status: 'finished', winner: 'a', opponent: { finished: true, correct: 0 } });
    expect(list.stats).toMatchObject({ rating: 1016, played: 1, wins: 1 });
  });

  it('missed words go to the "So\'z dueli: xatolar" deck once', async () => {
    const a = await mkUser();
    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    expect(await S.saveMissedWords(a._id, duel.code, plus(10))).toMatchObject({ error: 'not_finished' });
    await play(a, duel.code, [...all(true, 1500).slice(0, 7), { right: false, ms: 1500 }, { right: false, ms: 1500 }, null], plus(10));
    const saved = await S.saveMissedWords(a._id, duel.code, plus(600_000));
    expect(saved).toMatchObject({ added: 3, deck: "So'z dueli: xatolar" });
    expect(await S.saveMissedWords(a._id, duel.code, plus(600_100))).toMatchObject({ added: 0, already: true });
    const u = await M.User.findById(a._id).lean();
    const deck = u.categories.find((c) => c.name === "So'z dueli: xatolar");
    expect(deck.words).toHaveLength(3);
    expect(deck.words[0].syns[0]).toBeTruthy();
  });

  it('at most 5 open duels per player', async () => {
    const a = await mkUser();
    for (let i = 0; i < 5; i++) expect((await S.createDuel(a._id, { mode: 'link' }, plus(i))).duel).toBeTruthy();
    expect(await S.createDuel(a._id, { mode: 'link' }, plus(10))).toMatchObject({ error: 'too_many_open', status: 429 });
    expect(await S.createDuel(a._id, { mode: 'nope' }, plus(10))).toMatchObject({ error: 'bad_mode' });
  });

  it('accounts created before duels existed (no duel field) start from 1000, not 0', async () => {
    const [a, b] = [await mkUser(), await mkUser()];
    await M.User.collection.updateMany({ _id: { $in: [a._id, b._id] } }, { $unset: { duel: '' } });
    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    const endA = await play(a, duel.code, all(true, 1000), plus(10));
    await S.joinDuel(b._id, duel.code, endA);
    await play(b, duel.code, all(false, 1000), plus(10, endA));
    const [ua, ub] = await Promise.all([M.User.collection.findOne({ _id: a._id }), M.User.collection.findOne({ _id: b._id })]);
    expect(ua.duel).toEqual({ rating: 1016, played: 1, wins: 1 });
    expect(ub.duel).toEqual({ rating: 984, played: 1, losses: 1 });
  });

  it('concurrent joins: only one second player gets in', async () => {
    const [a, b, c] = [await mkUser(), await mkUser(), await mkUser()];
    const { duel } = await S.createDuel(a._id, { mode: 'link' }, T0);
    const res = await Promise.all([S.joinDuel(b._id, duel.code, plus(5)), S.joinDuel(c._id, duel.code, plus(5))]);
    expect(res.filter((r) => r.duel?.side === 'b')).toHaveLength(1);
    expect(res.filter((r) => r.error === 'closed')).toHaveLength(1);
  });
});

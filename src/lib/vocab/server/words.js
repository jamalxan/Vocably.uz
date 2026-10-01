// User.categories[].words[] -> o'yin/tanlov/tahlil uchun tekis ro'yxat va so'z statistikasini
// yangilash (SRS + mastery + skills). Barcha hisob-kitob sof funksiyalarda (src/lib/vocab/*.ts),
// bu yerda faqat ma'lumot shakllantirish va atomik yozish.
import mongoose from 'mongoose';
import { User } from '@/lib/models';
import { cardFromStats, levelFromIntervalDays, nextReviewState, ratingFromOutcome } from '@/lib/srs';
import { computeMastery, applySkillResult } from '@/lib/vocab/mastery';
import { analyzeWeakness } from '@/lib/vocab/weakness';

const HIGH_CEFR = new Set(['B2', 'C1', 'C2']);

/** Mongoose/lean `stats` -> mastery/weakness hisoblash uchun oddiy obyekt. */
export function statsToInput(stats = {}) {
  const skills = {};
  const raw = stats.skills && typeof stats.skills.toObject === 'function' ? stats.skills.toObject() : stats.skills || {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && typeof v === 'object') skills[k] = { correct: v.correct || 0, wrong: v.wrong || 0 };
  }
  return {
    skills,
    avgResponseMs: stats.avgResponseMs ?? null,
    streakCount: stats.streakCount || 0,
    correct: stats.correct || 0,
    wrong: stats.wrong || 0,
    intervalDays: stats.intervalDays || 0,
    lapses: stats.lapses || 0,
    reps: stats.reps || 0,
    isLeech: !!stats.isLeech,
    lastWrongAt: stats.lastWrongAt || null,
  };
}

/** Bitta so'zni o'yin/tanlov formatiga o'giradi (mastery/weakness hisoblab). */
export function toSelectableWord(word, category, now = new Date()) {
  const e = word.enrichment || {};
  const stats = word.stats || {};
  const input = statsToInput(stats);
  const mastery = computeMastery(input).score;
  const weak = analyzeWeakness(input, now);
  return {
    wordId: String(word._id),
    categoryId: String(category._id),
    word: word.word,
    translations: (word.syns || []).filter(Boolean),
    definitionEn: e.definitionEn || '',
    definitionUz: e.definitionUz || '',
    examples: (e.examples || []).filter((x) => x && x.en).map((x) => ({ en: x.en, uz: x.uz || '' })),
    synonymsEn: (e.synonymsEn || []).filter(Boolean),
    antonyms: (e.antonyms || []).filter(Boolean),
    collocations: (e.collocations || []).filter(Boolean),
    pos: e.pos || '',
    cefr: e.cefr || '',
    imageUrl: e.imageUrl || '',
    // SRS / tanlov signallari
    nextReview: stats.nextReview || null,
    srsState: stats.srsState || 'new',
    lapses: stats.lapses || 0,
    reps: stats.reps || 0,
    isLeech: !!stats.isLeech,
    mastery,
    weakness: weak.score,
    ieltsRelevance: HIGH_CEFR.has(e.cefr) || e.ieltsSkillTag ? 1 : 0,
  };
}

/** Foydalanuvchining barcha so'zlari (ixtiyoriy kategoriya bo'yicha). */
export function flattenUserWords(user, { categoryId = '', now = new Date() } = {}) {
  const out = [];
  for (const cat of user.categories || []) {
    if (categoryId && String(cat._id) !== String(categoryId)) continue;
    for (const w of cat.words || []) {
      if (!w?.word) continue;
      out.push(toSelectableWord(w, cat, now));
    }
  }
  return out;
}

/**
 * Bitta so'zga bir nechta javob natijasini ketma-ket qo'llaydi va `$set` xaritasini qaytaradi.
 * `results`: [{ skill, secondarySkill?, isCorrect, responseMs }]
 * SRS qoidasi (TZ §7.3): xato — har doim "again" (lapse); to'g'ri javob — faqat so'z hozir due/learning bo'lsa
 * SRS oralig'ini oshiradi (o'yinda takror-takror to'g'ri javob sun'iy interval bermasin).
 */
export function computeWordUpdate(stats = {}, results, now = new Date()) {
  let state = {
    ...statsToInput(stats),
    lastFormat: stats.lastFormat || null,
    lastSeenAt: stats.lastSeenAt || null,
  };
  let card = cardFromStats({
    level: stats.level,
    correct: stats.correct,
    wrong: stats.wrong,
    srsState: stats.srsState,
    ease: stats.ease,
    intervalDays: stats.intervalDays,
    learningStep: stats.learningStep,
    lapses: stats.lapses,
    reps: stats.reps,
  });
  const wasNew = card.state === 'new' && (card.reps || 0) === 0;
  const hadMasteredAt = !!stats.masteredAt;

  let correct = stats.correct || 0;
  let wrong = stats.wrong || 0;
  let nextReview = stats.nextReview ? new Date(stats.nextReview) : now;
  let srsChanged = false;
  let firstCorrectOnNew = false;
  let isLeech = !!stats.isLeech;
  let level = stats.level || 0;

  for (const r of results) {
    state = applySkillResult(state, r.skill, r.isCorrect, r.responseMs, now);
    if (r.secondarySkill) state = applySkillResult({ ...state, avgResponseMs: state.avgResponseMs }, r.secondarySkill, r.isCorrect, null, now);
    if (r.isCorrect) correct += 1;
    else wrong += 1;

    const dueNow = nextReview.getTime() <= now.getTime() || card.state !== 'review';
    if (!r.isCorrect) {
      const res = nextReviewState(card, 1, now);
      card = res;
      nextReview = res.dueAt;
      isLeech = res.isLeech;
      srsChanged = true;
    } else if (dueNow) {
      if (wasNew && card.state === 'new' && (card.reps || 0) === 0) firstCorrectOnNew = true;
      const res = nextReviewState(card, ratingFromOutcome(true, r.responseMs), now);
      card = res;
      nextReview = res.dueAt;
      isLeech = res.isLeech;
      srsChanged = true;
    }
  }

  const mastery = computeMastery({
    skills: state.skills,
    avgResponseMs: state.avgResponseMs,
    streakCount: state.streakCount,
    correct,
    wrong,
    intervalDays: card.intervalDays,
    lapses: card.lapses,
    reps: card.reps,
  });
  level = srsChanged ? levelFromIntervalDays(card.intervalDays) : level;

  const set = {
    skills: state.skills,
    avgResponseMs: state.avgResponseMs ?? null,
    streakCount: state.streakCount || 0,
    mastery: mastery.score,
    masteryVersion: mastery.version,
    lastFormat: state.lastFormat || '',
    lastSeenAt: now,
    correct,
    wrong,
    lastReviewed: now,
  };
  if (state.lastWrongAt) set.lastWrongAt = state.lastWrongAt;
  if (srsChanged) {
    Object.assign(set, {
      srsState: card.state,
      ease: card.ease,
      intervalDays: card.intervalDays,
      learningStep: card.learningStep,
      lapses: card.lapses,
      reps: card.reps,
      isLeech,
      nextReview,
      level,
    });
  }
  const newlyMastered = mastery.status === 'mastered' && !hadMasteredAt;
  if (newlyMastered) set.masteredAt = now;

  return { set, mastery, firstCorrectOnNew, newlyMastered, srsChanged };
}

const oid = (v) => new mongoose.Types.ObjectId(String(v));

/** `updates`: [{ categoryId, wordId, set }] — atomik (har so'z alohida $set, arrayFilters). */
export async function applyWordUpdates(userId, updates) {
  if (!updates.length) return;
  const ops = updates.map((u) => {
    const $set = {};
    for (const [k, v] of Object.entries(u.set)) $set[`categories.$[c].words.$[w].stats.${k}`] = v;
    return {
      updateOne: {
        filter: { _id: oid(userId) },
        update: { $set },
        arrayFilters: [{ 'c._id': oid(u.categoryId) }, { 'w._id': oid(u.wordId) }],
      },
    };
  });
  await User.bulkWrite(ops, { ordered: false });
}

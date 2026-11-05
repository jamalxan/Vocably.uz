import { ReviewEvent } from '@/lib/models';
import { nextReviewState, cardFromStats, levelFromIntervalDays } from '@/lib/srs';

// One SRS review applied to a word of a loaded (not lean) user document —
// shared by the web review endpoint and the Telegram mini-test, so both
// move the schedule in exactly the same way. The caller saves the user;
// `logReviewEvent` is separate because it must run after the save. The streak is
// not touched here: since TZ 2.0 it counts plan tasks (touchPlan in plan/server.js).
// `user` is unused but kept in the signature for callers.
export function applyWordReview(user, word, { correct, rating, now = new Date() }) {
  if (!word.stats) word.stats = {};
  const prevCard = cardFromStats(word.stats);
  const result = nextReviewState(prevCard, rating, now);

  word.stats.srsState = result.state;
  word.stats.ease = result.ease;
  word.stats.intervalDays = result.intervalDays;
  word.stats.learningStep = result.learningStep;
  word.stats.lapses = result.lapses;
  word.stats.reps = result.reps;
  word.stats.isLeech = result.isLeech;
  word.stats.nextReview = result.dueAt;
  word.stats.level = levelFromIntervalDays(result.intervalDays);
  word.stats.correct = (word.stats.correct || 0) + (correct ? 1 : 0);
  word.stats.wrong = (word.stats.wrong || 0) + (correct ? 0 : 1);
  word.stats.lastReviewed = now;

  void user;

  return { prevCard, result };
}

export async function logReviewEvent({ userId, categoryId, wordId, mode, rating, correct, prevCard, result, now }) {
  try {
    await ReviewEvent.create({
      userId,
      categoryId,
      wordId,
      mode,
      rating,
      isCorrect: correct,
      prevState: prevCard.state,
      newState: result.state,
      prevIntervalDays: prevCard.intervalDays,
      newIntervalDays: result.intervalDays,
      prevEase: prevCard.ease,
      newEase: result.ease,
      reviewedAt: now,
    });
  } catch (err) {
    console.error('ReviewEvent yozishda xatolik', err);
  }
}

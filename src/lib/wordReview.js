import { ReviewEvent } from '@/lib/models';
import { nextReviewState, cardFromStats, levelFromIntervalDays, computeStreakUpdate } from '@/lib/srs';

// One SRS review applied to a word of a loaded (not lean) user document —
// shared by the web review endpoint and the Telegram mini-test, so both
// move the schedule and the streak in exactly the same way. The caller saves
// the user; `logReviewEvent` is separate because it must run after the save.
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

  const { streak, lastReviewDate } = computeStreakUpdate(now, user.timezone || 'Asia/Tashkent', user.reviewStreak || 0, user.lastReviewDate);
  user.reviewStreak = streak;
  user.lastReviewDate = lastReviewDate;
  user.longestReviewStreak = Math.max(user.longestReviewStreak || 0, streak);

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

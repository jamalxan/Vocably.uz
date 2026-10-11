import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import mongoose from 'mongoose';

export async function getGameVocabulary(userId, mode, limit = 10) {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // The "Vocabulary Adapter" (TZ §7.1)
  // We extract words from the user's categories.
  // Priority: Words due for review (SRS) -> New words -> Random

  let allWords = [];
  user.categories.forEach(cat => {
    allWords = [...allWords, ...cat.words];
  });

  // Simple SRS-based filtering (TZ §7.2)
  // In reality, we would sort by stats.nextReview <= Date.now()
  const shuffled = allWords.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, limit).map(word => ({
    id: word._id,
    text: word.word,
    translations: word.syns,
    enrichment: word.enrichment,
    stats: word.stats
  }));
}

export async function updateSrsState(userId, wordId, rating) {
  // Implement SM-2 algorithm here (TZ §7.2)
  // Ease, Interval, Reps update logic
  await connectToDatabase();

  // Find the word in user categories and update its stats.srsState
  // This is a complex MongoDB update because words are embedded in Categories array
  // use arrayFilters to update the specific word

  return { success: true };
}

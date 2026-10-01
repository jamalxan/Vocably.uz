// So'z tavani (src/lib/vocab/wordCap.ts) — server tomoni: foydalanuvchining so'zlar sonini DB'da hisoblaydi
// (hujjatni yuklamasdan) va qo'shishdan oldin tekshiradi.
import mongoose from 'mongoose';
import { User } from '@/lib/models';
import { WORD_CAP_MESSAGE, wordRoom } from '@/lib/vocab/wordCap';
import { ServiceError } from './sessionService';

/** Foydalanuvchining barcha kategoriyalaridagi so'zlar soni (server tomonda, $size bilan). */
export async function countUserWords(userId) {
  const [row] = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(String(userId)) } },
    { $project: { _id: 0, n: { $sum: { $map: { input: { $ifNull: ['$categories', []] }, as: 'c', in: { $size: { $ifNull: ['$$c.words', []] } } } } } } },
  ]);
  return row?.n || 0;
}

/**
 * @param {string} userId
 * @param {number} adding  qo'shilmoqchi so'zlar soni
 * @returns {Promise<{current:number, room:number, fits:boolean}>}
 */
export async function checkWordRoom(userId, adding) {
  const current = await countUserWords(userId);
  return { current, ...wordRoom(current, adding) };
}

/** Sig'masa 409 `word_limit` tashlaydi (hammasi yoki hech narsa — qisman qo'shmaydi). */
export async function assertWordRoom(userId, adding) {
  const r = await checkWordRoom(userId, adding);
  if (!r.fits) throw new ServiceError(409, WORD_CAP_MESSAGE(), 'word_limit', { room: r.room });
  return r;
}

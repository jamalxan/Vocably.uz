import { duelRoute } from '@/lib/duel/http';
import { saveMissedWords } from '@/lib/duel/server';

export async function POST(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'save-words', (userId, now) => saveMissedWords(userId, code, now), { limit: 10 });
}

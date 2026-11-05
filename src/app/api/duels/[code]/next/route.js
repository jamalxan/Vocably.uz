import { duelRoute } from '@/lib/duel/http';
import { nextQuestion } from '@/lib/duel/server';

export async function POST(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'next', (userId) => nextQuestion(userId, code), { limit: 60 });
}

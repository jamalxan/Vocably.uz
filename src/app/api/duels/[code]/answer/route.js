import { duelRoute, readJson } from '@/lib/duel/http';
import { answerQuestion } from '@/lib/duel/server';

// { index, choice } — graded with the server's clock (TZ 2.0 §7.4 anti-cheat).
export async function POST(req, { params }) {
  const { code } = await params;
  const body = await readJson(req);
  return duelRoute(req, 'answer', (userId, now) => answerQuestion(userId, code, { index: body.index, choice: body.choice }, now), { limit: 60 });
}

import { duelRoute } from '@/lib/duel/http';
import { getDuel } from '@/lib/duel/server';

export async function GET(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'get', (userId, now) => getDuel(userId, code, now), { limit: 120 });
}

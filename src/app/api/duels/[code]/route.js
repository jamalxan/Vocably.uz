import { duelRoute } from '@/lib/duel/http';
import { getDuel } from '@/lib/duel/server';

export async function GET(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'get', (userId) => getDuel(userId, code), { limit: 120 });
}

import { duelRoute } from '@/lib/duel/http';
import { joinDuel } from '@/lib/duel/server';

export async function POST(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'join', (userId, now) => joinDuel(userId, code, now), { limit: 20 });
}

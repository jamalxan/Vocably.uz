import { duelRoute } from '@/lib/duel/http';
import { declineDuel } from '@/lib/duel/server';

export async function POST(req, { params }) {
  const { code } = await params;
  return duelRoute(req, 'decline', (userId) => declineDuel(userId, code), { limit: 20 });
}

import { duelRoute, readJson } from '@/lib/duel/http';
import { createDuel, listDuels } from '@/lib/duel/server';

// So'z dueli (TZ 2.0 §6.8.4). GET — my rating + recent duels; POST { mode, username? } — new duel / matchmaking.
export async function GET(req) {
  return duelRoute(req, 'list', (userId) => listDuels(userId));
}

export async function POST(req) {
  const body = await readJson(req);
  return duelRoute(req, 'create', (userId) => createDuel(userId, { mode: body.mode, username: body.username }), { limit: 10 });
}

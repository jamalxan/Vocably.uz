import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError } from '@/lib/vocab/server/route';
import { buildGamificationProfile } from '@/lib/vocab/server/profileService';

// GET /api/gamification/profile — XP, daraja, streak, yutuqlar, kvestlar, lug'at ko'rinishi va kunlik reja (TZ §44, §69).
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req);
    if (error) return error;
    const profile = await buildGamificationProfile(user);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err, 'gamification/profile');
  }
}

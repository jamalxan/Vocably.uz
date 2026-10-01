import { NextResponse } from 'next/server';
import { User } from '@/lib/models';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { REMINDER_FREQUENCIES, normalizePrefs } from '@/lib/vocab/reminders';

// GET/PATCH /api/vocabulary/reminders — { enabled, frequency } (TZ §55: chastota foydalanuvchi sozlamasi bilan boshqariladi)
export async function GET(req) {
  try {
    const { user, error } = await requireVocabUser(req, { select: 'role vocabReminders' });
    if (error) return error;
    const { enabled, frequency } = normalizePrefs(user.vocabReminders);
    return NextResponse.json({ enabled, frequency });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/reminders GET');
  }
}

export async function PATCH(req) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const body = await readJson(req);
    const set = {};
    if (typeof body?.enabled === 'boolean') set['vocabReminders.enabled'] = body.enabled;
    if (REMINDER_FREQUENCIES.includes(body?.frequency)) set['vocabReminders.frequency'] = body.frequency;
    if (!Object.keys(set).length) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    const u = await User.findByIdAndUpdate(userId, { $set: set }, { new: true, projection: { vocabReminders: 1 } }).lean();
    const { enabled, frequency } = normalizePrefs(u?.vocabReminders);
    return NextResponse.json({ enabled, frequency });
  } catch (err) {
    return handleRouteError(err, 'vocabulary/reminders PATCH');
  }
}

import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { ATTEMPT_EVENT_TYPES } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const MAX_EVENTS = 200; // urinish boshiga — halollik logi cheksiz o'smasin (TZ §14, "bloklamaydi" qoidasi)

// TZ-vocably-v2.md §4/§14 — "POST /attempts/:id/event — Integrity log: tab
// switch, fullscreen exit, paste". Faqat LOGLAYDI, hech narsani bloklamaydi
// yoki taqiqlamaydi (TZ §14: "maqsad — tasodifiy aldashni qiyinlashtirish,
// professional aldovni to'xtatish emas").
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const attempt = await getOwnedAttempt(params.id, userId);

    const { type, meta } = await req.json().catch(() => ({}));
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: "'type' shart" }, { status: 400 });
    }
    if (!ATTEMPT_EVENT_TYPES.includes(type)) {
      return NextResponse.json({ error: `Noma'lum event turi: '${type}'` }, { status: 400 });
    }

    if (attempt.events.length < MAX_EVENTS) {
      attempt.events.push({ type, at: new Date(), meta: meta ?? null });
    }
    if (type === 'visibility_hidden') attempt.tabSwitchCount += 1;
    await attempt.save();

    return NextResponse.json({ logged: true, tabSwitchCount: attempt.tabSwitchCount });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:event');
  }
}

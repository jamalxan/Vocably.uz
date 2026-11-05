import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { completeTask } from '@/lib/plan/server';

const KEY_RE = /^[a-z][a-z-]{0,30}$/;

// Manual tick for plan tasks the server can't detect on its own (skill / mock).
export async function POST(req, { params }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    const { key } = await params;
    if (!KEY_RE.test(key || '')) return NextResponse.json({ error: "Vazifa noto'g'ri" }, { status: 400 });
    await connectToDatabase();
    const out = await completeTask(userId, key);
    if (out.error) {
      const msg = out.error === 'auto_task' ? 'Bu vazifa avtomatik belgilanadi' : 'Vazifa topilmadi';
      return NextResponse.json({ error: msg }, { status: out.status });
    }
    return NextResponse.json(out);
  } catch (err) {
    return serverError(err, 'plan/tasks/complete');
  }
}

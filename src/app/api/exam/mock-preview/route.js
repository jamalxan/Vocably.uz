import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { mockPreview } from '@/lib/exam/mockPools';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Mock intro screen data: whether a mock can be started right now, whether it
// will be a full-format or Mini mock, and typical section durations/sizes —
// real numbers from the pool that POST /api/exam/attempts will draw from
// (N-05: the intro used to hardcode "Listening 30 daq" regardless of content).
export async function GET(req) {
  try {
    if (!await getUserIdFromRequest(req)) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    return NextResponse.json(await mockPreview());
  } catch (err) {
    return serverError(err, 'exam/mock-preview');
  }
}

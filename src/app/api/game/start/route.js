import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { GameSession, WorldProgress } from '@/lib/models/game';
import { User } from '@/lib/models';
import { auth } from '@/lib/auth'; // Assuming auth() provides the current user session

export async function POST(req) {
  try {
    // 1. Authentication Guard
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mode } = await req.json();
    if (!['memory', 'runner', 'lab', 'boss'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    await connectToDatabase();

    // 2. Check for existing active sessions to prevent duplicates
    const activeSession = await GameSession.findOne({
      userId: session.user.id,
      status: 'in_progress'
    });

    if (activeSession) {
      return NextResponse.json({
        session: activeSession,
        message: 'Resuming existing session'
      });
    }

    // 3. Create new session
    const newSession = await GameSession.create({
      userId: session.user.id,
      mode,
      status: 'in_progress',
      state: { round: 0, currentWordId: null }
    });

    // 4. Initialize WorldProgress if not exists
    await WorldProgress.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { lastActiveAt: new Date() } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      session: newSession,
      message: 'Session started successfully'
    });

  } catch (error) {
    console.error('Game Session Start Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

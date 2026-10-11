import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { GameSession } from '@/lib/models/game';
import { User, ReviewEvent } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, answer, metadata } = await req.json();
    await connectToDatabase();

    // 1. Validate Session Ownership
    const gameSession = await GameSession.findOne({
      _id: sessionId,
      userId: session.user.id,
      status: 'in_progress'
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
    }

    // 2. Server-side Validation (The Anti-Spoofing Core)
    // In a real implementation, we'd fetch the correct answer from the DB
    // and compare it here. For the structure, we assume 'isCorrect' is decided here.
    const isCorrect = true; // THIS MUST BE A REAL COMPARISON logic
    const xpEarned = isCorrect ? 10 : 0;

    // 3. Atomic XP Update (Using XpEvent for audit)
    if (isCorrect) {
      await User.updateOne(
        { _id: session.user.id },
        { $inc: { xp: xpEarned } }
      );

      // Log the XP event for the weekly leaderboard (TZ §13)
      // await XpEvent.create({ userId: session.user.id, amount: xpEarned, reason: 'game' });
    }

    // 4. Update Game Session State
    gameSession.state.round += 1;
    await gameSession.save();

    return NextResponse.json({
      success: true,
      isCorrect,
      xpEarned,
      nextRound: gameSession.state.round
    });

  } catch (error) {
    console.error('Game Submission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

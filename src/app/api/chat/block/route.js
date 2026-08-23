import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Block, User } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { userId } = await req.json();
    if (!userId || String(userId) === String(user._id)) {
      return NextResponse.json({ error: "Noto'g'ri foydalanuvchi" }, { status: 400 });
    }
    const target = await User.findById(userId).select('_id');
    if (!target) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    await Block.findOneAndUpdate(
      { blockerId: user._id, blockedId: target._id },
      { $setOnInsert: { blockerId: user._id, blockedId: target._id } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/block POST');
  }
}

export async function DELETE(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId kerak" }, { status: 400 });

    await Block.deleteOne({ blockerId: user._id, blockedId: userId });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/block DELETE');
  }
}

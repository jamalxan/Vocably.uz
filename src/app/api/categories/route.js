import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Kategoriya nomi bo'sh bo'lmasin" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    user.categories.push({ name: name.trim(), words: [] });
    await user.save();
    const created = user.categories[user.categories.length - 1];

    return NextResponse.json({ success: true, category: created });
  } catch (err) {
    return serverError(err, 'categories');
  }
}

export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId, name } = await req.json();
    if (!categoryId || !name || !name.trim()) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const result = await User.updateOne(
      { _id: userId, 'categories._id': categoryId },
      { $set: { 'categories.$.name': name.trim() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'categories');
  }
}

export async function DELETE(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });

    await connectToDatabase();

    const { categoryId } = await req.json();
    if (!categoryId) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    if (user.categories.length <= 1) {
      return NextResponse.json({ error: 'Kamida bitta kategoriya qolishi kerak' }, { status: 400 });
    }

    const exists = user.categories.id(categoryId);
    if (!exists) return NextResponse.json({ error: 'Kategoriya topilmadi' }, { status: 404 });

    user.categories.pull(categoryId);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'categories');
  }
}

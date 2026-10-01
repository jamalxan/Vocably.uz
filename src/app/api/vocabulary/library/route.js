import { NextResponse } from 'next/server';
import { requireVocabUser, handleRouteError, readJson } from '@/lib/vocab/server/route';
import { addEntriesToUser, searchPublished } from '@/lib/vocab/server/libraryService';

// GET /api/vocabulary/library?q=&cefr=&pos=&topic=&ielts=&page=&limit= — faqat PUBLISHED yozuvlar
export async function GET(req) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const sp = req.nextUrl.searchParams;
    const params = Object.fromEntries(['q', 'cefr', 'pos', 'topic', 'ielts', 'page', 'limit'].map((k) => [k, sp.get(k) || '']));
    return NextResponse.json(await searchPublished(params, userId));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/library GET');
  }
}

// POST { entryIds: string[], categoryId?: string } — tanlangan so'zlarni o'z lug'atiga nusxalash
export async function POST(req) {
  try {
    const { userId, error } = await requireVocabUser(req, { select: 'role' });
    if (error) return error;
    const body = await readJson(req);
    if (!body || !Array.isArray(body.entryIds)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    return NextResponse.json(await addEntriesToUser(userId, { entryIds: body.entryIds, categoryId: body.categoryId }));
  } catch (err) {
    return handleRouteError(err, 'vocabulary/library POST');
  }
}

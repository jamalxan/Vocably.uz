import { connectToDatabase } from '@/lib/db';
import { handleClick } from '@/lib/payments/click';
import { NextResponse } from 'next/server';

// Click SHOP API "complete" callback (set in the Click merchant cabinet).
export async function POST(req) {
  const form = await req.formData().catch(() => null);
  const p = form ? Object.fromEntries(form.entries()) : {};
  try {
    await connectToDatabase();
    return NextResponse.json(await handleClick('complete', p));
  } catch (err) {
    console.error('[click]', err);
    return NextResponse.json({ click_trans_id: p.click_trans_id, merchant_trans_id: p.merchant_trans_id, error: -8, error_note: 'System error' });
  }
}

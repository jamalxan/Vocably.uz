import { connectToDatabase } from '@/lib/db';
import { paymeConfig } from '@/lib/payments/config';
import { handlePayme, paymeAuthorized, PAYME_ERRORS } from '@/lib/payments/payme';
import { NextResponse } from 'next/server';

// Payme Merchant API endpoint (set this URL in the Payme merchant cabinet).
// Payme expects HTTP 200 with a JSON-RPC body even for errors.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id ?? null;
  const cfg = paymeConfig();
  if (!cfg || !paymeAuthorized(req.headers.get('authorization'), cfg.key)) {
    return NextResponse.json({ jsonrpc: '2.0', id, error: PAYME_ERRORS.auth });
  }
  try {
    await connectToDatabase();
    const out = await handlePayme(body.method, body.params);
    return NextResponse.json({ jsonrpc: '2.0', id, ...out });
  } catch (err) {
    console.error('[payme]', err);
    return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32400, message: 'System error' } });
  }
}

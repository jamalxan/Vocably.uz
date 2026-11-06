import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Serves THIRD_PARTY_NOTICES.md to the people the games are distributed to. The minified bundles keep
// no comments, so this file is how players of So'z tunneli receive the Apache License 2.0 copy and
// the attribution it requires (§4(a), §4(c)). Read once at build time (force-static).
export const dynamic = 'force-static';

export async function GET() {
  const text = await readFile(path.join(process.cwd(), 'THIRD_PARTY_NOTICES.md'), 'utf8');
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

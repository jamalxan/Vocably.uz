// Media backup: a bucket is copied into a Telegram channel as sealed parts and rebuilt from it.
// The bucket and the channel are in-memory fakes; the real S3 signing is cross-checked against the AWS SDK.
import { describe, expect, it } from 'vitest';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { open, parseKey, partAad, seal, sha256hex, split } from './lib/crypto.mjs';
import { emptyManifest, packManifest, planScan, takeExpiredTrash, trashObject, unpackManifest } from './lib/manifest.mjs';
import { fetchPinnedManifest, loadState, restore, runBackup } from './lib/engine.mjs';
import { createTelegram } from './lib/telegram.mjs';
import { createS3, signRequest } from './lib/s3.mjs';

// The AWS SDK's own signer (a transitive dependency of @aws-sdk/client-s3), for the cross-check below.
const smithy = await import('@smithy/signature-v4').catch(() => null);
class Sha256 {
  constructor(secret) {
    this.h = secret ? createHmac('sha256', secret) : createHash('sha256');
  }
  update(data) {
    this.h.update(typeof data === 'string' ? data : Buffer.from(data));
  }
  async digest() {
    return new Uint8Array(this.h.digest());
  }
}

const KEY = parseKey('11'.repeat(32));
const CHAT = -1001234567890;

function fakeBucket(initial = {}) {
  const objects = new Map();
  let clock = 0;
  const put = (key, body, contentType = 'application/octet-stream') => {
    objects.set(key, { body: Buffer.from(body), contentType, etag: sha256hex(body).slice(0, 32), lastModified: new Date(Date.UTC(2026, 10, 1, 0, 0, clock++)).toISOString() });
  };
  for (const [k, v] of Object.entries(initial)) put(k, v.body, v.contentType);
  return {
    objects,
    put: async (key, body, contentType) => put(key, body, contentType),
    remove: (key) => objects.delete(key),
    list: async (prefix = '') => [...objects].filter(([k]) => k.startsWith(prefix)).map(([key, o]) => ({ key, size: o.body.length, etag: o.etag, lastModified: o.lastModified })),
    get: async (key) => (objects.has(key) ? { body: objects.get(key).body, contentType: objects.get(key).contentType } : null),
    head: async (key) => (objects.has(key) ? { size: objects.get(key).body.length, etag: objects.get(key).etag } : null),
  };
}

function fakeChannel() {
  const messages = new Map(); // messageId -> { fileId, name, data }
  let nextId = 1;
  let pinned = null;
  const calls = { send: 0, delete: 0 };
  return {
    messages,
    calls,
    failNextSends: 0,
    get pinnedId() {
      return pinned;
    },
    async sendDocument(_chat, buffer, name) {
      if (this.failNextSends > 0) {
        this.failNextSends -= 1;
        throw new Error('Telegram sendDocument: 500 boom');
      }
      const messageId = nextId++;
      messages.set(messageId, { fileId: `file-${messageId}`, name, data: Buffer.from(buffer) });
      calls.send += 1;
      return { messageId, fileId: `file-${messageId}` };
    },
    async download(fileId) {
      const m = [...messages.values()].find((x) => x.fileId === fileId);
      if (!m) throw new Error('Telegram getFile: 400 file not found');
      return m.data;
    },
    async pinnedDocument() {
      const m = pinned && messages.get(pinned);
      return m ? { fileId: m.fileId, messageId: pinned, fileName: m.name } : null;
    },
    async pin(_chat, messageId) {
      pinned = messageId;
    },
    async deleteMessage(_chat, messageId) {
      calls.delete += 1;
      messages.delete(messageId);
      if (pinned === messageId) pinned = null;
    },
  };
}

const freshState = (bucket = 'b') => ({ manifest: emptyManifest(bucket), manifestMessageId: null, dirty: false });
const SEED = {
  'conversations/c1/image/a.jpg': { body: randomBytes(900), contentType: 'image/jpeg' },
  'conversations/c1/video/b.mp4': { body: randomBytes(5000), contentType: 'video/mp4' },
  'avatars/u1/p_f.jpg': { body: randomBytes(300), contentType: 'image/jpeg' },
  'stickers/p/empty.png': { body: Buffer.alloc(0), contentType: 'image/png' },
};

describe('crypto', () => {
  it('seals and opens a part; a wrong key, wrong position or a flipped byte fails', () => {
    const plain = randomBytes(1000);
    const sealed = seal(KEY, plain, partAad('k', 0, 2));
    expect(sealed.length).toBe(1028);
    expect(sealed.includes(plain.subarray(0, 32))).toBe(false);
    expect(open(KEY, sealed, partAad('k', 0, 2)).equals(plain)).toBe(true);
    expect(() => open(parseKey('22'.repeat(32)), sealed, partAad('k', 0, 2))).toThrow();
    expect(() => open(KEY, sealed, partAad('k', 1, 2))).toThrow();
    const tampered = Buffer.from(sealed);
    tampered[20] ^= 1;
    expect(() => open(KEY, tampered, partAad('k', 0, 2))).toThrow();
  });
  it('parses hex and base64 keys and rejects short ones', () => {
    expect(parseKey('ab'.repeat(32)).length).toBe(32);
    expect(parseKey(Buffer.alloc(32, 7).toString('base64')).length).toBe(32);
    expect(() => parseKey('abcd')).toThrow(/32 bytes/);
  });
  it('splits into parts of at most the given size', () => {
    expect(split(Buffer.alloc(10), 4).map((c) => c.length)).toEqual([4, 4, 2]);
    expect(split(Buffer.alloc(0), 4).map((c) => c.length)).toEqual([0]);
  });
});

describe('manifest', () => {
  it('survives sealing, and is unreadable with another key', () => {
    const m = emptyManifest('b');
    m.objects['a/b'] = { size: 1, etag: 'e', sha256: 's', contentType: 'x/y', parts: [{ fileId: 'f', messageId: 1 }], at: 't' };
    const sealed = packManifest(m, KEY);
    expect(sealed.toString('latin1')).not.toContain('a/b');
    expect(unpackManifest(sealed, KEY)).toEqual(m);
    expect(() => unpackManifest(sealed, parseKey('22'.repeat(32)))).toThrow();
  });
  it('plans uploads for new and changed objects, oldest first, capped', () => {
    const m = emptyManifest('b');
    m.objects.same = { size: 1, etag: 'e1', parts: [] };
    m.objects.changed = { size: 1, etag: 'old', parts: [] };
    const listing = [
      { key: 'new2', size: 1, etag: 'x', lastModified: '2026-11-03' },
      { key: 'same', size: 1, etag: 'e1', lastModified: '2026-11-01' },
      { key: 'changed', size: 1, etag: 'new', lastModified: '2026-11-02' },
      { key: 'new1', size: 1, etag: 'y', lastModified: '2026-11-01' },
    ];
    const plan = planScan(m, listing, { maxUploads: 2 });
    expect(plan.upload.map((o) => o.key)).toEqual(['new1', 'changed']);
    expect(plan.pending).toBe(1);
    expect(plan.gone).toEqual([]);
  });
  it('flags a mass deletion, but not a few deleted messages', () => {
    const m = emptyManifest('b');
    for (let i = 0; i < 100; i++) m.objects[`k${i}`] = { size: 1, etag: 'e', parts: [] };
    const listing = (n) => Array.from({ length: n }, (_, i) => ({ key: `k${i}`, size: 1, etag: 'e', lastModified: 't' }));
    expect(planScan(m, listing(95)).massDeletion).toBe(false);
    expect(planScan(m, listing(95)).gone).toHaveLength(5);
    expect(planScan(m, listing(70)).massDeletion).toBe(true);
    expect(planScan(m, []).massDeletion).toBe(true);
  });
  it('trash keeps parts for the retention period, then hands them over for deletion', () => {
    const m = emptyManifest('b');
    m.objects.a = { size: 1, etag: 'e', parts: [{ fileId: 'f', messageId: 9 }] };
    trashObject(m, 'a', new Date('2026-11-01T00:00:00Z'));
    expect(m.objects.a).toBeUndefined();
    expect(takeExpiredTrash(m, { retentionDays: 30, now: new Date('2026-11-20T00:00:00Z') })).toEqual([]);
    const expired = takeExpiredTrash(m, { retentionDays: 30, now: new Date('2026-12-02T00:00:00Z') });
    expect(expired.map((t) => t.parts[0].messageId)).toEqual([9]);
    expect(m.trash).toEqual([]);
  });
});

describe('backup and restore', () => {
  it('a wiped bucket is rebuilt byte for byte from the channel alone', async () => {
    const s3 = fakeBucket(SEED);
    const tg = fakeChannel();
    const state = freshState();
    const report = await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, partBytes: 2000 });
    expect(report).toMatchObject({ uploaded: 4, failed: [], published: true, pending: 0 });
    expect(state.manifest.objects['conversations/c1/video/b.mp4'].parts).toHaveLength(3); // 5000 bytes in 2000-byte parts
    // Nothing readable in the channel: no object key, no plaintext.
    for (const m of tg.messages.values()) {
      expect(m.name).not.toMatch(/conversations|avatars|jpg|mp4/);
      expect(m.data.includes(SEED['conversations/c1/image/a.jpg'].body.subarray(0, 24))).toBe(false);
    }

    // The server is gone: a new empty bucket, no local state. Only the channel and the key are left.
    const rebuilt = fakeBucket();
    const pinned = await fetchPinnedManifest({ tg, chatId: CHAT, key: KEY });
    const restored = await restore({ s3: rebuilt, tg, key: KEY, manifest: pinned.manifest });
    expect(restored).toMatchObject({ total: 4, restored: 4, failed: [] });
    for (const [k, v] of Object.entries(SEED)) {
      expect(rebuilt.objects.get(k).body.equals(v.body)).toBe(true);
      expect(rebuilt.objects.get(k).contentType).toBe(v.contentType);
    }
    // A second restore writes nothing; `check` proves readability without writing.
    expect(await restore({ s3: rebuilt, tg, key: KEY, manifest: pinned.manifest })).toMatchObject({ restored: 0, skipped: 4 });
    expect(await restore({ s3: fakeBucket(), tg, key: KEY, manifest: pinned.manifest, check: true, sample: 2 })).toMatchObject({ total: 2, verified: 2, restored: 0 });
  });

  it('a second pass uploads only what is new or changed and republishes the manifest', async () => {
    const s3 = fakeBucket(SEED);
    const tg = fakeChannel();
    const state = freshState();
    await runBackup({ s3, tg, chatId: CHAT, key: KEY, state });
    const firstManifest = state.manifestMessageId;
    expect(await runBackup({ s3, tg, chatId: CHAT, key: KEY, state })).toMatchObject({ uploaded: 0, published: false });

    await s3.put('conversations/c2/file/new.pdf', randomBytes(50), 'application/pdf');
    await s3.put('avatars/u1/p_f.jpg', randomBytes(310), 'image/jpeg'); // replaced
    const report = await runBackup({ s3, tg, chatId: CHAT, key: KEY, state });
    expect(report).toMatchObject({ uploaded: 2, published: true });
    expect(state.manifest.trash.map((t) => t.key)).toEqual(['avatars/u1/p_f.jpg']);
    expect(tg.pinnedId).toBe(state.manifestMessageId);
    expect(tg.messages.has(firstManifest)).toBe(false); // the old manifest message is removed
    const rebuilt = fakeBucket();
    await restore({ s3: rebuilt, tg, key: KEY, manifest: (await fetchPinnedManifest({ tg, chatId: CHAT, key: KEY })).manifest });
    expect(rebuilt.objects.get('avatars/u1/p_f.jpg').body.length).toBe(310);
  });

  it('a deleted object leaves the restore set at once and the channel after the retention period', async () => {
    const s3 = fakeBucket(SEED);
    const tg = fakeChannel();
    const state = freshState();
    let today = new Date('2026-11-01T00:00:00Z');
    const now = () => today;
    await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, now });
    const part = state.manifest.objects['conversations/c1/image/a.jpg'].parts[0].messageId;
    s3.remove('conversations/c1/image/a.jpg');
    expect(await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, now })).toMatchObject({ trashed: 1, purged: 0 });
    expect(state.manifest.objects['conversations/c1/image/a.jpg']).toBeUndefined();
    expect(tg.messages.has(part)).toBe(true);
    today = new Date('2026-12-05T00:00:00Z');
    expect(await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, now })).toMatchObject({ purged: 1 });
    expect(tg.messages.has(part)).toBe(false);
  });

  it('a wiped bucket does not wipe its own backup', async () => {
    const seed = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`conversations/c/image/${i}.jpg`, { body: randomBytes(20), contentType: 'image/jpeg' }]));
    const s3 = fakeBucket(seed);
    const tg = fakeChannel();
    const state = freshState();
    await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, maxUploads: 100 });
    for (const k of Object.keys(seed)) s3.remove(k);
    const report = await runBackup({ s3, tg, chatId: CHAT, key: KEY, state });
    expect(report).toMatchObject({ massDeletion: true, trashed: 0, gone: 40, published: false });
    expect(Object.keys(state.manifest.objects)).toHaveLength(40);
    const rebuilt = fakeBucket();
    expect(await restore({ s3: rebuilt, tg, key: KEY, manifest: state.manifest })).toMatchObject({ restored: 40, failed: [] });
  });

  it('a rebuilt server continues from the pinned manifest instead of uploading everything again', async () => {
    const s3 = fakeBucket(SEED);
    const tg = fakeChannel();
    await runBackup({ s3, tg, chatId: CHAT, key: KEY, state: freshState() });
    const sendsBefore = tg.calls.send;
    const state = await loadState({ tg, chatId: CHAT, key: KEY, bucket: 'b', readState: async () => null });
    expect(state.source).toBe('channel');
    expect(await runBackup({ s3, tg, chatId: CHAT, key: KEY, state })).toMatchObject({ uploaded: 0, published: false });
    expect(tg.calls.send).toBe(sendsBefore);
    expect((await loadState({ tg: fakeChannel(), chatId: CHAT, key: KEY, bucket: 'b', readState: async () => null })).source).toBe('empty');
    await expect(loadState({ tg, chatId: CHAT, key: parseKey('22'.repeat(32)), bucket: 'b', readState: async () => null })).rejects.toThrow();
  });

  it('a failed upload is retried on the next pass; its orphan parts go to the trash', async () => {
    const s3 = fakeBucket({ big: { body: randomBytes(5000), contentType: 'video/mp4' } });
    const tg = fakeChannel();
    const state = freshState();
    const saves = [];
    const realSend = tg.sendDocument.bind(tg);
    let n = 0;
    tg.sendDocument = async (...a) => {
      n += 1;
      if (n === 2) throw new Error('Telegram sendDocument: 500 boom');
      return realSend(...a);
    };
    const first = await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, partBytes: 2000, save: async (s) => saves.push(JSON.stringify(s)) });
    expect(first.failed).toEqual([{ key: 'big', error: 'Telegram sendDocument: 500 boom' }]);
    expect(state.manifest.objects.big).toBeUndefined();
    expect(state.manifest.trash).toHaveLength(1);
    expect(saves.length).toBeGreaterThan(0);
    const second = await runBackup({ s3, tg, chatId: CHAT, key: KEY, state, partBytes: 2000 });
    expect(second).toMatchObject({ uploaded: 1, failed: [] });
    const rebuilt = fakeBucket();
    expect(await restore({ s3: rebuilt, tg, key: KEY, manifest: state.manifest })).toMatchObject({ restored: 1, failed: [] });
  });

  it('a corrupted part is reported and nothing is written for that object', async () => {
    const s3 = fakeBucket(SEED);
    const tg = fakeChannel();
    const state = freshState();
    await runBackup({ s3, tg, chatId: CHAT, key: KEY, state });
    const victim = state.manifest.objects['conversations/c1/image/a.jpg'].parts[0].messageId;
    tg.messages.get(victim).data[30] ^= 1;
    const rebuilt = fakeBucket();
    const report = await restore({ s3: rebuilt, tg, key: KEY, manifest: state.manifest });
    expect(report.restored).toBe(3);
    expect(report.failed.map((f) => f.key)).toEqual(['conversations/c1/image/a.jpg']);
    expect(rebuilt.objects.has('conversations/c1/image/a.jpg')).toBe(false);
  });

  it('refuses a part size Telegram would not let the bot download', async () => {
    await expect(runBackup({ s3: fakeBucket(), tg: fakeChannel(), chatId: CHAT, key: KEY, state: freshState(), partBytes: 20 * 1000 * 1000 })).rejects.toThrow(/download/);
  });
});

describe('telegram client', () => {
  const reply = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  it('waits out a rate limit and retries with a fresh body', async () => {
    const waits = [];
    const bodies = [];
    let n = 0;
    const tg = createTelegram({
      token: 't',
      sleep: async (ms) => waits.push(ms),
      fetchImpl: async (_url, init) => {
        bodies.push(init.body);
        n += 1;
        return n === 1 ? reply({ ok: false, error_code: 429, parameters: { retry_after: 7 } }) : reply({ ok: true, result: { message_id: 5, document: { file_id: 'F' } } });
      },
    });
    expect(await tg.sendDocument(1, Buffer.from('x'), 'n.bin')).toEqual({ messageId: 5, fileId: 'F' });
    expect(waits).toEqual([8000]);
    expect(bodies[0]).not.toBe(bodies[1]);
  });
  it('does not retry a permanent error', async () => {
    let n = 0;
    const tg = createTelegram({ token: 't', sleep: async () => {}, fetchImpl: async () => (n++, reply({ ok: false, error_code: 403, description: 'Forbidden: bot is not a member of the channel chat' })) });
    await expect(tg.sendMessage(1, 'x')).rejects.toThrow(/403 Forbidden/);
    expect(n).toBe(1);
  });
  it('finds the pinned document through getChat', async () => {
    const tg = createTelegram({ token: 't', fetchImpl: async () => reply({ ok: true, result: { id: 1, pinned_message: { message_id: 44, document: { file_id: 'M', file_name: 'manifest-1.bin' } } } }) });
    expect(await tg.pinnedDocument(1)).toEqual({ fileId: 'M', messageId: 44, fileName: 'manifest-1.bin' });
  });
});

describe('s3 client', () => {
  it.skipIf(!smithy)('signs requests exactly like the AWS SDK signer', async () => {
    const { SignatureV4 } = smithy;
    const now = new Date('2026-11-16T10:20:30Z');
    const payloadHash = sha256hex('');
    const query = { 'list-type': '2', prefix: "conversations/a b/it's", 'max-keys': '1000' };
    const mine = signRequest({ method: 'GET', host: 'media.example.uz', path: '/vocably-chat', query, payloadHash, accessKey: 'AK', secretKey: 'SK', region: 'us-east-1', now });
    const signer = new SignatureV4({ service: 's3', region: 'us-east-1', credentials: { accessKeyId: 'AK', secretAccessKey: 'SK' }, sha256: Sha256, uriEscapePath: false });
    const theirs = await signer.sign(
      { method: 'GET', protocol: 'https:', hostname: 'media.example.uz', path: '/vocably-chat', query, headers: { host: 'media.example.uz', 'x-amz-content-sha256': payloadHash } },
      { signingDate: now }
    );
    expect(mine.headers.authorization).toBe(theirs.headers.authorization);
  });
  it('lists across pages and decodes keys', async () => {
    const pages = [
      '<ListBucketResult><IsTruncated>true</IsTruncated><NextContinuationToken>T2</NextContinuationToken><Contents><Key>a&amp;b.jpg</Key><LastModified>2026-11-01T00:00:00Z</LastModified><ETag>&quot;e1&quot;</ETag><Size>5</Size></Contents></ListBucketResult>',
      '<ListBucketResult><IsTruncated>false</IsTruncated><Contents><Key>c.mp4</Key><LastModified>2026-11-02T00:00:00Z</LastModified><ETag>&quot;e2&quot;</ETag><Size>7</Size></Contents></ListBucketResult>',
    ];
    const urls = [];
    const s3 = createS3({ endpoint: 'http://garage:3900', accessKey: 'AK', secretKey: 'SK', bucket: 'b', fetchImpl: async (url) => (urls.push(url), new Response(pages[urls.length - 1], { status: 200 })) });
    expect(await s3.list()).toEqual([
      { key: 'a&b.jpg', size: 5, etag: 'e1', lastModified: '2026-11-01T00:00:00Z' },
      { key: 'c.mp4', size: 7, etag: 'e2', lastModified: '2026-11-02T00:00:00Z' },
    ]);
    expect(urls[1]).toContain('continuation-token=T2');
  });
  it('a missing object is null, any other failure throws with the S3 code', async () => {
    const s3 = createS3({ endpoint: 'http://garage:3900', accessKey: 'AK', secretKey: 'SK', bucket: 'b', fetchImpl: async (url) => (String(url).endsWith('/gone') ? new Response('', { status: 404 }) : new Response('<Error><Code>AccessDenied</Code><Message>no</Message></Error>', { status: 403 })) });
    expect(await s3.get('gone')).toBeNull();
    await expect(s3.get('secret')).rejects.toThrow(/403 AccessDenied/);
  });
});

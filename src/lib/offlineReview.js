// Offline takrorlash (B2): bugungi navbatni IndexedDB'ga oldindan yuklash, internetsiz javob yig'ish va ulanganda
// `POST /api/words/review/batch` bilan yuborish. Offline javoblar XP BERMAYDI (server tomonida qaror) — faqat SRS/seriya.
// Foydalanuvchiga bog'langan: boshqa akkaunt kirsa eski ma'lumot ko'rinmaydi; logout'da `clearOfflineData()`.
const DB_NAME = 'vocably-offline';
const DB_VERSION = 1;
export const BATCH_SIZE = 100;
const STALE_QUEUE_MS = 24 * 3600 * 1000; // yuklangan navbat 24 soatdan keyin eskirgan hisoblanadi

function idb() {
  return typeof indexedDB !== 'undefined' ? indexedDB : null;
}

export function isOfflineReviewSupported() {
  return !!idb();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const factory = idb();
    if (!factory) return reject(new Error('IndexedDB yo‘q'));
    const req = factory.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('due')) db.createObjectStore('due', { keyPath: 'userId' });
      if (!db.objectStoreNames.contains('pending')) {
        const s = db.createObjectStore('pending', { keyPath: 'clientSeq' });
        s.createIndex('userId', 'userId');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Bitta tranzaksiya: `fn(stores)` ichida so'rovlar; tranzaksiya tugaganda natija qaytadi.
async function withStores(names, mode, fn) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(names, mode);
      const stores = Object.fromEntries(names.map((n) => [n, tx.objectStore(n)]));
      let out;
      Promise.resolve(fn(stores)).then((v) => (out = v), reject);
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

const wrap = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export const newClientSeq = () => `r-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;

/** Navbatni saqlaydi (oldingisini almashtiradi). `words`: [{ wordId, categoryId, word, translations }] */
export async function saveDueQueue(userId, words) {
  const record = { userId: String(userId), fetchedAt: Date.now(), words: words.map((w) => ({ wordId: w.wordId, categoryId: w.categoryId, word: w.word, translations: w.translations || [] })) };
  await withStores(['due'], 'readwrite', ({ due }) => wrap(due.put(record)));
  return record.words.length;
}

/** Yuklangan navbat (javob berilgan so'zlarsiz). `stale` — 24 soatdan eski. */
export async function loadDueQueue(userId) {
  const rec = await withStores(['due'], 'readonly', ({ due }) => wrap(due.get(String(userId))));
  if (!rec) return { words: [], fetchedAt: null, stale: false };
  return { words: rec.words || [], fetchedAt: rec.fetchedAt, stale: Date.now() - rec.fetchedAt > STALE_QUEUE_MS };
}

/** Javobni navbatga yozadi va so'zni yuklangan navbatdan olib tashlaydi (bir tranzaksiyada). */
export async function recordAnswer(userId, { wordId, categoryId, correct, responseMs = undefined }) {
  const uid = String(userId);
  const item = { clientSeq: newClientSeq(), userId: uid, wordId, categoryId, correct: !!correct, responseMs: Number.isFinite(responseMs) ? Math.round(responseMs) : undefined, clientTs: Date.now() };
  await withStores(['pending', 'due'], 'readwrite', async ({ pending, due }) => {
    pending.put(item);
    const rec = await wrap(due.get(uid));
    if (rec) due.put({ ...rec, words: rec.words.filter((w) => w.wordId !== wordId) });
  });
  return item;
}

export async function listPending(userId) {
  const all = await withStores(['pending'], 'readonly', ({ pending }) => wrap(pending.index('userId').getAll(String(userId))));
  return all.sort((a, b) => a.clientTs - b.clientTs);
}

export async function removePending(seqs) {
  if (!seqs.length) return;
  await withStores(['pending'], 'readwrite', ({ pending }) => {
    seqs.forEach((s) => pending.delete(s));
  });
}

/** Logout / akkaunt almashishda — hamma offline ma'lumot o'chadi. */
export async function clearOfflineData() {
  if (!idb()) return;
  await withStores(['pending', 'due'], 'readwrite', ({ pending, due }) => {
    pending.clear();
    due.clear();
  }).catch(() => {});
}

/**
 * Kutilayotgan javoblarni serverga yuboradi (≤100 talik paketlar). Server qabul qilgan, takror, eskirgan yoki rad etgan
 * hamma yozuv navbatdan olinadi (qayta yuborishning foydasi yo'q); tarmoq/5xx/429 xatosida qoladi va keyin urinib ko'riladi.
 * @returns {{ sent: number, applied: number, remaining: number, error: string|null }}
 */
export async function syncPending(userId, post = defaultPost) {
  let applied = 0;
  let sent = 0;
  let error = null;
  const pending = await listPending(userId);
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunk = pending.slice(i, i + BATCH_SIZE);
    let res;
    try {
      res = await post(chunk.map(({ userId: _u, ...r }) => r));
    } catch {
      error = 'network';
      break;
    }
    if (res.status === 401) {
      error = 'unauthorized';
      break;
    }
    if (res.status === 429 || res.status >= 500) {
      error = 'server';
      break;
    }
    // 2xx — hamma yozuv ko'rib chiqildi; 4xx (yaroqsiz paket) — qayta yuborish foydasiz, olib tashlanadi.
    if (res.ok) applied += (await res.json().catch(() => ({}))).applied || 0;
    sent += chunk.length;
    await removePending(chunk.map((c) => c.clientSeq));
  }
  return { sent, applied, remaining: (await listPending(userId)).length, error };
}

function defaultPost(reviews) {
  return fetch('/api/words/review/batch', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviews }) });
}

/** Onlayn paytda: serverdan hozirgi navbatni olib saqlaydi. */
export async function downloadDueQueue(userId, limit = 50, get = (url) => fetch(url, { credentials: 'same-origin' })) {
  const res = await get(`/api/vocabulary/due?limit=${limit}`);
  if (!res.ok) throw new Error(res.status === 401 ? 'unauthorized' : 'server');
  const data = await res.json();
  const n = await saveDueQueue(userId, data.words || []);
  return { saved: n, total: data.total || n };
}

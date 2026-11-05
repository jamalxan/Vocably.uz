// Parallel upload queue for chat attachments (Telegram parity: many files at once, each with its
// own progress, cancel and retry; nothing blocks typing). Pure scheduling — the actual transport is
// injected (`presign` + `put`), so the queue is unit-tested without a browser or S3.
// Browser transport: ./xhrUpload.js (XHR gives upload progress; fetch does not).

export const UPLOAD = { concurrency: 3 };

/**
 * @param {object} deps
 * @param {(item) => Promise<{ key: string, uploadUrl: string }>} deps.presign
 * @param {(url: string, file: Blob, opts: { mimeType: string, onProgress: (ratio: number) => void, signal: AbortSignal }) => Promise<void>} deps.put
 * @param {number} [deps.concurrency]
 */
export function createUploadManager({ presign, put, concurrency = UPLOAD.concurrency }) {
  const queue = []; // items waiting for a slot
  const running = new Map(); // id → AbortController
  const items = new Map(); // id → item

  function pump() {
    while (running.size < concurrency && queue.length) {
      const item = queue.shift();
      if (item.status !== 'queued') continue;
      run(item);
    }
  }

  async function run(item) {
    const ctrl = new AbortController();
    running.set(item.id, ctrl);
    item.status = 'uploading';
    item.progress = 0;
    item.onChange?.(item);
    try {
      const { key, uploadUrl } = await presign(item);
      if (ctrl.signal.aborted) throw new DOMException('aborted', 'AbortError');
      await put(uploadUrl, item.file, {
        mimeType: item.mimeType,
        signal: ctrl.signal,
        onProgress: (ratio) => {
          item.progress = Math.max(0, Math.min(1, ratio));
          item.onChange?.(item);
        },
      });
      item.status = 'done';
      item.progress = 1;
      item.key = key;
      item.onChange?.(item);
      item.resolve({ key });
    } catch (err) {
      const aborted = err?.name === 'AbortError' || ctrl.signal.aborted;
      item.status = aborted ? 'cancelled' : 'failed';
      item.error = aborted ? null : err?.message || 'upload_failed';
      item.onChange?.(item);
      if (aborted) item.resolve(null);
      else item.reject(err);
    } finally {
      running.delete(item.id);
      pump();
    }
  }

  return {
    /**
     * Queues one file. Resolves with `{ key }` when uploaded, `null` when cancelled; rejects on failure.
     * @param {{ id: string, file: Blob, mimeType: string, type: string, conversationId: string, onChange?: Function }} spec
     */
    enqueue(spec) {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const item = { ...spec, status: 'queued', progress: 0, key: null, error: null, resolve, reject, promise };
      items.set(item.id, item);
      queue.push(item);
      pump();
      return promise;
    },
    /** Puts a failed item back in the queue with a fresh promise. */
    retry(id) {
      const item = items.get(id);
      if (!item || item.status !== 'failed') return null;
      const promise = new Promise((res, rej) => {
        item.resolve = res;
        item.reject = rej;
      });
      item.promise = promise;
      item.status = 'queued';
      item.error = null;
      queue.push(item);
      pump();
      return promise;
    },
    cancel(id) {
      const item = items.get(id);
      if (!item) return;
      if (item.status === 'queued') {
        item.status = 'cancelled';
        item.onChange?.(item);
        item.resolve(null);
      } else running.get(id)?.abort();
    },
    get(id) {
      return items.get(id) || null;
    },
    /** For tests and diagnostics. */
    stats() {
      return { queued: queue.filter((i) => i.status === 'queued').length, running: running.size };
    },
  };
}

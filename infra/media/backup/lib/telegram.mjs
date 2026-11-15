// The slice of the Telegram Bot API the backup needs. Limits that shape the design:
//   upload (sendDocument, multipart): 50 MB per file; download (getFile): 20 MB per file.
// So nothing larger than 20 MB is ever uploaded as one document — objects are split into parts (see backup.mjs),
// otherwise a file could be stored and never read back.
export const TG_DOWNLOAD_MAX = 20 * 1000 * 1000;

export function createTelegram({ token, apiBase = 'https://api.telegram.org', fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), maxRetries = 5 }) {
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');

  // `build()` makes a fresh body per attempt (a FormData body cannot be re-sent after a failed fetch).
  async function call(method, build) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let data;
      try {
        const res = await fetchImpl(`${apiBase}/bot${token}/${method}`, { method: 'POST', ...build() });
        data = await res.json();
      } catch (err) {
        lastError = err; // network error: back off and retry
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      if (data.ok) return data.result;
      const retryAfter = data.parameters?.retry_after;
      if (data.error_code === 429 && retryAfter) {
        lastError = new Error(`Telegram ${method}: rate limited`);
        await sleep((retryAfter + 1) * 1000);
        continue;
      }
      if (data.error_code >= 500) {
        lastError = new Error(`Telegram ${method}: ${data.error_code} ${data.description || ''}`);
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      const err = new Error(`Telegram ${method}: ${data.error_code} ${data.description || ''}`.trim());
      err.code = data.error_code;
      throw err;
    }
    throw lastError || new Error(`Telegram ${method}: failed`);
  }

  const json = (payload) => () => ({ headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });

  return {
    /** Uploads one document; returns { messageId, fileId }. */
    async sendDocument(chatId, buffer, filename) {
      const result = await call('sendDocument', () => {
        const form = new FormData();
        form.set('chat_id', String(chatId));
        form.set('disable_notification', 'true');
        form.set('document', new Blob([buffer], { type: 'application/octet-stream' }), filename);
        return { body: form };
      });
      if (!result?.document?.file_id) throw new Error('Telegram sendDocument: no document in the reply');
      return { messageId: result.message_id, fileId: result.document.file_id };
    },
    /** Downloads a file the bot has stored (up to 20 MB). */
    async download(fileId) {
      const file = await call('getFile', json({ file_id: fileId }));
      if (!file?.file_path) throw new Error('Telegram getFile: no file_path');
      const res = await fetchImpl(`${apiBase}/file/bot${token}/${file.file_path}`);
      if (!res.ok) throw new Error(`Telegram file download: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    },
    /** The channel's pinned document, or null. This is how a restore finds the manifest with nothing else at hand. */
    async pinnedDocument(chatId) {
      const chat = await call('getChat', json({ chat_id: chatId }));
      const doc = chat?.pinned_message?.document;
      return doc ? { fileId: doc.file_id, messageId: chat.pinned_message.message_id, fileName: doc.file_name || '' } : null;
    },
    pin: (chatId, messageId) => call('pinChatMessage', json({ chat_id: chatId, message_id: messageId, disable_notification: true })),
    deleteMessage: (chatId, messageId) => call('deleteMessage', json({ chat_id: chatId, message_id: messageId })),
    sendMessage: (chatId, text) => call('sendMessage', json({ chat_id: chatId, text, disable_web_page_preview: true })),
    getChat: (chatId) => call('getChat', json({ chat_id: chatId })),
  };
}

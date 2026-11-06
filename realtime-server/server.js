// Vocably Do'stlar bo'limi — yengil realtime xizmat. Vazifasi tor va qasddan
// shunday: (1) foydalanuvchi ulanganda "onlayn" deb belgilash, (2) Next.js API'dan
// kelgan "yangi xabar" push'ini tegishli foydalanuvchining socket xonasiga
// yetkazish, (3) 1:1 qo'ng'iroqlar signalingi (calls.js). Xabarlarning o'zi bu yerda
// saqlanmaydi — Mongo yagona haqiqat manbai (Next.js tomonida). Bu xizmat butunlay
// o'chib qolsa ham chat REST orqali ishlayveradi (docs/ chat plani, "Arxitektura
// qarorlari" §2). Qo'ng'iroqlar esa faqat shu xizmat ishlab turganda mavjud.
//
// createRealtimeServer({ env }) -> { app, server, io, calls, listen, close, shutdown } —
// index.js faqat ishga tushiradi; testlar/E2E (e2e/realtime-local.mjs) to'g'ridan-to'g'ri chaqiradi.
'use strict';

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { createCallManager } = require('./calls');
const { createPersister } = require('./persist');

const OBJECT_ID_RE = /^[a-f0-9]{24}$/;
// emit-event orqali faqat shu hodisalarni tarqatish mumkin (ixtiyoriy event nomi bilan
// client'larda qo'ng'iroq yoki presence hodisasini soxtalashtirib bo'lmasin).
const EMIT_EVENT_ALLOWLIST = ['message:new', 'message:reacted', 'draft:update', 'conversation:read'];
const FORCE_END_REASONS = ['blocked', 'banned', 'admin'];

// Sirlarni vaqt bo'yicha yon kanalsiz solishtirish (=== birinchi farqda to'xtaydi).
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a || '')).digest();
  const hb = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(ha, hb) && String(a || '').length === String(b || '').length;
}

const positiveInt = (v, fallback) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

function createRealtimeServer({ env = process.env, fetchImpl = globalThis.fetch, now = Date.now, log = console } = {}) {
  // Socket tiketlari ham, Next.js'dan keladigan ichki so'rovlar ham, qo'ng'iroq grant'lari
  // ham bitta umumiy sir bilan himoyalanadi (src/app/api/chat/socket-ticket va .../calls
  // shu sir bilan imzolaydi) — bu xizmat sessiya JWT sirini (JWT_SECRET) hech qachon ko'rmaydi.
  const INTERNAL_SECRET = env.REALTIME_SHARED_SECRET;
  // Foydalanuvchi onlaynga o'tganda Next.js'ga xabar berish (Telegram "onlayn bo'ldi",
  // src/app/api/internal/presence-online) va qo'ng'iroq tarixini yozish
  // (src/app/api/internal/call-event) uchun. Sozlanmagan bo'lsa ikkalasi ham jimgina o'chiq.
  const NEXTJS_INTERNAL_URL = env.NEXTJS_INTERNAL_URL;

  if (!INTERNAL_SECRET) throw new Error('REALTIME_SHARED_SECRET sozlanmagan');

  // CORS: REALTIME_ALLOWED_ORIGINS (vergul bilan) — faqat shu originlar. Production'da
  // MAJBURIY (avval jimgina '*'ga tushib qolardi); dev'da berilmasa '*'.
  const ALLOWED_ORIGINS = (env.REALTIME_ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!ALLOWED_ORIGINS.length) {
    if (env.NODE_ENV === 'production') throw new Error('REALTIME_ALLOWED_ORIGINS production uchun sozlanmagan');
    log.warn("[realtime] REALTIME_ALLOWED_ORIGINS sozlanmagan — CORS '*' (faqat dev uchun)");
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : '*' }, maxHttpBufferSize: 1e5 });

  // userId -> shu foydalanuvchining ochiq socket ulanishlari soni (bir nechta tab/qurilma
  // bo'lishi mumkin) — presence "onlayn"ligini socket sonidan aniqlaymiz.
  const onlineCounts = new Map();

  const persist = createPersister({ url: NEXTJS_INTERNAL_URL, secret: INTERNAL_SECRET, fetchImpl, log });
  const calls = createCallManager({
    io,
    verifyGrant: (grant) => jwt.verify(grant, INTERNAL_SECRET, { algorithms: ['HS256'] }),
    persist,
    isOnline: (userId) => onlineCounts.has(String(userId)),
    now,
    log,
    limits: {
      RING_MS: positiveInt(env.CALL_RING_TIMEOUT_MS, 45000),
      CONNECT_MS: positiveInt(env.CALL_CONNECT_TIMEOUT_MS, 30000),
      GRACE_MS: positiveInt(env.CALL_GRACE_MS, 15000),
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = jwt.verify(token, INTERNAL_SECRET, { algorithms: ['HS256'] });
      // Faqat 60 soniyalik realtime-tiket (src/app/api/chat/socket-ticket) — qo'ng'iroq grant'i
      // (scope 'call') yoki boshqa token bilan ulanib bo'lmaydi.
      if (decoded.scope !== 'realtime') throw new Error('bad scope');
      socket.userId = String(decoded.userId);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  // userId onlayn/oflaynga o'tganda BARCHA ulangan client'larga xabar beradi — bu
  // kichik ilova uchun oddiy va yetarli (src/context/ChatContext.jsx `livePresence`).
  function broadcastPresence(userId, online) {
    io.emit('presence:update', { userId, online });
  }

  // Faqat haqiqiy oflayn->onlayn o'tishda (bir nechta tab/qurilmadan biri qo'shilganda
  // EMAS). Javobni kutmaydi: Telegram'ga yetib bormasa ham presence ta'sirlanmasligi kerak.
  async function notifyPresenceOnline(userId) {
    if (!NEXTJS_INTERNAL_URL) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      await fetchImpl(`${NEXTJS_INTERNAL_URL.replace(/\/$/, '')}/api/internal/presence-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': INTERNAL_SECRET },
        body: JSON.stringify({ userId }),
        signal: controller.signal,
      });
    } catch (err) {
      log.error('[realtime] onlayn bildirishnomasi yuborilmadi', err?.message || err);
    } finally {
      clearTimeout(timeout);
    }
  }

  // Handler ichidagi kutilmagan xato butun jarayonni (va barcha qo'ng'iroqlarni) yiqitmasin.
  const safe = (name, fn) => (...args) => {
    try {
      fn(...args);
    } catch (err) {
      log.error(`[realtime] ${name} xatosi`, err?.stack || err);
    }
  };
  const ackOf = (cb) => (typeof cb === 'function' ? cb : () => {});

  io.on('connection', (socket) => {
    const room = `user:${socket.userId}`;
    socket.join(room);
    const wasOffline = !onlineCounts.has(socket.userId);
    onlineCounts.set(socket.userId, (onlineCounts.get(socket.userId) || 0) + 1);
    if (wasOffline) {
      broadcastPresence(socket.userId, true);
      notifyPresenceOnline(socket.userId);
    }

    // Client ulanganda/ro'yxati yangilanganda "hozir kim onlayn" haqida bir martalik
    // aniq javob so'raydi (ack orqali) — presence:update'ni kutib o'tirmasdan.
    socket.on('presence:query', (userIds, cb) => {
      if (typeof cb !== 'function') return;
      const ids = Array.isArray(userIds) ? userIds.slice(0, 200) : []; // cheksiz massiv — DoS
      const result = {};
      ids.forEach((id) => {
        result[String(id)] = onlineCounts.has(String(id));
      });
      cb(result);
    });

    // "Yozmoqda..." holati (yoki ovozli/video xabar yozib turgani, `kind`) — hech
    // narsa saqlanmaydi, faqat qabul qiluvchining shaxsiy xonasiga forward qilinadi.
    socket.on('typing', ({ recipientId, conversationId, kind } = {}) => {
      if (!OBJECT_ID_RE.test(String(recipientId)) || !OBJECT_ID_RE.test(String(conversationId))) return; // begona xonalarga spam qilmaslik
      io.to(`user:${recipientId}`).emit('typing', { conversationId, userId: socket.userId, kind: kind || 'text' });
    });

    // Qo'ng'iroq signalingi — barcha tekshiruv/holat calls.js'da.
    calls.onConnect(socket);
    socket.on('call:invite', safe('call:invite', (p, cb) => calls.invite(socket, p, ackOf(cb))));
    socket.on('call:ringing', safe('call:ringing', (p) => calls.ringing(socket, p)));
    socket.on('call:accept', safe('call:accept', (p) => calls.accept(socket, p)));
    socket.on('call:reject', safe('call:reject', (p) => calls.reject(socket, p)));
    socket.on('call:sdp', safe('call:sdp', (p) => calls.relay(socket, 'call:sdp', p)));
    socket.on('call:ice', safe('call:ice', (p) => calls.relay(socket, 'call:ice', p)));
    socket.on('call:media', safe('call:media', (p) => calls.relay(socket, 'call:media', p)));
    socket.on('call:connected', safe('call:connected', (p) => calls.connected(socket, p)));
    socket.on('call:end', safe('call:end', (p) => calls.end(socket, p)));
    socket.on('call:resume', safe('call:resume', (p, cb) => calls.resume(socket, p, ackOf(cb))));
    socket.on('call:query', safe('call:query', (p, cb) => calls.query(socket, ackOf(cb))));

    socket.on('disconnect', () => {
      const n = (onlineCounts.get(socket.userId) || 1) - 1;
      // Qo'ng'iroq qoidalari onlineCounts yangilanishidan OLDIN (userNowOffline shu songa qarab).
      safe('call:disconnect', () => calls.onDisconnect(socket, { userNowOffline: n <= 0 }))();
      if (n <= 0) {
        onlineCounts.delete(socket.userId);
        broadcastPresence(socket.userId, false);
      } else {
        onlineCounts.set(socket.userId, n);
      }
    });
  });

  function requireInternalSecret(req, res, next) {
    if (!safeEqual(req.headers['x-internal-secret'], INTERNAL_SECRET)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    return next();
  }

  app.get('/health', (req, res) => res.json({ ok: true, calls: calls.size(), online: onlineCounts.size }));

  // Next.js API xabarni Mongo'ga yozgandan keyin shu yerga chaqiradi.
  app.post('/internal/emit', requireInternalSecret, (req, res) => {
    const { recipientId, conversationId, message, sender, silent } = req.body || {};
    if (!recipientId || !conversationId || !message) {
      return res.status(400).json({ error: 'recipientId, conversationId, message kerak' });
    }
    // `sender` (kim yozdi: id/username/taxallus) va `silent` (suhbat ovozsiz) — ilova ichidagi
    // toast uchun (PARITY_PLAN WP1); berilmasa client eski usulda ro'yxatdan topadi.
    io.to(`user:${recipientId}`).emit('message:new', {
      conversationId,
      message,
      ...(sender && typeof sender === 'object' ? { sender } : {}),
      ...(typeof silent === 'boolean' ? { silent } : {}),
    });
    return res.json({ ok: true });
  });

  // C-11 — xabar tahrirlangandan keyin boshqa tomonning ochiq socket'iga yangi matn+editedAt.
  app.post('/internal/emit-edited', requireInternalSecret, (req, res) => {
    const { recipientId, conversationId, message } = req.body || {};
    if (!recipientId || !conversationId || !message) {
      return res.status(400).json({ error: 'recipientId, conversationId, message kerak' });
    }
    io.to(`user:${recipientId}`).emit('message:edited', { conversationId, message });
    return res.json({ ok: true });
  });

  // C-11 — xabar "hamma uchun" o'chirilgandan keyin (`silently` — butunlay olib tashlanadi,
  // aks holda "xabar o'chirildi" tombstone'i).
  app.post('/internal/emit-deleted', requireInternalSecret, (req, res) => {
    const { recipientId, conversationId, messageId, silently } = req.body || {};
    if (!recipientId || !conversationId || !messageId) {
      return res.status(400).json({ error: 'recipientId, conversationId, messageId kerak' });
    }
    io.to(`user:${recipientId}`).emit('message:deleted', { conversationId, messageId, silently: !!silently });
    return res.json({ ok: true });
  });

  // Xabar(lar) "o'qildi" — asl yuboruvchining xonasiga (ptichkani darhol yangilash uchun).
  app.post('/internal/read', requireInternalSecret, (req, res) => {
    const { userId, conversationId, readAt } = req.body || {};
    if (!userId || !conversationId || !readAt) {
      return res.status(400).json({ error: 'userId, conversationId, readAt kerak' });
    }
    io.to(`user:${userId}`).emit('message:read', { conversationId, readAt });
    return res.json({ ok: true });
  });

  // Umumiy primitiv: bir nechta foydalanuvchiga (jumladan o'ziga — boshqa tab/qurilmalari
  // uchun) ruxsat etilgan hodisa. Faqat allowlist'dagi event nomlari, 1..10 ta 24-hex id.
  app.post('/internal/emit-event', requireInternalSecret, (req, res) => {
    const { userIds, event, payload } = req.body || {};
    const ids = Array.isArray(userIds) ? [...new Set(userIds.map(String))] : [];
    if (!ids.length || ids.length > 10 || !ids.every((id) => OBJECT_ID_RE.test(id))) {
      return res.status(400).json({ error: 'userIds: 1..10 ta 24-hex id kerak' });
    }
    if (!EMIT_EVENT_ALLOWLIST.includes(event)) return res.status(400).json({ error: 'event ruxsat etilmagan' });
    if (payload === undefined || payload === null || typeof payload !== 'object') {
      return res.status(400).json({ error: 'payload obyekt bo\'lishi kerak' });
    }
    io.to(ids.map((id) => `user:${id}`)).emit(event, payload);
    return res.json({ ok: true });
  });

  // Next.js (bloklash, admin ban) qo'ng'iroqni majburan tugatadi. `peerId` berilsa — faqat
  // shu ikki foydalanuvchi orasidagi qo'ng'iroq. /internal/call-end — spec nomi,
  // /internal/calls/force-end — src/lib/realtime.js#forceEndCall ishlatadigan nom.
  const forceEndHandler = (req, res) => {
    const { userId, peerId, reason } = req.body || {};
    if (!OBJECT_ID_RE.test(String(userId || ''))) return res.status(400).json({ error: 'userId kerak' });
    if (peerId !== undefined && peerId !== null && !OBJECT_ID_RE.test(String(peerId))) {
      return res.status(400).json({ error: "peerId noto'g'ri" });
    }
    if (!FORCE_END_REASONS.includes(reason)) return res.status(400).json({ error: "reason noto'g'ri" });
    const ended = calls.forceEnd({ userId: String(userId), peerId: peerId ? String(peerId) : null, reason });
    return res.json({ ok: true, ended });
  };
  app.post('/internal/calls/force-end', requireInternalSecret, forceEndHandler);
  app.post('/internal/call-end', requireInternalSecret, forceEndHandler);

  app.get('/internal/calls/:userId', requireInternalSecret, (req, res) => {
    const c = calls.getUserCall(String(req.params.userId));
    res.json(c ? { inCall: true, callId: c.callId, state: c.state } : { inCall: false });
  });

  app.get('/internal/presence/:userId', requireInternalSecret, (req, res) => {
    res.json({ online: onlineCounts.has(String(req.params.userId)) });
  });

  function listen(port = positiveInt(env.PORT, 4001), host) {
    return new Promise((resolve) => {
      server.listen(port, host, () => {
        log.log(`[realtime] ${server.address().port}-portda ishga tushdi`);
        resolve(server.address());
      });
    });
  }

  function close() {
    return new Promise((resolve) => {
      io.close(() => resolve());
    });
  }

  // SIGTERM: faol qo'ng'iroqlarni yakunlab (best-effort yozuv, 5 s gacha kutiladi), keyin yopish.
  async function shutdown(reason = 'server_shutdown') {
    try {
      await calls.shutdown(reason);
    } catch (err) {
      log.error('[realtime] shutdown xatosi', err?.message || err);
    }
    await close();
  }

  return { app, server, io, calls, onlineCounts, listen, close, shutdown };
}

module.exports = { createRealtimeServer, EMIT_EVENT_ALLOWLIST };

// Vocably Do'stlar bo'limi — yengil realtime xizmat. Vazifasi tor va qasddan
// shunday: (1) foydalanuvchi ulanganda "onlayn" deb belgilash, (2) Next.js API'dan
// kelgan "yangi xabar" push'ini tegishli foydalanuvchining socket xonasiga
// yetkazish. Xabarlarning o'zi bu yerda saqlanmaydi — Mongo yagona haqiqat manbai
// (Next.js tomonida). Bu xizmat butunlay o'chib qolsa ham chat REST orqali ishlayveradi
// (docs/ chat plani, "Arxitektura qarorlari" §2).
require('dotenv').config();
const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET;
const INTERNAL_SECRET = process.env.REALTIME_SHARED_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET sozlanmagan');
if (!INTERNAL_SECRET) throw new Error('REALTIME_SHARED_SECRET sozlanmagan');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// userId -> shu foydalanuvchining ochiq socket ulanishlari soni (bir nechta tab/qurilma
// bo'lishi mumkin) — presence "onlayn"ligini socket sonidan aniqlaymiz.
const onlineCounts = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = String(decoded.userId);
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

// userId onlayn/oflaynga o'tganda BARCHA ulangan client'larga xabar beradi — bu
// kichik ilova uchun oddiy va yetarli (Do'stlar ro'yxati/suhbat ochiq bo'lgan har
// bir client shu orqali `livePresence` xaritasini yangilaydi, src/context/ChatContext.jsx).
function broadcastPresence(userId, online) {
  io.emit('presence:update', { userId, online });
}

io.on('connection', (socket) => {
  const room = `user:${socket.userId}`;
  socket.join(room);
  const wasOffline = !onlineCounts.has(socket.userId);
  onlineCounts.set(socket.userId, (onlineCounts.get(socket.userId) || 0) + 1);
  if (wasOffline) broadcastPresence(socket.userId, true);

  // Client ulanganda/ro'yxati yangilanganda "hozir kim onlayn" haqida bir martalik
  // aniq javob so'raydi (ack orqali) — presence:update'ni kutib o'tirmasdan, darhol
  // to'g'ri holatni ko'rsatish uchun (src/context/ChatContext.jsx queryPresenceForKnownUsers).
  socket.on('presence:query', (userIds, cb) => {
    if (typeof cb !== 'function') return;
    const ids = Array.isArray(userIds) ? userIds : [];
    const result = {};
    ids.forEach((id) => {
      result[String(id)] = onlineCounts.has(String(id));
    });
    cb(result);
  });

  // "Yozmoqda..." holati (yoki ovozli/video xabar yozib turgani, `kind`) — hech
  // narsa saqlanmaydi, faqat qabul qiluvchining shaxsiy xonasiga forward qilinadi
  // (kim yozayotganini bilish uchun boshqa hech kim shart emas).
  socket.on('typing', ({ recipientId, conversationId, kind } = {}) => {
    if (!recipientId || !conversationId) return;
    io.to(`user:${recipientId}`).emit('typing', { conversationId, userId: socket.userId, kind: kind || 'text' });
  });

  socket.on('disconnect', () => {
    const n = (onlineCounts.get(socket.userId) || 1) - 1;
    if (n <= 0) {
      onlineCounts.delete(socket.userId);
      broadcastPresence(socket.userId, false);
    } else {
      onlineCounts.set(socket.userId, n);
    }
  });
});

function requireInternalSecret(req, res, next) {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Next.js API xabarni Mongo'ga yozgandan keyin shu yerga chaqiradi.
app.post('/internal/emit', requireInternalSecret, (req, res) => {
  const { recipientId, conversationId, message } = req.body || {};
  if (!recipientId || !conversationId || !message) {
    return res.status(400).json({ error: 'recipientId, conversationId, message kerak' });
  }
  io.to(`user:${recipientId}`).emit('message:new', { conversationId, message });
  res.json({ ok: true });
});

// Next.js API xabar(lar)ni "o'qildi" deb belgilagandan keyin shu yerga chaqiradi —
// asl yuboruvchining xonasiga forward qilinadi, u o'z ekranida ptichkani darhol yangilaydi.
app.post('/internal/read', requireInternalSecret, (req, res) => {
  const { userId, conversationId, readAt } = req.body || {};
  if (!userId || !conversationId || !readAt) {
    return res.status(400).json({ error: 'userId, conversationId, readAt kerak' });
  }
  io.to(`user:${userId}`).emit('message:read', { conversationId, readAt });
  res.json({ ok: true });
});

app.get('/internal/presence/:userId', requireInternalSecret, (req, res) => {
  res.json({ online: onlineCounts.has(String(req.params.userId)) });
});

server.listen(PORT, () => console.log(`[realtime] ${PORT}-portda ishga tushdi`));

// 1:1 audio/video qo'ng'iroqlar uchun signaling holat mashinasi (docs/chat/CALLS_SPEC.md §3-§5).
//
// Hammasi xotirada, bitta jarayon (bitta replika) — DB yo'q. Qo'ng'iroq tarixi tugagan
// zahoti `persist()` orqali Next.js'ga (POST /api/internal/call-event) yuboriladi, u
// Mongo'ga yozadi va qaytargan xabarni shu yerdan ikkala tomonga `message:new` qilib
// tarqatamiz.
//
// Modul ATAYLAB bog'liqliksiz: socket.io/express import qilinmaydi, har bir yon ta'sir
// (emit, taymerlar, vaqt, grant tekshiruvi, persist) `deps` orqali keladi — testlar
// (calls.test.js) soxta io va soxta taymerlar bilan to'liq boshqaradi.
//
// Asosiy qoidalar:
// - Hech narsa Next.js imzolagan grant'siz jiringlamaydi; grant socket.userId'ga va
//   payload'ga bog'lanadi, callId 120 s davomida qayta ishlatilmaydi (replay guard).
// - Bir foydalanuvchida bir vaqtda bitta qo'ng'iroq (ringing/connecting/active).
// - SDP/ICE/media faqat ikki "bog'langan" socket (callerSocketId/calleeSocketId)
//   o'rtasida uzatiladi, hech qachon xonaga (room) emas.
// - Taymerlar: jiringlash 45 s, ulanish 30 s, qayta ulanish (grace) 15 s — server hal qiladi.
'use strict';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const KINDS = ['audio', 'video'];
const END_REASONS = ['hangup', 'cancel', 'media_error', 'failed'];
const MAX_GRANT_LEN = 4096;

const DEFAULT_LIMITS = {
  RING_MS: 45000,
  CONNECT_MS: 30000,
  GRACE_MS: 15000,
  SDP_MAX: 65536,
  ICE_MAX: 2048,
  ICE_PER_SIDE: 300,
  INVITES_PER_WINDOW: 5,
  INVITE_WINDOW_MS: 30000,
  REPLAY_MS: 120000,
  MEDIA_PER_WINDOW: 20,
  MEDIA_WINDOW_MS: 10000,
  SHUTDOWN_WAIT_MS: 5000,
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const room = (userId) => `user:${userId}`;
const cleanStr = (v, max = 100) => (typeof v === 'string' && v ? v.slice(0, max) : null);
const noop = () => {};

function createCallManager({
  io,
  verifyGrant,
  persist,
  isOnline,
  now = Date.now,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  log = console,
  limits = {},
} = {}) {
  const L = { ...DEFAULT_LIMITS, ...limits };

  const calls = new Map(); // callId -> Call
  const activeCallByUser = new Map(); // userId -> callId (invite'dan yakungacha, ikkala ishtirokchi)
  const recentCallIds = new Map(); // callId -> expiresAtMs (grant replay guard)
  const inviteBuckets = new Map(); // userId -> [timestamp, ...]
  const pendingPersists = new Set();

  // --- yordamchilar -------------------------------------------------------

  function emit(target, event, payload, except) {
    let op = io.to(target);
    const ex = (except || []).filter(Boolean);
    if (ex.length) op = op.except(ex);
    op.emit(event, payload);
  }

  const bothRooms = (call) => [room(call.callerId), room(call.calleeId)];
  const boundIds = (call) => [call.callerSocketId, call.calleeSocketId].filter(Boolean);

  function sideOfUser(call, userId) {
    if (userId === call.callerId) return 'caller';
    if (userId === call.calleeId) return 'callee';
    return null;
  }

  function boundSide(call, socket) {
    if (socket.id && socket.id === call.callerSocketId) return 'caller';
    if (socket.id && socket.id === call.calleeSocketId) return 'callee';
    return null;
  }

  const otherSocketId = (call, side) => (side === 'caller' ? call.calleeSocketId : call.callerSocketId);

  function sendError(socket, code, callId) {
    socket.emit('call:error', callId ? { callId, code } : { code });
  }

  // c->s payload'ning umumiy tekshiruvi: oddiy obyekt + UUID callId.
  function validBase(p) {
    return isPlainObject(p) && typeof p.callId === 'string' && UUID_RE.test(p.callId);
  }

  // callId bo'yicha qo'ng'iroq; topilmasa (yoki payload buzuq bo'lsa) emitter'ga xato.
  function lookup(socket, p) {
    if (!validBase(p)) {
      sendError(socket, 'bad_payload');
      return null;
    }
    const call = calls.get(p.callId);
    if (!call) {
      sendError(socket, 'not_in_call', p.callId);
      return null;
    }
    return call;
  }

  function stateFor(call, side) {
    if (call.state === 'ringing') return side === 'caller' ? 'outgoing' : 'incoming';
    return call.state;
  }

  function statePayload(call, side, onThisDevice) {
    const payload = {
      callId: call.callId,
      conversationId: call.conversationId,
      kind: call.kind,
      peerId: side === 'caller' ? call.calleeId : call.callerId,
      state: stateFor(call, side),
      onThisDevice,
    };
    if (call.acceptedAt) payload.since = call.acceptedAt;
    return payload;
  }

  // Ikkala foydalanuvchining bog'lanmagan (boshqa tab/qurilma) socket'lariga holat.
  function emitStateToOthers(call) {
    const except = boundIds(call);
    emit(room(call.callerId), 'call:state', statePayload(call, 'caller', false), except);
    emit(room(call.calleeId), 'call:state', statePayload(call, 'callee', false), except);
  }

  function clearAllTimers(call) {
    ['ringTimer', 'connectTimer', 'graceTimer'].forEach((k) => {
      if (call[k]) clearTimer(call[k]);
      call[k] = null;
    });
  }

  const iso = (ms) => (ms ? new Date(ms).toISOString() : null);

  // Next.js'ga yozish (kutilmaydi — socket handler'ni bloklamaydi), muvaffaqiyatli
  // bo'lsa qaytgan xabarni ikkala xonaga `message:new` qilib tarqatamiz.
  function persistAndAnnounce(body) {
    const task = Promise.resolve()
      .then(() => persist(body))
      .then((res) => {
        if (res && res.message) {
          emit([room(body.callerId), room(body.calleeId)], 'message:new', {
            conversationId: body.conversationId,
            message: res.message,
          });
        }
      })
      .catch((err) => log.error('[realtime] call-event xatosi', err && err.message ? err.message : err))
      .finally(() => pendingPersists.delete(task));
    pendingPersists.add(task);
    return task;
  }

  function releaseUsers(call) {
    [call.callerId, call.calleeId].forEach((uid) => {
      if (activeCallByUser.get(uid) === call.callId) activeCallByUser.delete(uid);
    });
  }

  // Yakunlovchi yagona nuqta: idempotent (ikkinchi chaqiruv hech narsa qilmaydi).
  // opts.timeout — `call:end` o'rniga `call:timeout`; opts.durationEndAt — grace
  // tugaganda davomiylik uzilish paytigacha hisoblanadi.
  function finish(call, outcome, reason, opts = {}) {
    if (!call || call.finished) return false;
    call.finished = true;
    clearAllTimers(call);
    calls.delete(call.callId);
    releaseUsers(call);

    const endedAt = now();
    let durationSec = null;
    if (outcome === 'ended') {
      const base = call.acceptedAt || endedAt;
      const until = opts.durationEndAt || endedAt;
      durationSec = Math.max(0, Math.round((until - base) / 1000));
    }

    if (opts.timeout) {
      emit(bothRooms(call), 'call:timeout', { callId: call.callId });
    } else {
      emit(bothRooms(call), 'call:end', { callId: call.callId, reason, outcome, durationSec });
    }

    persistAndAnnounce({
      callId: call.callId,
      conversationId: call.conversationId,
      callerId: call.callerId,
      calleeId: call.calleeId,
      kind: call.kind,
      outcome,
      durationSec,
      startedAt: iso(call.createdAt),
      acceptedAt: outcome === 'ended' ? iso(call.acceptedAt || endedAt) : null,
      endedAt: iso(endedAt),
      answered: !!call.answered,
    });
    return true;
  }

  // Invite paytida rad etilgan (busy/offline) qo'ng'iroq: holat yaratilmaydi, faqat yozuv.
  function persistRejectedInvite(claims, outcome) {
    const t = iso(now());
    persistAndAnnounce({
      callId: claims.callId,
      conversationId: claims.conversationId,
      callerId: claims.callerId,
      calleeId: claims.calleeId,
      kind: claims.kind,
      outcome,
      durationSec: null,
      startedAt: t,
      acceptedAt: null,
      endedAt: t,
      answered: false,
    });
  }

  function pruneRecent(t) {
    for (const [id, exp] of recentCallIds) if (exp <= t) recentCallIds.delete(id);
  }

  function inviteAllowed(userId, t) {
    const hits = (inviteBuckets.get(userId) || []).filter((ts) => t - ts < L.INVITE_WINDOW_MS);
    if (hits.length >= L.INVITES_PER_WINDOW) {
      inviteBuckets.set(userId, hits);
      return false;
    }
    hits.push(t);
    inviteBuckets.set(userId, hits);
    return true;
  }

  function outcomeForForce(state) {
    if (state === 'ringing') return 'cancelled';
    if (state === 'connecting') return 'failed';
    return 'ended';
  }

  // --- c->s hodisalar -----------------------------------------------------

  function invite(socket, p, ack = noop) {
    const reply = typeof ack === 'function' ? ack : noop;
    if (!validBase(p) || typeof p.grant !== 'string' || !p.grant || p.grant.length > MAX_GRANT_LEN) {
      return reply({ ok: false, code: 'bad_payload' });
    }

    let claims;
    try {
      claims = verifyGrant(p.grant);
    } catch {
      return reply({ ok: false, code: 'bad_grant' });
    }
    const t = now();
    pruneRecent(t);
    const grantOk =
      isPlainObject(claims) &&
      claims.scope === 'call' &&
      String(claims.callerId) === String(socket.userId) &&
      claims.callId === p.callId &&
      claims.conversationId === p.conversationId &&
      claims.calleeId === p.calleeId &&
      claims.kind === p.kind &&
      KINDS.includes(claims.kind) &&
      OBJECT_ID_RE.test(String(claims.conversationId)) &&
      OBJECT_ID_RE.test(String(claims.calleeId)) &&
      !calls.has(p.callId) &&
      !recentCallIds.has(p.callId);
    if (!grantOk) return reply({ ok: false, code: 'bad_grant' });

    const callerId = String(claims.callerId);
    const calleeId = String(claims.calleeId);
    if (callerId === calleeId) return reply({ ok: false, code: 'self_call' });
    if (activeCallByUser.has(callerId)) return reply({ ok: false, code: 'already_in_call' });
    if (!inviteAllowed(callerId, t)) return reply({ ok: false, code: 'rate_limited' });

    // Grant shu nuqtadan "ishlatilgan" — busy/offline bo'lsa ham qayta yuborib bo'lmaydi.
    recentCallIds.set(p.callId, t + L.REPLAY_MS);
    const base = { callId: p.callId, conversationId: claims.conversationId, callerId, calleeId, kind: claims.kind };

    if (activeCallByUser.has(calleeId)) {
      reply({ ok: false, code: 'busy' });
      socket.emit('call:busy', { callId: p.callId, conversationId: base.conversationId });
      persistRejectedInvite(base, 'busy');
      return undefined;
    }
    if (!isOnline(calleeId)) {
      reply({ ok: false, code: 'callee_offline' });
      persistRejectedInvite(base, 'missed');
      return undefined;
    }

    // Qo'ng'iroq qiluvchining ism/rasmi faqat grant'dan (payload'dan EMAS — soxtalashtirib bo'lmaydi).
    const from = isPlainObject(claims.from) ? claims.from : {};
    const call = {
      ...base,
      from: {
        userId: callerId,
        username: cleanStr(from.username),
        name: cleanStr(from.name),
        photoId: cleanStr(from.photoId, 200),
      },
      state: 'ringing',
      callerSocketId: socket.id,
      calleeSocketId: null,
      createdAt: t,
      acceptedAt: null,
      answered: false,
      ringingRelayed: false,
      ringTimer: null,
      connectTimer: null,
      graceTimer: null,
      graceSide: null,
      disconnectedAt: null,
      iceCount: { caller: 0, callee: 0 },
      mediaHits: { caller: [], callee: [] },
      finished: false,
    };
    calls.set(call.callId, call);
    activeCallByUser.set(callerId, call.callId);
    activeCallByUser.set(calleeId, call.callId);

    const expiresAt = t + L.RING_MS;
    call.ringTimer = setTimer(() => {
      call.ringTimer = null;
      if (call.state === 'ringing') finish(call, 'missed', 'timeout', { timeout: true });
    }, L.RING_MS);

    emit(room(calleeId), 'call:invite', {
      callId: call.callId,
      conversationId: call.conversationId,
      kind: call.kind,
      from: call.from,
      expiresAt,
    });
    emit(room(callerId), 'call:state', statePayload(call, 'caller', false), [socket.id]);
    reply({ ok: true, callId: call.callId, expiresAt });
    return undefined;
  }

  function ringing(socket, p) {
    const call = lookup(socket, p);
    if (!call) return;
    if (socket.userId !== call.calleeId) return sendError(socket, 'not_in_call', call.callId);
    if (call.state !== 'ringing' || call.ringingRelayed) return;
    call.ringingRelayed = true;
    emit(call.callerSocketId, 'call:ringing', { callId: call.callId });
  }

  function accept(socket, p) {
    const call = lookup(socket, p);
    if (!call) return;
    if (socket.userId !== call.calleeId) return sendError(socket, 'not_in_call', call.callId);
    if (call.state !== 'ringing') return sendError(socket, 'not_ringing', call.callId);

    if (call.ringTimer) clearTimer(call.ringTimer);
    call.ringTimer = null;
    call.state = 'connecting';
    call.calleeSocketId = socket.id;
    call.answered = true;
    call.connectTimer = setTimer(() => {
      call.connectTimer = null;
      if (call.state === 'connecting') finish(call, 'failed', 'failed');
    }, L.CONNECT_MS);

    emit(call.callerSocketId, 'call:accept', { callId: call.callId });
    emit(room(call.calleeId), 'call:end', { callId: call.callId, reason: 'answered_elsewhere', outcome: null, durationSec: null }, [socket.id]);
    emitStateToOthers(call);
  }

  function reject(socket, p) {
    const call = lookup(socket, p);
    if (!call) return;
    if (socket.userId !== call.calleeId) return sendError(socket, 'not_in_call', call.callId);
    if (call.state !== 'ringing') return sendError(socket, 'not_ringing', call.callId);
    if (p.reason === 'busy') finish(call, 'busy', 'busy');
    else finish(call, 'declined', 'rejected');
  }

  function relay(socket, event, p) {
    const call = lookup(socket, p);
    if (!call) return;
    const side = boundSide(call, socket);
    if (!side) return sendError(socket, 'not_in_call', call.callId);
    if (call.state !== 'connecting' && call.state !== 'active') return; // hali qabul qilinmagan — e'tiborsiz
    const target = otherSocketId(call, side);
    const from = socket.userId;

    if (event === 'call:sdp') {
      const d = p.description;
      if (!isPlainObject(d) || (d.type !== 'offer' && d.type !== 'answer') || typeof d.sdp !== 'string' || d.sdp.length > L.SDP_MAX) {
        return sendError(socket, 'bad_payload', call.callId);
      }
      if (target) emit(target, 'call:sdp', { callId: call.callId, description: { type: d.type, sdp: d.sdp }, from });
      return;
    }

    if (event === 'call:ice') {
      if (!('candidate' in p)) return sendError(socket, 'bad_payload', call.callId);
      const c = p.candidate;
      if (c !== null && !isPlainObject(c)) return sendError(socket, 'bad_payload', call.callId);
      let size;
      try {
        size = JSON.stringify(c).length;
      } catch {
        return sendError(socket, 'bad_payload', call.callId);
      }
      if (size > L.ICE_MAX) return sendError(socket, 'bad_payload', call.callId);
      call.iceCount[side] += 1;
      if (call.iceCount[side] > L.ICE_PER_SIDE) {
        // Ortiqchasi tashlab yuboriladi; faqat birinchi oshishda bir marta xabar beriladi.
        if (call.iceCount[side] === L.ICE_PER_SIDE + 1) sendError(socket, 'ice_limit', call.callId);
        return;
      }
      if (target) emit(target, 'call:ice', { callId: call.callId, candidate: c, from });
      return;
    }

    if (event === 'call:media') {
      if (typeof p.audio !== 'boolean' || typeof p.video !== 'boolean') return sendError(socket, 'bad_payload', call.callId);
      const t = now();
      const hits = call.mediaHits[side].filter((ts) => t - ts < L.MEDIA_WINDOW_MS);
      if (hits.length >= L.MEDIA_PER_WINDOW) {
        call.mediaHits[side] = hits;
        return; // juda tez-tez — jimgina tashlanadi
      }
      hits.push(t);
      call.mediaHits[side] = hits;
      if (target) emit(target, 'call:media', { callId: call.callId, audio: p.audio, video: p.video, from });
    }
  }

  function connected(socket, p) {
    const call = lookup(socket, p);
    if (!call) return;
    if (!boundSide(call, socket)) return sendError(socket, 'not_in_call', call.callId);
    if (call.state !== 'connecting') return; // ICE restart'dan keyingi takror — hech narsa
    call.state = 'active';
    call.acceptedAt = now();
    if (call.connectTimer) clearTimer(call.connectTimer);
    call.connectTimer = null;
    emit(call.callerSocketId, 'call:state', statePayload(call, 'caller', true));
    emit(call.calleeSocketId, 'call:state', statePayload(call, 'callee', true));
    emitStateToOthers(call);
  }

  function end(socket, p) {
    const call = lookup(socket, p);
    if (!call) return;
    const side = sideOfUser(call, socket.userId);
    if (!side) return sendError(socket, 'not_in_call', call.callId);
    const reason = END_REASONS.includes(p.reason) ? p.reason : 'hangup';

    if (call.state === 'ringing') {
      if (side === 'caller') finish(call, 'cancelled', 'cancel');
      else finish(call, 'declined', 'rejected');
    } else if (call.state === 'connecting') {
      if (reason === 'media_error' || reason === 'failed') finish(call, 'failed', reason);
      else if (side === 'caller') finish(call, 'cancelled', 'cancel');
      else finish(call, 'declined', 'rejected');
    } else {
      finish(call, 'ended', reason);
    }
  }

  // Bog'langan socket uzilgandan keyin shu foydalanuvchining YANGI socket'i qo'ng'iroqni
  // qaytarib oladi. Server eski socket uzilganini hali sezmagan bo'lishi ham mumkin
  // (ping timeout ~45 s) — shuning uchun grace bo'lmasa ham, xuddi shu foydalanuvchining
  // boshqa socket'i connecting/active qo'ng'iroqni o'ziga ko'chira oladi (takeover).
  // Boshqa foydalanuvchi hech qachon (not_in_call).
  function resume(socket, p, ack = noop) {
    const reply = typeof ack === 'function' ? ack : noop;
    if (!validBase(p)) return reply({ ok: false, code: 'bad_payload' });
    const call = calls.get(p.callId);
    const side = call ? sideOfUser(call, socket.userId) : null;
    if (!call || !side || call.state === 'ringing' || (side === 'callee' && !call.calleeSocketId)) {
      return reply({ ok: false, code: 'not_in_call' });
    }
    const key = side === 'caller' ? 'callerSocketId' : 'calleeSocketId';
    const previous = call[key];
    let graceCleared = false;
    if (call.graceTimer && call.graceSide === side) {
      clearTimer(call.graceTimer);
      call.graceTimer = null;
      call.graceSide = null;
      call.disconnectedAt = null;
      graceCleared = true;
    }
    call[key] = socket.id;
    if (previous && previous !== socket.id) {
      // Eski socket (agar hali tirik bo'lsa) endi qo'ng'iroq bu qurilmada emasligini biladi.
      emit(previous, 'call:state', statePayload(call, side, false));
    }
    if (graceCleared || previous !== socket.id) {
      const other = otherSocketId(call, side);
      if (other) emit(other, 'call:resume', { callId: call.callId });
    }
    reply({ ok: true, state: call.state, since: call.acceptedAt });
    return undefined;
  }

  // --- ulanish/uzilish ----------------------------------------------------

  function onConnect(socket) {
    const callId = activeCallByUser.get(socket.userId);
    const call = callId && calls.get(callId);
    if (!call) return;
    const side = sideOfUser(call, socket.userId);
    if (side) socket.emit('call:state', statePayload(call, side, false));
  }

  function onDisconnect(socket, { userNowOffline } = {}) {
    const callId = activeCallByUser.get(socket.userId);
    const call = callId && calls.get(callId);
    if (!call) return;

    if (call.state === 'ringing') {
      if (socket.id === call.callerSocketId) finish(call, 'cancelled', 'disconnected');
      else if (socket.userId === call.calleeId && userNowOffline) finish(call, 'missed', 'offline');
      return;
    }

    const side = boundSide(call, socket);
    if (!side) return;
    if (call.graceTimer) {
      if (call.graceSide !== side) {
        // Ikkinchi tomon ham uzildi — kutishdan ma'no yo'q.
        const outcome = call.state === 'active' ? 'ended' : 'failed';
        finish(call, outcome, 'disconnected', { durationEndAt: call.disconnectedAt });
      }
      return;
    }
    call.graceSide = side;
    call.disconnectedAt = now();
    call.graceTimer = setTimer(() => {
      call.graceTimer = null;
      if (call.finished) return;
      if (call.state === 'active') finish(call, 'ended', 'disconnected', { durationEndAt: call.disconnectedAt });
      else finish(call, 'failed', 'disconnected');
    }, L.GRACE_MS);
  }

  // --- tashqi boshqaruv (Next.js ichki endpointlari, SIGTERM) -------------

  function forceEnd({ userId, peerId, reason } = {}) {
    const uid = String(userId || '');
    const callId = activeCallByUser.get(uid);
    const call = callId && calls.get(callId);
    if (!call) return false;
    if (peerId) {
      const other = uid === call.callerId ? call.calleeId : call.callerId;
      if (String(peerId) !== other) return false;
    }
    return finish(call, outcomeForForce(call.state), reason || 'admin');
  }

  function getUserCall(userId) {
    const callId = activeCallByUser.get(String(userId));
    const call = callId && calls.get(callId);
    return call ? { callId: call.callId, state: call.state } : null;
  }

  async function shutdown(reason = 'server_shutdown') {
    [...calls.values()].forEach((call) => finish(call, outcomeForForce(call.state), reason));
    const pending = [...pendingPersists];
    if (!pending.length) return;
    let timer;
    await Promise.race([
      Promise.allSettled(pending),
      new Promise((resolve) => {
        timer = setTimer(resolve, L.SHUTDOWN_WAIT_MS);
      }),
    ]);
    clearTimer(timer);
  }

  return {
    invite,
    ringing,
    accept,
    reject,
    relay,
    connected,
    end,
    resume,
    onConnect,
    onDisconnect,
    forceEnd,
    getUserCall,
    shutdown,
    size: () => calls.size,
  };
}

module.exports = { createCallManager, UUID_RE, OBJECT_ID_RE, DEFAULT_LIMITS };

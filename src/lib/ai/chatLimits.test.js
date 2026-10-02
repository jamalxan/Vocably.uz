import { describe, expect, it } from 'vitest';
import { CHAT_LIMITS, pruneOldSessions, trimSessionHistory, validateChatInput } from './chatLimits';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

describe('validateChatInput', () => {
  it('oddiy matn va rasm qabul qilinadi', () => {
    expect(validateChatInput('salom', [PNG])).toEqual({ ok: true, message: 'salom', images: [PNG] });
    expect(validateChatInput(undefined, [PNG]).ok).toBe(true);
    expect(validateChatInput('x', undefined)).toMatchObject({ ok: true, images: [] });
  });
  it('matn bo‘lmagan xabar (obyekt/massiv/raqam) rad etiladi', () => {
    for (const bad of [{ a: 1 }, ['x'], 5, true]) expect(validateChatInput(bad, [])).toMatchObject({ ok: false, status: 400 });
  });
  it('juda uzun xabar 413', () => {
    expect(validateChatInput('x'.repeat(CHAT_LIMITS.maxMessageChars + 1), [])).toMatchObject({ ok: false, status: 413 });
    expect(validateChatInput('x'.repeat(CHAT_LIMITS.maxMessageChars), []).ok).toBe(true);
  });
  it('rasm: faqat image data-URL (SVG/HTML/oddiy URL rad)', () => {
    for (const bad of ['http://evil/x.png', 'data:text/html;base64,PHNjcmlwdD4=', 'data:image/svg+xml;base64,PHN2Zz4=', 'javascript:alert(1)', 123, null, { $ne: 1 }]) {
      expect(validateChatInput('x', [bad])).toMatchObject({ ok: false, status: 415 });
    }
  });
  it('bitta rasm va jami hajm chegaralari', () => {
    const big = `data:image/png;base64,${'A'.repeat(CHAT_LIMITS.maxImageChars)}`;
    expect(validateChatInput('x', [big])).toMatchObject({ ok: false, status: 413 });
    const mid = `data:image/jpeg;base64,${'A'.repeat(1_100_000)}`;
    expect(validateChatInput('x', [mid, mid, mid]).ok).toBe(true);
    expect(validateChatInput('x', [mid, mid, mid, mid])).toMatchObject({ ok: false, status: 413 });
  });
  it('10 tadan ortiq rasm kesiladi', () => {
    expect((validateChatInput('x', Array(25).fill(PNG)) ).images).toHaveLength(10);
  });
});

describe('trimSessionHistory', () => {
  const mk = (n, withImages = true) => Array.from({ length: n }, (_, i) => ({ role: 'user', parts: [{ text: `m${i}` }], imageUrls: withImages ? [PNG] : [], imageUrl: null }));
  it('oxirgi 80 xabar qoladi', () => {
    const s = { messages: mk(130) };
    trimSessionHistory(s);
    expect(s.messages).toHaveLength(80);
    expect(s.messages[0].parts[0].text).toBe('m50');
  });
  it('rasmlar faqat oxirgi 6 xabarda qoladi', () => {
    const s = { messages: mk(20) };
    trimSessionHistory(s);
    const withImg = s.messages.filter((m) => m.imageUrls.length).length;
    expect(withImg).toBe(6);
    expect(s.messages.slice(-6).every((m) => m.imageUrls.length === 1)).toBe(true);
  });
  it('eski yagona imageUrl ham tozalanadi; qisqa tarix o‘zgarmaydi', () => {
    const s = { messages: [{ role: 'user', parts: [], imageUrls: [], imageUrl: PNG }, ...mk(10, false)] };
    trimSessionHistory(s);
    expect(s.messages[0].imageUrl).toBeNull();
    const t = { messages: mk(3) };
    trimSessionHistory(t);
    expect(t.messages).toHaveLength(3);
  });
});

describe('pruneOldSessions', () => {
  it('eng eskilarini olib tashlaydi, yangi qo‘shishga joy (49 ta) qoladi', () => {
    const user = { chatSessions: Array.from({ length: 60 }, (_, i) => ({ title: `s${i}`, updatedAt: new Date(2026, 0, 1 + i) })) };
    const removed = pruneOldSessions(user);
    expect(removed).toBe(11);
    expect(user.chatSessions).toHaveLength(49);
    expect(user.chatSessions.some((s) => s.title === 's0')).toBe(false);
    expect(user.chatSessions.some((s) => s.title === 's59')).toBe(true);
  });
  it('limit ostida hech narsa o‘chirmaydi', () => {
    const user = { chatSessions: Array.from({ length: 10 }, (_, i) => ({ title: `s${i}`, updatedAt: new Date() })) };
    expect(pruneOldSessions(user)).toBe(0);
    expect(user.chatSessions).toHaveLength(10);
  });
});

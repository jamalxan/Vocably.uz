import { describe, expect, it } from 'vitest';
import { installSafeJson, stripOperators } from './safeRequest';

describe('stripOperators', () => {
  it('oddiy qiymatlar va obyektlar o‘zgarmaydi', () => {
    const body = { phone: '+998901234567', words: [{ word: 'a', syns: ['b'] }], n: 3, ok: true, nothing: null };
    expect(stripOperators(body)).toEqual(body);
  });
  it('$ operatorli obyekt xavfsiz matn bilan almashtiriladi (har qanday chuqurlikda)', () => {
    expect(stripOperators({ sessionToken: { $ne: '' } })).toEqual({ sessionToken: "[noto'g'ri]" });
    expect(stripOperators({ a: { b: [{ c: { $gt: '' } }] } })).toEqual({ a: { b: [{ c: "[noto'g'ri]" }] } });
    expect(stripOperators({ $where: 'sleep(1000)' })).toBe("[noto'g'ri]");
    expect(stripOperators({ x: { $regex: '.*', $options: 'i' } })).toEqual({ x: "[noto'g'ri]" });
  });
  it('"$" ichida bo‘lgan oddiy matn qiymati va kalit o‘rtasidagi $ tegmaydi', () => {
    expect(stripOperators({ price: '$5', note: 'a$b' })).toEqual({ price: '$5', note: 'a$b' });
    expect(stripOperators({ 'a$b': 1 })).toEqual({ 'a$b': 1 });
  });
  it('prototype pollution kalitlari tashlanadi', () => {
    const parsed = JSON.parse('{"__proto__":{"admin":true},"constructor":1,"ok":1}');
    const out = stripOperators(parsed);
    expect(out).toEqual({ ok: 1 });
    expect({}.admin).toBeUndefined();
  });
  it('juda chuqur ichma-ichlikni kesadi (DoS)', () => {
    let deep = { v: 1 };
    for (let i = 0; i < 40; i++) deep = { n: deep };
    expect(JSON.stringify(stripOperators(deep))).toContain("[noto'g'ri]");
  });
});

describe('installSafeJson', () => {
  it('Request.json() natijasini tozalaydi va bir marta o‘raydi (idempotent)', async () => {
    expect(installSafeJson()).toBe(false); // modul import qilinganda allaqachon o'rnatilgan
    const req = new Request('http://x/api', { method: 'POST', body: JSON.stringify({ sessionToken: { $ne: '' }, code: '123456' }) });
    expect(await req.json()).toEqual({ sessionToken: "[noto'g'ri]", code: '123456' });
  });
  it('yaroqsiz JSON avvalgidek xato beradi', async () => {
    const req = new Request('http://x/api', { method: 'POST', body: '{bad' });
    await expect(req.json()).rejects.toThrow();
  });
});

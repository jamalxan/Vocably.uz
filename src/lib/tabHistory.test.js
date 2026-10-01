import { describe, expect, it } from 'vitest';
import { decideTabNavigation, readBase, writeBase } from './tabHistory';

const ROOTS = ['/app', '/app/mashq', '/app/ai', '/app/dostlar', '/app/profil'];
const d = (over) => decideTabNavigation({ pathname: '/app', targetHref: '/app/profil', tabRoots: ROOTS, base: null, historyLength: 5, ...over });

describe('decideTabNavigation', () => {
  it('bosilgan tab allaqachon faol — hech narsa', () => {
    expect(d({ pathname: '/app/ai', targetHref: '/app/ai' }).action).toBe('noop');
  });
  it('Bosh sahifa -> tab: push va "ostida Bosh sahifa bor" belgisi (uzunlik +1)', () => {
    expect(d({ pathname: '/app', targetHref: '/app/mashq', historyLength: 5 })).toEqual({ action: 'push', nextBase: { len: 6 } });
  });
  it('tab -> tab: replace, belgi saqlanadi', () => {
    const base = { len: 6 };
    expect(d({ pathname: '/app/mashq', targetHref: '/app/ai', base, historyLength: 6 })).toEqual({ action: 'replace', nextBase: base });
  });
  it('tab -> Bosh sahifa: belgi yaroqli (uzunlik o‘zgarmagan) bo‘lsa back', () => {
    expect(d({ pathname: '/app/ai', targetHref: '/app', base: { len: 6 }, historyLength: 6 })).toEqual({ action: 'back', nextBase: null });
  });
  it('tab -> Bosh sahifa: oraliqda yangi yozuv qo‘shilgan (uzunlik farqli) yoki belgi yo‘q bo‘lsa replace', () => {
    expect(d({ pathname: '/app/ai', targetHref: '/app', base: { len: 6 }, historyLength: 8 }).action).toBe('replace');
    expect(d({ pathname: '/app/ai', targetHref: '/app', base: null, historyLength: 6 }).action).toBe('replace');
  });
  it('ichki sahifadan tab bosilsa — oddiy push, belgi tozalanadi', () => {
    expect(d({ pathname: '/app/lugat/jadval', targetHref: '/app/profil', base: { len: 6 }, historyLength: 7 })).toEqual({ action: 'push', nextBase: null });
  });
  it('to‘liq ssenariy: Bosh -> Mashq -> AI -> Profil -> Bosh bitta "back" bilan', () => {
    let len = 4; // dastlabki tarix
    let base = null;
    let path = '/app';
    const apply = (target) => {
      const r = decideTabNavigation({ pathname: path, targetHref: target, tabRoots: ROOTS, base, historyLength: len });
      if (r.action === 'push') len += 1;
      base = r.nextBase;
      if (r.action !== 'noop') path = target;
      return r.action;
    };
    expect([apply('/app/mashq'), apply('/app/ai'), apply('/app/profil'), apply('/app')]).toEqual(['push', 'replace', 'replace', 'back']);
  });
});

describe('sessionStorage belgisi', () => {
  const mem = () => {
    const s = new Map();
    return { getItem: (k) => s.get(k) ?? null, setItem: (k, v) => s.set(k, v), removeItem: (k) => s.delete(k) };
  };
  it('yozadi, o‘qiydi, tozalaydi; buzilgan qiymat null', () => {
    const st = mem();
    writeBase({ len: 7 }, st);
    expect(readBase(st)).toEqual({ len: 7 });
    writeBase(null, st);
    expect(readBase(st)).toBeNull();
    st.setItem('vocably.tabBase', '{bad');
    expect(readBase(st)).toBeNull();
    st.setItem('vocably.tabBase', JSON.stringify({ len: 'x' }));
    expect(readBase(st)).toBeNull();
  });
  it('storage yo‘q yoki xato bersa jim ishlaydi', () => {
    expect(readBase(null)).toBeNull();
    expect(() => writeBase({ len: 1 }, { setItem() { throw new Error('denied'); }, removeItem() {} })).not.toThrow();
  });
});

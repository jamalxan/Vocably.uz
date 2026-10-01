import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from './jsonLd';

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe('serializeJsonLd', () => {
  it('</script> bilan skript blokidan chiqib bo‘lmaydi, lekin JSON.parse asl qiymatni qaytaradi', () => {
    const data = { name: '</script><script>alert(1)</script>', a: 'x&y', b: '<b>' };
    const out = serializeJsonLd(data);
    expect(out).not.toMatch(/[<>&]/);
    expect(out.toLowerCase()).not.toContain('</script');
    expect(JSON.parse(out)).toEqual(data);
  });
  it('oddiy ma‘lumot o‘zgarmaydi', () => {
    expect(serializeJsonLd({ '@type': 'DefinedTerm', name: 'arise' })).toBe('{"@type":"DefinedTerm","name":"arise"}');
  });
  it('U+2028/2029 ekranlanadi', () => {
    const out = serializeJsonLd({ s: `a${LS}b${PS}c` });
    expect(out.includes(LS) || out.includes(PS)).toBe(false);
    expect(JSON.parse(out).s).toBe(`a${LS}b${PS}c`);
  });
});

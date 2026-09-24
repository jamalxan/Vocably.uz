import { describe, expect, it } from 'vitest';
import { Matrix2D } from './pdfNodePolyfills';

const parts = (m: Matrix2D) => [m.a, m.b, m.c, m.d, m.e, m.f];

describe('Matrix2D (DOMMatrix polyfill)', () => {
  it('bo\'sh konstruktor — birlik matritsa', () => {
    const m = new Matrix2D();
    expect(parts(m)).toEqual([1, 0, 0, 1, 0, 0]);
    expect(m.isIdentity).toBe(true);
  });

  it('pdfjs worker naqshi: scaleSelf().translateSelf()', () => {
    // pdf.worker.mjs: new DOMMatrix().scaleSelf(1 / width, -1 / height).translateSelf(0, -height)
    const m = new Matrix2D().scaleSelf(1 / 4, -1 / 2).translateSelf(0, -2);
    expect(parts(m)).toEqual([0.25, 0, 0, -0.5, 0, 1]);
  });

  it('invertSelf × asl = birlik', () => {
    const m = new Matrix2D([2, 1, 1, 3, 5, 7]);
    const r = m.multiply(m.inverse());
    parts(r).forEach((v, i) => expect(v).toBeCloseTo([1, 0, 0, 1, 0, 0][i]));
  });

  it('preMultiplySelf tartibi multiplySelfga teskari', () => {
    const a = [1, 2, 3, 4, 5, 6];
    const b = [0, 1, -1, 0, 2, 3];
    expect(parts(new Matrix2D(a).preMultiplySelf(b))).toEqual(parts(new Matrix2D(b).multiplySelf(a)));
  });

  it('transformPoint', () => {
    expect(new Matrix2D([1, 0, 0, 1, 10, 20]).transformPoint({ x: 1, y: 2 })).toMatchObject({ x: 11, y: 22 });
  });
});

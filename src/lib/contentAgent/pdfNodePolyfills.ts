// pdfjs-dist (pdf-parse v2 ichida) Node'da `DOMMatrix`/`Path2D`/`ImageData`ni
// `@napi-rs/canvas` native paketidan oladi. Vercel serverless bundle'ida bu
// native paket YO'Q — natijada pdfjs moduli yuklanayotgandayoq
// (`const SCALE_MATRIX = new DOMMatrix()`) "ReferenceError: DOMMatrix is not
// defined" bilan yiqilardi va /api/admin/agent/upload umuman ishlamay qolardi
// (2026-09-24 production loglari).
//
// Matn ajratish (`getText`) canvas'ga muhtoj emas — unga faqat modul
// yuklanishi va ba'zi ichki hisob-kitoblar uchun 2D affin matritsa kerak.
// Shuning uchun bu yerda faqat o'sha qism (a..f) yozilgan; native canvas
// mavjud bo'lsa (lokal/worker), u ustun turadi — polyfill faqat bo'shliqni
// to'ldiradi.

type Init = number[] | Float32Array | Float64Array | { a: number; b: number; c: number; d: number; e: number; f: number };

class Matrix2D {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  constructor(init?: Init) {
    if (!init) return;
    if (Array.isArray(init) || ArrayBuffer.isView(init)) {
      const m = Array.from(init as ArrayLike<number>);
      // 16 elementli (4x4) massivdan 2D qismi olinadi.
      [this.a, this.b, this.c, this.d, this.e, this.f] = m.length === 16 ? [m[0], m[1], m[4], m[5], m[12], m[13]] : m;
    } else {
      ({ a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f } = init);
    }
  }

  get is2D() {
    return true;
  }

  get isIdentity() {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
  }

  // this = this × o
  multiplySelf(other?: Init) {
    const o = new Matrix2D(other);
    const { a, b, c, d, e, f } = this;
    this.a = a * o.a + c * o.b;
    this.b = b * o.a + d * o.b;
    this.c = a * o.c + c * o.d;
    this.d = b * o.c + d * o.d;
    this.e = a * o.e + c * o.f + e;
    this.f = b * o.e + d * o.f + f;
    return this;
  }

  // this = o × this
  preMultiplySelf(other?: Init) {
    const o = new Matrix2D(other);
    const { a, b, c, d, e, f } = this;
    this.a = o.a * a + o.c * b;
    this.b = o.b * a + o.d * b;
    this.c = o.a * c + o.c * d;
    this.d = o.b * c + o.d * d;
    this.e = o.a * e + o.c * f + o.e;
    this.f = o.b * e + o.d * f + o.f;
    return this;
  }

  translateSelf(tx = 0, ty = 0) {
    return this.multiplySelf([1, 0, 0, 1, tx, ty]);
  }

  scaleSelf(sx = 1, sy = sx) {
    return this.multiplySelf([sx, 0, 0, sy, 0, 0]);
  }

  invertSelf() {
    const { a, b, c, d, e, f } = this;
    const det = a * d - b * c;
    if (!det) {
      this.a = this.b = this.c = this.d = this.e = this.f = NaN;
      return this;
    }
    this.a = d / det;
    this.b = -b / det;
    this.c = -c / det;
    this.d = a / det;
    this.e = (c * f - d * e) / det;
    this.f = (b * e - a * f) / det;
    return this;
  }

  multiply(other?: Init) {
    return new Matrix2D(this).multiplySelf(other);
  }

  translate(tx?: number, ty?: number) {
    return new Matrix2D(this).translateSelf(tx, ty);
  }

  scale(sx?: number, sy?: number) {
    return new Matrix2D(this).scaleSelf(sx, sy);
  }

  inverse() {
    return new Matrix2D(this).invertSelf();
  }

  transformPoint(p: { x?: number; y?: number } = {}) {
    const x = p.x ?? 0;
    const y = p.y ?? 0;
    return { x: this.a * x + this.c * y + this.e, y: this.b * x + this.d * y + this.f, z: 0, w: 1 };
  }
}

export function ensurePdfNodePolyfills() {
  const g = globalThis as any;
  if (!g.DOMMatrix) g.DOMMatrix = Matrix2D;
}

export { Matrix2D };

// GLSL for the landing experience. Every color arrives as a uniform derived
// from the site's own CSS tokens (see ExperienceScene's paletteFromColors) —
// no hue is hardcoded here, only how those colors are mixed and lit.
// Colors are passed as raw sRGB 0..1 vectors and written straight to the
// sRGB canvas, so a uniform built from `--color-bg` renders pixel-identical
// to the CSS background around it.

const NOISE = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < OCTAVES; i++) {
    v += a * vnoise(p);
    p = m * p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

export const backdropVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Domain-warped fbm "silk" — the video-like moving background. uScroll
// pushes the warp field along as the page scrolls, uVelocity makes it churn
// harder while scrolling fast, and the deep-merlot palette replaces the light
// (cream/pink) one inside the uDarkRanges bands (the dark chapters).
export const backdropFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform vec2 uDarkRanges[4];
uniform int uDarkCount;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec3 uBg;
uniform vec3 uSurface;
uniform vec3 uAccentSoft;
uniform vec3 uPrimarySoft;
uniform vec3 uAccent;
uniform vec3 uPrimary;
uniform vec3 uPrimaryDeep;
uniform vec3 uGold;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 p = vUv - 0.5;
  p.x *= uRes.x / max(uRes.y, 1.0);
  float t = uTime * 0.045;
  float s = uScroll * 3.0;

  vec2 q = vec2(
    fbm(p * 1.25 + vec2(0.0, t + s)),
    fbm(p * 1.25 + vec2(5.2, -t + s * 0.55)));
  vec2 r = vec2(
    fbm(p * 1.6 + 2.6 * q + vec2(1.7, 9.2) + t * 0.8 + uMouse * 0.12),
    fbm(p * 1.6 + 2.6 * q + vec2(8.3, 2.8) - t * 0.6 - uMouse * 0.12));
  float f = fbm(p * 1.1 + (2.2 + uVelocity * 1.2) * r + s * 0.35);
  float silk = pow(1.0 - abs(sin((f * 2.2 + q.x) * 6.2831)), 14.0);

  vec3 light = uBg;
  light = mix(light, uAccentSoft, smoothstep(0.35, 0.72, f));
  light = mix(light, uPrimarySoft, smoothstep(0.45, 0.85, r.y) * 0.7);
  light = mix(light, uAccent, smoothstep(0.62, 0.9, f * (0.7 + r.x)) * 0.16);
  light = mix(light, uSurface, silk * 0.4);

  vec3 dark = mix(uPrimaryDeep, uPrimary, smoothstep(0.25, 0.7, f));
  dark = mix(dark, uAccent, smoothstep(0.55, 0.92, f * (0.6 + r.x)) * 0.6);
  dark = mix(dark, uGold, smoothstep(0.78, 1.0, f + silk * 0.25) * 0.14);
  dark += silk * 0.09 * uAccentSoft;

  // Dark exactly behind the dark chapters' on-screen bands (soft edges).
  float dk = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uDarkCount) break;
    vec2 rg = uDarkRanges[i];
    float band = smoothstep(rg.x - 0.03, rg.x + 0.07, vUv.y) * (1.0 - smoothstep(rg.y - 0.07, rg.y + 0.03, vUv.y));
    dk = max(dk, band);
  }

  vec3 col = mix(light, dark, dk);
  float vig = smoothstep(1.25, 0.15, length(p));
  col *= mix(0.97 + 0.03 * vig, 0.72 + 0.28 * vig, dk);
  col += (hash21(vUv * uRes + fract(uTime * 7.0) * 91.0) - 0.5) * 0.028;
  gl_FragColor = vec4(col, 1.0);
}
`;

// The Learning Core orb: a gently "breathing" sphere (vertex displacement,
// stronger while scrolling fast) with merlot-to-accent body, a soft
// accent-soft fresnel rim and a faint gold back-light.
export const orbVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;
float wave(vec3 p) {
  return sin(p.x * 1.7 + uTime * 0.6) * sin(p.y * 2.1 - uTime * 0.5) * sin(p.z * 1.9 + uTime * 0.4);
}
void main() {
  float n = wave(normal * 2.2) * 0.6 + wave(normal * 4.3 + 3.1) * 0.3;
  vNoise = n;
  vec3 pos = position + normal * n * uAmp;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vViewPos = mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const orbFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uPrimary;
uniform vec3 uPrimaryDeep;
uniform vec3 uAccent;
uniform vec3 uAccentSoft;
uniform vec3 uSurface;
uniform vec3 uGold;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
  float grad = n.y * 0.5 + 0.5;
  float swirl = sin(vNoise * 5.0 + grad * 6.0 + uTime * 0.4) * 0.5 + 0.5;

  vec3 base = mix(uPrimaryDeep, uPrimary, smoothstep(0.0, 0.6, grad));
  base = mix(base, uAccent, smoothstep(0.35, 1.0, grad * 0.7 + swirl * 0.5) * 0.85);

  vec3 L = normalize(vec3(0.5, 0.9, 0.8));
  float diff = max(dot(n, L), 0.0);
  vec3 H = normalize(L + v);
  float spec = pow(max(dot(n, H), 0.0), 80.0);
  vec3 L2 = normalize(vec3(-0.8, -0.4, 0.3));
  float back = pow(max(dot(n, L2), 0.0), 3.0);

  vec3 col = base * (0.45 + 0.7 * diff);
  col += spec * uSurface * 0.85;
  col += fres * mix(uAccentSoft, uAccent, 0.35) * 0.95;
  col += back * uGold * 0.18;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const haloVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const haloFragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(smoothstep(1.0, 0.0, d), 2.4) * uIntensity;
  gl_FragColor = vec4(uColor, a);
}
`;

// Depth particles that drift up and fly past as the page scrolls — gives the
// fixed canvas a sense of travelling through space rather than sitting still.
export const particlesVertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSeed;
varying float vSeed;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * 0.08 * aScale + uScroll * 18.0 * aScale + 6.0, 12.0) - 6.0;
  p.x += sin(uTime * 0.2 + aSeed * 6.2831) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;
  gl_Position = projectionMatrix * mv;
  vSeed = aSeed;
}
`;

export const particlesFragment = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDark;
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 c = mix(uColorA, uColorB, step(0.72, vSeed));
  gl_FragColor = vec4(c, a * (0.3 + 0.4 * uDark));
}
`;

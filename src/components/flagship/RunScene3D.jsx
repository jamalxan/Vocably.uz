'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RUN } from '@/lib/flagship/run';
import { RUN_THEMES, THEME_KEYS, SIGN_TONES, themeIndex, themeBlend } from '@/lib/flagship/runTheme';
import { dprFor } from '@/lib/flagship/gpu';

// Vocably Run scene: a synthwave look (design §7). A neon grid floor scrolls toward the runner, a
// striped sun sits on the horizon under the stars, and the palette changes every 10 correct answers.
// The visual idea is inspired by akarlsten/cuberun (MIT, © 2023 Adam Karlsten; credited in
// THIRD_PARTY_NOTICES.md). No code, textures, models or fonts come from it: everything is a few quads
// and tori with small shaders, the words are drawn into canvas textures, and there is no
// postprocessing (the glow is additive halo shells), so budget phones can run it.
//
// Contract: every frame reads `sceneRef.current`, written by the VocablyRun controller:
//   { lane, progress, options, feedback, speed, running, locked, level }
// The scene writes back only `contextLost` (webglcontextlost), which the controller's own loop turns
// into the 2D fallback, so React never re-renders at 60 fps. The canvas stays mounted between rounds
// and is paused with frameloop="never" (unmounting R3F from inside a frame callback crashes).

const LANE_X = [-2, 0, 2];
const GATE_FAR = -34;
const CAM_POS = [0, 3.2, 6];
const CAM_LOOK = [0, 1.4, -10];
const CAMERA = { position: CAM_POS, fov: 55, near: 0.1, far: 400 };
/** Floor speed at ×1 = the gate's own approach speed, so the gate looks planted on the moving grid. */
const WORLD_SPEED = (Math.abs(GATE_FAR) * 1000) / RUN.travelMs;
const CELL = 2; // one lane per grid cell: lane lines at x = ±1 and ±3
const ROAD = 3; // road half-width
// Roadside lamp posts (world section); the floor shader draws their light pools.
const POST = { x: ROAD + 2.2, spacing: 7, count: 15, z0: 6, arm: 0.9, top: 3.3 };
const POST_POOL_X = POST.x - POST.arm;
const FOG_NEAR = 18;
const FOG_FAR = 100;
const FLOOR = { w: 320, l: 240, nearZ: 8 };
const SKY = { z: -300, w: 900, h: 560, y: 250 }; // tall enough for the wider portrait field of view
const SUN = { z: -94, r: 17, y: 7 };
const SUN_E = (SUN.y - CAM_POS[1]) / (CAM_POS[2] - SUN.z); // tan(elevation) of the sun's centre
const SUN_RT = SUN.r / (CAM_POS[2] - SUN.z); // tan of its angular radius
// The arch must clear the outer signs and their rim glow (corners ≈ 4.03 from the arch centre).
const ARCH_R = 4.6;
const SIGN = { w: 1.9, h: 0.95, y: 2.2 }; // high enough to clear the runner's head until the lane locks
const SIGN_PX = [512, 256];
const RIM_PAD = 64; // canvas px of glow around a sign panel
const SIGN_FADE = 0.1; // share of the gate's travel over which it fades in at the far end

// Cost by render tier (gpu.js): fewer stars and halo shells, no floor glow, no MSAA, and a lighter world
// (no lamp posts or light pools, one mountain ridge) on 'low'.
const TIERS = {
  high: { stars: 4000, starSize: 5, arc: 72, glow: true, world: true, antialias: true, halos: [{ tube: 0.2, opacity: 0.55 }, { tube: 0.48, opacity: 0.2 }] },
  low: { stars: 1500, starSize: 5, arc: 40, glow: false, world: false, antialias: false, halos: [{ tube: 0.3, opacity: 0.45 }] },
};

const glf = (n) => Number(n).toFixed(4); // a GLSL float literal
const CAM_GLSL = `vec3(${CAM_POS.map(glf).join(', ')})`;
const TONE_RIM = Object.fromEntries(Object.entries(SIGN_TONES).map(([k, t]) => [k, t.rim ? new THREE.Color(t.rim) : null]));
const WHITE = new THREE.Color(1, 1, 1);

/**
 * The live palette. `cur` holds one THREE.Color per theme slot; shader uniforms reference these
 * objects, so easing them in place recolours every material with no per-frame allocation. A level
 * change eases from the colours on screen over THEME_EASE_MS of rendered time (never a flash; a pause
 * mid-change resumes it where it stopped). Only a lower level (a new round, which starts while the
 * stage is hidden) snaps.
 */
function createPalette() {
  const toColors = (t) => Object.fromEntries(THEME_KEYS.map((k) => [k, new THREE.Color(t[k])]));
  const themes = RUN_THEMES.map(toColors);
  const cur = toColors(RUN_THEMES[0]);
  const from = toColors(RUN_THEMES[0]);
  let to = themes[0];
  let level = 0;
  let elapsed = 0;
  let settled = true;
  return {
    cur,
    /** Once per frame: the controller's level and this frame's time in ms. */
    update(next, dtMs) {
      const lv = Number.isFinite(next) ? next : 0;
      if (lv !== level) {
        const snap = lv < level;
        to = themes[themeIndex(lv)];
        for (let i = 0; i < THEME_KEYS.length; i++) {
          const k = THEME_KEYS[i];
          if (snap) cur[k].copy(to[k]);
          else from[k].copy(cur[k]);
        }
        level = lv;
        elapsed = 0;
        settled = snap;
        return;
      }
      if (settled) return;
      elapsed += dtMs;
      const t = themeBlend(elapsed);
      for (let i = 0; i < THEME_KEYS.length; i++) {
        const k = THEME_KEYS[i];
        cur[k].copy(from[k]).lerp(to[k], t);
      }
      settled = t >= 1;
    },
  };
}

function PaletteDriver({ sceneRef, pal }) {
  // Priority -1: runs before every other frame callback, so they all see this frame's colours.
  useFrame((state, dt) => {
    pal.update(sceneRef.current.level, Math.min(0.1, dt) * 1000);
    // The fog and the clear colour follow the horizon, so whatever the fog swallows fades into it.
    state.scene.fog?.color.copy(pal.cur.horizon);
    if (state.scene.background?.isColor) state.scene.background.copy(pal.cur.horizon);
  }, -1);
  return null;
}

/**
 * Reports a lost WebGL context (GPU reset, too many tabs) to the controller, whose own loop moves the
 * round to 2D. The listeners live exactly as long as the scene: R3F's teardown forces a context loss
 * of its own after the Canvas unmounts (a switch to 2D), and that one must not read as a GPU failure.
 */
function ContextLossReporter({ sceneRef }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (e) => {
      e.preventDefault(); // lets the browser restore it
      sceneRef.current.contextLost = true;
    };
    // A context the browser gives back clears it (three.js re-uploads everything on restore).
    const onRestored = () => {
      sceneRef.current.contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl, sceneRef]);
  return null;
}

// ---------------------------------------------------------------------------------- shaders
const WORLD_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Light near the horizon in the direction of a world point: a glow band hugging the horizon and a
// halo around the sun. Shared by the sky and the far floor, so the grid fades into exactly the colour
// of the sky behind it and the end of the floor leaves no seam.
const HAZE_GLSL = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunGlow;
  vec3 hazeLight(vec3 world, float h) {
    vec3 d = world - ${CAM_GLSL};
    float ahead = max(-d.z, 0.001);
    float r = length(vec2(d.x / ahead, d.y / ahead - ${glf(SUN_E)}));
    return uGlow * (0.35 * exp(-h * 24.0)) + uSunGlow * (0.3 * exp(-max(r - ${glf(SUN_RT)}, 0.0) * 9.0));
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  ${HAZE_GLSL}
  varying vec3 vWorld;
  void main() {
    vec3 d = vWorld - ${CAM_GLSL};
    float h = max(d.y / max(-d.z, 0.001), 0.0); // tan(elevation)
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.12, h));
    col = mix(col, uTop, smoothstep(0.1, 0.34, h));
    col += hazeLight(vWorld, h);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// The classic synthwave sun: a vertical gradient with horizontal cut-outs that thicken toward the
// bottom and drift down slowly while the round runs. Both edges of every band are anti-aliased.
const SUN_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float disc = 1.0 - smoothstep(1.0 - max(fwidth(r), 1e-4) * 1.5, 1.0, r);
    float y = vUv.y;
    vec3 col = mix(uBottom, uTop, smoothstep(0.12, 0.95, y));
    float lower = clamp((0.62 - y) / 0.62, 0.0, 1.0);
    float b = y * 12.0 + uTime;
    float fb = max(fwidth(b), 1e-4);
    float half_gap = lower * 0.42 - 0.03;
    float keep = smoothstep(half_gap - fb, half_gap + fb, abs(fract(b + 0.5) - 0.5));
    float a = disc * keep;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

// Neon grid floor. Thin anti-aliased lines: under a pixel a line stays one pixel wide and dims
// instead, and once a cell is only a few pixels the lines fade out, so the far grid melts into the
// haze instead of shimmering (moire). The four lane lines on the road are brighter and wider.
const FLOOR_FRAG = /* glsl */ `
  uniform float uScroll;
  uniform vec3 uFloor;
  uniform vec3 uGrid;
  uniform vec3 uLane;
  uniform vec2 uFog;
  uniform float uPost;
  ${HAZE_GLSL}
  varying vec3 vWorld;
  varying float vDepth;
  float gridLine(float v, float w, float fw) {
    float d = abs(fract(v + 0.5) - 0.5);
    float hw = max(w, 0.5 * fw);
    float cover = clamp((hw - d) / fw + 0.5, 0.0, 1.0) * (w / hw);
    return cover * (1.0 - smoothstep(0.12, 0.4, fw));
  }
  void main() {
    float ux = vWorld.x / ${glf(CELL)} + 0.5;
    float uz = (vWorld.z - uScroll) / ${glf(CELL)};
    float fx = max(fwidth(ux), 1e-4);
    float fz = max(fwidth(uz), 1e-4);
    float ax = abs(vWorld.x);
    float lineX = abs(floor(ux + 0.5) * ${glf(CELL)} - ${glf(CELL / 2)}); // |x| of the nearest along-line
    float edge = step(abs(lineX - ${glf(ROAD)}), 0.5);
    float divider = step(lineX, ${glf(ROAD / 2)});
    float onRoad = 1.0 - smoothstep(${glf(ROAD - 0.05)}, ${glf(ROAD + 0.15)}, ax);
    float w = mix(mix(0.011, 0.02, divider), 0.03, edge);
    vec3 alongCol = mix(mix(uGrid, uLane * 0.8, divider), uLane, edge);
    float along = gridLine(ux, w, fx);
    float across = gridLine(uz, 0.013, fz) * mix(1.0, 0.5, onRoad);
    vec3 col = uFloor + uLane * (0.03 * onRoad);
    col += uLane * (0.07 * onRoad * exp(-(${glf(ROAD)} - min(ax, ${glf(ROAD)})) * 1.6));
    col += alongCol * along + uGrid * across;
  #ifdef GLOW
    // Light pools under the roadside lamps (same spacing and scroll as the posts).
    float pz = vWorld.z - ${glf(POST.z0)} - uPost;
    pz -= ${glf(POST.spacing)} * floor(pz / ${glf(POST.spacing)} + 0.5);
    float px = ax - ${glf(POST_POOL_X)};
    col += uLane * (0.16 * exp(-(px * px * 0.55 + pz * pz * 0.3)));
  #endif
  #ifdef GLOW
    float near = 1.0 - smoothstep(0.03, 0.18, fz);
    float dx = abs(fract(ux + 0.5) - 0.5) * ${glf(CELL)};
    float dz = abs(fract(uz + 0.5) - 0.5) * ${glf(CELL)};
    col += (alongCol * (exp(-dx * 8.0) * 0.2) + uGrid * (exp(-dz * 8.0) * 0.1 * mix(1.0, 0.5, onRoad))) * near;
  #endif
    float fog = smoothstep(uFog.x, uFog.y, vDepth);
    col = mix(col, uHorizon + hazeLight(vWorld, 0.0), fog);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Soft glow shell (instead of bloom): brightest where the tube faces the camera, fading to nothing at
// its silhouette, dimmer with distance.
const GLOW_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec2 uFog;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDepth;
  void main() {
    float f = abs(dot(normalize(vNormal), normalize(vView)));
    float a = pow(f, 2.2) * uOpacity * (1.0 - 0.7 * smoothstep(uFog.x, uFog.y, vDepth));
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;
const SPOT_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float a = 1.0 - smoothstep(0.0, 1.0, length(vUv * 2.0 - 1.0));
    gl_FragColor = vec4(uColor, a * a * uOpacity);
    #include <colorspace_fragment>
  }
`;

const fogUniform = () => ({ value: new THREE.Vector2(FOG_NEAR, FOG_FAR) });

// ---------------------------------------------------------------------------------- backdrop
function Sky({ pal }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(SKY.w, SKY.h), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTop: { value: pal.cur.skyTop },
          uMid: { value: pal.cur.skyMid },
          uHorizon: { value: pal.cur.horizon },
          uGlow: { value: pal.cur.glow },
          uSunGlow: { value: pal.cur.sunBottom },
        },
        vertexShader: WORLD_VERT,
        fragmentShader: SKY_FRAG,
        depthWrite: false, // behind everything; stars and sun are never hidden by it
        fog: false,
        toneMapped: false,
      }),
    [pal]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh geometry={geometry} material={material} position={[0, SKY.y, SKY.z]} renderOrder={-2} frustumCulled={false} />;
}

function Sun({ sceneRef, pal }) {
  const mesh = useRef(null);
  const drift = useRef(0);
  const geometry = useMemo(() => new THREE.PlaneGeometry(SUN.r * 2, SUN.r * 2), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTop: { value: pal.cur.sunTop }, uBottom: { value: pal.cur.sunBottom }, uTime: { value: 0 } },
        vertexShader: UV_VERT,
        fragmentShader: SUN_FRAG,
        transparent: true,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [pal]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    if (sceneRef.current.running) drift.current = (drift.current + Math.min(0.1, dt) * 0.35) % 1;
    m.material.uniforms.uTime.value = drift.current;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} position={[0, SUN.y, SUN.z]} frustumCulled={false} />;
}

function StarField({ cfg }) {
  // A group's renderOrder sorts everything inside it: the stars are drawn before the sun (both are
  // transparent), so the sun disc covers the stars behind it. The floor hides the ones below the horizon.
  return (
    <group position={CAM_POS} renderOrder={-1}>
      <Stars radius={120} depth={40} count={cfg.stars} factor={cfg.starSize} saturation={0} fade speed={0.6} />
    </group>
  );
}

// ---------------------------------------------------------------------------------- floor
function Floor({ sceneRef, pal, cfg, postScrollRef }) {
  const mesh = useRef(null);
  const scroll = useRef(0);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(FLOOR.w, FLOOR.l, 1, 1);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, FLOOR.nearZ - FLOOR.l / 2);
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uScroll: { value: 0 },
          uFloor: { value: pal.cur.floor },
          uGrid: { value: pal.cur.grid },
          uLane: { value: pal.cur.lane },
          uHorizon: { value: pal.cur.horizon },
          uGlow: { value: pal.cur.glow },
          uSunGlow: { value: pal.cur.sunBottom },
          uFog: fogUniform(),
          uPost: { value: 0 },
        },
        defines: cfg.glow ? { GLOW: '' } : {},
        vertexShader: WORLD_VERT,
        fragmentShader: FLOOR_FRAG,
        fog: false, // its own haze (above), the same colour and distances as the scene fog
        toneMapped: false,
      }),
    [pal, cfg.glow]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const s = sceneRef.current;
    // Frozen while paused or between rounds; wrapped at one cell, which the pattern repeats on.
    if (s.running) scroll.current = (scroll.current + Math.min(0.1, dt) * WORLD_SPEED * (s.speed || 1)) % CELL;
    m.material.uniforms.uScroll.value = scroll.current;
    m.material.uniforms.uPost.value = postScrollRef.current;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------------- world
// Distant mountain ridges and roadside lamp posts give the run a place and a sense of speed. The
// ridges are two flat strips (a near one in front of the sun, a hazier far one behind it) with a lit
// ridge line; the posts are instanced and scroll with the floor, and their light pools are drawn by
// the floor shader at the same spacing, so posts and pools never drift apart.

/** Seeded ridge heights: jagged low-poly peaks, low in the middle so the road runs into a valley. */
function ridgeHeights(n, halfW, seed, peak) {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = -halfW + (2 * halfW * i) / n;
    const ax = Math.abs(x);
    const valley = 0.12 + 0.88 * Math.min(1, Math.max(0, (ax - 6) / (halfW * 0.38)));
    const h = (i % 2 ? 0.55 + rand() * 0.45 : 0.2 + rand() * 0.35) * peak * valley;
    out.push([x, h]);
  }
  return out;
}

function ridgeGeometry(points) {
  const pos = [];
  const top = [];
  for (const [x, h] of points) {
    pos.push(x, -4, 0, x, h, 0);
    top.push(0, 1);
  }
  const index = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
  g.setIndex(index);
  return g;
}

const RIDGE_VERT = /* glsl */ `
  attribute float aTop;
  varying float vTop;
  void main() {
    vTop = aTop;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// A dark silhouette that thins into the haze toward its foot, with a one-pixel lit ridge line.
const RIDGE_FRAG = /* glsl */ `
  uniform vec3 uFloor;
  uniform vec3 uHorizon;
  uniform vec3 uLine;
  uniform float uHaze;
  uniform float uLineAmt;
  varying float vTop;
  void main() {
    vec3 col = mix(uFloor, uHorizon, uHaze + (1.0 - uHaze) * 0.45 * (1.0 - vTop));
    float fw = max(fwidth(vTop), 1e-4);
    float line = 1.0 - smoothstep(0.0, fw * 1.6, 1.0 - vTop);
    col += uLine * line * uLineAmt;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const RIDGES = [
  { z: -150, halfW: 200, n: 46, seed: 7, peak: 20, haze: 0.62, line: 0.35 },
  { z: -88, halfW: 130, n: 38, seed: 3, peak: 12, haze: 0.28, line: 0.8 },
];

function Mountains({ pal, cfg }) {
  const layers = useMemo(
    () =>
      RIDGES.filter((r, i) => cfg.world || i === RIDGES.length - 1).map((r) => ({
        r,
        geometry: ridgeGeometry(ridgeHeights(r.n, r.halfW, r.seed, r.peak)),
        material: new THREE.ShaderMaterial({
          uniforms: {
            uFloor: { value: pal.cur.floor },
            uHorizon: { value: pal.cur.horizon },
            uLine: { value: pal.cur.grid },
            uHaze: { value: r.haze },
            uLineAmt: { value: r.line },
          },
          vertexShader: RIDGE_VERT,
          fragmentShader: RIDGE_FRAG,
          fog: false,
          toneMapped: false,
        }),
      })),
    [pal, cfg.world]
  );
  useEffect(
    () => () =>
      layers.forEach((l) => {
        l.geometry.dispose();
        l.material.dispose();
      }),
    [layers]
  );
  return layers.map((l) => <mesh key={l.r.z} geometry={l.geometry} material={l.material} position={[0, 0, l.r.z]} frustumCulled={false} />);
}

const HALO_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 p = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
  #endif
    vec4 mv = modelViewMatrix * p;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const HALO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec2 uFog;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    float a = 1.0 - smoothstep(0.0, 1.0, length(vUv * 2.0 - 1.0));
    gl_FragColor = vec4(uColor, a * a * uOpacity * (1.0 - 0.85 * smoothstep(uFog.x, uFog.y, vDepth)));
    #include <colorspace_fragment>
  }
`;

/** Lamp posts on both sides of the road; `postScrollRef` is shared with the floor's light pools. */
function Roadside({ sceneRef, pal, postScrollRef }) {
  const poles = useRef(null);
  const heads = useRef(null);
  const halos = useRef(null);
  const n = POST.count * 2;
  const res = useMemo(() => {
    const pole = new THREE.BoxGeometry(0.1, POST.top, 0.1);
    pole.translate(0, POST.top / 2, 0);
    const arm = new THREE.BoxGeometry(POST.arm + 0.06, 0.07, 0.09);
    arm.translate(POST.arm / 2, POST.top - 0.04, 0);
    const poleGeo = mergeGeometries([pole, arm]);
    pole.dispose();
    arm.dispose();
    const headGeo = new THREE.BoxGeometry(0.42, 0.06, 0.18);
    headGeo.translate(POST.arm - 0.1, POST.top - 0.1, 0);
    const haloGeo = new THREE.PlaneGeometry(1.6, 1.0);
    haloGeo.translate(POST.arm - 0.1, POST.top - 0.14, 0.02);
    return {
      poleGeo,
      headGeo,
      haloGeo,
      poleMat: new THREE.MeshStandardMaterial({ color: '#3a3f60', roughness: 0.5, metalness: 0.15 }),
      headMat: new THREE.MeshBasicMaterial({ color: new THREE.Color(), toneMapped: false }),
      haloMat: new THREE.ShaderMaterial({
        uniforms: { uColor: { value: pal.cur.lane }, uOpacity: { value: 0.55 }, uFog: fogUniform() },
        vertexShader: HALO_VERT,
        fragmentShader: HALO_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: false,
        toneMapped: false,
      }),
    };
  }, [pal]);
  useEffect(
    () => () => {
      for (const v of Object.values(res)) v.dispose();
    },
    [res]
  );
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const posV = useMemo(() => new THREE.Vector3(), []);
  // The right-hand posts are turned half a circle, so every arm points at the road.
  const turns = useMemo(() => [new THREE.Quaternion(), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)], []);
  useFrame((_, dt) => {
    const s = sceneRef.current;
    if (s.running) postScrollRef.current = (postScrollRef.current + Math.min(0.1, dt) * WORLD_SPEED * (s.speed || 1)) % POST.spacing;
    res.headMat.color.copy(pal.cur.lane);
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const z = POST.z0 - Math.floor(i / 2) * POST.spacing + postScrollRef.current;
      posV.set(-side * POST.x, 0, z);
      m4.compose(posV, turns[side < 0 ? 1 : 0], one);
      poles.current?.setMatrixAt(i, m4);
      heads.current?.setMatrixAt(i, m4);
      halos.current?.setMatrixAt(i, m4);
    }
    for (const r of [poles, heads, halos]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={poles} args={[res.poleGeo, res.poleMat, n]} frustumCulled={false} />
      <instancedMesh ref={heads} args={[res.headGeo, res.headMat, n]} frustumCulled={false} />
      <instancedMesh ref={halos} args={[res.haloGeo, res.haloMat, n]} frustumCulled={false} renderOrder={1} />
    </>
  );
}

// ---------------------------------------------------------------------------------- runner
// A jointed runner (pelvis, torso, head, thighs, shins, feet, upper arms, forearms) driven by a run
// cycle: the knee folds high in the swing and stays soft in the stance, the arms swing against the legs,
// the torso leans forward and twists against the hips, the body rises twice a stride, and it banks into
// a lane change. The shirt stays Vocably coral in every theme so the avatar is always recognisable; the
// theme reaches it as light (sky light, grid bounce, and a rim light from the sun ahead).
const RUNNER_COLOR = '#e0566a';
const LOOK = { skin: '#c98d6b', shorts: '#1c2250', shoe: '#f3f0ea', sole: '#4a4f66', hair: '#2a1a16' };
const BODY = { hipY: 1.0, hipX: 0.1, thigh: 0.45, shin: 0.44, shoulderX: 0.25, shoulderY: 0.47, upper: 0.29, fore: 0.27 };
const TAU = Math.PI * 2;

/** A capsule that hangs from its pivot: from y = 0 down to y = -len. */
function limbGeometry(r, len) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 4, 10);
  g.translate(0, -len / 2, 0);
  return g;
}

/** Paints a geometry one colour (as a vertex colour), so parts of different colours can share a draw. */
function tinted(geo, hex) {
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Merges tinted parts into one geometry (one draw call per body segment). */
function segment(...parts) {
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

/**
 * The runner's segments, each one geometry with vertex colours, sharing one material: 13 draw calls for
 * the whole body. `lite` (the low tier) lights it with Lambert instead of PBR.
 */
function useRunnerKit(lite) {
  const kit = useMemo(() => {
    const shoe = tinted(new THREE.CapsuleGeometry(0.052, 0.15, 4, 10), LOOK.shoe);
    shoe.rotateX(Math.PI / 2);
    shoe.translate(0, -0.05, -0.05);
    const sole = tinted(new THREE.BoxGeometry(0.11, 0.03, 0.27), LOOK.sole);
    sole.translate(0, -0.095, -0.05);
    const head = tinted(new THREE.SphereGeometry(0.12, 20, 16), LOOK.skin);
    head.scale(0.9, 1.05, 1);
    const hair = tinted(new THREE.SphereGeometry(0.126, 18, 12, 0, TAU, 0, Math.PI * 0.6), LOOK.hair);
    hair.rotateX(0.55); // covers the crown and the back of the head, which is what the camera sees
    hair.translate(0, 0.012, 0.004);
    const hips = tinted(new THREE.CapsuleGeometry(0.135, 0.12, 4, 12), LOOK.shorts);
    hips.rotateZ(Math.PI / 2);
    hips.scale(1, 1, 0.75);
    // Shoulders wider than the waist: a broad chest over a narrower abdomen.
    const chest = tinted(new THREE.CapsuleGeometry(0.15, 0.16, 6, 14), RUNNER_COLOR);
    chest.scale(1.45, 1, 0.7);
    chest.translate(0, 0.38, 0);
    const waist = tinted(new THREE.CapsuleGeometry(0.12, 0.16, 6, 14), RUNNER_COLOR);
    waist.scale(1.18, 1, 0.78);
    waist.translate(0, 0.15, 0);
    const neck = tinted(limbGeometry(0.05, 0.12), LOOK.skin);
    neck.translate(0, 0.66, 0);
    const hand = tinted(new THREE.SphereGeometry(0.048, 12, 10), LOOK.skin);
    hand.translate(0, -BODY.fore - 0.02, 0);
    const Mat = lite ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;
    return {
      geo: {
        pelvis: hips,
        torso: segment(chest, waist, neck),
        head: segment(head, hair),
        thigh: segment(tinted(limbGeometry(0.097, 0.22), LOOK.shorts), tinted(limbGeometry(0.084, BODY.thigh), LOOK.skin)),
        shin: tinted(limbGeometry(0.064, BODY.shin), LOOK.skin),
        foot: segment(shoe, sole),
        upper: segment(tinted(limbGeometry(0.066, 0.13), RUNNER_COLOR), tinted(limbGeometry(0.052, BODY.upper), LOOK.skin)),
        fore: segment(tinted(limbGeometry(0.042, BODY.fore), LOOK.skin), hand),
      },
      mat: new Mat({ vertexColors: true, ...(lite ? {} : { roughness: 0.62 }) }),
    };
  }, [lite]);
  useEffect(
    () => () => {
      Object.values(kit.geo).forEach((g) => g.dispose());
      kit.mat.dispose();
    },
    [kit]
  );
  return kit;
}

const lerp = (a, b, t) => a + (b - a) * t;
const bend = (joint, x) => {
  if (joint) joint.rotation.x = x;
};

function Runner({ sceneRef, pal, cfg }) {
  const { geo, mat } = useRunnerKit(!cfg.world);
  const root = useRef(null);
  const body = useRef(null);
  const pelvis = useRef(null);
  const torso = useRef(null);
  const head = useRef(null);
  const spot = useRef(null);
  const shadow = useRef(null);
  const j = useRef({ thigh: [], knee: [], ankle: [], shoulder: [], elbow: [] });
  const phase = useRef(0);
  const amt = useRef(0); // 0 = standing, 1 = running; eased so a pause or a new round never snaps
  const spotGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.8, 1.8);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const spotMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: pal.cur.lane }, uOpacity: { value: 0.26 } },
        vertexShader: UV_VERT,
        fragmentShader: SPOT_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
        toneMapped: false,
      }),
    [pal]
  );
  const shadowGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.9, 1.1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const shadowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uOpacity: { value: 0.6 } },
        vertexShader: UV_VERT,
        fragmentShader: SPOT_FRAG,
        transparent: true,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    []
  );
  useEffect(() => () => spotGeo.dispose(), [spotGeo]);
  useEffect(() => () => spotMat.dispose(), [spotMat]);
  useEffect(() => () => shadowGeo.dispose(), [shadowGeo]);
  useEffect(() => () => shadowMat.dispose(), [shadowMat]);

  useFrame((_, rawDt) => {
    const s = sceneRef.current;
    const r = root.current;
    if (!r || !body.current) return;
    const dt = Math.min(0.1, rawDt);
    const tx = LANE_X[s.lane] ?? 0;
    r.position.x += (tx - r.position.x) * Math.min(1, dt * 12);
    const off = r.position.x - tx;
    r.rotation.z = off * 0.11; // bank into the turn
    r.rotation.y = off * 0.12; // and look where it goes
    // About 1.5 strides a second at ×1, quicker as the speed steps up; the phase accumulates, so a
    // speed change never jumps the pose.
    if (s.running) phase.current = (phase.current + dt * 9.5 * Math.min(1.6, s.speed || 1)) % (TAU * 1000);
    amt.current += ((s.running ? 1 : 0) - amt.current) * Math.min(1, dt * 6);
    const a = amt.current;
    const p = phase.current;
    const jt = j.current;
    for (let side = 0; side < 2; side++) {
      const q = p + side * Math.PI; // the right leg is half a stride behind the left
      const sq = Math.sin(q);
      const swing = Math.max(0, Math.cos(q)); // > 0 while this leg travels forward
      bend(jt.thigh[side], lerp(0.02, 0.22 + 0.72 * sq, a));
      bend(jt.knee[side], lerp(-0.06, -(0.2 + 1.5 * swing ** 1.4), a));
      bend(jt.ankle[side], lerp(0.04, 0.42 * sq, a));
      // Arms swing against the legs on the same side, elbows bent near a right angle.
      bend(jt.shoulder[side], lerp(0.05, -0.75 * sq, a));
      bend(jt.elbow[side], lerp(0.25, 1.35 - 0.3 * sq, a));
    }
    const s0 = Math.sin(p);
    body.current.position.y = lerp(0, -0.045 + 0.085 * Math.abs(s0), a); // up in flight, down in stance
    if (torso.current) {
      torso.current.rotation.x = lerp(-0.02, -0.2 - 0.03 * Math.abs(s0), a); // forward lean
      torso.current.rotation.y = lerp(0, 0.16 * s0, a); // shoulders against the hips
    }
    if (pelvis.current) pelvis.current.rotation.y = lerp(0, -0.09 * s0, a);
    if (head.current) {
      head.current.rotation.x = lerp(0.02, 0.14, a); // eyes stay on the road
      head.current.rotation.y = lerp(0, -0.13 * s0, a);
    }
    if (spot.current) spot.current.position.x = r.position.x;
    if (shadow.current) {
      shadow.current.position.x = r.position.x;
      const lift = Math.max(0, body.current.position.y);
      const k = 1 - lift * 2.5;
      shadow.current.scale.set(k, 1, k);
      shadow.current.material.uniforms.uOpacity.value = 0.6 * k;
    }
  });

  const set = (key, i) => (m) => {
    j.current[key][i] = m;
  };
  return (
    <>
      <mesh ref={spot} geometry={spotGeo} material={spotMat} position={[0, 0.02, 0]} />
      <mesh ref={shadow} geometry={shadowGeo} material={shadowMat} position={[0, 0.025, -0.02]} renderOrder={1} />
      <group ref={root}>
        <group ref={body}>
          <group ref={pelvis} position={[0, BODY.hipY, 0]}>
            <mesh geometry={geo.pelvis} material={mat} />
            {[-1, 1].map((sx, i) => (
              <group key={sx} ref={set('thigh', i)} position={[sx * BODY.hipX, 0, 0]}>
                <mesh geometry={geo.thigh} material={mat} />
                <group ref={set('knee', i)} position={[0, -BODY.thigh, 0]}>
                  <mesh geometry={geo.shin} material={mat} />
                  <group ref={set('ankle', i)} position={[0, -BODY.shin, 0]}>
                    <mesh geometry={geo.foot} material={mat} />
                  </group>
                </group>
              </group>
            ))}
          </group>
          <group ref={torso} position={[0, BODY.hipY + 0.03, 0]}>
            <mesh geometry={geo.torso} material={mat} />
            <group ref={head} position={[0, 0.7, 0]}>
              <mesh geometry={geo.head} material={mat} />
            </group>
            {[-1, 1].map((sx, i) => (
              <group key={sx} ref={set('shoulder', i)} position={[sx * BODY.shoulderX, BODY.shoulderY, 0]} rotation={[0, 0, sx * 0.13]}>
                <mesh geometry={geo.upper} material={mat} />
                <group ref={set('elbow', i)} position={[0, -BODY.upper, 0]}>
                  <mesh geometry={geo.fore} material={mat} />
                </group>
              </group>
            ))}
          </group>
        </group>
      </group>
    </>
  );
}

function Lights({ pal }) {
  const hemi = useRef(null);
  const rim = useRef(null);
  // The runner and the posts are the only lit objects. Mostly white light keeps the coral coral: a tint
  // of the horizon glow from above, the grid bounced from below, and the sun's colour as a rim light
  // from ahead that outlines the runner against the road.
  useFrame(() => {
    const h = hemi.current;
    if (h) {
      h.color.copy(WHITE).lerp(pal.cur.glow, 0.2);
      h.groundColor.copy(pal.cur.grid).multiplyScalar(0.35);
    }
    if (rim.current) rim.current.color.copy(pal.cur.sunTop).lerp(pal.cur.sunBottom, 0.5);
  });
  return (
    <>
      <hemisphereLight ref={hemi} intensity={1.0} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <directionalLight ref={rim} position={[-2, 4, -14]} intensity={1.6} />
    </>
  );
}

/** The camera drifts a little toward the runner's lane and sways with the stride, so the view feels held. */
function CameraRig({ sceneRef }) {
  const cx = useRef(0);
  const t = useRef(0);
  useFrame((state, rawDt) => {
    const s = sceneRef.current;
    const dt = Math.min(0.1, rawDt);
    cx.current += ((LANE_X[s.lane] ?? 0) * 0.3 - cx.current) * Math.min(1, dt * 3);
    if (s.running) t.current += dt * 9.5 * Math.min(1.6, s.speed || 1);
    const cam = state.camera;
    cam.position.set(CAM_POS[0] + cx.current, CAM_POS[1] + (s.running ? Math.sin(t.current * 2) * 0.018 : 0), CAM_POS[2]);
    cam.lookAt(CAM_LOOK[0] + cx.current * 0.5, CAM_LOOK[1], CAM_LOOK[2]);
    // A portrait stage gets a taller field of view, so the three word signs stay inside the screen
    // until the gate is almost at the runner (at the fixed 55° the outer signs were cut off on phones).
    const aspect = state.size.width / Math.max(1, state.size.height);
    const fov = Math.min(78, Math.max(CAMERA.fov, (2 * Math.atan(Math.tan((26 * Math.PI) / 180) / Math.max(0.3, aspect)) * 180) / Math.PI));
    if (Math.abs(cam.fov - fov) > 0.1) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

// ---------------------------------------------------------------------------------- gate
// A word sign: the word is drawn into a canvas texture, so it scales with the panel in 3D (HTML
// labels don't, and overlap at a distance). Redrawn only when the word or the tone changes.
function makeSign() {
  const canvas = document.createElement('canvas');
  canvas.width = SIGN_PX[0];
  canvas.height = SIGN_PX[1];
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, texture, text: null, tone: null };
}

/** White rounded outline with a blurred glow, shared by the three signs and tinted per sign. */
function makeRimTexture() {
  const [w, h] = SIGN_PX;
  const canvas = document.createElement('canvas');
  canvas.width = w + RIM_PAD * 2;
  canvas.height = h + RIM_PAD * 2;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.lineWidth = 8;
  for (const blur of [34, 14]) {
    ctx.shadowBlur = blur;
    ctx.beginPath();
    ctx.roundRect(RIM_PAD + 10, RIM_PAD + 10, w - 20, h - 20, 40);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const signFont = (px) => `800 ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

/** A phrase split into two lines of similar length at a space; null for a single word. */
function twoLines(text) {
  const words = text.split(' ').filter(Boolean);
  if (words.length < 2) return null;
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const d = Math.abs(a.length - b.length);
    if (!best || d < best.d) best = { a, b, d };
  }
  return [best.a, best.b];
}

function drawSign(sign, text, tone) {
  if (sign.text === text && sign.tone === tone) return;
  sign.text = text;
  sign.tone = tone;
  const t = SIGN_TONES[tone];
  const [w, h] = SIGN_PX;
  const ctx = sign.canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = tone === 'idle' ? 0.94 : tone === 'dim' ? 0.88 : 1;
  ctx.fillStyle = t.panel;
  ctx.beginPath();
  ctx.roundRect(10, 10, w - 20, h - 20, 40);
  ctx.fill();
  ctx.globalAlpha = tone === 'dim' ? 0.7 : 0.9;
  ctx.lineWidth = 6;
  ctx.strokeStyle = t.edge;
  ctx.beginPath();
  ctx.roundRect(13, 13, w - 26, h - 26, 37);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = t.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Large bold text: one line from 96 px down to 56 px; a longer phrase goes on two lines rather
  // than shrinking further; a single long word shrinks to 30 px at the least.
  const maxW = w - 64;
  const fits = (px, s) => {
    ctx.font = signFont(px);
    return ctx.measureText(s).width <= maxW;
  };
  let px = 96;
  while (px > 56 && !fits(px, text)) px -= 4;
  const lines = fits(px, text) ? null : twoLines(text);
  if (lines) {
    let lp = 76;
    while (lp > 30 && !(fits(lp, lines[0]) && fits(lp, lines[1]))) lp -= 4;
    ctx.font = signFont(lp);
    ctx.fillText(lines[0], w / 2, h / 2 + 4 - lp * 0.56);
    ctx.fillText(lines[1], w / 2, h / 2 + 4 + lp * 0.56);
  } else {
    while (px > 30 && !fits(px, text)) px -= 4;
    ctx.font = signFont(px);
    ctx.fillText(text, w / 2, h / 2 + 6);
  }
  sign.texture.needsUpdate = true;
}

function makeGlowMaterial(opacity) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: opacity }, uFog: fogUniform() },
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    toneMapped: false,
  });
}

function Gate({ sceneRef, pal, cfg }) {
  const group = useRef(null);
  const arch = useRef(null);
  const line = useRef(null);
  const halos = useRef([]);
  const rims = useRef([]);
  const panels = useRef([]);
  const signs = useMemo(() => [makeSign(), makeSign(), makeSign()], []);
  const rimTexture = useMemo(() => makeRimTexture(), []);
  const panelGeo = useMemo(() => new THREE.PlaneGeometry(SIGN.w, SIGN.h), []);
  const rimGeo = useMemo(() => new THREE.PlaneGeometry((SIGN.w * (SIGN_PX[0] + RIM_PAD * 2)) / SIGN_PX[0], (SIGN.h * (SIGN_PX[1] + RIM_PAD * 2)) / SIGN_PX[1]), []);
  const panelMats = useMemo(() => signs.map((s) => new THREE.MeshBasicMaterial({ map: s.texture, transparent: true, fog: false, toneMapped: false })), [signs]);
  const rimMats = useMemo(
    () => signs.map(() => new THREE.MeshBasicMaterial({ map: rimTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false })),
    [signs, rimTexture]
  );
  const archGeo = useMemo(() => new THREE.TorusGeometry(ARCH_R, 0.075, 10, cfg.arc, Math.PI), [cfg.arc]);
  const archMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const haloGeos = useMemo(() => cfg.halos.map((h) => new THREE.TorusGeometry(ARCH_R, h.tube, 12, cfg.arc, Math.PI)), [cfg]);
  const haloMats = useMemo(() => cfg.halos.map((h) => makeGlowMaterial(h.opacity)), [cfg]);
  const lineGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(ROAD * 2 + 0.2, 0.16);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const lineMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }), []);
  // One effect per resource: a tier change rebuilds only what depends on the tier.
  useEffect(() => () => signs.forEach((s) => s.texture.dispose()), [signs]);
  useEffect(() => () => rimTexture.dispose(), [rimTexture]);
  useEffect(() => () => panelGeo.dispose(), [panelGeo]);
  useEffect(() => () => rimGeo.dispose(), [rimGeo]);
  useEffect(() => () => panelMats.forEach((m) => m.dispose()), [panelMats]);
  useEffect(() => () => rimMats.forEach((m) => m.dispose()), [rimMats]);
  useEffect(() => () => archGeo.dispose(), [archGeo]);
  useEffect(() => () => archMat.dispose(), [archMat]);
  useEffect(() => () => haloGeos.forEach((geo) => geo.dispose()), [haloGeos]);
  useEffect(() => () => haloMats.forEach((m) => m.dispose()), [haloMats]);
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);
  useEffect(() => () => lineMat.dispose(), [lineMat]);

  useFrame(() => {
    const gr = group.current;
    if (!gr) return;
    const s = sceneRef.current;
    const visible = s.options?.length === 3;
    gr.visible = visible;
    if (!visible) return;
    const p = Math.max(0, s.progress || 0);
    gr.position.z = GATE_FAR * (1 - Math.min(1.15, p));
    // The gate comes out of the haze: the arch from the horizon colour, the glow and signs from clear.
    const x = Math.min(1, p / SIGN_FADE);
    const fade = x * x * (3 - 2 * x);
    if (arch.current) arch.current.material.color.copy(pal.cur.horizon).lerp(pal.cur.arch, fade);
    for (let i = 0; i < halos.current.length; i++) {
      const m = halos.current[i];
      if (!m) continue;
      m.material.uniforms.uColor.value.copy(pal.cur.arch);
      m.material.uniforms.uOpacity.value = (cfg.halos[i]?.opacity || 0) * fade;
    }
    if (line.current) {
      line.current.material.color.copy(pal.cur.arch);
      line.current.material.opacity = 0.6 * fade;
    }
    const fb = s.feedback;
    for (let i = 0; i < 3; i++) {
      const tone = fb
        ? i === fb.correctLane ? 'right' : i === fb.chosen && fb.ok === false ? 'wrong' : 'dim'
        : s.locked && i === s.lane ? 'locked' : 'idle';
      drawSign(signs[i], s.options[i]?.text || '', tone);
      const panel = panels.current[i];
      if (panel) panel.material.opacity = fade;
      const rim = rims.current[i];
      if (rim) {
        rim.material.color.copy(TONE_RIM[tone] || pal.cur.arch);
        if (tone === 'dim') rim.material.color.multiplyScalar(0.3);
        rim.material.opacity = fade * (tone === 'idle' ? 0.85 : tone === 'dim' ? 0.5 : 1);
      }
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={arch} geometry={archGeo} material={archMat} />
      {haloGeos.map((geo, i) => (
        <mesh
          key={`${cfg.arc}-${i}`}
          ref={(m) => {
            halos.current[i] = m;
          }}
          geometry={geo}
          material={haloMats[i]}
        />
      ))}
      <mesh ref={line} geometry={lineGeo} material={lineMat} position={[0, 0.012, 0]} />
      {LANE_X.map((x, i) => (
        <group key={x} position={[x, SIGN.y, 0]}>
          {/* rim glow behind the panel, then the panel: the glow never covers a word */}
          <mesh
            ref={(m) => {
              rims.current[i] = m;
            }}
            geometry={rimGeo}
            material={rimMats[i]}
            position={[0, 0, -0.012]}
            renderOrder={1}
          />
          <mesh
            ref={(m) => {
              panels.current[i] = m;
            }}
            geometry={panelGeo}
            material={panelMats[i]}
            renderOrder={2}
          />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------- canvas
function RunScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  const pal = useMemo(() => createPalette(), []);
  const postScrollRef = useRef(0); // written by Roadside, read by the floor's light pools
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={CAMERA}
      gl={{ antialias: cfg.antialias, powerPreference: tier === 'high' ? 'high-performance' : 'default', alpha: false }}
      onCreated={({ camera }) => camera.lookAt(...CAM_LOOK)}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden="true"
    >
      <color attach="background" args={[RUN_THEMES[0].horizon]} />
      <fog attach="fog" args={[RUN_THEMES[0].horizon, FOG_NEAR, FOG_FAR]} />
      <ContextLossReporter sceneRef={sceneRef} />
      <PaletteDriver sceneRef={sceneRef} pal={pal} />
      <Lights pal={pal} />
      <Sky pal={pal} />
      <StarField cfg={cfg} />
      <Sun sceneRef={sceneRef} pal={pal} />
      <Mountains pal={pal} cfg={cfg} />
      {cfg.world && <Roadside sceneRef={sceneRef} pal={pal} postScrollRef={postScrollRef} />}
      <Floor sceneRef={sceneRef} pal={pal} cfg={cfg} postScrollRef={postScrollRef} />
      <Gate sceneRef={sceneRef} pal={pal} cfg={cfg} />
      <Runner sceneRef={sceneRef} pal={pal} cfg={cfg} />
      <CameraRig sceneRef={sceneRef} />
    </Canvas>
  );
}

export default memo(RunScene3D);

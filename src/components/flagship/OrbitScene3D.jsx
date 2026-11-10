'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ORBIT } from '@/lib/flagship/orbit';
import { dprFor } from '@/lib/flagship/gpu';

// So'z orbitasi scene: deep space. Three planets, each carrying a word, fly in ahead of a small
// ship; the player sends the ship to the planet whose word completes the sentence.
// Original design and art: everything is procedural (shaders, canvas textures, merged primitives) —
// no models, textures or fonts are downloaded, and there are no scene lights or postprocessing, so
// it runs on budget phones. The 'low' tier drops the nebula noise, the gas giant and half the stars.
//
// Contract: everything per-frame reads `sceneRef.current`, written by the WordOrbit controller:
//   { options: [{ text }], shownAt, unlockAt, sel: 0..2 | null,
//     pick: { i, at } | null, feedback: { ok, chosen, correct, at } | null,
//     fuel: 0..1, onPick(i), contextLost }
// The Canvas stays mounted for the whole round and is paused with frameloop="never".

const PLANET_Z = -9;
const PLANET_R = 0.78;
const CAM_POS = [0, 0.6, 2];
const CAM_LOOK = [0, 0.55, PLANET_Z];
const SHIP_Z = -4.6;
const TIERS = {
  high: { stars: 340, antialias: true, nebula: true, giant: true, segments: 40 },
  low: { stars: 140, antialias: false, nebula: false, giant: false, segments: 24 },
};
const PLANETS = [
  { a: '#ffc49a', b: '#d9485f', rim: '#ffd9cc', seed: 1.7 },
  { a: '#b9f3ff', b: '#1f7fd1', rim: '#dcf8ff', seed: 4.2 },
  { a: '#e9dcff', b: '#6d3df0', rim: '#efe4ff', seed: 7.9 },
];
const OK = new THREE.Color('#34d399');
const BAD = new THREE.Color('#fb7185');
const LOCK = new THREE.Color('#fde68a');
const WHITE = new THREE.Color('#ffffff');
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** How far apart the planets sit on a stage of this size (the rig, the planets and the ship all ask). */
function spreadFor(size) {
  return Math.min(3.3, Math.max(1.72, (size.width / Math.max(1, size.height)) * 3.1));
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const x = canvas.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.4)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------------- backdrop
const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const NEBULA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uPulseCol;
  varying vec2 vUv;
  #ifdef NEBULA
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    return 0.55 * noise(p) + 0.3 * noise(p * 2.1 + 3.7) + 0.15 * noise(p * 4.3 + 9.1);
  }
  #endif
  void main() {
    vec2 c = vUv - 0.5;
    vec3 col = mix(vec3(0.016, 0.02, 0.07), vec3(0.03, 0.04, 0.14), smoothstep(0.75, 0.0, length(c)));
    #ifdef NEBULA
    vec2 p = vUv * vec2(3.4, 2.2);
    float n = fbm(p + uTime * 0.012);
    float m = fbm(p * 1.6 - uTime * 0.009 + 5.0);
    col += vec3(0.16, 0.1, 0.42) * smoothstep(0.42, 0.9, n) * 0.75;
    col += vec3(0.05, 0.3, 0.42) * smoothstep(0.5, 0.95, m) * 0.55;
    col += vec3(0.5, 0.16, 0.3) * smoothstep(0.62, 1.0, n * m * 2.0) * 0.4;
    #else
    col += vec3(0.1, 0.07, 0.26) * smoothstep(0.7, 0.1, length(c - vec2(0.18, 0.1)));
    col += vec3(0.03, 0.14, 0.22) * smoothstep(0.6, 0.0, length(c + vec2(0.25, 0.12)));
    #endif
    col += uPulseCol * uPulse * 0.12 * smoothstep(0.7, 0.0, length(c));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Nebula({ sceneRef, cfg }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uPulseCol: { value: new THREE.Color('#34d399') } },
        defines: cfg.nebula ? { NEBULA: 1 } : {},
        vertexShader: UV_VERT,
        fragmentShader: NEBULA_FRAG,
        depthWrite: false,
      }),
    [cfg.nebula]
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const now = performance.now();
    const fb = sceneRef.current.feedback;
    const u = m.material.uniforms;
    u.uTime.value = (now / 1000) % 1000;
    u.uPulse.value = fb && fb.ok !== null ? Math.max(0, 1 - (now - fb.at) / 500) : 0;
    u.uPulseCol.value.copy(fb?.ok ? OK : BAD);
  });
  return (
    <mesh ref={mesh} material={material} position={[0, 0, -140]} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[520, 320]} />
    </mesh>
  );
}

/** Stars that drift toward the camera, faster while a new set of planets flies in (a short warp). */
function Stars({ sceneRef, count }) {
  const points = useRef(null);
  const geometry = useMemo(() => {
    let seed = 987654321;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 90;
      pos[i * 3 + 1] = (rnd() - 0.5) * 60;
      pos[i * 3 + 2] = -95 + rnd() * 95;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    return g;
  }, [count]);
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#dfe7ff', size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, rawDt) => {
    const p = points.current;
    if (!p) return;
    const dt = Math.min(0.05, rawDt);
    const warp = 1 - clamp01((performance.now() - (sceneRef.current.shownAt || -1e9)) / 900);
    const speed = (1.6 + 46 * warp * warp) * dt;
    const arr = p.geometry.attributes.position.array;
    for (let i = 2; i < arr.length; i += 3) {
      arr[i] += speed;
      if (arr[i] > 0) arr[i] -= 95;
    }
    p.geometry.attributes.position.needsUpdate = true;
  });
  return <points ref={points} geometry={geometry} material={material} renderOrder={-9} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------------- planets
const PLANET_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vObj;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vObj = position;
    gl_Position = projectionMatrix * mv;
  }
`;
const PLANET_FRAG = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uRim;
  uniform vec3 uTone;
  uniform float uToneMix;
  uniform float uDim;
  uniform float uSeed;
  uniform float uBands;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vObj;
  void main() {
    vec3 n = normalize(vN);
    // cloud bands, bent by a slow swirl so no two planets look alike
    float swirl = sin(vObj.x * 3.1 + uSeed * 2.0) * 0.55 + sin(vObj.z * 4.3 + uSeed) * 0.35;
    float bands = 0.5 + 0.5 * sin(vObj.y * uBands + swirl + uSeed);
    float fine = 0.5 + 0.5 * sin(vObj.y * uBands * 3.1 + swirl * 2.0);
    vec3 base = mix(uB, uA, smoothstep(0.2, 0.85, bands) * 0.85 + fine * 0.15);
    // one key light from the upper left; the far side falls into shadow (a soft terminator)
    float lit = smoothstep(-0.25, 0.75, dot(n, normalize(vec3(-0.55, 0.6, 0.58))));
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.6);
    vec3 col = base * (0.1 + 1.05 * lit) + uRim * fres * (0.55 + 0.5 * lit);
    col = mix(col, uTone * (0.35 + 0.9 * lit) + uTone * fres, uToneMix);
    gl_FragColor = vec4(col * uDim, 1.0);
    #include <colorspace_fragment>
  }
`;

const SIGN_PX = [512, 168];
const SIGN_TONES = {
  idle: { border: 'rgba(255,255,255,0.28)', fill: 'rgba(8,12,34,0.86)', text: '#ffffff' },
  focus: { border: '#7dd3fc', fill: 'rgba(10,26,58,0.92)', text: '#ffffff' },
  locked: { border: '#fde68a', fill: 'rgba(40,32,8,0.92)', text: '#fff7d6' },
  ok: { border: '#6ee7b7', fill: 'rgba(6,60,44,0.94)', text: '#ffffff' },
  bad: { border: '#fda4af', fill: 'rgba(84,14,30,0.94)', text: '#ffffff' },
  dim: { border: 'rgba(255,255,255,0.12)', fill: 'rgba(8,12,34,0.6)', text: 'rgba(255,255,255,0.5)' },
};
const signFont = (px) => `800 ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

function drawSign(sign, text, tone) {
  const { canvas, ctx, texture } = sign;
  const [w, h] = SIGN_PX;
  const t = SIGN_TONES[tone] || SIGN_TONES.idle;
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.roundRect(8, 8, w - 16, h - 16, 44);
  ctx.fillStyle = t.fill;
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = t.border;
  ctx.stroke();
  ctx.fillStyle = t.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let px = 76;
  do {
    ctx.font = signFont(px);
    px -= 4;
  } while (px > 30 && ctx.measureText(text).width > w - 72);
  ctx.fillText(text, w / 2, h / 2 + 4);
  texture.needsUpdate = true;
  void canvas;
}

function makeSign() {
  const canvas = document.createElement('canvas');
  canvas.width = SIGN_PX[0];
  canvas.height = SIGN_PX[1];
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, ctx: canvas.getContext('2d'), texture };
}

function Planet({ index, sceneRef, cfg, glowTexture }) {
  const group = useRef(null);
  const body = useRef(null);
  const halo = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const look = PLANETS[index];
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uA: { value: new THREE.Color(look.a) },
          uB: { value: new THREE.Color(look.b) },
          uRim: { value: new THREE.Color(look.rim) },
          uTone: { value: new THREE.Color('#ffffff') },
          uToneMix: { value: 0 },
          uDim: { value: 1 },
          uSeed: { value: look.seed },
          uBands: { value: 6.5 + index * 1.8 },
        },
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAG,
      }),
    [look, index]
  );
  const haloMat = useMemo(() => new THREE.SpriteMaterial({ map: glowTexture, color: look.rim, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [glowTexture, look]);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: look.rim, transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false }), [look]);
  const sign = useMemo(() => makeSign(), []);
  const drawn = useRef({ text: null, tone: null }); // what the sign shows now
  const labelMat = useMemo(() => new THREE.MeshBasicMaterial({ map: sign.texture, transparent: true, depthWrite: false, toneMapped: false }), [sign]);
  useEffect(
    () => () => {
      material.dispose();
      haloMat.dispose();
      ringMat.dispose();
      labelMat.dispose();
      sign.texture.dispose();
    },
    [material, haloMat, ringMat, labelMat, sign]
  );
  const tint = useMemo(() => new THREE.Color(), []);
  const rim = useMemo(() => new THREE.Color(look.rim), [look]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const s = sceneRef.current;
    const now = performance.now();
    const option = s.options?.[index];
    g.visible = !!option;
    if (!option) return;
    const spread = spreadFor(state.size);
    const e = 1 - Math.pow(1 - clamp01((now - (s.shownAt || 0)) / 900), 3); // fly in from deep space
    const fb = s.feedback;
    const pick = s.pick;
    const locked = now < (s.unlockAt || 0);
    let scale = 0.25 + 0.75 * e;
    let shake = 0;
    let toneMix = 0;
    let dim = locked ? 0.55 + 0.45 * e * clamp01(1 - ((s.unlockAt || 0) - now) / 400) : 1;
    let tone = 'idle';
    tint.copy(WHITE);
    if (fb) {
      const since = now - fb.at;
      if (index === fb.correct) {
        tone = 'ok';
        tint.copy(OK);
        toneMix = 0.55;
        scale *= 1 + 0.22 * Math.max(0, 1 - since / 420) + 0.06;
      } else if (index === fb.chosen && fb.ok === false) {
        tone = 'bad';
        tint.copy(BAD);
        toneMix = 0.6;
        shake = Math.sin(now * 0.07) * 0.09 * Math.max(0, 1 - since / 380);
        scale *= 1 - 0.3 * clamp01(since / 500);
      } else {
        tone = 'dim';
        dim = 0.4;
      }
      scale *= 1 - clamp01((since - (ORBIT.gapMs - 360)) / 340); // leave before the next sentence
    } else if (pick && pick.i === index) {
      tone = 'locked';
      tint.copy(LOCK);
      toneMix = 0.25 + 0.15 * Math.sin(now * 0.02);
      scale *= 1.08;
    } else if (pick) {
      tone = 'dim';
      dim = 0.55;
    } else if (!locked && s.sel === index) {
      tone = 'focus';
      scale *= 1.1;
    }
    const x = (index - 1) * spread + shake;
    const y = 0.95 + (index === 1 ? 0.42 : 0) + Math.sin(now * 0.0011 + index * 2.1) * 0.11;
    g.position.set(x, y, PLANET_Z - (1 - e) * 46);
    g.scale.setScalar(Math.max(0.0001, scale));

    const b = body.current;
    b.rotation.y = now * 0.00022 * (1 + index * 0.35) + index;
    const u = b.material.uniforms;
    u.uTone.value.copy(tint);
    u.uToneMix.value = toneMix;
    u.uDim.value = dim;

    halo.current.material.color.copy(toneMix > 0 ? tint : rim);
    halo.current.material.opacity = (tone === 'dim' ? 0.18 : tone === 'idle' ? 0.42 : 0.75) * (locked ? 0.6 : 1);
    ring.current.rotation.z = now * 0.0004 * (index % 2 ? -1 : 1);
    ring.current.material.color.copy(toneMix > 0 ? tint : rim);
    ring.current.material.opacity = tone === 'dim' ? 0.15 : tone === 'idle' ? 0.4 : 0.9;

    // the word sign under the planet; redrawn only when the word or its tone changes
    const text = option.text || '';
    const d = drawn.current;
    if (d.text !== text || d.tone !== tone) {
      d.text = text;
      d.tone = tone;
      drawSign(sign, text, tone);
    }
    const fit = Math.min(1, (spread * 0.94) / 2.25);
    label.current.scale.set(fit, fit, 1);
  });

  return (
    <group ref={group} visible={false}>
      <sprite ref={halo} material={haloMat} scale={[PLANET_R * 4.2, PLANET_R * 4.2, 1]} />
      <mesh
        ref={body}
        material={material}
        onPointerDown={(ev) => {
          ev.stopPropagation();
          sceneRef.current.onPick?.(index);
        }}
      >
        <sphereGeometry args={[PLANET_R, cfg.segments, Math.round(cfg.segments * 0.7)]} />
      </mesh>
      <group rotation={[1.25 + index * 0.12, 0.2 - index * 0.25, 0]}>
        <mesh ref={ring} material={ringMat}>
          <torusGeometry args={[PLANET_R * 1.5, 0.018, 6, 64]} />
        </mesh>
      </group>
      <mesh ref={label} material={labelMat} position={[0, -(PLANET_R + 0.62), 0.2]} renderOrder={3}>
        <planeGeometry args={[2.25, 2.25 * (SIGN_PX[1] / SIGN_PX[0])]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------------- ship
const SHADE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const SHADE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uRim;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 n = normalize(vN);
    float l = max(dot(n, normalize(vec3(-0.4, 0.75, 0.55))), 0.0);
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.4);
    gl_FragColor = vec4(uColor * (0.3 + 0.9 * l) + uRim * fres * 0.8, 1.0);
    #include <colorspace_fragment>
  }
`;
function shaded(color, rim) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uRim: { value: new THREE.Color(rim) } },
    vertexShader: SHADE_VERT,
    fragmentShader: SHADE_FRAG,
  });
}

function Ship({ sceneRef, glowTexture }) {
  const group = useRef(null);
  const flame = useRef(null);
  const beam = useRef(null);
  const motion = useRef({ x: 0, vx: 0 });
  const mats = useMemo(
    () => ({
      hull: shaded('#e8ecff', '#ffffff'),
      wing: shaded('#e0566a', '#ffc2cc'),
      dark: shaded('#232a5c', '#8ea2ff'),
      glass: new THREE.MeshBasicMaterial({ color: '#7dd3fc', toneMapped: false }),
      flame: new THREE.SpriteMaterial({ map: glowTexture, color: '#7dd3fc', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      beam: new THREE.MeshBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    }),
    [glowTexture]
  );
  const beamGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1, true);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, 0.5);
    return g;
  }, []);
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) m.dispose();
      beamGeo.dispose();
    },
    [mats, beamGeo]
  );
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), []);

  useFrame((state, rawDt) => {
    const g = group.current;
    if (!g) return;
    const s = sceneRef.current;
    const now = performance.now();
    const dt = Math.min(0.05, rawDt);
    const spread = spreadFor(state.size);
    const aim = s.pick ? s.pick.i : s.sel;
    const wantX = aim === null || aim === undefined ? 0 : (aim - 1) * spread * 0.42;
    const mo = motion.current;
    const prev = mo.x;
    mo.x += (wantX - mo.x) * (1 - Math.exp(-dt * 7));
    mo.vx = dt > 0 ? (mo.x - prev) / dt : 0;
    // lunge toward the planet for a moment after the pick
    const sincePick = s.pick ? now - s.pick.at : Infinity;
    const lunge = sincePick < 520 ? Math.sin((Math.PI * sincePick) / 520) : 0;
    // the ship sits in the lower third of whatever the camera shows
    const half = Math.tan((state.camera.fov * Math.PI) / 360) * (CAM_POS[2] - SHIP_Z);
    const y = CAM_POS[1] - half * 0.5 + Math.sin(now * 0.0016) * 0.05;
    g.position.set(mo.x, y + 0.25 * lunge, SHIP_Z - 1.5 * lunge);
    g.rotation.set(0.12 + 0.1 * lunge, -mo.vx * 0.06, -mo.vx * 0.16);

    const fuel = clamp01(s.fuel ?? 1);
    const flicker = 0.85 + 0.15 * Math.sin(now * 0.04);
    flame.current.scale.setScalar((0.55 + 0.75 * fuel + 1.2 * lunge) * flicker);
    flame.current.material.color.set(fuel < 0.25 ? '#fb7185' : '#7dd3fc');

    // a tractor beam from the nose to the chosen planet while the answer is checked
    const b = beam.current;
    const fb = s.feedback;
    const show = !!s.pick && s.pick.i >= 0 && (!fb || now - fb.at < 320);
    b.visible = show;
    if (show) {
      tmp.a.set(g.position.x, g.position.y + 0.05, g.position.z - 0.75);
      tmp.b.set((s.pick.i - 1) * spread, 0.95 + (s.pick.i === 1 ? 0.42 : 0), PLANET_Z);
      b.position.copy(tmp.a);
      b.lookAt(tmp.b);
      const k = fb ? Math.max(0, 1 - (now - fb.at) / 320) : 0.75 + 0.25 * Math.sin(now * 0.03);
      b.scale.set(0.09, 0.09, tmp.a.distanceTo(tmp.b));
      b.material.opacity = 0.55 * k;
      b.material.color.copy(fb ? (fb.ok ? OK : fb.ok === false ? BAD : WHITE) : LOCK);
    }
  });

  return (
    <>
      <group ref={group}>
        {/* fuselage: nose toward -z */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.28]} material={mats.hull}>
          <coneGeometry args={[0.17, 0.8, 14]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.26]} material={mats.hull}>
          <cylinderGeometry args={[0.17, 0.13, 0.3, 14]} />
        </mesh>
        <mesh position={[0, 0.1, -0.12]} scale={[0.55, 0.5, 1.2]} material={mats.glass}>
          <sphereGeometry args={[0.13, 12, 10]} />
        </mesh>
        {/* swept wings and a tail fin */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.3, -0.02, 0.2]} rotation={[0, side * -0.5, side * 0.12]} material={mats.wing}>
            <boxGeometry args={[0.5, 0.035, 0.26]} />
          </mesh>
        ))}
        <mesh position={[0, 0.14, 0.3]} rotation={[0.5, 0, 0]} material={mats.wing}>
          <boxGeometry args={[0.03, 0.22, 0.2]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.44]} material={mats.dark}>
          <cylinderGeometry args={[0.1, 0.12, 0.1, 12]} />
        </mesh>
        <sprite ref={flame} material={mats.flame} position={[0, 0, 0.62]} />
      </group>
      <mesh ref={beam} geometry={beamGeo} material={mats.beam} visible={false} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- a gas giant far away
const GIANT_FRAG = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vObj;
  void main() {
    vec3 n = normalize(vN);
    float bands = 0.5 + 0.5 * sin(vObj.y * 0.75 + sin(vObj.x * 0.2) * 0.6);
    vec3 base = mix(vec3(0.16, 0.1, 0.36), vec3(0.5, 0.3, 0.62), bands);
    float lit = smoothstep(-0.2, 0.8, dot(n, normalize(vec3(-0.7, 0.45, 0.55))));
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.0);
    gl_FragColor = vec4(base * (0.06 + 0.7 * lit) + vec3(0.55, 0.45, 0.95) * fres * 0.45 * lit, 1.0);
    #include <colorspace_fragment>
  }
`;
const GIANT_RING_FRAG = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float band = smoothstep(0.62, 0.66, r) * (1.0 - smoothstep(0.96, 1.0, r));
    float gaps = 0.55 + 0.45 * sin(r * 70.0);
    float a = band * gaps * 0.34;
    gl_FragColor = vec4(vec3(0.72, 0.62, 1.0) * a, a);
    #include <colorspace_fragment>
  }
`;

function GasGiant() {
  const body = useMemo(() => new THREE.ShaderMaterial({ vertexShader: PLANET_VERT, fragmentShader: GIANT_FRAG }), []);
  const ring = useMemo(() => new THREE.ShaderMaterial({ vertexShader: UV_VERT, fragmentShader: GIANT_RING_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), []);
  useEffect(
    () => () => {
      body.dispose();
      ring.dispose();
    },
    [body, ring]
  );
  return (
    <group position={[40, 27, -112]} rotation={[0.2, 0, -0.32]}>
      <mesh material={body}>
        <sphereGeometry args={[16, 48, 32]} />
      </mesh>
      <mesh material={ring} rotation={[Math.PI / 2 - 0.22, 0, 0]}>
        <planeGeometry args={[62, 62]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------------- camera
function Rig({ sceneRef }) {
  useFrame((state) => {
    const now = performance.now();
    const camera = state.camera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const spread = spreadFor(state.size);
    // Keep all three planets (and their word signs) inside the screen at any shape.
    const half = Math.atan((spread + 1.25) / (CAM_POS[2] - PLANET_Z));
    const fov = Math.min(76, Math.max(42, (2 * Math.atan(Math.tan(half) / Math.max(0.3, aspect)) * 180) / Math.PI));
    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const fb = sceneRef.current.feedback;
    const since = fb ? now - fb.at : Infinity;
    const shake = fb && fb.ok === false && since < 320 ? (1 - since / 320) * 0.09 : 0;
    camera.position.set(CAM_POS[0] + Math.sin(now * 0.0004) * 0.14 + Math.sin(now * 0.07) * shake, CAM_POS[1] + Math.sin(now * 0.0003) * 0.08 + Math.cos(now * 0.083) * shake, CAM_POS[2]);
    camera.lookAt(CAM_LOOK[0], CAM_LOOK[1], CAM_LOOK[2]);
  });
  return null;
}

function Scene({ sceneRef, cfg }) {
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  return (
    <>
      <Rig sceneRef={sceneRef} />
      <Nebula sceneRef={sceneRef} cfg={cfg} />
      <Stars sceneRef={sceneRef} count={cfg.stars} />
      {cfg.giant && <GasGiant />}
      {PLANETS.map((_, i) => (
        <Planet key={i} index={i} sceneRef={sceneRef} cfg={cfg} glowTexture={glowTexture} />
      ))}
      <Ship sceneRef={sceneRef} glowTexture={glowTexture} />
    </>
  );
}

function OrbitScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: CAM_POS, fov: 50, near: 0.1, far: 400 }}
      gl={{ antialias: cfg.antialias, powerPreference: tier === 'high' ? 'high-performance' : 'default', alpha: false }}
      onCreated={({ gl }) => {
        // A lost context (GPU reset, too many tabs) is reported to the controller, which switches to 2D.
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          sceneRef.current.contextLost = true;
        });
        gl.domElement.addEventListener('webglcontextrestored', () => {
          sceneRef.current.contextLost = false;
        });
      }}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#050716']} />
      <Scene sceneRef={sceneRef} cfg={cfg} />
    </Canvas>
  );
}

export default memo(OrbitScene3D);

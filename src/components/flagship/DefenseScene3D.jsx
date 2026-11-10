'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { DEFENSE } from '@/lib/flagship/defense';
import { dprFor } from '@/lib/flagship/gpu';

// Word Defense scene: a night citadel. Word-carrying drones leave a rift at the far end of a neon
// causeway and fly down it toward the turret that guards the base.
// Original design (the "educational tower defence" idea is credited to pshenok/server-survival, MIT,
// in THIRD_PARTY_NOTICES.md — no code or assets from it). Built for budget phones: no lights, no
// textures to download and no postprocessing — the shading is a few small shaders (a fixed key light
// plus a rim), everything that repeats is instanced, and the 'low' tier drops the scenery (skyline,
// pylons, drone rings, floor pools). The 1–4 labels are canvas textures; the prompts themselves are
// DOM text in the controller.
//
// Contract: everything per-frame reads `sceneRef.current`, written by the WordDefense controller:
//   { enemies: [{ id, slot, x, progress, state, at, born }], targetId,
//     shot: { id, at } | null, hit: { at } | null, pulse: { ok, at } | null, contextLost }
//   state: 'walk' | 'pending' | 'revealed' | 'dead' | 'lost' | 'breach'
// The Canvas stays mounted for the whole round and is paused with frameloop="never".

const LANE = DEFENSE.laneLength;
const MAX = 8;
const ORB_Y = 1.05;
const CAM_POS = [0, 3.7, 7.4];
const CAM_LOOK = [0, 0.9, -17];
const MUZZLE = [0, 1.02, -0.55];
const RAIL_X = 3.75;
const RIFT = { z: -(LANE + 5), y: 4.4, size: 19 };
const HORIZON_Y = CAM_POS[1];
const TIERS = {
  high: { shards: 72, perKill: 16, antialias: true, stars: 260, scenery: true },
  low: { shards: 24, perKill: 6, antialias: false, stars: 90, scenery: false },
};
const PALETTE = {
  skyTop: '#050716',
  skyMid: '#12113a',
  horizon: '#3a1a78',
  glow: '#8b5cf6',
  grid: '#7c5cff',
  rail: '#5eead4',
  rift: '#c4b5fd',
  hot: '#f43f5e',
};
const TONE = {
  walk: new THREE.Color('#a78bfa'),
  pending: new THREE.Color('#f8fafc'),
  revealed: new THREE.Color('#fb7185'),
  dead: new THREE.Color('#34d399'),
  lost: new THREE.Color('#64748b'),
  breach: new THREE.Color('#f43f5e'),
};
const LIVE = new Set(['walk', 'pending', 'revealed']);
const glf = (n) => Number(n).toFixed(3);

function enemyPos(e, out) {
  return out.set(e.x, ORB_Y, -LANE * (1 - Math.min(1, Math.max(0, e.progress || 0))));
}

/** A soft round glow (white → transparent) shared by the drone halos, floor pools and the muzzle flash. */
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const x = canvas.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------------- sky
const SKY_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const SKY_FRAG = /* glsl */ `
  uniform float uHit;
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uHot;
  varying vec3 vWorld;
  void main() {
    float h = (vWorld.y - ${glf(HORIZON_Y)}) / 120.0;
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.3, h));
    col = mix(col, uTop, smoothstep(0.22, 0.95, h));
    float band = exp(-max(h, 0.0) * 11.0);
    float centre = exp(-abs(vWorld.x) * 0.006);
    col += uGlow * band * (0.25 + 0.4 * centre);
    col += uHot * uHit * exp(-max(h, 0.0) * 5.0) * 0.45;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Sky({ sceneRef }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uHit: { value: 0 },
          uTop: { value: new THREE.Color(PALETTE.skyTop) },
          uMid: { value: new THREE.Color(PALETTE.skyMid) },
          uHorizon: { value: new THREE.Color(PALETTE.horizon) },
          uGlow: { value: new THREE.Color(PALETTE.glow) },
          uHot: { value: new THREE.Color(PALETTE.hot) },
        },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        depthWrite: false,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const since = performance.now() - (sceneRef.current.hit?.at || -1e9);
    m.material.uniforms.uHit.value = Math.max(0, 1 - since / 520);
  });
  return (
    <mesh ref={mesh} material={material} position={[0, 90, -190]} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[900, 340]} />
    </mesh>
  );
}

function Stars({ count }) {
  const geometry = useMemo(() => {
    // A fixed pseudo-random layout (no Math.random in render): the same sky every round.
    let seed = 20261110;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 760;
      pos[i * 3 + 1] = 14 + Math.pow(rnd(), 0.7) * 190;
      pos[i * 3 + 2] = -185;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#dbe4ff', size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <points geometry={geometry} material={material} renderOrder={-9} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------------- the rift
const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const RIFT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uHit;
  uniform vec3 uCol;
  uniform vec3 uCore;
  uniform vec3 uHot;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    float swirl = 0.5 + 0.5 * sin(a * 5.0 + r * 9.0 - uTime * 1.3);
    float ring = exp(-pow((r - 0.56) * 9.0, 2.0));
    float wisps = exp(-pow((r - 0.56 - 0.06 * swirl) * 16.0, 2.0)) * (0.4 + 0.6 * swirl);
    float inner = (1.0 - smoothstep(0.0, 0.56, r)) * (0.1 + 0.12 * swirl);
    float halo = exp(-r * 3.4) * 0.5;
    vec3 tint = mix(uCol, uHot, uHit * 0.8);
    vec3 col = tint * (ring * 0.95 + wisps * 0.8 + halo) + uCore * (ring * 0.55 + inner);
    float alpha = clamp(ring + wisps + halo + inner, 0.0, 1.0) * (1.0 - smoothstep(0.82, 1.0, r));
    gl_FragColor = vec4(col * alpha, alpha);
    #include <colorspace_fragment>
  }
`;

function Rift({ sceneRef }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uHit: { value: 0 },
          uCol: { value: new THREE.Color(PALETTE.glow) },
          uCore: { value: new THREE.Color(PALETTE.rift) },
          uHot: { value: new THREE.Color(PALETTE.hot) },
        },
        vertexShader: UV_VERT,
        fragmentShader: RIFT_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const now = performance.now();
    const u = m.material.uniforms;
    u.uTime.value = (now / 1000) % 1000;
    u.uHit.value = Math.max(0, 1 - (now - (sceneRef.current.hit?.at || -1e9)) / 520);
  });
  return (
    <mesh ref={mesh} material={material} position={[0, RIFT.y, RIFT.z]} renderOrder={-6} frustumCulled={false}>
      <planeGeometry args={[RIFT.size, RIFT.size]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------------- skyline
/** Seeded crystal-city silhouette: stepped blocks and spires, lower in the middle so the rift reads. */
function skylineGeometry(seed, halfW, peak, columns) {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const pos = [];
  const w = (halfW * 2) / columns;
  for (let i = 0; i < columns; i++) {
    const x0 = -halfW + i * w;
    const x1 = x0 + w * (0.72 + rnd() * 0.28);
    const mid = (x0 + x1) / 2;
    const clear = 0.25 + 0.75 * Math.min(1, Math.abs(mid) / (halfW * 0.34));
    const h = peak * clear * (0.25 + 0.75 * Math.pow(rnd(), 1.6));
    const spire = rnd() < 0.35 ? h * (0.25 + rnd() * 0.5) : 0;
    pos.push(x0, 0, 0, x1, 0, 0, x1, h, 0, x0, 0, 0, x1, h, 0, x0, h, 0);
    if (spire) pos.push(mid - w * 0.12, h, 0, mid + w * 0.12, h, 0, mid, h + spire, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function Skyline() {
  const far = useMemo(() => skylineGeometry(7, 260, 30, 46), []);
  const near = useMemo(() => skylineGeometry(23, 220, 17, 54), []);
  const farMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#241257', toneMapped: false }), []);
  const nearMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#130b33', toneMapped: false }), []);
  useEffect(
    () => () => {
      far.dispose();
      near.dispose();
      farMat.dispose();
      nearMat.dispose();
    },
    [far, near, farMat, nearMat]
  );
  return (
    <>
      <mesh geometry={far} material={farMat} position={[0, -0.5, -150]} renderOrder={-8} frustumCulled={false} />
      <mesh geometry={near} material={nearMat} position={[0, -0.5, -118]} renderOrder={-7} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- ground
const GROUND_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const GROUND_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uHit;
  uniform vec3 uCol;
  uniform vec3 uRail;
  uniform vec3 uHot;
  uniform vec3 uHorizon;
  uniform vec3 uRift;
  varying vec3 vWorld;
  float line(float v, float w) {
    float f = abs(fract(v) - 0.5);
    return smoothstep(0.5 - w, 0.5, f);
  }
  void main() {
    float ax = abs(vWorld.x);
    float depth = clamp(-vWorld.z / ${glf(LANE)}, -0.3, 3.0);
    float lane = 1.0 - smoothstep(${glf(RAIL_X - 0.25)}, ${glf(RAIL_X + 0.1)}, ax);
    float side = exp(-max(0.0, ax - ${glf(RAIL_X)}) * 0.05);
    float gx = line(vWorld.x / 1.75, 0.04);
    float gz = line((vWorld.z + uTime * 1.6) / 2.2, 0.035);
    float grid = max(gx, gz);
    vec3 tint = mix(uCol, uHot, uHit);
    vec3 col = mix(vec3(0.016, 0.018, 0.055), vec3(0.03, 0.026, 0.1), lane);
    col += tint * grid * (0.6 * lane + 0.2 * (1.0 - lane) * side);
    // the two rails that edge the causeway, and energy running down them toward the base
    float rail = smoothstep(0.2, 0.0, abs(ax - ${glf(RAIL_X)}));
    float flow = 0.55 + 0.45 * sin(vWorld.z * 0.9 + uTime * 5.0);
    col += mix(uRail, uHot, uHit) * rail * (0.75 + 0.5 * flow);
    // the base line under the turret
    float baseGlow = exp(-abs(vWorld.z + 0.9) * 1.6) * lane;
    col += tint * baseGlow * (0.5 + 1.7 * uHit);
    // light of the rift spilling down the lane
    col += uRift * exp(-ax * 0.16) * smoothstep(0.35, 1.05, depth) * 0.22;
    // melt into the horizon so the floor has no edge
    col = mix(col, uHorizon, smoothstep(0.7, 2.1, depth));
    col = mix(col, uHorizon * 0.55, (1.0 - side) * 0.6 * (1.0 - smoothstep(0.7, 2.1, depth)));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Ground({ sceneRef }) {
  const mesh = useRef(null);
  const geometry = useMemo(() => {
    const length = LANE + 150;
    const g = new THREE.PlaneGeometry(520, length, 1, 1);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -length / 2 + 12);
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uHit: { value: 0 },
          uCol: { value: new THREE.Color(PALETTE.grid) },
          uRail: { value: new THREE.Color(PALETTE.rail) },
          uHot: { value: new THREE.Color(PALETTE.hot) },
          uHorizon: { value: new THREE.Color(PALETTE.horizon) },
          uRift: { value: new THREE.Color(PALETTE.rift) },
        },
        vertexShader: GROUND_VERT,
        fragmentShader: GROUND_FRAG,
      }),
    []
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    // Our own material (no `uniforms` prop for R3F to copy); time from performance.now(), because
    // R3F resets its clock whenever the frameloop is paused and resumed.
    const u = m.material.uniforms;
    const now = performance.now();
    u.uTime.value = (now / 1000) % 1000;
    const since = now - (sceneRef.current.hit?.at || -1e9);
    u.uHit.value = Math.max(0, 1 - since / 520);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />;
}

/** Pylons along both rails: the depth cue that makes the causeway read as long. */
function Pylons() {
  const posts = useRef(null);
  const caps = useRef(null);
  const count = 18;
  const postGeo = useMemo(() => new THREE.BoxGeometry(0.2, 1.5, 0.2), []);
  const capGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.12, 0.3), []);
  const postMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1b1648', toneMapped: false }), []);
  const capMat = useMemo(() => new THREE.MeshBasicMaterial({ color: PALETTE.rail, toneMapped: false }), []);
  useEffect(
    () => () => {
      postGeo.dispose();
      capGeo.dispose();
      postMat.dispose();
      capMat.dispose();
    },
    [postGeo, capGeo, postMat, capMat]
  );
  useEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (i % 2 ? 1 : -1) * (RAIL_X + 0.55);
      const z = -3 - Math.floor(i / 2) * 4.6;
      o.position.set(x, 0.75, z);
      o.updateMatrix();
      posts.current.setMatrixAt(i, o.matrix);
      o.position.set(x, 1.56, z);
      o.updateMatrix();
      caps.current.setMatrixAt(i, o.matrix);
    }
    posts.current.instanceMatrix.needsUpdate = true;
    caps.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={posts} args={[postGeo, postMat, count]} frustumCulled={false} />
      <instancedMesh ref={caps} args={[capGeo, capMat, count]} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- shading
// One small "key light + rim" shader instead of scene lights: lit materials cost a much bigger
// program on entry-level GPUs. The light direction is fixed in view space (the camera never turns).
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
  uniform float uGlow;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 n = normalize(vN);
    float l = max(dot(n, normalize(vec3(0.35, 0.8, 0.5))), 0.0);
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.4);
    vec3 col = uColor * (0.32 + 0.85 * l) + uRim * fres * 0.9 + uColor * uGlow;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
function shaded(color, rim, glow = 0) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uRim: { value: new THREE.Color(rim) }, uGlow: { value: glow } },
    vertexShader: SHADE_VERT,
    fragmentShader: SHADE_FRAG,
  });
}

const DRONE_VERT = /* glsl */ `
  attribute vec4 aTone;
  varying vec3 vN;
  varying vec3 vV;
  varying vec4 vTone;
  void main() {
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vV = normalize(-mv.xyz);
    vTone = aTone;
    gl_Position = projectionMatrix * mv;
  }
`;
const DRONE_FRAG = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec4 vTone;
  void main() {
    vec3 n = normalize(vN);
    float l = max(dot(n, normalize(vec3(0.35, 0.8, 0.5))), 0.0);
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.0);
    vec3 body = mix(vec3(0.05, 0.045, 0.16), vTone.rgb, 0.42);
    vec3 col = body * (0.4 + 0.9 * l) + vTone.rgb * fres * 1.25 + vTone.rgb * vTone.a;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// ---------------------------------------------------------------------------------- turret
function Turret({ sceneRef }) {
  const head = useRef(null);
  const barrels = useRef(null);
  const core = useRef(null);
  const ring = useRef(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mats = useMemo(
    () => ({
      hull: shaded('#241d66', '#8b7bff'),
      plate: shaded('#37308f', '#c4b5fd'),
      metal: shaded('#9aa3c7', '#ffffff'),
      core: new THREE.MeshBasicMaterial({ color: '#f0abfc', toneMapped: false }),
      trim: new THREE.MeshBasicMaterial({ color: PALETTE.rail, toneMapped: false }),
    }),
    []
  );
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) m.dispose();
    },
    [mats]
  );
  useFrame((_, dt) => {
    const h = head.current;
    if (!h) return;
    const s = sceneRef.current;
    const now = performance.now();
    const target = (s.enemies || []).find((e) => e.id === s.targetId && LIVE.has(e.state));
    let want = 0;
    if (target) {
      enemyPos(target, tmp);
      // The barrels point down -z; rotating by θ about y turns them toward (−sin θ, −cos θ).
      want = Math.atan2(-(tmp.x - MUZZLE[0]), -(tmp.z - MUZZLE[2]));
    }
    h.rotation.y += (want - h.rotation.y) * (1 - Math.exp(-Math.min(0.1, dt) * 10));
    // recoil: the barrels kick back for a moment after every shot
    const since = s.shot ? now - s.shot.at : Infinity;
    const kick = since < 160 ? 1 - since / 160 : 0;
    if (barrels.current) barrels.current.position.z = 0.2 * kick;
    if (core.current) core.current.scale.setScalar(1 + 0.12 * Math.sin(now * 0.006) + 0.5 * kick);
    if (ring.current) ring.current.rotation.z = now * 0.0012;
  });
  return (
    <group position={[0, 0, 0.25]}>
      {/* plinth */}
      <mesh position={[0, 0.16, 0]} material={mats.hull}>
        <cylinderGeometry args={[1.1, 1.3, 0.32, 8]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={mats.plate}>
        <cylinderGeometry args={[0.8, 1.02, 0.24, 8]} />
      </mesh>
      <mesh ref={ring} position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.trim}>
        <torusGeometry args={[1.12, 0.03, 6, 48]} />
      </mesh>
      {/* head */}
      <group ref={head} position={[0, 0.86, 0]}>
        <mesh material={mats.plate}>
          <sphereGeometry args={[0.52, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} material={mats.hull}>
          <cylinderGeometry args={[0.56, 0.6, 0.2, 20]} />
        </mesh>
        <mesh ref={core} position={[0, 0.16, -0.36]} material={mats.core}>
          <sphereGeometry args={[0.11, 12, 10]} />
        </mesh>
        <group ref={barrels}>
          {[-0.2, 0.2].map((x) => (
            <group key={x} position={[x, 0.16, -0.62]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
                <cylinderGeometry args={[0.065, 0.085, 1.0, 10]} />
              </mesh>
              <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]} material={mats.trim}>
                <cylinderGeometry args={[0.095, 0.095, 0.1, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      {/* the two emitters of the base barrier */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (RAIL_X + 0.1), 0, -1.15]}>
          <mesh position={[0, 0.5, 0]} material={mats.hull}>
            <boxGeometry args={[0.3, 1.0, 0.3]} />
          </mesh>
          <mesh position={[0, 1.06, 0]} material={mats.trim}>
            <boxGeometry args={[0.38, 0.12, 0.38]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const BARRIER_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uHit;
  uniform vec3 uCol;
  uniform vec3 uHot;
  varying vec2 vUv;
  void main() {
    float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    float fall = pow(1.0 - vUv.y, 1.6);
    float scan = 0.6 + 0.4 * sin(vUv.x * 70.0 + uTime * 4.0);
    float a = edge * fall * (0.16 + 0.1 * scan + 0.7 * uHit);
    vec3 col = mix(uCol, uHot, uHit);
    gl_FragColor = vec4(col * a, a);
    #include <colorspace_fragment>
  }
`;

function Barrier({ sceneRef }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uHit: { value: 0 }, uCol: { value: new THREE.Color(PALETTE.rail) }, uHot: { value: new THREE.Color(PALETTE.hot) } },
        vertexShader: UV_VERT,
        fragmentShader: BARRIER_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const now = performance.now();
    m.material.uniforms.uTime.value = (now / 1000) % 1000;
    m.material.uniforms.uHit.value = Math.max(0, 1 - (now - (sceneRef.current.hit?.at || -1e9)) / 520);
  });
  return (
    <mesh ref={mesh} material={material} position={[0, 0.55, -0.9]} frustumCulled={false}>
      <planeGeometry args={[(RAIL_X + 0.1) * 2, 1.1]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------------- enemies
function makeLabels() {
  return [1, 2, 3, 4].map((n) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const x = canvas.getContext('2d');
    x.fillStyle = 'rgba(7,10,24,0.9)';
    x.beginPath();
    x.arc(64, 64, 56, 0, Math.PI * 2);
    x.fill();
    x.lineWidth = 8;
    x.strokeStyle = '#c4b5fd';
    x.stroke();
    x.fillStyle = '#ffffff';
    x.font = '900 70px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(String(n), 64, 69);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  });
}

function Enemies({ sceneRef, cfg, glowTexture }) {
  const core = useRef(null);
  const glow = useRef(null);
  const rings = useRef(null);
  const pools = useRef(null);
  const labels = useRef(null);
  const reticle = useRef(null);
  const coreGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.62, 0);
    g.setAttribute('aTone', new THREE.InstancedBufferAttribute(new Float32Array(MAX * 4), 4).setUsage(THREE.DynamicDrawUsage));
    return g;
  }, []);
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(3.4, 3.4), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.92, 0.035, 6, 36), []);
  const poolGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(3.2, 3.2);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const coreMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: DRONE_VERT, fragmentShader: DRONE_FRAG }), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ map: glowTexture, toneMapped: false, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), [glowTexture]);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const poolMat = useMemo(() => new THREE.MeshBasicMaterial({ map: glowTexture, toneMapped: false, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }), [glowTexture]);
  const labelMats = useMemo(() => makeLabels(), []);
  useEffect(
    () => () => {
      coreGeo.dispose();
      glowGeo.dispose();
      ringGeo.dispose();
      poolGeo.dispose();
    },
    [coreGeo, glowGeo, ringGeo, poolGeo]
  );
  useEffect(
    () => () => {
      coreMat.dispose();
      glowMat.dispose();
      ringMat.dispose();
      poolMat.dispose();
    },
    [coreMat, glowMat, ringMat, poolMat]
  );
  useEffect(
    () => () => {
      for (const m of labelMats) {
        m.map?.dispose();
        m.dispose();
      }
    },
    [labelMats]
  );
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), c: new THREE.Color() }), []);

  useFrame((state) => {
    const cm = core.current;
    const gm = glow.current;
    const lab = labels.current;
    const ret = reticle.current;
    if (!cm || !gm || !lab || !ret) return;
    const rm = rings.current;
    const pm = pools.current;
    const s = sceneRef.current;
    const now = performance.now();
    const list = s.enemies || [];
    const tones = cm.geometry.attributes.aTone.array;
    let n = 0;
    for (let i = 0; i < list.length && n < MAX; i++) {
      const e = list[i];
      const since = now - (e.at || 0);
      let scale = 1;
      let flash = 0;
      if (e.state === 'dead') {
        scale = since < 110 ? 1 + 0.6 * (since / 110) : Math.max(0, 1.6 * (1 - (since - 110) / 300));
        flash = Math.max(0, 1 - since / 200);
      } else if (e.state === 'breach') scale = Math.max(0, 1 - since / 320);
      else if (e.state === 'lost') scale = Math.max(0, 1 - since / 520);
      else if (e.state === 'pending') {
        scale = 1 + 0.05 * Math.sin(now * 0.025);
        flash = 0.25 + 0.2 * Math.sin(now * 0.02);
      }
      scale *= Math.min(1, (now - (e.born || 0)) / 260); // pop in at the spawn line
      scale = Math.max(0.0001, scale);
      enemyPos(e, tmp.p);
      tmp.p.setY(tmp.p.y + Math.sin(now * 0.003 + e.id) * 0.1);

      tmp.c.copy(TONE[e.state] || TONE.walk);
      if (e.state === 'revealed') tmp.c.lerp(TONE.walk, 0.5 + 0.5 * Math.sin(now * 0.012));
      const targeted = e.id === s.targetId && (e.state === 'walk' || e.state === 'revealed');

      tmp.o.position.copy(tmp.p);
      tmp.o.rotation.set(now * 0.0009 + e.id, now * 0.0013, 0);
      tmp.o.scale.setScalar(scale);
      tmp.o.updateMatrix();
      cm.setMatrixAt(n, tmp.o.matrix);
      tones[n * 4] = tmp.c.r;
      tones[n * 4 + 1] = tmp.c.g;
      tones[n * 4 + 2] = tmp.c.b;
      tones[n * 4 + 3] = flash + (targeted ? 0.12 : 0);

      // halo: a camera-facing glow, larger while the answer is being graded
      tmp.o.quaternion.copy(state.camera.quaternion);
      tmp.o.scale.setScalar(scale * (e.state === 'pending' ? 1.35 : targeted ? 1.15 : 1));
      tmp.o.updateMatrix();
      gm.setMatrixAt(n, tmp.o.matrix);
      gm.setColorAt(n, e.state === 'pending' ? TONE.pending : tmp.c);

      if (rm) {
        tmp.o.rotation.set(Math.PI / 2 + 0.35 * Math.sin(now * 0.0011 + e.id), now * 0.0016 + e.id * 2.1, 0);
        tmp.o.scale.setScalar(scale);
        tmp.o.updateMatrix();
        rm.setMatrixAt(n, tmp.o.matrix);
        rm.setColorAt(n, tmp.c);
      }
      if (pm) {
        tmp.o.position.set(tmp.p.x, 0.03, tmp.p.z);
        tmp.o.rotation.set(0, 0, 0);
        tmp.o.scale.setScalar(Math.min(1, scale));
        tmp.o.updateMatrix();
        pm.setMatrixAt(n, tmp.o.matrix);
        pm.setColorAt(n, tmp.c);
      }

      const sp = lab.children[n];
      if (sp) {
        sp.visible = LIVE.has(e.state);
        sp.material = labelMats[e.slot] || labelMats[0];
        // Far labels are drawn larger so the number stays readable down the lane.
        sp.scale.setScalar(0.66 * (1 + 1.5 * (1 - Math.min(1, e.progress || 0))) * Math.min(1, scale));
        sp.position.set(tmp.p.x, tmp.p.y + 1.2 + 0.6 * (1 - Math.min(1, e.progress || 0)), tmp.p.z);
      }
      n++;
    }
    for (let k = n; k < MAX; k++) if (lab.children[k]) lab.children[k].visible = false;
    cm.count = n;
    gm.count = n;
    cm.instanceMatrix.needsUpdate = true;
    gm.instanceMatrix.needsUpdate = true;
    cm.geometry.attributes.aTone.needsUpdate = true;
    if (gm.instanceColor) gm.instanceColor.needsUpdate = true;
    if (rm) {
      rm.count = n;
      rm.instanceMatrix.needsUpdate = true;
      if (rm.instanceColor) rm.instanceColor.needsUpdate = true;
    }
    if (pm) {
      pm.count = n;
      pm.instanceMatrix.needsUpdate = true;
      if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }

    const target = list.find((e) => e.id === s.targetId && (e.state === 'walk' || e.state === 'revealed'));
    ret.visible = !!target;
    if (target) {
      enemyPos(target, tmp.p);
      tmp.p.setY(tmp.p.y + Math.sin(now * 0.003 + target.id) * 0.1);
      ret.position.copy(tmp.p);
      ret.quaternion.copy(state.camera.quaternion);
      const size = 1.05 + 0.07 * Math.sin(now * 0.009) + 0.32 * (1 - Math.min(1, target.progress || 0));
      ret.scale.setScalar(size);
      ret.children[0].rotation.z = now * 0.0022;
      ret.children[1].rotation.z = -now * 0.0016;
    }
  });

  return (
    <>
      {cfg.scenery && <instancedMesh ref={pools} args={[poolGeo, poolMat, MAX]} frustumCulled={false} />}
      <instancedMesh ref={core} args={[coreGeo, coreMat, MAX]} frustumCulled={false} />
      {cfg.scenery && <instancedMesh ref={rings} args={[ringGeo, ringMat, MAX]} frustumCulled={false} />}
      <instancedMesh ref={glow} args={[glowGeo, glowMat, MAX]} frustumCulled={false} />
      <group ref={labels}>
        {Array.from({ length: MAX }, (_, i) => (
          <sprite key={i} visible={false} material={labelMats[0]} />
        ))}
      </group>
      <group ref={reticle} visible={false}>
        <mesh>
          <torusGeometry args={[1.22, 0.045, 6, 44, Math.PI * 1.5]} />
          <meshBasicMaterial color="#fde68a" toneMapped={false} transparent opacity={0.95} depthWrite={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.42, 0.022, 6, 44, Math.PI * 0.9]} />
          <meshBasicMaterial color="#fde68a" toneMapped={false} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------------- shots
function Beam({ sceneRef, glowTexture }) {
  const group = useRef(null);
  const aim = useRef(null);
  const flash = useRef(null);
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1, true);
    g.rotateX(Math.PI / 2); // axis along z
    g.translate(0, 0, 0.5); // from the origin to +1 along z, so lookAt + scale.z = distance
    return g;
  }, []);
  const mats = useMemo(
    () => ({
      core: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      sheath: new THREE.MeshBasicMaterial({ color: '#e879f9', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      aim: new THREE.MeshBasicMaterial({ color: '#fde68a', toneMapped: false, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
      flash: new THREE.SpriteMaterial({ map: glowTexture, color: '#f5d0fe', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    }),
    [glowTexture]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) m.dispose();
    },
    [mats]
  );
  const tmp = useMemo(() => ({ a: new THREE.Vector3(...MUZZLE), b: new THREE.Vector3() }), []);
  useFrame(() => {
    const g = group.current;
    const a = aim.current;
    const f = flash.current;
    if (!g || !f) return;
    const s = sceneRef.current;
    const now = performance.now();
    const since = s.shot ? now - s.shot.at : Infinity;
    const e = since < 240 ? (s.enemies || []).find((x) => x.id === s.shot.id) : null;
    g.visible = !!e;
    f.visible = since < 140;
    if (f.visible) f.scale.setScalar(1.2 + 2.4 * (1 - since / 140));
    if (e) {
      enemyPos(e, tmp.b);
      g.position.copy(tmp.a);
      g.lookAt(tmp.b);
      const k = 1 - since / 240;
      const d = tmp.a.distanceTo(tmp.b);
      g.children[0].scale.set(0.05 + 0.07 * k, 0.05 + 0.07 * k, d);
      g.children[1].scale.set(0.16 + 0.3 * k, 0.16 + 0.3 * k, d);
      g.children[0].material.opacity = k;
      g.children[1].material.opacity = 0.55 * k;
    }
    // a faint aiming line from the muzzle to the targeted drone
    if (a) {
      const target = (s.enemies || []).find((x) => x.id === s.targetId && (x.state === 'walk' || x.state === 'revealed'));
      a.visible = !!target && !e;
      if (a.visible) {
        enemyPos(target, tmp.b);
        a.position.copy(tmp.a);
        a.lookAt(tmp.b);
        a.scale.set(0.035, 0.035, tmp.a.distanceTo(tmp.b));
      }
    }
  });
  return (
    <>
      <group ref={group} visible={false}>
        <mesh geometry={geometry} material={mats.core} frustumCulled={false} />
        <mesh geometry={geometry} material={mats.sheath} frustumCulled={false} />
      </group>
      <mesh ref={aim} geometry={geometry} material={mats.aim} visible={false} frustumCulled={false} />
      <sprite ref={flash} material={mats.flash} position={MUZZLE} visible={false} />
    </>
  );
}

/** Kill effects: tumbling shards and an expanding shock ring where the drone was. */
function Bursts({ sceneRef, cfg }) {
  const mesh = useRef(null);
  const rings = useRef(null);
  const pool = useRef({ items: [], waves: [], seen: new Set() });
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.15), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#a7f3d0', toneMapped: false }), []);
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.86, 1, 40), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    },
    [geometry, material, ringGeo, ringMat]
  );
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), c: new THREE.Color() }), []);
  useFrame((state, dt) => {
    const m = mesh.current;
    const rm = rings.current;
    if (!m || !rm) return;
    const s = sceneRef.current;
    const now = performance.now();
    const P = pool.current;
    for (const e of s.enemies || []) {
      if (e.state !== 'dead' || P.seen.has(e.id)) continue;
      P.seen.add(e.id);
      if (P.seen.size > 64) P.seen.delete(P.seen.values().next().value);
      enemyPos(e, tmp.p);
      P.waves.push({ born: now, p: tmp.p.clone() });
      if (P.waves.length > 4) P.waves.shift();
      for (let k = 0; k < cfg.perKill; k++) {
        const a = Math.random() * Math.PI * 2;
        const up = 1.5 + Math.random() * 3.4;
        const out = 1.5 + Math.random() * 3;
        P.items.push({
          born: now,
          p: tmp.p.clone(),
          v: new THREE.Vector3(Math.cos(a) * out, up, Math.sin(a) * out),
          r: Math.random() * 6,
        });
      }
    }
    if (P.items.length > cfg.shards) P.items.splice(0, P.items.length - cfg.shards);
    const step = Math.min(0.05, dt);
    let n = 0;
    for (let i = P.items.length - 1; i >= 0; i--) {
      const it = P.items[i];
      const age = now - it.born;
      if (age > 820) {
        P.items.splice(i, 1);
        continue;
      }
      it.v.y -= 9 * step;
      it.p.addScaledVector(it.v, step);
      tmp.o.position.copy(it.p);
      tmp.o.rotation.set(it.r + age * 0.01, it.r * 2 + age * 0.012, 0);
      tmp.o.scale.setScalar(Math.max(0.0001, 1 - age / 820));
      tmp.o.updateMatrix();
      m.setMatrixAt(n, tmp.o.matrix);
      n++;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;

    let w = 0;
    for (let i = P.waves.length - 1; i >= 0; i--) {
      const it = P.waves[i];
      const k = (now - it.born) / 460;
      if (k >= 1) {
        P.waves.splice(i, 1);
        continue;
      }
      tmp.o.position.copy(it.p);
      tmp.o.quaternion.copy(state.camera.quaternion);
      tmp.o.scale.setScalar(0.6 + 3.6 * (1 - Math.pow(1 - k, 3)));
      tmp.o.updateMatrix();
      rm.setMatrixAt(w, tmp.o.matrix);
      // additive blending: a darker colour is a fainter ring
      rm.setColorAt(w, tmp.c.copy(TONE.dead).multiplyScalar(1 - k));
      w++;
    }
    rm.count = w;
    rm.instanceMatrix.needsUpdate = true;
    if (rm.instanceColor) rm.instanceColor.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, cfg.shards]} frustumCulled={false} />
      <instancedMesh ref={rings} args={[ringGeo, ringMat, 4]} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- camera
function Rig({ sceneRef }) {
  const look = useMemo(() => new THREE.Vector3(...CAM_LOOK), []);
  useFrame((state) => {
    const now = performance.now();
    const camera = state.camera;
    const since = now - (sceneRef.current.hit?.at || -1e9);
    const shake = since < 380 ? (1 - since / 380) * 0.16 : 0;
    const shot = sceneRef.current.shot ? now - sceneRef.current.shot.at : Infinity;
    const punch = shot < 140 ? (1 - shot / 140) * 0.05 : 0;
    // A wide stage pulls the camera back and up, so the turret clears the chips and the input row
    // that float over the bottom of the scene; a portrait stage keeps the close, low view.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const wide = Math.min(1, Math.max(0, (aspect - 0.7) / 0.8));
    camera.position.set(
      CAM_POS[0] + Math.sin(now * 0.06) * shake + Math.sin(now * 0.00035) * 0.12,
      CAM_POS[1] + 1.5 * wide + Math.cos(now * 0.071) * shake + Math.sin(now * 0.0005) * 0.05,
      CAM_POS[2] + 3.2 * wide + punch
    );
    look.set(CAM_LOOK[0], CAM_LOOK[1] - 2.6 * wide, CAM_LOOK[2]);
    camera.lookAt(look);
    // The whole causeway stays in view on any screen: a narrow (portrait) stage gets a taller field
    // of view so the lane edges at the base are never cut off.
    const fov = Math.min(84, Math.max(50, (2 * Math.atan(Math.tan((25 * Math.PI) / 180) / Math.max(0.3, aspect)) * 180) / Math.PI));
    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

function Scene({ sceneRef, cfg }) {
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  return (
    <>
      <Rig sceneRef={sceneRef} />
      <Sky sceneRef={sceneRef} />
      <Stars count={cfg.stars} />
      {cfg.scenery && <Skyline />}
      <Rift sceneRef={sceneRef} />
      <Ground sceneRef={sceneRef} />
      {cfg.scenery && <Pylons />}
      <Barrier sceneRef={sceneRef} />
      <Turret sceneRef={sceneRef} />
      <Enemies sceneRef={sceneRef} cfg={cfg} glowTexture={glowTexture} />
      <Beam sceneRef={sceneRef} glowTexture={glowTexture} />
      <Bursts sceneRef={sceneRef} cfg={cfg} />
    </>
  );
}

function DefenseScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: CAM_POS, fov: 50, near: 0.1, far: 420 }}
      gl={{ antialias: cfg.antialias, powerPreference: tier === 'high' ? 'high-performance' : 'default', alpha: false }}
      onCreated={({ gl }) => {
        // A lost context (GPU reset, too many tabs) is reported to the controller, which switches to 2D.
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          sceneRef.current.contextLost = true;
        });
        // ...and a context the browser gives back clears it (three.js re-uploads everything on restore).
        gl.domElement.addEventListener('webglcontextrestored', () => {
          sceneRef.current.contextLost = false;
        });
      }}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden="true"
    >
      <color attach="background" args={[PALETTE.skyTop]} />
      <Scene sceneRef={sceneRef} cfg={cfg} />
    </Canvas>
  );
}

export default memo(DefenseScene3D);

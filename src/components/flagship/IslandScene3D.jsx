'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ISLAND, BEACONS } from '@/lib/flagship/island';
import { dprFor } from '@/lib/flagship/gpu';

// So'z oroli scene: a small island at dusk. A hero walks it in third person; eight crystal beacons
// stand around a lighthouse and light up as their words are found.
// Original design and art: everything is procedural (a displaced, vertex-coloured terrain, shaders,
// canvas textures, merged primitives) — no models or textures are downloaded, there are no scene
// lights and no postprocessing. Trees, rocks and every beacon part are instanced. The 'low' tier
// drops the clouds, thins the forest and uses a plainer sea.
//
// Contract: everything per-frame reads `sceneRef.current`, written by the WordIsland controller:
//   { hero: { x, z, angle, moving }, beacons: ['idle' | 'lit' | 'broken'], near: index | -1,
//     open: index | -1, feedback: { index, ok, at } | null, dest: { x, z } | null,
//     allLit: { at } | null, onTap(x, z), contextLost }
// The Canvas stays mounted for the whole round and is paused with frameloop="never".

const SHORE = ISLAND.walkRadius + 1.1; // where the grass ends
const EDGE = SHORE + 3.2; // where the sand goes under the water
const WATER_Y = -0.55;
const TIERS = {
  high: { antialias: true, trees: 26, rocks: 12, clouds: true, waves: true, grid: 64 },
  low: { antialias: false, trees: 12, rocks: 6, clouds: false, waves: false, grid: 40 },
};
const PAL = {
  skyTop: '#141a4a',
  skyMid: '#5a3b9c',
  skyLow: '#d46a9f',
  horizon: '#ffb38a',
  sun: '#fff0c2',
  deep: '#0e2a52',
  shallow: '#2f9fb8',
};
const TONE = {
  idle: new THREE.Color('#7dd3fc'),
  near: new THREE.Color('#fde68a'),
  lit: new THREE.Color('#ffd27a'),
  broken: new THREE.Color('#64748b'),
  ok: new THREE.Color('#34d399'),
  bad: new THREE.Color('#fb7185'),
};
const KEY_LIGHT = 'normalize(vec3(-0.45, 0.8, 0.4))';
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const x = canvas.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A column of light: bright at the foot, fading upward and toward both edges. */
function makePillarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const x = canvas.getContext('2d');
  const img = x.createImageData(64, 256);
  for (let j = 0; j < 256; j++) {
    for (let i = 0; i < 64; i++) {
      const across = 1 - Math.abs(i - 31.5) / 31.5;
      const up = 1 - j / 255; // canvas row 0 is the top of the pillar
      const a = Math.pow(across, 2.2) * Math.pow(up, 1.3);
      const k = (j * 64 + i) * 4;
      img.data[k] = 255;
      img.data[k + 1] = 255;
      img.data[k + 2] = 255;
      img.data[k + 3] = Math.round(255 * a);
    }
  }
  x.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------------- sky
const UV_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uLow;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform float uLit;
  varying vec2 vUv;
  void main() {
    float h = vUv.y;
    vec3 col = mix(uHorizon, uLow, smoothstep(0.30, 0.44, h));
    col = mix(col, uMid, smoothstep(0.40, 0.62, h));
    col = mix(col, uTop, smoothstep(0.56, 0.95, h));
    vec2 d = (vUv - vec2(0.64, 0.335)) * vec2(2.6, 1.0);
    float r = length(d);
    col += uSun * (exp(-r * 22.0) * 0.9 + exp(-r * 5.5) * 0.3);
    col += uSun * uLit * 0.07 * smoothstep(0.9, 0.3, h);
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
          uTop: { value: new THREE.Color(PAL.skyTop) },
          uMid: { value: new THREE.Color(PAL.skyMid) },
          uLow: { value: new THREE.Color(PAL.skyLow) },
          uHorizon: { value: new THREE.Color(PAL.horizon) },
          uSun: { value: new THREE.Color(PAL.sun) },
          uLit: { value: 0 },
        },
        vertexShader: UV_VERT,
        fragmentShader: SKY_FRAG,
        depthWrite: false,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    const m = mesh.current;
    if (!m) return;
    // The sky travels with the camera, so the horizon never moves against the sea.
    m.position.set(camera.position.x, 30, camera.position.z - 230);
    m.material.uniforms.uLit.value = sceneRef.current.allLit ? 1 : 0;
  });
  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[900, 420]} />
    </mesh>
  );
}

function Clouds({ glowTexture }) {
  const group = useRef(null);
  const material = useMemo(() => new THREE.SpriteMaterial({ map: glowTexture, color: '#ffd9c2', transparent: true, opacity: 0.34, depthWrite: false, toneMapped: false }), [glowTexture]);
  useEffect(() => () => material.dispose(), [material]);
  const puffs = useMemo(() => {
    const rnd = seeded(77);
    return Array.from({ length: 9 }, (_, i) => ({ x: -120 + i * 30 + rnd() * 14, y: 20 + rnd() * 22, z: -150 - rnd() * 40, w: 46 + rnd() * 38, h: 9 + rnd() * 6 }));
  }, []);
  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    g.position.set(camera.position.x + ((performance.now() * 0.0009) % 60) - 30, 0, camera.position.z);
  });
  return (
    <group ref={group} renderOrder={-9}>
      {puffs.map((p, i) => (
        <sprite key={i} material={material} position={[p.x, p.y, p.z]} scale={[p.w, p.h, 1]} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------- sea
const WORLD_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const SEA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  varying vec3 vWorld;
  void main() {
    float r = length(vWorld.xz);
    float a = atan(vWorld.z, vWorld.x);
    vec3 col = mix(uShallow, uDeep, smoothstep(${EDGE.toFixed(1)}, ${(EDGE + 13).toFixed(1)}, r));
    #ifdef WAVES
    float w = sin(vWorld.x * 0.55 + uTime * 0.9) + sin(vWorld.z * 0.8 - uTime * 1.2) + sin((vWorld.x + vWorld.z) * 0.33 + uTime * 0.6);
    col += vec3(0.35, 0.5, 0.6) * smoothstep(2.1, 2.9, w) * 0.22;
    // the low sun lays a path of light across the water, away to the right
    float path = exp(-abs(vWorld.x - 30.0 - vWorld.z * -0.42) * 0.06) * smoothstep(-10.0, -120.0, vWorld.z);
    col += uSun * path * (0.25 + 0.2 * smoothstep(1.2, 2.6, w));
    #endif
    // foam where the sea meets the sand: a wobbling ring that breathes in and out
    float shore = ${EDGE.toFixed(2)} - 0.55 + 0.32 * sin(a * 9.0 + uTime * 0.7) + 0.25 * sin(uTime * 1.1);
    float foam = smoothstep(0.75, 0.0, abs(r - shore)) * 0.75 + smoothstep(1.6, 0.0, abs(r - shore - 1.5)) * 0.2;
    col = mix(col, vec3(1.0), clamp(foam, 0.0, 1.0));
    // far away the sea takes the colour of the horizon
    float far = smoothstep(60.0, 230.0, r);
    col = mix(col, uHorizon, far * 0.85);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Sea({ cfg }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color(PAL.deep) },
          uShallow: { value: new THREE.Color(PAL.shallow) },
          uHorizon: { value: new THREE.Color(PAL.horizon) },
          uSun: { value: new THREE.Color(PAL.sun) },
        },
        defines: cfg.waves ? { WAVES: 1 } : {},
        vertexShader: WORLD_VERT,
        fragmentShader: SEA_FRAG,
      }),
    [cfg.waves]
  );
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(900, 900, 1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    if (mesh.current) mesh.current.material.uniforms.uTime.value = (performance.now() / 1000) % 1000;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} position={[0, WATER_Y, 0]} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------------- land
const LAND_VERT = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vN;
  void main() {
    vColor = color;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const LAND_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vN;
  void main() {
    float l = max(dot(normalize(vN), ${KEY_LIGHT}), 0.0);
    vec3 col = vColor * (0.5 + 0.62 * l) + vec3(0.16, 0.07, 0.1) * (1.0 - l) * 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Height of the ground at radius r: a plateau with soft bumps, a beach, then under the sea. */
function landHeight(x, z) {
  const r = Math.hypot(x, z);
  const bumps = 0.09 * (Math.sin(x * 0.9) * Math.cos(z * 0.8) + 0.6 * Math.sin(x * 0.35 + z * 0.5));
  const drop = clamp01((r - SHORE) / (EDGE - SHORE + 1.5));
  const eased = drop * drop * (3 - 2 * drop);
  return bumps * (1 - eased) - 1.25 * eased - 0.02;
}

function Land({ sceneRef, cfg }) {
  const geometry = useMemo(() => {
    const size = (EDGE + 2.5) * 2;
    const g = new THREE.PlaneGeometry(size, size, cfg.grid, cfg.grid);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const grassA = new THREE.Color('#3f9b5b');
    const grassB = new THREE.Color('#86d07a');
    const sand = new THREE.Color('#f0d6a0');
    const wet = new THREE.Color('#b99a6a');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      pos.setY(i, landHeight(x, z));
      const patch = 0.5 + 0.5 * Math.sin(x * 0.55 + Math.sin(z * 0.7) * 1.4) * Math.cos(z * 0.45);
      c.copy(grassA).lerp(grassB, patch);
      const beach = clamp01((r - (SHORE - 1.1)) / 1.4);
      c.lerp(sand, beach);
      c.lerp(wet, clamp01((r - (EDGE - 1.2)) / 1.6));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [cfg.grid]);
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: LAND_VERT, fragmentShader: LAND_FRAG }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh
      geometry={geometry}
      material={material}
      onPointerDown={(ev) => {
        ev.stopPropagation();
        sceneRef.current.onTap?.(ev.point.x, ev.point.z);
      }}
    />
  );
}

// One "key light + rim" shader for everything solid (see DefenseScene3D): no scene lights.
const SHADE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    #ifdef USE_INSTANCING
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    #else
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    #endif
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
    float l = max(dot(n, ${KEY_LIGHT}), 0.0);
    float fres = pow(1.0 - max(dot(normalize(mat3(viewMatrix) * n), normalize(vV)), 0.0), 2.6);
    vec3 col = uColor * (0.42 + 0.72 * l) + uRim * fres * 0.5 + uColor * uGlow;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
function shaded(color, rim = '#ffd9c2', glow = 0) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uRim: { value: new THREE.Color(rim) }, uGlow: { value: glow } },
    vertexShader: SHADE_VERT,
    fragmentShader: SHADE_FRAG,
  });
}

/** Sites for trees and rocks: seeded, on the plateau, clear of the tower, the beacons and the spawn. */
function scatter(count, seed, minR, maxR) {
  const rnd = seeded(seed);
  const out = [];
  for (let tries = 0; out.length < count && tries < count * 40; tries++) {
    const a = rnd() * Math.PI * 2;
    const r = minR + Math.sqrt(rnd()) * (maxR - minR);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x - ISLAND.spawn.x, z - ISLAND.spawn.z) < 3) continue;
    if (BEACONS.some((b) => Math.hypot(x - b.x, z - b.z) < 2.6)) continue;
    if (out.some((o) => Math.hypot(x - o.x, z - o.z) < 1.5)) continue;
    out.push({ x, z, s: 0.62 + rnd() * 0.4, rot: rnd() * Math.PI * 2 });
  }
  return out;
}

function Forest({ cfg }) {
  const trunks = useRef(null);
  const lower = useRef(null);
  const upper = useRef(null);
  const rocks = useRef(null);
  const sites = useMemo(() => scatter(cfg.trees, 4242, 4.2, SHORE - 0.6), [cfg.trees]);
  const stones = useMemo(() => scatter(cfg.rocks, 99, 3.6, EDGE - 1.2), [cfg.rocks]);
  const geo = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.13, 0.2, 1.1, 7),
      lower: new THREE.ConeGeometry(1.0, 1.7, 8),
      upper: new THREE.ConeGeometry(0.72, 1.4, 8),
      rock: new THREE.DodecahedronGeometry(0.55, 0),
    }),
    []
  );
  const mats = useMemo(() => ({ trunk: shaded('#7a4a34', '#ffb38a'), lower: shaded('#2f8f5e', '#ffe2a8'), upper: shaded('#49b673', '#ffe2a8'), rock: shaded('#8d8aa6', '#ffd9c2') }), []);
  useEffect(
    () => () => {
      for (const g of Object.values(geo)) g.dispose();
      for (const m of Object.values(mats)) m.dispose();
    },
    [geo, mats]
  );
  useEffect(() => {
    const o = new THREE.Object3D();
    sites.forEach((t, i) => {
      const y = landHeight(t.x, t.z);
      o.rotation.set(0, t.rot, 0);
      o.scale.setScalar(t.s);
      o.position.set(t.x, y + 0.5 * t.s, t.z);
      o.updateMatrix();
      trunks.current.setMatrixAt(i, o.matrix);
      o.position.set(t.x, y + 1.7 * t.s, t.z);
      o.updateMatrix();
      lower.current.setMatrixAt(i, o.matrix);
      o.position.set(t.x, y + 2.65 * t.s, t.z);
      o.updateMatrix();
      upper.current.setMatrixAt(i, o.matrix);
    });
    stones.forEach((t, i) => {
      o.rotation.set(t.rot, t.rot * 1.7, 0);
      o.scale.set(t.s, t.s * 0.7, t.s * 0.9);
      o.position.set(t.x, landHeight(t.x, t.z) + 0.1, t.z);
      o.updateMatrix();
      rocks.current.setMatrixAt(i, o.matrix);
    });
    for (const m of [trunks, lower, upper, rocks]) m.current.instanceMatrix.needsUpdate = true;
  }, [sites, stones]);
  return (
    <>
      <instancedMesh ref={trunks} args={[geo.trunk, mats.trunk, sites.length]} frustumCulled={false} />
      <instancedMesh ref={lower} args={[geo.lower, mats.lower, sites.length]} frustumCulled={false} />
      <instancedMesh ref={upper} args={[geo.upper, mats.upper, sites.length]} frustumCulled={false} />
      <instancedMesh ref={rocks} args={[geo.rock, mats.rock, stones.length]} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- the lighthouse
function Tower({ sceneRef, glowTexture }) {
  const lamp = useRef(null);
  const halo = useRef(null);
  const beams = useRef(null);
  const mats = useMemo(
    () => ({
      stone: shaded('#8f8aa8', '#ffd9c2'),
      wall: shaded('#f4efe6', '#ffe2c2'),
      band: shaded('#e0566a', '#ffc2cc'),
      deck: shaded('#232a5c', '#8ea2ff'),
      lamp: new THREE.MeshBasicMaterial({ color: '#8a8fb5', toneMapped: false }),
      halo: new THREE.SpriteMaterial({ map: glowTexture, color: '#ffe9a8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      beam: new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    }),
    [glowTexture]
  );
  const beamGeo = useMemo(() => {
    // a flat wedge of light pointing along +x from the lamp
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.12, 0, 0, -0.12, 0, 26, 2.4, 0, 0, -0.12, 0, 26, -2.4, 0, 26, 2.4, 0], 3));
    return g;
  }, []);
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) m.dispose();
      beamGeo.dispose();
    },
    [mats, beamGeo]
  );
  const off = useMemo(() => new THREE.Color('#8a8fb5'), []);
  const on = useMemo(() => new THREE.Color('#fff3c4'), []);
  useFrame(() => {
    const s = sceneRef.current;
    const now = performance.now();
    const list = s.beacons || [];
    const share = list.length ? list.filter((b) => b === 'lit').length / list.length : 0;
    const done = s.allLit ? 1 : 0;
    const k = 0.2 + 0.8 * share;
    lamp.current.material.color.copy(off).lerp(on, share);
    halo.current.material.opacity = 0.75 * share + 0.25 * done * (0.6 + 0.4 * Math.sin(now * 0.006));
    halo.current.scale.setScalar(2.2 + 3.4 * share + 2 * done);
    beams.current.rotation.y = now * (0.0005 + 0.0006 * done);
    beams.current.children[0].material.opacity = share > 0 ? 0.1 * k + 0.2 * done : 0;
  });
  return (
    <group>
      <mesh position={[0, 0.25, 0]} material={mats.stone}>
        <cylinderGeometry args={[1.9, 2.15, 0.6, 12]} />
      </mesh>
      <mesh position={[0, 3.1, 0]} material={mats.wall}>
        <cylinderGeometry args={[0.92, 1.3, 5.2, 16]} />
      </mesh>
      {[1.7, 3.6].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.band}>
          <cylinderGeometry args={[1.24 - (y - 0.5) * 0.073 + 0.02, 1.24 - (y - 1.3) * 0.073 + 0.02, 0.8, 16]} />
        </mesh>
      ))}
      <mesh position={[0, 5.78, 0]} material={mats.deck}>
        <cylinderGeometry args={[1.32, 1.18, 0.2, 16]} />
      </mesh>
      <mesh ref={lamp} position={[0, 6.32, 0]} material={mats.lamp}>
        <cylinderGeometry args={[0.6, 0.6, 0.9, 12]} />
      </mesh>
      <mesh position={[0, 7.18, 0]} material={mats.band}>
        <coneGeometry args={[0.86, 0.9, 12]} />
      </mesh>
      <sprite ref={halo} material={mats.halo} position={[0, 6.35, 0]} />
      <group ref={beams} position={[0, 6.35, 0]}>
        <mesh geometry={beamGeo} material={mats.beam} frustumCulled={false} />
        <mesh geometry={beamGeo} material={mats.beam} rotation={[0, Math.PI, 0]} frustumCulled={false} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------- beacons
const CRYSTAL_VERT = /* glsl */ `
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
const CRYSTAL_FRAG = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec4 vTone;
  void main() {
    vec3 n = normalize(vN);
    float l = max(dot(n, normalize(vec3(-0.3, 0.8, 0.5))), 0.0);
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 1.8);
    vec3 col = vTone.rgb * (0.35 + 0.6 * l) + vec3(1.0) * fres * 0.55 + vTone.rgb * vTone.a;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Beacons({ sceneRef, glowTexture, pillarTexture }) {
  const N = BEACONS.length;
  const bases = useRef(null);
  const crystals = useRef(null);
  const rings = useRef(null);
  const pillars = useRef(null);
  const glows = useRef(null);
  const geo = useMemo(() => {
    const crystal = new THREE.OctahedronGeometry(0.44, 0);
    crystal.scale(1, 1.45, 1);
    crystal.setAttribute('aTone', new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4).setUsage(THREE.DynamicDrawUsage));
    const ring = new THREE.RingGeometry(0.95, 1.12, 40);
    ring.rotateX(-Math.PI / 2);
    const pillar = new THREE.PlaneGeometry(1.5, 11);
    pillar.translate(0, 5.5, 0);
    return { base: new THREE.CylinderGeometry(0.5, 0.68, 0.5, 8), crystal, ring, pillar, glow: new THREE.PlaneGeometry(2.6, 2.6) };
  }, [N]);
  const mats = useMemo(
    () => ({
      base: shaded('#6f6a94', '#ffd9c2'),
      crystal: new THREE.ShaderMaterial({ vertexShader: CRYSTAL_VERT, fragmentShader: CRYSTAL_FRAG }),
      ring: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      pillar: new THREE.MeshBasicMaterial({ map: pillarTexture, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      glow: new THREE.MeshBasicMaterial({ map: glowTexture, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    }),
    [glowTexture, pillarTexture]
  );
  useEffect(
    () => () => {
      for (const g of Object.values(geo)) g.dispose();
      for (const m of Object.values(mats)) m.dispose();
    },
    [geo, mats]
  );
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), k: new THREE.Color() }), []);

  useFrame((state) => {
    const cm = crystals.current;
    if (!cm) return;
    const s = sceneRef.current;
    const now = performance.now();
    const list = s.beacons || [];
    const tones = cm.geometry.attributes.aTone.array;
    const count = Math.min(N, list.length);
    for (let i = 0; i < count; i++) {
      const site = BEACONS[i];
      const y = landHeight(site.x, site.z);
      const st = list[i];
      const fb = s.feedback && s.feedback.index === i ? s.feedback : null;
      const since = fb ? now - fb.at : Infinity;
      const active = st === 'idle' && (s.open === i || s.near === i);
      tmp.c.copy(st === 'lit' ? TONE.lit : st === 'broken' ? TONE.broken : active ? TONE.near : TONE.idle);
      let flash = st === 'lit' ? 0.35 + 0.15 * Math.sin(now * 0.004 + i) : active ? 0.2 + 0.15 * Math.sin(now * 0.012) : 0.05;
      let pop = 1;
      if (fb && since < 600 && fb.ok !== null) {
        tmp.c.lerp(fb.ok ? TONE.ok : TONE.bad, 1 - since / 600);
        flash += 0.8 * (1 - since / 600);
        pop = 1 + 0.5 * (1 - since / 600);
      }
      const hover = st === 'broken' ? 0.72 : 1.3 + Math.sin(now * 0.002 + i * 1.7) * 0.12;

      tmp.o.position.set(site.x, y + 0.25, site.z);
      tmp.o.rotation.set(0, i, 0);
      tmp.o.scale.setScalar(1);
      tmp.o.updateMatrix();
      bases.current.setMatrixAt(i, tmp.o.matrix);

      tmp.o.position.set(site.x, y + hover, site.z);
      tmp.o.rotation.set(st === 'broken' ? 1.1 : 0, st === 'broken' ? i : now * 0.0012 + i, 0);
      tmp.o.scale.setScalar((active ? 1.2 : 1) * pop);
      tmp.o.updateMatrix();
      cm.setMatrixAt(i, tmp.o.matrix);
      tones[i * 4] = tmp.c.r;
      tones[i * 4 + 1] = tmp.c.g;
      tones[i * 4 + 2] = tmp.c.b;
      tones[i * 4 + 3] = flash;

      // additive parts: a darker colour is a fainter light
      const ringK = st === 'broken' ? 0.12 : st === 'lit' ? 0.7 : active ? 0.9 + 0.1 * Math.sin(now * 0.012) : 0.38;
      tmp.o.position.set(site.x, y + 0.06, site.z);
      tmp.o.rotation.set(0, 0, 0);
      tmp.o.scale.setScalar(active ? 1.5 + 0.12 * Math.sin(now * 0.008) : st === 'lit' ? 1.15 : 1);
      tmp.o.updateMatrix();
      rings.current.setMatrixAt(i, tmp.o.matrix);
      rings.current.setColorAt(i, tmp.k.copy(tmp.c).multiplyScalar(ringK));

      const pillarK = st === 'broken' ? 0 : st === 'lit' ? 0.85 : active ? 0.6 : 0.28 + 0.06 * Math.sin(now * 0.003 + i);
      tmp.o.position.set(site.x, y + 0.3, site.z);
      tmp.o.scale.set(st === 'lit' ? 1.25 : 1, 1, 1);
      tmp.o.updateMatrix();
      pillars.current.setMatrixAt(i, tmp.o.matrix);
      pillars.current.setColorAt(i, tmp.k.copy(tmp.c).multiplyScalar(pillarK));

      tmp.o.position.set(site.x, y + hover, site.z);
      tmp.o.quaternion.copy(state.camera.quaternion);
      tmp.o.scale.setScalar((st === 'lit' ? 1.5 : active ? 1.3 : 1) * pop);
      tmp.o.updateMatrix();
      glows.current.setMatrixAt(i, tmp.o.matrix);
      glows.current.setColorAt(i, tmp.k.copy(tmp.c).multiplyScalar(st === 'broken' ? 0.08 : st === 'lit' ? 0.85 : 0.5));
    }
    for (const m of [bases, crystals, rings, pillars, glows]) {
      m.current.count = count;
      m.current.instanceMatrix.needsUpdate = true;
      if (m.current.instanceColor) m.current.instanceColor.needsUpdate = true;
    }
    cm.geometry.attributes.aTone.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={bases} args={[geo.base, mats.base, N]} frustumCulled={false} />
      <instancedMesh ref={crystals} args={[geo.crystal, mats.crystal, N]} frustumCulled={false} />
      <instancedMesh ref={rings} args={[geo.ring, mats.ring, N]} frustumCulled={false} />
      <instancedMesh ref={pillars} args={[geo.pillar, mats.pillar, N]} frustumCulled={false} />
      <instancedMesh ref={glows} args={[geo.glow, mats.glow, N]} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------------------------- hero
function Hero({ sceneRef }) {
  const group = useRef(null);
  const body = useRef(null);
  const legL = useRef(null);
  const legR = useRef(null);
  const armL = useRef(null);
  const armR = useRef(null);
  const marker = useRef(null);
  const motion = useRef({ yaw: 0, stride: 0, blend: 0 });
  const mats = useMemo(
    () => ({
      hoodie: shaded('#e0566a', '#ffd0c2'),
      skin: shaded('#d79a76', '#ffe2c2'),
      hair: shaded('#2a1a16', '#8a6a5a'),
      shorts: shaded('#232a5c', '#8ea2ff'),
      shoe: shaded('#f3f0ea', '#ffffff'),
      pack: shaded('#2f7fb8', '#bfe9ff'),
      shadow: new THREE.MeshBasicMaterial({ color: '#0b1020', transparent: true, opacity: 0.28, depthWrite: false }),
      marker: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false }),
    }),
    []
  );
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) m.dispose();
    },
    [mats]
  );
  useFrame((_, rawDt) => {
    const g = group.current;
    if (!g) return;
    const s = sceneRef.current;
    const h = s.hero || { x: 0, z: 0, angle: 0, moving: false };
    const dt = Math.min(0.05, rawDt);
    const mo = motion.current;
    // turn toward the direction of travel by the shortest way
    const want = -(h.angle || 0);
    let d = (want - mo.yaw) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    mo.yaw += d * (1 - Math.exp(-dt * 14));
    mo.blend += ((h.moving ? 1 : 0) - mo.blend) * (1 - Math.exp(-dt * 12));
    if (h.moving) mo.stride += dt * 11;
    const swing = Math.sin(mo.stride) * 0.85 * mo.blend;
    const bob = Math.abs(Math.sin(mo.stride)) * 0.06 * mo.blend + Math.sin(performance.now() * 0.003) * 0.012 * (1 - mo.blend);
    g.position.set(h.x, landHeight(h.x, h.z), h.z);
    g.rotation.y = mo.yaw;
    body.current.position.y = bob;
    body.current.rotation.x = -0.1 * mo.blend; // lean into the run
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    armL.current.rotation.x = -swing * 0.8;
    armR.current.rotation.x = swing * 0.8;

    const mk = marker.current;
    mk.visible = !!s.dest;
    if (s.dest) {
      mk.position.set(s.dest.x, landHeight(s.dest.x, s.dest.z) + 0.05, s.dest.z);
      mk.scale.setScalar(0.8 + 0.2 * Math.sin(performance.now() * 0.01));
    }
  });
  return (
    <>
      <group ref={group}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={mats.shadow}>
          <circleGeometry args={[0.38, 20]} />
        </mesh>
        <group ref={body}>
          {/* legs swing from the hip */}
          {[
            [legL, -0.11],
            [legR, 0.11],
          ].map(([ref, x]) => (
            <group key={x} ref={ref} position={[x, 0.56, 0]}>
              <mesh position={[0, -0.14, 0]} material={mats.shorts}>
                <cylinderGeometry args={[0.1, 0.09, 0.28, 8]} />
              </mesh>
              <mesh position={[0, -0.38, 0]} material={mats.skin}>
                <cylinderGeometry args={[0.075, 0.065, 0.24, 8]} />
              </mesh>
              <mesh position={[0, -0.53, -0.04]} material={mats.shoe}>
                <boxGeometry args={[0.13, 0.09, 0.24]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.84, 0]} material={mats.hoodie}>
            <cylinderGeometry args={[0.2, 0.23, 0.56, 10]} />
          </mesh>
          <mesh position={[0, 0.86, 0.2]} material={mats.pack}>
            <boxGeometry args={[0.28, 0.36, 0.14]} />
          </mesh>
          {/* arms swing from the shoulder */}
          {[
            [armL, -0.27],
            [armR, 0.27],
          ].map(([ref, x]) => (
            <group key={x} ref={ref} position={[x, 1.06, 0]}>
              <mesh position={[0, -0.2, 0]} material={mats.hoodie}>
                <cylinderGeometry args={[0.07, 0.06, 0.4, 8]} />
              </mesh>
              <mesh position={[0, -0.43, 0]} material={mats.skin}>
                <sphereGeometry args={[0.065, 8, 6]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 1.31, 0]} material={mats.skin}>
            <sphereGeometry args={[0.2, 16, 12]} />
          </mesh>
          <mesh position={[0, 1.36, 0.03]} material={mats.hair}>
            <sphereGeometry args={[0.215, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
        </group>
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} material={mats.marker} visible={false}>
        <ringGeometry args={[0.3, 0.42, 28]} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------------- camera
function Rig({ sceneRef }) {
  const cam = useRef({ x: ISLAND.spawn.x, z: ISLAND.spawn.z, zoom: 0, ready: false });
  useFrame((state, rawDt) => {
    const s = sceneRef.current;
    const h = s.hero || ISLAND.spawn;
    const dt = Math.min(0.05, rawDt);
    const c = cam.current;
    if (!c.ready) {
      c.x = h.x;
      c.z = h.z;
      c.ready = true;
    }
    const ease = 1 - Math.exp(-dt * 5);
    c.x += (h.x - c.x) * ease;
    c.z += (h.z - c.z) * ease;
    c.zoom += ((s.open >= 0 ? 1 : 0) - c.zoom) * (1 - Math.exp(-dt * 4)); // lean in while a beacon is open
    const camera = state.camera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    // A portrait stage gets a taller field of view, and looks further ahead of the hero, so the
    // question sheet at the bottom never covers them.
    const tall = clamp01((1.1 - aspect) / 0.6);
    const fov = Math.min(64, Math.max(44, (2 * Math.atan(Math.tan((20 * Math.PI) / 180) / Math.max(0.3, aspect)) * 180) / Math.PI));
    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    // A wide stage looks down from higher up, so the trees in front never hide the hero.
    const wide = clamp01((aspect - 0.8) / 0.8);
    const back = 12.4 - 1.2 * wide - 2.6 * c.zoom;
    const up = 10.2 + 4.2 * wide - 2.2 * c.zoom;
    camera.position.set(c.x * 0.9, up, c.z + back);
    camera.lookAt(c.x, 0.9, c.z - 1.6 + 2.6 * tall * (1 - c.zoom) + 1.4 * tall * c.zoom);
  });
  return null;
}

function Scene({ sceneRef, cfg }) {
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const pillarTexture = useMemo(() => makePillarTexture(), []);
  useEffect(
    () => () => {
      glowTexture.dispose();
      pillarTexture.dispose();
    },
    [glowTexture, pillarTexture]
  );
  return (
    <>
      <Rig sceneRef={sceneRef} />
      <Sky sceneRef={sceneRef} />
      {cfg.clouds && <Clouds glowTexture={glowTexture} />}
      <Sea cfg={cfg} />
      <Land sceneRef={sceneRef} cfg={cfg} />
      <Forest cfg={cfg} />
      <Tower sceneRef={sceneRef} glowTexture={glowTexture} />
      <Beacons sceneRef={sceneRef} glowTexture={glowTexture} pillarTexture={pillarTexture} />
      <Hero sceneRef={sceneRef} />
    </>
  );
}

function IslandScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: [ISLAND.spawn.x, 10.2, ISLAND.spawn.z + 12.4], fov: 42, near: 0.1, far: 700 }}
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
      style={{ visibility: visible ? 'visible' : 'hidden', touchAction: 'none' }}
      aria-hidden="true"
    >
      <color attach="background" args={[PAL.horizon]} />
      <Scene sceneRef={sceneRef} cfg={cfg} />
    </Canvas>
  );
}

export default memo(IslandScene3D);

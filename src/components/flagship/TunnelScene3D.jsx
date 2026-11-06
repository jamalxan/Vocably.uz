'use client';
// Modified work: the tunnel-of-typed-glyphs mechanic and ring layout are adapted from
// Boom123bam/cooltypinggame (Apache License 2.0, Copyright Boom123bam and contributors) and changed
// by Vocably (canvas-texture glyph atlas, GPU tiers, server-graded prompts). See THIRD_PARTY_NOTICES.md.
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ringHue } from '@/lib/flagship/tunnel';
import { dprFor } from '@/lib/flagship/gpu';

// So'z tunneli scene. Every typed character becomes a ring of that glyph around the tunnel axis;
// the camera flies forward as you type, so the word you are typing is always just ahead.
// Mechanic adapted from Boom123bam/cooltypinggame (Apache-2.0, modified — see THIRD_PARTY_NOTICES.md):
// glyph copies around the axis, a twist per ring, hue by depth, the camera trailing the newest ring
// and the FOV widening with speed. Re-implemented for budget phones: all glyphs are ONE instanced
// draw call over a canvas-texture atlas (no font files, no troika workers — the CSP allows neither).
//
// Contract: everything per-frame reads `sceneRef.current`, written by the WordTunnel controller:
//   { rings: [{ i, ch, w, born }], head, gates: [{ i, w }], words: { [w]: { s, at } }, pulse: { ok, at }, combo }
// The Canvas stays mounted for the whole round; it is paused with frameloop="never" (unmounting R3F
// from inside a frame callback crashes).

const SPACING = 0.9;
const RADIUS = 0.95;
const GLYPH = 0.46;
const TWIST = 0.075;
const LEAD = 7.2;
const TILT = 0.55;
const CELLS = 8;
const ATLAS_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789'-.?!";
const OK = new THREE.Color('#34d399');
const BAD = new THREE.Color('#fb7185');
const IDLE = new THREE.Color('#94a3b8');

const TIERS = {
  high: { rings: 48, glyphs: 8, wall: 32, antialias: true },
  low: { rings: 30, glyphs: 6, wall: 16, antialias: false },
};

function makeAtlas() {
  const size = 512;
  const cell = size / CELLS;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(cell * 0.78)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const index = new Map();
  Array.from(ATLAS_CHARS).forEach((ch, n) => {
    const cx = n % CELLS;
    const cy = Math.floor(n / CELLS);
    ctx.fillText(ch === "'" ? '’' : ch, cx * cell + cell / 2, cy * cell + cell / 2 + cell * 0.04);
    // CanvasTexture is flipped (flipY): canvas row 0 is the top of UV space.
    index.set(ch, [cx, CELLS - 1 - cy]);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return { texture, index };
}

function cellFor(index, ch) {
  const c = String(ch || '').toLowerCase();
  if (index.has(c)) return index.get(c);
  if (/['‘’ʻʼ`]/.test(c)) return index.get("'");
  return index.get('?');
}

const GLYPH_VERT = /* glsl */ `
  attribute vec2 aCell;
  attribute vec4 aTint;
  uniform float uCells;
  varying vec2 vUv;
  varying vec4 vTint;
  varying float vDepth;
  void main() {
    vUv = (uv + aCell) / uCells;
    vTint = aTint;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const GLYPH_FRAG = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying vec4 vTint;
  varying float vDepth;
  void main() {
    float a = texture2D(uAtlas, vUv).a;
    float nearFade = smoothstep(0.4, 2.4, vDepth);
    float farFade = 1.0 - smoothstep(13.0, 21.0, vDepth);
    float alpha = a * vTint.a * nearFade * farFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vTint.rgb, alpha);
    #include <colorspace_fragment>
  }
`;
const WALL_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vWz;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWz = world.z;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const WALL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uPulseCol;
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying vec2 vUv;
  varying float vWz;
  varying float vDepth;
  void main() {
    float around = abs(fract(vUv.x * 16.0) - 0.5);
    float along = abs(fract(vWz * 0.35) - 0.5);
    float lineA = smoothstep(0.465, 0.5, around) * 0.55;
    float lineB = smoothstep(0.455, 0.5, along);
    float l = max(lineA, lineB);
    float fade = 1.0 - smoothstep(5.0, 32.0, vDepth);
    vec3 col = mix(uColA, uColB, 0.5 + 0.5 * sin(vWz * 0.09 + uTime * 0.25));
    col = mix(col, uPulseCol, uPulse);
    vec3 base = vec3(0.015, 0.02, 0.06) + uPulseCol * uPulse * 0.08;
    gl_FragColor = vec4(base * fade + col * l * fade, 1.0);
    #include <colorspace_fragment>
  }
`;

function Glyphs({ sceneRef, cfg }) {
  const mesh = useRef(null);
  const count = cfg.rings * cfg.glyphs;
  const atlas = useMemo(() => makeAtlas(), []);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(GLYPH, GLYPH);
    const cells = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2);
    const tints = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    cells.setUsage(THREE.DynamicDrawUsage);
    tints.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aCell', cells);
    g.setAttribute('aTint', tints);
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uAtlas: { value: atlas.texture }, uCells: { value: CELLS } },
        vertexShader: GLYPH_VERT,
        fragmentShader: GLYPH_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [atlas]
  );
  // One effect per resource: a tier change rebuilds only the geometry (instance count), and must not
  // dispose the material and atlas that the new mesh keeps using.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      material.dispose();
      atlas.texture.dispose();
    },
    [material, atlas]
  );

  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), h: new THREE.Color() }), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = sceneRef.current;
    const now = performance.now();
    const rings = s.rings || [];
    const from = Math.max(0, rings.length - cfg.rings);
    // Buffers are reached through the mesh ref (what is on screen this frame), not the memo closure.
    const attrs = m.geometry.attributes;
    const cells = attrs.aCell.array;
    const tints = attrs.aTint.array;
    const spin = now * 0.00012;
    let n = 0;
    for (let r = from; r < rings.length; r++) {
      const ring = rings[r];
      const word = s.words?.[ring.w] || { s: 'typing', at: 0 };
      const age = now - ring.born;
      const since = now - (word.at || 0);
      let alpha = Math.min(1, age / 120);
      let scale = 1 + 0.65 * Math.pow(1 - Math.min(1, age / 240), 3);
      tmp.h.setHSL(ringHue(ring.i), 0.85, word.s === 'typing' ? 0.66 : 0.6);
      if (word.s === 'ok') {
        tmp.c.copy(tmp.h).lerp(OK, 0.75);
        if (since < 320) tmp.c.lerp(new THREE.Color(1, 1, 1), 0.5 * (1 - since / 320));
      } else if (word.s === 'bad') {
        const k = Math.min(1, since / 450);
        tmp.c.copy(BAD);
        alpha *= 1 - k;
        scale *= 1 - 0.5 * k;
      } else if (word.s === 'none') {
        tmp.c.copy(IDLE);
        alpha *= 0.5;
      } else {
        tmp.c.copy(tmp.h);
        if (word.s === 'pending') alpha *= 0.75 + 0.25 * Math.sin(now * 0.02);
      }
      if (alpha <= 0.01 || ring.ch === ' ') continue; // a space keeps its slot as a gap
      const z = -ring.i * SPACING;
      for (let k = 0; k < cfg.glyphs; k++) {
        const theta = (k * Math.PI * 2) / cfg.glyphs + ring.i * TWIST + spin;
        tmp.o.position.set(Math.cos(theta) * RADIUS, Math.sin(theta) * RADIUS, z);
        tmp.o.rotation.set(-TILT, 0, theta + Math.PI / 2, 'ZXY');
        tmp.o.scale.setScalar(scale);
        tmp.o.updateMatrix();
        m.setMatrixAt(n, tmp.o.matrix);
        const cell = cellFor(atlas.index, ring.ch);
        cells[n * 2] = cell[0];
        cells[n * 2 + 1] = cell[1];
        tints[n * 4] = tmp.c.r;
        tints[n * 4 + 1] = tmp.c.g;
        tints[n * 4 + 2] = tmp.c.b;
        tints[n * 4 + 3] = alpha;
        n++;
      }
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    attrs.aCell.needsUpdate = true;
    attrs.aTint.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

const GATE_TONES = { pending: new THREE.Color('#e2e8f0'), ok: OK, bad: BAD, none: IDLE, typing: new THREE.Color('#e2e8f0') };

function Gates({ sceneRef }) {
  const mesh = useRef(null);
  const max = 8;
  const geometry = useMemo(() => new THREE.TorusGeometry(1.08, 0.022, 6, 48), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.85 }), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );
  const tmp = useMemo(() => ({ o: new THREE.Object3D() }), []);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = sceneRef.current;
    const gates = s.gates || [];
    const from = Math.max(0, gates.length - max);
    let n = 0;
    const now = performance.now();
    for (let i = from; i < gates.length; i++) {
      const gate = gates[i];
      const word = s.words?.[gate.w];
      const since = now - (word?.at || 0);
      const pop = word && (word.s === 'ok' || word.s === 'bad') && since < 300 ? 1 + 0.25 * (1 - since / 300) : 1;
      tmp.o.position.set(0, 0, -gate.i * SPACING);
      tmp.o.rotation.set(0, 0, gate.i * TWIST);
      tmp.o.scale.setScalar(pop);
      tmp.o.updateMatrix();
      m.setMatrixAt(n, tmp.o.matrix);
      m.setColorAt(n, GATE_TONES[word?.s] || GATE_TONES.pending);
      n++;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, max]} frustumCulled={false} />;
}

function Wall({ sceneRef, cfg }) {
  const mesh = useRef(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uPulseCol: { value: new THREE.Color('#34d399') },
          uColA: { value: new THREE.Color('#5b3bd6') },
          uColB: { value: new THREE.Color('#e0566a') },
        },
        vertexShader: WALL_VERT,
        fragmentShader: WALL_FRAG,
        side: THREE.BackSide,
      }),
    []
  );
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.6, 1.6, 44, cfg.wall, 1, true);
    g.rotateX(Math.PI / 2);
    return g;
  }, [cfg.wall]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    const s = sceneRef.current;
    mesh.current.position.z = camera.position.z - 20;
    // We own this material (no `uniforms` prop for R3F to copy), so writing its uniforms reaches the GPU.
    // Time comes from performance.now(): R3F resets clock.elapsedTime on every frameloop change.
    const u = mesh.current.material.uniforms;
    u.uTime.value = (performance.now() / 1000) % 1000;
    const since = performance.now() - (s.pulse?.at || -1e9);
    u.uPulse.value = Math.max(0, 1 - since / 380) * 0.55;
    u.uPulseCol.value.copy(s.pulse?.ok ? OK : BAD);
    const hot = Math.min(1, (s.combo || 0) / 10);
    u.uColA.value.setRGB(0.36 + 0.3 * hot, 0.23, 0.84 - 0.3 * hot);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />;
}

function Rig({ sceneRef }) {
  const motion = useRef({ z: LEAD, speed: 0 });
  useFrame((state, dt) => {
    const camera = state.camera;
    const s = sceneRef.current;
    const head = s.head || 0;
    const target = -Math.max(0, head - 1) * SPACING + LEAD;
    const mo = motion.current;
    const prev = mo.z;
    mo.z += (target - mo.z) * (1 - Math.exp(-Math.min(0.1, dt) * 5.5));
    const v = dt > 0 ? (prev - mo.z) / dt : 0;
    mo.speed += (v - mo.speed) * Math.min(1, dt * 4);
    const since = performance.now() - (s.pulse?.at || -1e9);
    const shake = s.pulse && s.pulse.ok === false && since < 220 ? (1 - since / 220) * 0.05 : 0;
    camera.position.set(Math.sin(since * 0.09) * shake, Math.cos(since * 0.11) * shake, mo.z);
    camera.rotation.set(0, 0, Math.sin((performance.now() / 1000) * 0.35) * 0.05);
    const fov = Math.min(86, 58 + Math.max(0, mo.speed) * 5.5);
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

function TunnelScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: [0, 0, LEAD], fov: 58, near: 0.1, far: 60 }}
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
      <color attach="background" args={['#070a18']} />
      <Rig sceneRef={sceneRef} />
      <Wall sceneRef={sceneRef} cfg={cfg} />
      <Gates sceneRef={sceneRef} />
      <Glyphs sceneRef={sceneRef} cfg={cfg} />
    </Canvas>
  );
}

export default memo(TunnelScene3D);

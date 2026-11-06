'use client';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { DEFENSE } from '@/lib/flagship/defense';
import { dprFor } from '@/lib/flagship/gpu';

// Word Defense scene: a neon lane, a turret at the base and glowing word-carriers coming down it.
// Original design (the "educational tower defence" idea is credited to pshenok/server-survival, MIT,
// in THIRD_PARTY_NOTICES.md — no code or assets from it). Built for budget phones: flat (unlit)
// materials, orbs and their glow as two instanced draw calls, a pooled shard burst, no font files
// (the 1–4 labels are canvas textures; the prompts themselves are DOM text in the controller).
//
// Contract: everything per-frame reads `sceneRef.current`, written by the WordDefense controller:
//   { enemies: [{ id, slot, x, progress, state, at, born }], targetId,
//     shot: { id, at } | null, hit: { at } | null, pulse: { ok, at } | null, contextLost }
//   state: 'walk' | 'pending' | 'revealed' | 'dead' | 'lost' | 'breach'
// The Canvas stays mounted for the whole round and is paused with frameloop="never".

const LANE = DEFENSE.laneLength;
const MAX = 8;
const ORB_Y = 0.95;
const CAM_POS = [0, 3.6, 7.2];
const CAM_LOOK = [0, 0.3, -17];
const MUZZLE = [0, 0.78, -0.2];
const TIERS = {
  high: { shards: 64, perKill: 14, antialias: true },
  low: { shards: 24, perKill: 6, antialias: false },
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

function enemyPos(e, out) {
  return out.set(e.x, ORB_Y, -LANE * (1 - Math.min(1, Math.max(0, e.progress || 0))));
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
  uniform vec3 uHot;
  varying vec3 vWorld;
  float line(float v, float w) {
    float f = abs(fract(v) - 0.5);
    return smoothstep(0.5 - w, 0.5, f);
  }
  void main() {
    float lane = 1.0 - smoothstep(3.4, 4.0, abs(vWorld.x));
    float gx = line(vWorld.x / 1.75, 0.045) * lane;
    float gz = line((vWorld.z + uTime * 1.6) / 2.2, 0.04);
    float g = max(gx, gz * (0.3 + 0.7 * lane));
    float depth = clamp(-vWorld.z / ${LANE.toFixed(1)}, 0.0, 1.2);
    float fade = 1.0 - smoothstep(0.62, 1.08, depth);
    vec3 tint = mix(uCol, uHot, uHit);
    vec3 col = tint * g * fade * 0.85;
    float baseGlow = exp(-abs(vWorld.z + 0.6) * 1.8) * lane;
    col += tint * baseGlow * (0.45 + 1.6 * uHit);
    col += vec3(0.012, 0.016, 0.05) * fade;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Ground({ sceneRef }) {
  const mesh = useRef(null);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(10, LANE + 16, 1, 1);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -(LANE + 16) / 2 + 7);
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uHit: { value: 0 },
          uCol: { value: new THREE.Color('#7c5cff') },
          uHot: { value: new THREE.Color('#f43f5e') },
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

// ---------------------------------------------------------------------------------- turret
function Turret({ sceneRef }) {
  const head = useRef(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const h = head.current;
    if (!h) return;
    const s = sceneRef.current;
    const target = (s.enemies || []).find((e) => e.id === s.targetId && LIVE.has(e.state));
    let want = 0;
    if (target) {
      enemyPos(target, tmp);
      // The barrel points down -z; rotating by θ about y turns it toward (−sin θ, −cos θ).
      want = Math.atan2(-(tmp.x - MUZZLE[0]), -(tmp.z - MUZZLE[2]));
    }
    h.rotation.y += (want - h.rotation.y) * (1 - Math.exp(-Math.min(0.1, dt) * 10));
  });
  return (
    <group position={[0, 0, 0.2]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.75, 0.95, 0.44, 24]} />
        <meshBasicMaterial color="#1e1b4b" />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.035, 6, 40]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
      <group ref={head} position={[0, 0.66, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 20, 14]} />
          <meshBasicMaterial color="#312e81" />
        </mesh>
        <mesh position={[0, 0.06, -0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.92, 10]} />
          <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------------- enemies
function makeLabels() {
  return [1, 2, 3, 4].map((n) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const x = canvas.getContext('2d');
    x.fillStyle = 'rgba(7,10,24,0.88)';
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

function Enemies({ sceneRef }) {
  const core = useRef(null);
  const glow = useRef(null);
  const labels = useRef(null);
  const reticle = useRef(null);
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(0.5, 1), []);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(0.8, 18, 12), []);
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const labelMats = useMemo(() => makeLabels(), []);
  useEffect(() => () => coreGeo.dispose(), [coreGeo]);
  useEffect(() => () => glowGeo.dispose(), [glowGeo]);
  useEffect(() => () => coreMat.dispose(), [coreMat]);
  useEffect(() => () => glowMat.dispose(), [glowMat]);
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
    const s = sceneRef.current;
    const now = performance.now();
    const list = s.enemies || [];
    let n = 0;
    for (let i = 0; i < list.length && n < MAX; i++) {
      const e = list[i];
      const since = now - (e.at || 0);
      let scale = 1;
      if (e.state === 'dead') scale = since < 110 ? 1 + 0.6 * (since / 110) : Math.max(0, 1.6 * (1 - (since - 110) / 300));
      else if (e.state === 'breach') scale = Math.max(0, 1 - since / 320);
      else if (e.state === 'lost') scale = Math.max(0, 1 - since / 520);
      else if (e.state === 'pending') scale = 1 + 0.05 * Math.sin(now * 0.025);
      scale *= Math.min(1, (now - (e.born || 0)) / 260); // pop in at the spawn line
      scale = Math.max(0.0001, scale);
      enemyPos(e, tmp.p);
      tmp.p.setY(tmp.p.y + Math.sin(now * 0.003 + e.id) * 0.08);

      tmp.o.position.copy(tmp.p);
      tmp.o.rotation.set(now * 0.0009 + e.id, now * 0.0013, 0);
      tmp.o.scale.setScalar(scale);
      tmp.o.updateMatrix();
      cm.setMatrixAt(n, tmp.o.matrix);
      tmp.c.copy(TONE[e.state] || TONE.walk);
      if (e.state === 'revealed') tmp.c.lerp(TONE.walk, 0.5 + 0.5 * Math.sin(now * 0.012));
      cm.setColorAt(n, tmp.c);

      tmp.o.rotation.set(0, 0, 0);
      tmp.o.scale.setScalar(scale * (e.state === 'pending' ? 1.3 : 1));
      tmp.o.updateMatrix();
      gm.setMatrixAt(n, tmp.o.matrix);
      gm.setColorAt(n, e.state === 'pending' ? TONE.pending : tmp.c);

      const sp = lab.children[n];
      if (sp) {
        sp.visible = LIVE.has(e.state);
        sp.material = labelMats[e.slot] || labelMats[0];
        // Far labels are drawn larger so the number stays readable down the lane.
        sp.scale.setScalar(0.62 * (1 + 1.5 * (1 - Math.min(1, e.progress || 0))) * Math.min(1, scale));
        sp.position.set(tmp.p.x, tmp.p.y + 1.0 + 0.6 * (1 - Math.min(1, e.progress || 0)), tmp.p.z);
      }
      n++;
    }
    for (let k = n; k < MAX; k++) if (lab.children[k]) lab.children[k].visible = false;
    cm.count = n;
    gm.count = n;
    cm.instanceMatrix.needsUpdate = true;
    gm.instanceMatrix.needsUpdate = true;
    if (cm.instanceColor) cm.instanceColor.needsUpdate = true;
    if (gm.instanceColor) gm.instanceColor.needsUpdate = true;

    const target = list.find((e) => e.id === s.targetId && (e.state === 'walk' || e.state === 'revealed'));
    ret.visible = !!target;
    if (target) {
      enemyPos(target, tmp.p);
      tmp.p.setY(tmp.p.y + Math.sin(now * 0.003 + target.id) * 0.08);
      ret.position.copy(tmp.p);
      ret.quaternion.copy(state.camera.quaternion);
      ret.rotateZ(now * 0.0022);
      ret.scale.setScalar(1.05 + 0.07 * Math.sin(now * 0.009) + 0.8 * (1 - Math.min(1, target.progress || 0)) * 0.4);
    }
  });

  return (
    <>
      <instancedMesh ref={core} args={[coreGeo, coreMat, MAX]} frustumCulled={false} />
      <instancedMesh ref={glow} args={[glowGeo, glowMat, MAX]} frustumCulled={false} />
      <group ref={labels}>
        {Array.from({ length: MAX }, (_, i) => (
          <sprite key={i} visible={false} material={labelMats[0]} />
        ))}
      </group>
      <mesh ref={reticle} visible={false}>
        <torusGeometry args={[0.98, 0.045, 6, 44, Math.PI * 1.6]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} transparent opacity={0.95} depthWrite={false} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------------------------- shots
function Beam({ sceneRef }) {
  const mesh = useRef(null);
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1, true);
    g.rotateX(Math.PI / 2); // axis along z
    g.translate(0, 0, 0.5); // from the origin to +1 along z, so lookAt + scale.z = distance
    return g;
  }, []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f0abfc', toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(...MUZZLE), b: new THREE.Vector3() }), []);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = sceneRef.current;
    const now = performance.now();
    const since = s.shot ? now - s.shot.at : Infinity;
    const e = since < 220 ? (s.enemies || []).find((x) => x.id === s.shot.id) : null;
    m.visible = !!e;
    if (!e) return;
    enemyPos(e, tmp.b);
    m.position.copy(tmp.a);
    m.lookAt(tmp.b);
    const k = 1 - since / 220;
    m.scale.set(0.6 + 1.4 * k, 0.6 + 1.4 * k, tmp.a.distanceTo(tmp.b));
    m.material.opacity = k;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} visible={false} frustumCulled={false} />;
}

function Shards({ sceneRef, cfg }) {
  const mesh = useRef(null);
  const pool = useRef({ items: [], seen: new Set() });
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.13), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#6ee7b7', toneMapped: false }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3() }), []);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const s = sceneRef.current;
    const now = performance.now();
    const P = pool.current;
    for (const e of s.enemies || []) {
      if (e.state !== 'dead' || P.seen.has(e.id)) continue;
      P.seen.add(e.id);
      if (P.seen.size > 64) P.seen.delete(P.seen.values().next().value);
      enemyPos(e, tmp.p);
      for (let k = 0; k < cfg.perKill; k++) {
        const a = Math.random() * Math.PI * 2;
        const up = 1.5 + Math.random() * 3;
        const out = 1.5 + Math.random() * 2.5;
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
      if (age > 760) {
        P.items.splice(i, 1);
        continue;
      }
      it.v.y -= 9 * step;
      it.p.addScaledVector(it.v, step);
      tmp.o.position.copy(it.p);
      tmp.o.rotation.set(it.r + age * 0.01, it.r * 2 + age * 0.012, 0);
      tmp.o.scale.setScalar(Math.max(0.0001, 1 - age / 760));
      tmp.o.updateMatrix();
      m.setMatrixAt(n, tmp.o.matrix);
      n++;
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, cfg.shards]} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------------- camera
function Rig({ sceneRef }) {
  const look = useMemo(() => new THREE.Vector3(...CAM_LOOK), []);
  useFrame((state) => {
    const now = performance.now();
    const since = now - (sceneRef.current.hit?.at || -1e9);
    const shake = since < 380 ? (1 - since / 380) * 0.16 : 0;
    state.camera.position.set(CAM_POS[0] + Math.sin(now * 0.06) * shake, CAM_POS[1] + Math.cos(now * 0.071) * shake, CAM_POS[2]);
    state.camera.lookAt(look);
  });
  return null;
}

function DefenseScene3D({ sceneRef, running, visible = true, tier = 'high' }) {
  const cfg = TIERS[tier] || TIERS.high;
  const dpr = useMemo(() => dprFor(tier, typeof window !== 'undefined' ? window.devicePixelRatio : 1), [tier]);
  return (
    <Canvas
      frameloop={running && visible ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: CAM_POS, fov: 50, near: 0.1, far: 80 }}
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
      <fog attach="fog" args={['#070a18', 30, 72]} />
      <Rig sceneRef={sceneRef} />
      <Ground sceneRef={sceneRef} />
      <Turret sceneRef={sceneRef} />
      <Enemies sceneRef={sceneRef} />
      <Beam sceneRef={sceneRef} />
      <Shards sceneRef={sceneRef} cfg={cfg} />
    </Canvas>
  );
}

export default memo(DefenseScene3D);

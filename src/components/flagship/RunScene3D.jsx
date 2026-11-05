'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

// Vocably Run scene. Everything per-frame reads `sceneRef.current`
// ({ lane, progress, options, feedback, speed, running }) written by the game controller,
// so React never re-renders at 60 fps. The canvas stays mounted between rounds and is
// paused with frameloop="demand" (unmounting R3F from inside a frame callback crashes).

const LANE_X = [-2, 0, 2];
const GATE_FAR = -34;
const ROAD_LEN = 80;
const STRIPES = 14;
const SIDE = 12;

function Road({ sceneRef }) {
  const stripes = useRef([]);
  const posts = useRef([]);
  useFrame((_, dt) => {
    const s = sceneRef.current;
    const v = s.running ? 16 * s.speed * dt : 0;
    for (const m of stripes.current) {
      if (!m) continue;
      m.position.z += v;
      if (m.position.z > 6) m.position.z -= ROAD_LEN;
    }
    for (const m of posts.current) {
      if (!m) continue;
      m.position.z += v;
      if (m.position.z > 6) m.position.z -= ROAD_LEN;
    }
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -ROAD_LEN / 2 + 6]} receiveShadow>
        <planeGeometry args={[6.4, ROAD_LEN]} />
        <meshStandardMaterial color="#1c2033" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -ROAD_LEN / 2 + 6]}>
        <planeGeometry args={[60, ROAD_LEN]} />
        <meshStandardMaterial color="#0d1222" />
      </mesh>
      {Array.from({ length: STRIPES }, (_, i) =>
        [-1, 1].map((side) => (
          <mesh
            key={`${i}${side}`}
            ref={(m) => (stripes.current[i * 2 + (side > 0 ? 1 : 0)] = m)}
            rotation-x={-Math.PI / 2}
            position={[side, 0.01, 6 - (i * ROAD_LEN) / STRIPES]}
          >
            <planeGeometry args={[0.08, 2.2]} />
            <meshBasicMaterial color="#e0566a" />
          </mesh>
        ))
      )}
      {Array.from({ length: SIDE }, (_, i) =>
        [-1, 1].map((side) => (
          <mesh
            key={`p${i}${side}`}
            ref={(m) => (posts.current[i * 2 + (side > 0 ? 1 : 0)] = m)}
            position={[side * (4.4 + (i % 3) * 0.7), 0.9 + (i % 2) * 0.5, 6 - (i * ROAD_LEN) / SIDE]}
          >
            <boxGeometry args={[0.5, 1.8 + (i % 2), 0.5]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#5a2a3a' : '#232a4d'} />
          </mesh>
        ))
      )}
    </group>
  );
}

function Runner({ sceneRef }) {
  const g = useRef();
  const legs = useRef([]);
  useFrame((state, dt) => {
    const s = sceneRef.current;
    if (!g.current) return;
    const tx = LANE_X[s.lane] ?? 0;
    g.current.position.x += (tx - g.current.position.x) * Math.min(1, dt * 14);
    const t = state.clock.elapsedTime * (s.running ? 12 * s.speed : 0);
    g.current.position.y = s.running ? Math.abs(Math.sin(t)) * 0.12 : 0;
    g.current.rotation.z = (g.current.position.x - tx) * 0.12;
    legs.current.forEach((l, i) => l && (l.rotation.x = Math.sin(t + i * Math.PI) * 0.7));
  });
  return (
    <group ref={g} position={[0, 0, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.6, 6, 12]} />
        <meshStandardMaterial color="#e0566a" />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#f2d1b3" />
      </mesh>
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={x} ref={(m) => (legs.current[i] = m)} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.16, 0.6, 0.16]} />
          <meshStandardMaterial color="#2b3170" />
        </mesh>
      ))}
    </group>
  );
}

// A word sign: the word is drawn into a canvas texture, so it scales with the panel in 3D
// (HTML labels don't, and overlap at a distance). Redrawn only when the word or tint changes.
function makeSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, texture, key: '' };
}

const SIGN_TONES = {
  idle: ['#f6efe9', '#1b2033'],
  locked: ['#fbbf24', '#1b2033'],
  right: ['#22c55e', '#ffffff'],
  wrong: ['#ef4444', '#ffffff'],
  dim: ['#3a4060', '#c8cbe0'],
};

function drawSign(sign, text, tone) {
  const key = `${text}|${tone}`;
  if (sign.key === key) return;
  sign.key = key;
  const ctx = sign.canvas.getContext('2d');
  const [bg, fg] = SIGN_TONES[tone];
  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 240, 36);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = 92;
  do {
    ctx.font = `800 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    size -= 4;
  } while (size > 30 && ctx.measureText(text).width > 450);
  ctx.fillText(text, 256, 132);
  sign.texture.needsUpdate = true;
}

function Gate({ sceneRef }) {
  const g = useRef();
  const signs = useMemo(() => [makeSign(), makeSign(), makeSign()], []);
  useEffect(() => () => signs.forEach((s) => s.texture.dispose()), [signs]);
  useFrame(() => {
    const s = sceneRef.current;
    if (!g.current) return;
    const visible = s.running && s.options?.length === 3;
    g.current.visible = visible;
    if (!visible) return;
    g.current.position.z = GATE_FAR * (1 - Math.min(1.15, s.progress));
    const fb = s.feedback;
    for (let i = 0; i < 3; i++) {
      const tone = fb
        ? i === fb.correctLane ? 'right' : i === fb.chosen && fb.ok === false ? 'wrong' : 'dim'
        : s.locked && i === s.lane ? 'locked' : 'idle';
      drawSign(signs[i], s.options[i]?.text || '', tone);
    }
  });
  return (
    <group ref={g} visible={false}>
      {LANE_X.map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.75, 0]}>
            <planeGeometry args={[1.9, 0.95]} />
            <meshBasicMaterial map={signs[i].texture} transparent toneMapped={false} />
          </mesh>
          {[-0.85, 0.85].map((px) => (
            <mesh key={px} position={[px, 0.65, -0.02]}>
              <boxGeometry args={[0.06, 1.3, 0.06]} />
              <meshStandardMaterial color="#5a2a3a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function RunScene3D({ sceneRef, running }) {
  const dpr = useMemo(() => [1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)], []);
  return (
    <Canvas
      frameloop={running ? 'always' : 'demand'}
      dpr={dpr}
      camera={{ position: [0, 3.2, 6], fov: 55 }}
      onCreated={({ camera }) => camera.lookAt(0, 1.4, -10)}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#0b1020']} />
      <fog attach="fog" args={['#0b1020', 22, 46]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.2} />
      <Road sceneRef={sceneRef} />
      <Gate sceneRef={sceneRef} />
      <Runner sceneRef={sceneRef} />
    </Canvas>
  );
}

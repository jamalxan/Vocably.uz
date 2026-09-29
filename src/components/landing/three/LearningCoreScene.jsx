'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Html, Torus, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// The "Vocably Learning Core" — the signature hero object described in the
// redesign brief (§6): a central orb (vocabulary/SRS core) with the four
// skills orbiting it, an SRS ring, and a few floating vocabulary tokens.
// Every color comes from `colors` (see ../useBrandColors.js) — nothing here
// is a hardcoded brand hue, only geometry/lighting/material shaping.

const SKILL_NODES = [
  { label: 'Reading', angle: 45 },
  { label: 'Listening', angle: 135 },
  { label: 'Speaking', angle: 225 },
  { label: 'Writing', angle: 315 },
];

const VOCAB_WORDS = ['resilient', 'articulate', 'insightful', 'sustainable'];

function SkillNode({ angle, label, radius, colors, reducedMotion }) {
  const ref = useRef(null);
  const rad = (angle * Math.PI) / 180;
  const basePos = useMemo(
    () => new THREE.Vector3(Math.cos(rad) * radius, Math.sin(rad) * radius * 0.55, Math.sin(rad * 1.3) * 0.6),
    [rad, radius],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    ref.current.position.y = basePos.y + Math.sin(t * 0.6 + angle) * 0.08;
  });

  return (
    <group ref={ref} position={basePos}>
      <Octahedron args={[0.22, 0]}>
        <meshPhysicalMaterial
          color={colors.accentSoft}
          emissive={colors.accent}
          emissiveIntensity={0.5}
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.6}
        />
      </Octahedron>
      <Html center distanceFactor={8} occlude={false} style={{ pointerEvents: 'none' }}>
        <div
          className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-landing-body font-medium backdrop-blur-sm"
          style={{
            borderColor: `${colors.border}`,
            background: `${colors.surface}CC`,
            color: colors.ink,
            transform: 'translateY(22px)',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function VocabToken({ word, angle, radius, colors, reducedMotion, yOffset = 1.1 }) {
  const ref = useRef(null);
  const rad = (angle * Math.PI) / 180;
  const basePos = useMemo(
    () => new THREE.Vector3(Math.cos(rad) * radius, Math.sin(rad) * radius * 0.4 + yOffset, Math.sin(rad * 0.7) * 1.2),
    [rad, radius, yOffset],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    ref.current.position.y = basePos.y + Math.sin(t * 0.4 + angle * 0.5) * 0.12;
  });

  return (
    <group ref={ref} position={basePos}>
      <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: 'none' }}>
        <div
          className="whitespace-nowrap rounded-lg border px-2 py-1 text-[10px] font-landing-mono tracking-tight shadow-sm"
          style={{
            borderColor: `${colors.accent}33`,
            background: `${colors.surface2}E6`,
            color: colors.accent,
          }}
        >
          {word}
        </div>
      </Html>
    </group>
  );
}

export default function LearningCoreScene({ colors, reducedMotion, quality = 'full', pointerRef }) {
  const groupRef = useRef(null);
  const orbRef = useRef(null);
  const ringRef = useRef(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  const isLite = quality === 'lite';
  const nodes = isLite ? SKILL_NODES.slice(0, 4) : SKILL_NODES;
  // Mobile keeps just one vocab token, pulled in close to center — the HTML
  // label pill's own rendered width (it's DOM, not WebGL, so it doesn't get
  // clipped to the 3D frustum) otherwise pokes past a narrow mobile canvas.
  const words = isLite ? VOCAB_WORDS.slice(0, 1) : VOCAB_WORDS;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      // Calm constant drift — brief §7: "premium animation = calm + smooth +
      // intentional", explicitly NOT spinning/chaotic. Pointer only ever
      // nudges the target a small amount (targetRotation), never snaps.
      const pointer = pointerRef?.current;
      targetRotation.current.x = pointer ? -pointer.y * 0.15 : 0;
      targetRotation.current.y += delta * 0.06 + (pointer ? pointer.x * delta * 0.08 : 0);

      groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.08;
    }

    if (orbRef.current && !reducedMotion) {
      orbRef.current.rotation.y += delta * 0.08;
      orbRef.current.rotation.x += delta * 0.03;
    }
    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.55} color={colors.surface2} />
      <pointLight position={[3, 3, 4]} intensity={40} color={colors.accent} decay={2} />
      <pointLight position={[-3, -2, -3]} intensity={20} color={colors.primary} decay={2} />

      {/* Central Learning Core orb */}
      <Icosahedron ref={orbRef} args={[1.05, isLite ? 1 : 2]}>
        <meshPhysicalMaterial
          color={colors.accentSoft}
          emissive={colors.primary}
          emissiveIntensity={0.35}
          roughness={0.12}
          metalness={0.05}
          transmission={isLite ? 0 : 0.55}
          thickness={1.2}
          ior={1.4}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </Icosahedron>

      {/* SRS ring */}
      <Torus ref={ringRef} args={[1.55, 0.012, 16, isLite ? 32 : 96]} rotation={[Math.PI / 2.4, 0, 0]}>
        <meshBasicMaterial color={colors.accent} transparent opacity={0.45} />
      </Torus>
      <Torus args={[1.75, 0.006, 16, isLite ? 32 : 96]} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <meshBasicMaterial color={colors.primary} transparent opacity={0.25} />
      </Torus>

      {nodes.map((n) => (
        <SkillNode
          key={n.label}
          angle={n.angle}
          label={n.label}
          radius={isLite ? 1.55 : 2.1}
          colors={colors}
          reducedMotion={reducedMotion}
        />
      ))}

      {words.map((w, i) => (
        <VocabToken
          key={w}
          word={w}
          angle={isLite ? 0 : (360 / words.length) * i + 20}
          radius={isLite ? 1.1 : 2.9}
          yOffset={isLite ? 0.3 : 1.1}
          colors={colors}
          reducedMotion={reducedMotion}
        />
      ))}

      {!reducedMotion && (
        <Sparkles
          count={isLite ? 12 : 36}
          scale={4.2}
          size={2}
          speed={0.25}
          opacity={0.35}
          color={colors.accent}
        />
      )}
    </group>
  );
}

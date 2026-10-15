import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BRIDGE, DOCK, PORTALS, SHORE, VILLAGE } from './worldLayout';

/* =========================================================================
   STARTER ISLAND 3D
   O'lchamlar worldLayout.js dan olinadi (personaj harakati bilan bir xil):
   - Janubda qirg'oq (spawn), shimolda qishloq oroli, orasida lagun va ko'prik
   - Fonda qoya tog' va "V" emblemasi, sharqda mayoq, g'arbda pristan va kema
   - Har bir portal haqiqiy o'yinga olib boradi (GameClient boshqaradi)
   ========================================================================= */

const HOUSES = [
  { x: -6, z: -3, rot: 0.25, scale: 1.1 },
  { x: 5, z: -4, rot: -0.3, scale: 1.0 },
  { x: -1, z: -9, rot: 0, scale: 1.25 },
];

const TREES = [
  // Qirg'oq
  [-10, 8], [-9, 17], [9, 18], [10, 7], [-4, 22], [5, 22],
  // Qishloq
  [-9, -28], [9, -30], [-5, -12], [5, -12], [-12, -26],
];

const SHORE_ROCKS = [
  [-5, 2], [5, 3], [-4, 5], [4, 6], [-9, 4], [9, 4], [-3, -5], [3, -5],
];

function PortalShape({ shape, color }) {
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} />;
  switch (shape) {
    case 'torus':
      return <mesh castShadow><torusGeometry args={[1.2, 0.18, 12, 32]} />{mat}</mesh>;
    case 'sphere':
      return <mesh castShadow><sphereGeometry args={[0.9, 20, 20]} />{mat}</mesh>;
    case 'box':
      return <mesh castShadow><boxGeometry args={[1.6, 1.6, 1.6]} />{mat}</mesh>;
    case 'octahedron':
      return <mesh castShadow><octahedronGeometry args={[1.1, 0]} />{mat}</mesh>;
    case 'boss':
      return (
        <group>
          <mesh castShadow><octahedronGeometry args={[1.2, 0]} />{mat}</mesh>
          <mesh rotation={[0.5, 0.5, 0]}>
            <torusGeometry args={[1.8, 0.12, 8, 24]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.3} />
          </mesh>
        </group>
      );
    default:
      return <mesh castShadow><dodecahedronGeometry args={[1, 0]} />{mat}</mesh>;
  }
}

function Portal({ portal, active, onSelect }) {
  const floatRef = useRef();
  const ringRef = useRef();
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (floatRef.current) {
      floatRef.current.rotation.y += delta * (active ? 2.2 : 0.9);
      floatRef.current.position.y = 2.4 + Math.sin(t * 2 + portal.x) * 0.2;
    }
    if (ringRef.current) {
      const s = active ? 1.15 + Math.sin(t * 6) * 0.05 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group
      position={[portal.x, SHORE.groundY, portal.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(portal.key);
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
    >
      {/* Poydevor */}
      <mesh receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.3, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {/* Yer ustidagi nurli halqa (yaqin kelganda kattalashadi) */}
      <mesh ref={ringRef} position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.9, 32]} />
        <meshStandardMaterial color={portal.color} emissive={portal.color} emissiveIntensity={active ? 1.4 : 0.6} transparent opacity={0.85} />
      </mesh>
      <group ref={floatRef} position={[0, 2.4, 0]}>
        <PortalShape shape={portal.shape} color={portal.color} />
      </group>
    </group>
  );
}

export function StarterIsland3D({ activePortalKey, onPortalSelect }) {
  const waterRef = useRef();
  const waterfallRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (waterRef.current) waterRef.current.position.y = -0.15 + Math.sin(t * 1.8) * 0.04;
    if (waterfallRef.current) waterfallRef.current.position.y = -2 + Math.sin(t * 6) * 0.15;
  });

  return (
    <group>
      {/* 1. OKEAN */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -10]}>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.08} metalness={0.6} transparent opacity={0.88} />
      </mesh>

      {/* 2. QIRG'OQ (SPAWN) */}
      <group position={[SHORE.x, 0, SHORE.z]}>
        <mesh receiveShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[SHORE.radius, SHORE.radius + 3, 2.2, 40]} />
          <meshStandardMaterial color="#854d0e" roughness={0.9} />
        </mesh>
        <mesh receiveShadow position={[0, 0.85, 0]}>
          <cylinderGeometry args={[SHORE.radius - 0.2, SHORE.radius, 0.2, 40]} />
          <meshStandardMaterial color="#4ade80" roughness={0.8} />
        </mesh>
        {/* Spawndan ko'prikka tuproqli yo'lak */}
        <mesh receiveShadow position={[0, 0.96, -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 20]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        {SHORE_ROCKS.map(([x, z], i) => (
          <group key={i} position={[x, 1, z]}>
            <mesh castShadow position={[0, 0.1, 0]}>
              <dodecahedronGeometry args={[0.35 + (i % 3) * 0.1, 0]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            <mesh position={[0.4, 0.2, 0]}>
              <coneGeometry args={[0.2, 0.5, 5]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#fef08a' : '#fb7185'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. YOG'OCH KO'PRIK (lagun ustida) */}
      <group position={[0, 1.15, BRIDGE.centerZ]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[3.6, 0.25, BRIDGE.length]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((z) => (
          <mesh key={z} position={[0, 0.16, z]} receiveShadow>
            <boxGeometry args={[3.8, 0.08, 0.65]} />
            <meshStandardMaterial color={z % 2 === 0 ? '#854d0e' : '#92400e'} roughness={0.8} />
          </mesh>
        ))}
        {[-1.8, 1.8].map((x) => (
          <group key={x} position={[x, 0.7, 0]}>
            {[-5, -2.5, 0, 2.5, 5].map((z) => (
              <mesh key={z} position={[0, -0.15, z]} castShadow>
                <cylinderGeometry args={[0.12, 0.14, 1.1, 8]} />
                <meshStandardMaterial color="#451a03" />
              </mesh>
            ))}
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[0.14, 0.14, BRIDGE.length - 0.2]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
          </group>
        ))}
        {/* Suvga tushgan tayanch ustunlar */}
        {[-3.5, 0, 3.5].map((z) =>
          [-1.5, 1.5].map((x) => (
            <mesh key={`${x}:${z}`} position={[x, -0.9, z]}>
              <cylinderGeometry args={[0.18, 0.2, 1.6, 8]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
          ))
        )}
      </group>

      {/* 4. QISHLOQ OROLI */}
      <group position={[VILLAGE.x, -0.35, VILLAGE.z]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[VILLAGE.radius, VILLAGE.radius + 3, 2.6, 40]} />
          <meshStandardMaterial color="#854d0e" roughness={0.9} />
        </mesh>
        <mesh receiveShadow position={[0, 1.2, 0]}>
          <cylinderGeometry args={[VILLAGE.radius - 0.2, VILLAGE.radius, 0.2, 40]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
        {HOUSES.map((house, idx) => (
          <group key={idx} position={[house.x, 1.3 + 1.6 * house.scale, house.z]} rotation={[0, house.rot, 0]} scale={house.scale}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4.8, 3.2, 4.8]} />
              <meshStandardMaterial color="#854d0e" roughness={0.75} />
            </mesh>
            <mesh position={[0, 2.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[4.2, 2.0, 4]} />
              <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.6, 2.42]}>
              <planeGeometry args={[1.3, 2.0]} />
              <meshStandardMaterial color="#3b1d07" roughness={0.9} />
            </mesh>
            {[1.5, -1.5].map((wx) => (
              <mesh key={wx} position={[wx, 0.3, 2.42]}>
                <planeGeometry args={[1.0, 1.0]} />
                <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.8} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 5. FON: QOYA TOG' VA "V" EMBLEMASI (qishloqdan orqada) */}
      <group position={[0, 12, -72]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[16, 32, 26, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.95} />
        </mesh>
        <mesh position={[0, 13.2, 0]}>
          <cylinderGeometry args={[15, 17, 2, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        <group position={[12, 0, 22]} rotation={[0, -0.4, 0]}>
          <mesh ref={waterfallRef} position={[0, -2, 0]}>
            <planeGeometry args={[4.5, 18]} />
            <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.8} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, -11.9, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        </group>
        <group position={[0, 5, 23]}>
          <mesh>
            <coneGeometry args={[3.2, 4.5, 3]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1} />
          </mesh>
        </group>
      </group>

      {/* 6. MAYOQ (o'z qoyasida, sharqda) */}
      <group position={[26, 0, -14]}>
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[3.2, 4.2, 2, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.95} />
        </mesh>
        <group position={[0, 3.25, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[2.0, 2.8, 4.5, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <cylinderGeometry args={[1.5, 2.0, 4.0, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, 7.8, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.5, 3.5, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          <mesh position={[0, 10.2, 0]}>
            <cylinderGeometry args={[1.1, 1.1, 1.8, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 11.8, 0]}>
            <coneGeometry args={[1.4, 1.4, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <pointLight color="#fef08a" intensity={5} distance={40} position={[0, 10.2, 0]} />
        </group>
      </group>

      {/* 7. PRISTAN VA KEMA (g'arbda) */}
      <group position={[(DOCK.minX + DOCK.maxX) / 2, 0, (DOCK.minZ + DOCK.maxZ) / 2]}>
        <mesh position={[0, DOCK.deckY - 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[DOCK.maxX - DOCK.minX, 0.2, DOCK.maxZ - DOCK.minZ + 0.4]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {[-4, 0, 4].map((x) =>
          [-1.8, 1.8].map((z) => (
            <mesh key={`${x}:${z}`} position={[x, -0.2, z]} castShadow>
              <cylinderGeometry args={[0.18, 0.2, 1.6, 8]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
          ))
        )}
      </group>
      <group position={[-28, 0.6, 5]} rotation={[0, 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.8, 2.4, 11]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        {[-3.2, 0, 3.2].map((z) => (
          <group key={z} position={[0, 2.2, z]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.12, 6, 8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[0, 2.6, 0.1]}>
              <boxGeometry args={[3.8, 3.2, 0.06]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 8. DARAXTLAR */}
      {TREES.map(([x, z], i) => (
        <group key={i} position={[x, SHORE.groundY, z]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.38, 3.2, 8]} />
            <meshStandardMaterial color="#5c2409" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.6, 0]} castShadow>
            <coneGeometry args={[2.0, 2.8, 7]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#22c55e'} roughness={0.7} />
          </mesh>
          <mesh position={[0, 4.9, 0]} castShadow>
            <coneGeometry args={[1.5, 2.2, 7]} />
            <meshStandardMaterial color="#4ade80" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 9. YO'L BELGISI VA CHIROQ (spawn yonida) */}
      <group position={[3, SHORE.groundY, 16]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 1.3, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[-0.4, 1.1, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.6, 0.45, 0.1]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      </group>
      <group position={[-3, SHORE.groundY, 16]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.2, 8]} />
          <meshStandardMaterial color="#5c2409" />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <boxGeometry args={[0.45, 0.55, 0.45]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* 10. PORTALLAR */}
      {PORTALS.map((p) => (
        <Portal key={p.key} portal={p} active={activePortalKey === p.key} onSelect={onPortalSelect} />
      ))}
    </group>
  );
}

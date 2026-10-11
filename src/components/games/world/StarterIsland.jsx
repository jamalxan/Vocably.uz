import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function StarterIsland() {
  return (
    <group>
      {/* Main Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a2b1a" />
      </mesh>

      {/* Decorative Rocks / Primitives as Placeholders */}
      <mesh position={[5, 1, -5]} castShadow>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[-8, 0.5, 2]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Portal / Interaction Point */}
      <group position={[0, 1, -10]}>
        <mesh castShadow>
          <torusGeometry args={[2, 0.1, 16, 100]} />
          <meshStandardMaterial color="#00f0b5" emissive="#00f0b5" emissiveIntensity={2} />
        </mesh>
        <pointLight color="#00f0b5" intensity={2} distance={10} />
      </group>

      {/* Boundary Lights */}
      <gridHelper args={[100, 20, 0x444444, 0x222222]} />
    </group>
  );
}

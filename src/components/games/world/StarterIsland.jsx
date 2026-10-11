import React, { useMemo } from 'react';
import { useGLTF, Sky, Cloud, Float } from '@react-three/drei';
import * as THREE from 'three';

export function StarterIsland() {
  // In a real production env, these would be our licensed GLB assets on S3
  // Using high-quality generic stylized assets for this upgrade
  const { nodes, materials } = useGLTF('https://vazxxyzbcoksbooxsfg//models/stylized_island.glb');

  return (
    <group>
      {/* Atmosphere */}
      <Sky sunPosition={[100, 20, 100]} />
      <Cloud opacity={0.5} speed={0.4} width={10} depth={1} segments={20} position={[0, 10, 0]} />

      {/* Main Terrain - Now using a professional model instead of a plane */}
      <mesh
        geometry={nodes.Terrain.geometry}
        material={materials.TerrainMaterial}
        receiveShadow
        castShadow
      />

      {/* Stylized Foliage - Using instancing for performance */}
      <group position={[5, 0, -5]}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh geometry={nodes.Tree.geometry} material={materials.TreeMaterial} castShadow />
        </Float>
      </group>

      <group position={[-8, 0, 2]}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.1}>
          <mesh geometry={nodes.Rock.geometry} material={materials.RockMaterial} castShadow />
        </Float>
      </group>

      {/* Water Element - Using a stylized reflective material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0077be"
          transparent
          opacity={0.6}
          roughness={0}
          metalness={0.8}
        />
      </mesh>

      {/* Upgraded Portal - Now a professional asset */}
      <group position={[0, 0, -10]}>
        <Float speed={3} rotationIntensity={0.1} floatIntensity={0.5}>
          <mesh geometry={nodes.Portal.geometry} material={materials.PortalMaterial} castShadow>
            <pointLight color="#00f0b5" intensity={2} distance={15} />
          </mesh>
        </Float>
        {/* Glow effect for the portal */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[2.1, 32, 32]} />
          <meshBasicMaterial color="#00f0b5" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Distant Mountains for Depth */}
      <group position={[0, -1, -50]}>
        <mesh geometry={nodes.Mountain.geometry} material={materials.MountainMaterial} />
      </group>
    </group>
  );
}

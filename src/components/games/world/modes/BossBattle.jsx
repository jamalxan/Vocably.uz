import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshWobbleMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function BossBattle({ words, onComplete }) {
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentRound, setCurrentRound] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeat, setIsDefeat] = useState(false);

  const bossRef = useRef();
  // Load professional Boss asset
  const { scene: bossModel, animations } = useGLTF('https://vazxxyzbcoksbooxsfg//models/boss_monster.glb');

  useFrame((state) => {
    if (bossRef.current && !isVictory) {
      // Smooth floating movement
      bossRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.8;
      bossRef.current.rotation.y += 0.005;
    }
  });

  const handleAttack = (isCorrect) => {
    if (isCorrect) {
      setBossHp(prev => {
        const next = prev - 20;
        if (next <= 0) {
          setIsVictory(true);
          onComplete(true);
        }
        return next;
      });
    } else {
      setPlayerHp(prev => {
        const next = prev - 25;
        if (next <= 0) {
          setIsDefeat(true);
          onComplete(false);
        }
        return next;
      });
    }

    if (!isVictory && !isDefeat) {
      setCurrentRound(prev => prev + 1);
    }
  };

  return (
    <group>
      {/* Professional Boss Model */}
      <group ref={bossRef} position={[0, 3, -15]} castShadow>
        <primitive object={bossModel} scale={1.5} />
        <pointLight color="#ff0055" intensity={2} distance={10} />
      </group>

      {/* Boss HP Bar - Styled as a Pro UI element */}
      <group position={[0, 8, -15]}>
        <Text fontSize={0.4} color="white" position={[-2.5, 0, 0]} fontWeight="bold">BOSS HEALTH</Text>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5, 0.3, 0.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[(bossHp / 100) * 2.5 - 2.5, 0, 0.01]}>
          <boxGeometry args={[(bossHp / 100) * 5, 0.3, 0.1]} />
          <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Combat HUD */}
      <group position={[0, 2, -5]}>
        <Float speed={2} rotationIntensity={0.1}>
          <Text
            fontSize={0.8}
            color="#00f0b5"
            anchorX="center"
            position={[0, 0, 0]}
            fontWeight="bold"
          >
            {isVictory ? 'VICTORY!' : isDefeat ? 'DEFEATED!' : `Tackling: ${words[currentRound]?.text}`}
          </Text>
        </Float>
      </group>
    </group>
  );
}

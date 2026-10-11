import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function BossBattle({ words, onComplete }) {
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentRound, setCurrentRound] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeat, setIsDefeat] = useState(false);

  const bossRef = useRef();

  useFrame((state) => {
    if (bossRef.current && !isVictory) {
      // Boss hovering movement
      bossRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime()) * 0.5;
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
      {/* The Boss - A stylized floating geometric entity */}
      <mesh ref={bossRef} position={[0, 3, -15]} castShadow>
        <torusKnotGeometry args={[2, 0.6, 128, 32]} />
        <MeshWobbleMaterial
          color="#ff0055"
          factor={0.4}
          speed={2}
          emissive="#ff0055"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Boss HP Bar */}
      <group position={[0, 8, -15]}>
        <Text fontSize={0.5} color="white" position={[-2, 0, 0]}>BOSS HP</Text>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.4, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[(bossHp / 100) * 2 - 2, 0, 0.01]}>
          <boxGeometry args={[(bossHp / 100) * 4, 0.4, 0.1]} />
          <meshStandardMaterial color="#ff0055" />
        </mesh>
      </group>

      {/* Combat HUD */}
      <group position={[0, 2, -5]}>
        <Text
          fontSize={1}
          color="#00f0b5"
          anchorX="center"
          position={[0, 0, 0]}
        >
          {isVictory ? 'VICTORY!' : isDefeat ? 'DEFEATED!' : `Tackling: ${words[currentRound]?.text}`}
        </Text>
      </group>
    </group>
  );
}

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export function WordRunner({ words, onComplete }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const speed = 0.1;
  const gateDistance = 20; // Distance between gates

  useFrame((state, delta) => {
    if (isGameOver) return;
    setPlayerPosition(prev => prev + speed);
  });

  const handleGateCollision = (choiceIndex) => {
    const currentWord = words[currentRound];
    const isCorrect = choiceIndex === 0; // Simplified: index 0 is always correct for now

    if (isCorrect) {
      if (currentRound < words.length - 1) {
        setCurrentRound(prev => prev + 1);
      } else {
        setIsGameOver(true);
        onComplete(true);
      }
    } else {
      setIsGameOver(true);
      onComplete(false);
    }
  };

  return (
    <group>
      {/* The Infinite Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Gates for the current round */}
      <group position={[0, 0, -gateDistance - playerPosition]}>
        <Text position={[0, 5, 0]} fontSize={1} color="white" anchorX="center">
          {words[currentRound]?.text || 'Loading...'}
        </Text>

        {/* Gate 1 (Correct) */}
        <group position={[-3, 2, 0]} onClick={() => handleBypass(0)}>
           <mesh>
             <boxGeometry args={[4, 6, 0.5]} />
             <meshStandardMaterial color="#00f0b5" transparent opacity={0.5} />
           </mesh>
           <Text position={[0, 0, 0.3]} fontSize={0.5} color="black">{words[currentRound]?.translations[0]}</Text>
        </group>

        {/* Gate 2 (Incorrect) */}
        <group position={[3, 2, 0]} onClick={() => handleBypass(1)}>
           <mesh>
             <boxGeometry args={[4, 6, 0.5]} />
             <meshStandardMaterial color="#ff4d4d" transparent opacity={0.5} />
           </mesh>
           <Text position={[0, 0, 0.3]} fontSize={0.5} color="black">Wrong Option</Text>
        </group>
      </group>

      {isGameOver && (
        <Text position={[0, 5, -5]} fontSize={2} color="white">
          {onComplete ? 'Victory!' : 'Game Over!'}
        </Text>
      )}
    </group>
  );

  function handleBypass(idx) {
    handleGateCollision(idx);
  }
}

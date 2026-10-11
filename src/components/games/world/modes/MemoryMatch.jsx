import React, { useState } from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export function MemoryMatch({ words, onComplete, onMatch }) {
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);

  // Create pairs: [word1, translation1, word2, translation2...]
  const cards = [];
  words.forEach((w, i) => {
    cards.push({ id: `w${i}`, content: w.text, type: 'word', pairId: i });
    cards.push({ id: `t${i}`, content: w.translations[0] || w.text, type: 'translation', pairId: i });
  });
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

  const handleFlip = (id, pairId, type) => {
    if (lockBoard || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      const [firstId, secondId] = newFlipped;

      const firstCard = shuffledCards.find(c => c.id === firstId);
      const secondCard = shuffledCards.find(c => c.id === secondId);

      if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        setMatched(prev => [...prev, firstId, secondId]);
        onMatch(true);
        setFlipped([]);
        setLockBoard(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  return (
    <group position={[0, 2, 0]}>
      {shuffledCards.map((card, index) => {
        const x = (index % 4) * 3 - 4.5;
        const z = Math.floor(index / 4) * 3 - 3;
        const isFlipped = flipped.includes(card.id) || matched.includes(card.id);

        return (
          <group key={card.id} position={[x, 0, z]}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
              <mesh
                onClick={() => handleFlip(card.id, card.pairId, card.type)}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[2, 2.5, 0.2]} />
                <meshStandardMaterial
                  color={isFlipped ? '#fff' : '#0a0b2e'}
                  emissive={isFlipped ? '#fff' : '#00f0b5'}
                  emissiveIntensity={isFlipped ? 0.2 : 0.5}
                  metalness={0.6}
                  roughness={0.2}
                />

                {isFlipped && (
                  <Text
                    position={[0, 0, 0.11]}
                    fontSize={0.3}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.8}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {card.content}
                  </Text>
                )}
              </mesh>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

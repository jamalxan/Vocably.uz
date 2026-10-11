import React, { useState } from 'react';
import { Text, Float } from '@react-three/drei';

export function WordLab({ words, onComplete }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const currentWord = words[currentRound];

  const handleSubmit = () => {
    const isCorrect = input.trim().toLowerCase() === currentWord.text.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setTimeout(() => {
        if (currentRound < words.length - 1) {
          setCurrentRound(prev => prev + 1);
          setInput('');
          setFeedback(null);
        } else {
          onComplete(true);
        }
      }, 1500);
    }
  };

  return (
    <group position={[0, 2, 0]}>
      <Float speed={1.5}>
        <Text position={[0, 3, 0]} fontSize={1} color="#00f0b5" anchorX="center">
          WORD LAB: SPELLING
        </Text>
      </Float>

      <Text position={[0, 1, 0]} fontSize={0.5} color="white" anchorX="center">
        Translation: {currentWord?.translations[0]}
      </Text>

      {/* The "Interactive Lab Table" */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* HTML Input Overlay is handled via HUD usually,
          but here we represent the answer visually in 3D */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.4}
        color={feedback === 'correct' ? '#00ff00' : feedback === 'wrong' ? '#ff0000' : '#fff'}
        anchorX="center"
      >
        {input || 'Type the word...'}
      </Text>

      {/* Note: In a real implementation, we would use a real <input> via @react-three/drei's Html component */}
    </group>
  );
}

import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Player } from './Player';
import { StarterIsland } from './StarterIsland';
import { MemoryMatch } from './modes/MemoryMatch';
import { WordRunner } from './modes/WordRunner';
import { WordLab } from './modes/WordLab';
import { BossBattle } from './modes/BossBattle';

export function GameEngine() {
  // Game State Machine
  // states: 'ready' | 'in_progress' | 'completed' | 'paused'
  const [gameState, setGameState] = useState('ready');
  const [activeMode, setActiveMode] = useState(null);
  const [gameData, setGameData] = useState(null);

  // Session Logic
  useEffect(() => {
    console.log('Game Engine Initialized');
  }, []);

  const startMode = async (mode) => {
    setGameState('in_progress');
    setActiveMode(mode);

    // Simulation of fetching words from VocabularyAdapter
    const mockWords = [
      { text: 'Resilient', translations: ['Chidamlilik'], id: '1' },
      { text: 'Eloquent', translations: ['Notiq'], id: '2' },
      { text: 'Ubiquitous', translations: ['Hamma joyda bor'], id: '3' },
      { text: 'Pragmatic', translations: ['Pragmatik'], id: '4' },
    ];
    setGameData(mockWords);
  };

  return (
    <>
      {/* Environment */}
      <StarterIsland />

      {/* Player and Interaction Logic */}
      <Player
        gameState={gameState}
        onInteract={(target) => {
          if (target === 'portal') {
            startMode('memory');
          } else if (target === 'road') {
            startMode('runner');
          } else if (target === 'lab') {
            startMode('lab');
          } else if (target === 'boss') {
            startMode('boss');
          }
        }}
      />

      {/* Game Modes */}
      {gameState === 'in_progress' && (
        <>
          {activeMode === 'memory' && (
            <MemoryMatch
              words={gameData}
              onMatch={(success) => console.log('Match success:', success)}
              onComplete={() => {
                setGameState('completed');
                setActiveMode(null);
              }}
            />
          )}
          {activeMode === 'runner' && (
            <WordRunner
              words={gameData}
              onComplete={(success) => {
                setGameState('completed');
                setActiveMode(null);
              }}
            />
          )}
          {activeMode === 'lab' && (
            <WordLab
              words={gameData}
              onComplete={(success) => {
                setGameState('completed');
                setActiveMode(null);
              }}
            />
          )}
          {activeMode === 'boss' && (
            <BossBattle
              words={gameData}
              onComplete={(success) => {
                setGameState('completed');
                setActiveMode(null);
              }}
            />
          )}
        </>
      )}
    </>
  );
}

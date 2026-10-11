'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { GameEngine } from './world/GameEngine';

export default function GameClient() {
  return (
    <div className="h-screen w-screen relative">
      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        dpr={[1, 2]} // Performance optimization for high-DPI screens
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <GameEngine />

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={20}
            blur={2}
            far={4.5}
          />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>

      {/* Game HUD Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
        <div className="p-6 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-white">
              <div className="text-xs opacity-60 uppercase font-bold tracking-wider">Total XP</div>
              <div className="text-2xl font-bold text-[#00f0b5]">0</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-full text-white hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="10" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="14"/><line x1="20" y1="10" x2="20" y2="3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

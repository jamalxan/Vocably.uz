'use client'
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import to ensure Three.js/R3F only loads on this route.
const GameClient = dynamic(() => import('@/components/games/GameClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0b2e] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold animate-pulse">Loading Vocabulary World...</h1>
        <p className="text-sm opacity-70">Preparing your 3D adventure</p>
      </div>
    </div>
  )
});

export default function VocabularyWorldPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0b2e]">
      <Suspense fallback={null}>
        <GameClient />
      </Suspense>
    </div>
  );
}

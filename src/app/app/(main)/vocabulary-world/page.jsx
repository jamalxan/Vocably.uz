'use client';

import dynamic from 'next/dynamic';
import { useT } from '@/context/LocaleContext';

function WorldLoading() {
  const { t } = useT();
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0b2e] text-white" role="status">
      <div className="text-center">
        <h1 className="text-2xl font-bold motion-safe:animate-pulse text-[#00f0b5]">{t('world.loading')}</h1>
        <p className="text-sm opacity-70 mt-2">{t('world.loadingSub')}</p>
      </div>
    </div>
  );
}

// Three.js/R3F faqat shu sahifada (va faqat brauzerda) yuklanadi.
const GameClient = dynamic(() => import('@/components/games/GameClient'), {
  ssr: false,
  loading: WorldLoading,
});

export default function VocabularyWorldPage() {
  // AppShell (sidebar, FAB) ustini to'liq qoplaydi — o'yin to'liq ekranda.
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0b2e]">
      <GameClient />
    </div>
  );
}

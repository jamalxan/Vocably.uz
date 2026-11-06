import { Suspense } from 'react';
import GamePlayer from '@/components/games/GamePlayer';
import VocablyRun from '@/components/flagship/VocablyRun';
import WordTunnel from '@/components/flagship/WordTunnel';
import WordDefense from '@/components/flagship/WordDefense';

// Flagship o'yinlarning o'z ekrani bor (sessiya API'si bir xil).
const FLAGSHIP = { vocably_run: VocablyRun, word_tunnel: WordTunnel, word_defense: WordDefense };

// `useSearchParams` (GamePlayer ichida, ?mode=weak) Suspense chegarasini talab qiladi.
export default async function OyinPage(props) {
  const params = await props.params;
  const Flagship = Object.hasOwn(FLAGSHIP, params.game) ? FLAGSHIP[params.game] : null;
  if (Flagship) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full">
        <Flagship />
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-3xl mx-auto">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-border/70" aria-hidden="true" />}>
        <GamePlayer gameKey={params.game} />
      </Suspense>
    </div>
  );
}

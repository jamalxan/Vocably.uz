import GamesHub from '@/components/games/GamesHub';

export const metadata = { title: "Lug'at o'yinlari — Vocably" };

// Lug'at o'yinlari markazi (Gamified Vocabulary Engine TZ §9): bugungi reja, vazifalar, o'yinlar, yutuqlar.
export default function OyinlarPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
      <GamesHub />
    </div>
  );
}

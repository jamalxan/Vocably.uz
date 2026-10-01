// Hub (O'yinlar markazi) javob vaqti katta lug'atda (TZ §59 "Main dashboard remains responsive", §37).
// Hub ikkita so'rov yuboradi: /api/gamification/profile (buildGamificationProfile) va /api/games (katalog + mavjudlik).
// Byudjetlar ataylab keng (CI/sekin mashina uchun) — maqsad: yuzlab-ming emas, o'n minglab so'zda ham sekundlab kutmaslik.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { GAME_CATALOG, availabilityFor } from '@/lib/vocab/games';
import { buildSkillProfile, gameWeights } from '@/lib/vocab/weakness';
import { buildGamificationProfile } from './profileService';
import { flattenUserWords, statsToInput } from './words';

const User: any = Models.User;
const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;

const NOW = new Date('2026-10-10T10:00:00Z');
const STATES = ['new', 'learning', 'review', 'review', 'relearning'];

function makeWords(n: number, offset = 0) {
  return Array.from({ length: n }, (_, i) => {
    const k = i + offset;
    return {
      word: `word${k}`,
      syns: [`tarjima ${k}`],
      enrichment: {
        definitionEn: `definition of word ${k}`,
        examples: [{ en: `This is an example with word${k} inside.`, uz: '' }],
        synonymsEn: [`syn${k}`],
        antonyms: [`ant${k}`],
        cefr: ['A2', 'B1', 'B2', 'C1'][k % 4],
        imageUrl: k % 10 === 0 ? `/img/${k}.png` : '',
      },
      stats: {
        srsState: STATES[k % STATES.length],
        reps: k % 7,
        intervalDays: (k % 30) + 1,
        nextReview: new Date(NOW.getTime() + ((k % 9) - 4) * 86400_000), // ~yarmi muddati o'tgan
        correct: k % 11,
        wrong: k % 5,
      },
    };
  });
}

/** /api/games ning hisoblash qismi (route.js) — HTTP/auth'siz. */
function gamesCatalogCompute(user: any) {
  const words = flattenUserWords(user, { now: NOW });
  const profile = buildSkillProfile((user.categories || []).flatMap((c: any) => (c.words || []).map((w: any) => statsToInput(w.stats || {}))));
  const availableKeys = GAME_CATALOG.filter((g) => availabilityFor(g, words).available).map((g) => g.key);
  gameWeights(profile, availableKeys);
  GAME_CATALOG.forEach((g) => availabilityFor(g, words));
  return words.length;
}

const ms = (t0: bigint) => Number(process.hrtime.bigint() - t0) / 1e6;

describeDb('hub performance (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });

  for (const [size, budgetMs] of [
    // Byudjet yakka yugurishdagidan ~8–10x keng: to'liq suitda ko'p fayl parallel yuradi (yakka: 5k ≈ 0.3 s, 10k ≈ 0.5 s).
    [5_000, 4000],
    [10_000, 6000],
  ] as const) {
    it(`${size.toLocaleString('en')} so'zli foydalanuvchi: profil + katalog byudjetda`, async () => {
      // Eslatma: so'zlar User hujjati ichida (categories[].words[]) — MongoDB 16 MB chegarasi ~19k boyitilgan so'zda
      // to'ladi (o'lchangan: 20k so'z = 17.3 MB, yozib bo'lmadi). Shuning uchun 10k dan yuqori sinalmaydi.
      const cats = [0, 1, 2, 3].map((c) => ({ name: `cat${c}`, words: makeWords(size / 4, (size / 4) * c) }));
      const created = await User.create({ phone: `+99890${size}`, name: 'Perf', password: 'x', timezone: 'Asia/Tashkent', categories: cats });

      // Haqiqiy so'rovdagidek: DB'dan o'qish (lean) + hisoblash.
      let t0 = process.hrtime.bigint();
      const user = await User.findById(created._id).lean();
      const load = ms(t0);

      await buildGamificationProfile(user, { now: NOW }); // isitish (birinchi chaqiruv JIT/import)
      t0 = process.hrtime.bigint();
      const profile = await buildGamificationProfile(user, { now: NOW });
      const profileMs = ms(t0);

      t0 = process.hrtime.bigint();
      const counted = gamesCatalogCompute(user);
      const catalogMs = ms(t0);

      // eslint-disable-next-line no-console
      console.log(`[perf] ${size} words: load ${load.toFixed(0)}ms, profile ${profileMs.toFixed(0)}ms, catalog ${catalogMs.toFixed(0)}ms`);
      expect(counted).toBe(size);
      expect(profile.overview.total).toBe(size);
      expect(load + profileMs).toBeLessThan(budgetMs);
      expect(load + catalogMs).toBeLessThan(budgetMs);
    }, 120_000);
  }
});

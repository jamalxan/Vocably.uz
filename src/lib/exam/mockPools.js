import { ExamTest } from '@/lib/models';
import { composeMock, composedTitle, MOCK_SECTION_KEYS } from '@/lib/exam/mockComposer';
import { isSectionMockEligible } from '@/lib/exam/contentValidator';

// Shared by POST /api/exam/attempts (mode:'mock') and GET /api/exam/mock-preview
// so the intro screen always describes exactly what "Boshlash" will create.

/** Per-module pools of section sources that pass the mock gate.
 * `lengthNorms:false` relaxes only the official Reading word-count window
 * (see checkMockEligibility) — the structure is still enforced. */
export async function buildMockPools({ lengthNorms = true } = {}) {
  const tests = await ExamTest.find({
    isPublished: true,
    $or: MOCK_SECTION_KEYS.map((key) => ({ [`sections.${key}`]: { $exists: true } })),
  })
    .select('title module sections availability')
    .lean();

  // Academic Reading and General Writing must never be mixed in one mock.
  const byModule = new Map();
  for (const test of tests) {
    const moduleKey = test.module || 'academic';
    if (!byModule.has(moduleKey)) byModule.set(moduleKey, { listening: [], reading: [], writing: [] });
    const pools = byModule.get(moduleKey);
    for (const key of MOCK_SECTION_KEYS) {
      const content = test.sections?.[key];
      if (!content) continue;
      // Admin closed this section on purpose (e.g. quality) — keep it out of mocks too.
      const availabilityKey = `practice${key[0].toUpperCase()}${key.slice(1)}`;
      if (test.availability && test.availability[availabilityKey] === false) continue;
      if (!isSectionMockEligible(key, content, { lengthNorms })) continue;
      pools[key].push({ testId: String(test._id), title: test.title, module: moduleKey, content });
    }
  }
  return byModule;
}

function viableModules(byModule) {
  return Array.from(byModule.entries()).filter(([, pools]) => MOCK_SECTION_KEYS.every((k) => pools[k].length > 0));
}

/** Full-format mock first; only if no module has a complete full-format set,
 * fall back to a structurally complete "Mini mock". Returns null when not
 * even that is possible (no fake half-mocks). */
export async function resolveMockPools() {
  const full = viableModules(await buildMockPools({ lengthNorms: true }));
  if (full.length) return { format: 'full', viable: full };
  const mini = viableModules(await buildMockPools({ lengthNorms: false }));
  if (mini.length) return { format: 'mini', viable: mini };
  return null;
}

/** Test-like object for createMockAttemptForTest, or null. */
export async function composeRandomMock(avoidTestIds) {
  const resolved = await resolveMockPools();
  if (!resolved) return null;
  const [moduleKey, pools] = resolved.viable[Math.floor(Math.random() * resolved.viable.length)];
  const composed = composeMock(pools, { avoidTestIds });
  if (!composed) return null;

  const title = composedTitle(composed);
  return {
    _id: composed.parentTestId,
    slug: `mixed-${composed.composedFrom.map((c) => c.testId.slice(-4)).join('-')}`,
    title: resolved.format === 'mini' ? `Mini mock — ${title}` : title,
    module: moduleKey,
    difficulty: 'medium',
    sections: composed.sections,
    bandTable: null,
    isPublished: true,
    createdAt: new Date(),
    mockFormat: resolved.format,
  };
}

function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.floor(sorted.length / 2)];
}

function countQuestions(groups) {
  return (groups || []).reduce((n, g) => n + (g.questions?.length || 0), 0);
}

/** What the intro screen may show without revealing which test will be drawn:
 * format + typical section durations/sizes from the pool that would be used. */
export async function mockPreview() {
  const resolved = await resolveMockPools();
  if (!resolved) return { available: false };
  const sources = { listening: [], reading: [], writing: [] };
  for (const [, pools] of resolved.viable) {
    for (const key of MOCK_SECTION_KEYS) sources[key].push(...pools[key].map((p) => p.content));
  }
  return {
    available: true,
    format: resolved.format,
    sections: {
      listening: {
        durationSec: median(sources.listening.map((c) => c.durationSec)),
        questionCount: median(sources.listening.map((c) => (c.parts || []).reduce((n, p) => n + countQuestions(p.questionGroups), 0))),
      },
      reading: {
        durationSec: median(sources.reading.map((c) => c.durationSec)),
        questionCount: median(sources.reading.map((c) => (c.passages || []).reduce((n, p) => n + countQuestions(p.questionGroups), 0))),
      },
      writing: {
        durationSec: median(sources.writing.map((c) => c.durationSec)),
        taskCount: median(sources.writing.map((c) => (c.tasks || []).length)),
      },
    },
  };
}

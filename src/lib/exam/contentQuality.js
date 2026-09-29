// Content quality across all tests (pure — tested in contentQuality.test.js).
// For each test: how many attempts and learners, completion rate, average
// Reading/Listening band. For each question with enough answers: accuracy
// and the most common wrong answer. When most learners miss a question with
// the SAME wrong answer, the answer key is the first suspect — that is the
// typical signature of a key the AI importer (or a typo) got wrong.

export const MIN_ANSWERS = 5;
export const MIN_LEARNERS = 3;

function mean(xs) {
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null;
}

const norm = (s) => String(s || '').trim().toLowerCase();

/**
 * @param {Array} attempts  lean ExamAttempt docs: { testId, userId, status, result }
 * @param {Map|Object} titles testId -> title
 */
export function contentQuality(attempts, titles = {}) {
  const title = (id) => (titles instanceof Map ? titles.get(id) : titles[id]) || '';
  const tests = new Map();

  for (const a of attempts) {
    const id = String(a.testId);
    const t =
      tests.get(id) ||
      { testId: id, title: title(id), attempts: 0, graded: 0, users: new Set(), reading: [], listening: [], questions: new Map() };
    t.attempts++;
    t.users.add(String(a.userId));
    if (a.status === 'graded') {
      t.graded++;
      if (a.result?.reading?.band != null) t.reading.push(a.result.reading.band);
      if (a.result?.listening?.band != null) t.listening.push(a.result.listening.band);
      for (const q of a.result?.perQuestion || []) {
        const e = t.questions.get(q.number) || { number: q.number, type: q.type, total: 0, correct: 0, wrong: new Map(), accepted: q.accepted || [] };
        e.total++;
        if (q.correct) e.correct++;
        else if (norm(q.userAnswer)) e.wrong.set(norm(q.userAnswer), (e.wrong.get(norm(q.userAnswer)) || 0) + 1);
        t.questions.set(q.number, e);
      }
    }
    tests.set(id, t);
  }

  const out = [];
  for (const t of tests.values()) {
    const questions = [...t.questions.values()]
      .filter((q) => q.total >= MIN_ANSWERS)
      .map((q) => {
        const [topWrong, topCount] = [...q.wrong.entries()].sort((x, y) => y[1] - x[1])[0] || [null, 0];
        const wrongTotal = q.total - q.correct;
        const accuracy = q.correct / q.total;
        return {
          number: q.number,
          type: q.type,
          total: q.total,
          accuracy: Math.round(accuracy * 100) / 100,
          topWrong,
          topWrongShare: wrongTotal ? Math.round((topCount / wrongTotal) * 100) / 100 : 0,
          accepted: q.accepted,
          // Most learners wrong, and wrong the same way → check the key.
          // …and by several different learners — one person repeating a test
          // is not evidence about the key.
          keySuspect: t.users.size >= MIN_LEARNERS && accuracy < 0.3 && topCount >= 3 && topCount / Math.max(1, wrongTotal) >= 0.5,
          tooEasy: accuracy > 0.97,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);
    out.push({
      testId: t.testId,
      title: t.title,
      attempts: t.attempts,
      learners: t.users.size,
      completion: Math.round((t.graded / t.attempts) * 100) / 100,
      avgReading: mean(t.reading),
      avgListening: mean(t.listening),
      hardest: questions.slice(0, 5),
      suspects: questions.filter((q) => q.keySuspect),
    });
  }
  return out.sort((a, b) => b.suspects.length - a.suspects.length || b.attempts - a.attempts);
}

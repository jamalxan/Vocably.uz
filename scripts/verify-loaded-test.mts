// Bazadagi yuklangan testni tekshiradi (faqat o'qish): holat, audio/rasm fayllari, dvigatel baholashi.
//   node --env-file=.env --import tsx scripts/verify-loaded-test.mts <slug> [slug...]
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { connectToDatabase } = await import('@/lib/db');
const { ExamTest } = await import('@/lib/models');
const { scoreSection } = await import('@/lib/exam/attemptServer');
const { sanitizeForExam } = await import('@/lib/exam/sanitize');
const { getAudioFileMeta } = await import('@/lib/exam/audioStorage');
const { getImageFileMeta } = await import('@/lib/exam/imageStorage');
await connectToDatabase();

for (const slug of process.argv.slice(2)) {
  const t: any = await (ExamTest as any).findOne({ slug }).lean();
  if (!t) { console.log(`FAIL ${slug}: bazada yo'q`); continue; }
  const problems: string[] = [];
  if (t.isPublished) problems.push("NASHR QILINGAN (bo'lmasligi kerak)");
  if (t.rights?.publishScope !== 'private') problems.push(`publishScope=${t.rights?.publishScope}`);

  // Reading va Listening raqamlari ustma-ust tushadi (ikkalasi 1..N) — javoblar bo'lim bo'yicha alohida.
  const answersFor = (containers: any[]) => {
    const answers: Record<string, any> = {};
    containers.forEach((c) => (c.questionGroups || []).forEach((g: any) => (g.questions || []).forEach((q: any) => {
      answers[`q${q.number}`] = q.selectCount > 1 ? q.answer.accepted.slice(0, q.selectCount) : q.answer.accepted[0];
    })));
    return answers;
  };

  const out: string[] = [];
  for (const [key, containers] of [['reading', t.sections.reading?.passages], ['listening', t.sections.listening?.parts]] as const) {
    if (!containers) continue;
    const s = scoreSection(t, answersFor(containers), key);
    out.push(`${key} ${s.raw}/${s.total}`);
    if (s.raw !== s.total) problems.push(`${key}: barcha to'g'ri javobda ${s.raw}/${s.total} (xato: ${s.perQuestion.filter((p: any) => !p.correct).map((p: any) => p.number).join(',')})`);
  }
  for (const p of t.sections.listening?.parts || []) {
    const id = String(p.audioUrl || '').split('/').pop() || '';
    const meta = await getAudioFileMeta(id);
    if (!meta || meta.length < 100_000) problems.push(`part ${p.order}: audio fayl yo'q/kichik (${meta?.length})`);
    if (!p.durationSec) problems.push(`part ${p.order}: durationSec 0`);
  }
  const imgIds = JSON.stringify(t.sections).match(/\/api\/exam\/image\/[0-9a-f]{24}/g) || [];
  for (const u of imgIds) { const meta = await getImageFileMeta(u.split('/').pop()!); if (!meta || meta.length < 5_000) problems.push(`rasm yo'q/kichik: ${u}`); }
  const safe: any = sanitizeForExam(t);
  if (JSON.stringify(safe).includes('"accepted"')) problems.push('sanitize javob kalitini yashirmayapti!');
  console.log(`${problems.length ? 'FAIL' : 'OK  '} ${slug} | ${out.join(' | ')} | parts ${(t.sections.listening?.parts || []).length} | images ${imgIds.length} | published=${t.isPublished} scope=${t.rights?.publishScope}${problems.length ? '\n   - ' + problems.join('\n   - ') : ''}`);
}
process.exit(0);

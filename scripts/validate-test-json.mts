// Subagent yozgan test JSON'ini tekshiradi (audio bundan mustasno).
//   node --import tsx scripts/validate-test-json.mts <file.json> [more.json ...]
import fs from 'node:fs';
const { validateTest } = await import('@/lib/exam/contentValidator');

let bad = 0;
for (const file of process.argv.slice(2)) {
  const t = JSON.parse(fs.readFileSync(file, 'utf8'));
  const problems: string[] = [];
  const sections = t.sections || {};

  const groupsOf = (s: any) => (s.passages || s.parts || []).flatMap((x: any) => x.questionGroups || []);
  const check = (name: string, container: any[], perUnit: number | null) => {
    const nums: number[] = []; const covered: number[] = [];
    const allQ = container.flatMap((u: any) => (u.questionGroups || []).flatMap((g: any) => g.questions || [])).map((q: any) => q.number).sort((a: number, b: number) => a - b);
    const spanOf = (q: any) => (q.selectCount > 1 && !allQ.some((n: number) => n > q.number && n < q.number + q.selectCount) ? q.selectCount : 1);
    for (const unit of container) {
      let count = 0;
      for (const g of unit.questionGroups || []) {
        const stem = (g.stemHtml || '') + (g.questions || []).map((q: any) => q.promptHtml || '').join('');
        for (const q of g.questions || []) {
          nums.push(q.number); count += spanOf(q); for (let k = 0; k < spanOf(q); k++) covered.push(q.number + k);
          if (!q.answer?.accepted?.length || q.answer.accepted.some((a: string) => !String(a).trim())) problems.push(`${name} Q${q.number}: javob yo'q`);
          if (/multiple_choice/.test(g.type) && (q.options || []).length < 3) problems.push(`${name} Q${q.number}: options yetarli emas`);
          if (g.type === 'multiple_choice_multi' && !q.selectCount) problems.push(`${name} Q${q.number}: selectCount yo'q`);
          if (!q.explanationHtml) problems.push(`${name} Q${q.number}: explanationHtml yo'q`);
          if (/completion/.test(g.type) && g.stemHtml && !g.stemHtml.includes(`{{q${q.number}}}`)) problems.push(`${name} Q${q.number}: stemHtml'da {{q${q.number}}} yo'q`);
          if (/completion/.test(g.type) && !g.stemHtml && !(q.promptHtml || '').includes(`{{q${q.number}}}`) && g.type !== 'short_answer') problems.push(`${name} Q${q.number}: gap placeholder yo'q`);
        }
        void stem;
      }
      if (perUnit && !t.legacyCounts && count !== perUnit && name === 'listening') problems.push(`${name} part ${unit.order}: ${count} savol (10 kutilgan)`);
    }
    const sorted = [...covered].sort((a, b) => a - b);
    void nums;
    if (!(t.legacyCounts ? covered.length >= 38 && covered.length <= 42 : covered.length === 40)) problems.push(`${name}: jami ${covered.length} savol (40 kutilgan)`);
    sorted.forEach((n, i) => { if (n !== i + 1) { if (!problems.some((p) => p.startsWith(`${name}: raqam`))) problems.push(`${name}: raqam ketma-ketligi buzilgan (${i + 1} kutilgan, ${n} topildi)`); } });
  };
  if (sections.reading) check('reading', sections.reading.passages || [], null);
  if (sections.listening) check('listening', sections.listening.parts || [], 10);
  if (sections.reading && (sections.reading.passages || []).length !== 3) problems.push('reading: 3 passage emas');
  if (sections.reading) for (const p of sections.reading.passages || []) if ((p.paragraphs || []).join('').length === 0 || !(p.paragraphs || []).length) problems.push(`passage ${p.order}: paragraphs bo'sh`);
  if (sections.listening && (sections.listening.parts || []).length !== 4) problems.push('listening: 4 part emas');
  void groupsOf;

  const draft = { ...t, rights: { sourceType: 'third_party_copyright', publishScope: 'private' } };
  const issues = validateTest(draft).filter((i: any) => i.severity === 'error' && !/audioUrl|uzilishsiz/.test(i.message)); // uzilishsiz: multi-select to'plam raqamlari yuqorida o'zimiz tekshiramiz
  issues.forEach((i: any) => problems.push(`validator: ${i.path}: ${i.message}`));

  if (problems.length) { bad++; console.log(`✗ ${file}\n  - ${problems.slice(0, 25).join('\n  - ')}${problems.length > 25 ? `\n  ...+${problems.length - 25}` : ''}`); }
  else console.log(`✓ ${file}`);
}
process.exit(bad ? 1 : 0);





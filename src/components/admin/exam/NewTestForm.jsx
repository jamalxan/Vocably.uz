'use client';
import { useMemo, useState } from 'react';
import { Loader2, Sparkles, FileJson, FileText, Eye, Check } from 'lucide-react';
import { parseReadingDsl } from '@/lib/exam/dsl';
import { validateTest, hasBlockingErrors } from '@/lib/exam/contentValidator';
import ValidationIssuesList from './ValidationIssuesList';
import TestPreview from './TestPreview';

// TZ-vocably-v2.md §15.1 / §19 Faza 4 item 21 — "Uch xil kiritish yo'li: JSON
// import, DSL, AI yordamchi." Uchalasi ham OXIR-OQIBAT bir xil shaklga
// (`{title, slug, module, difficulty, sections}`, `Test` types.ts) tushadi va
// SHU BITTA validatsiya+preview+yaratish oqimidan o'tadi — faqat "draft'ni
// qanday olish" farq qiladi. `validateTest`/`parseReadingDsl` bu yerda
// to'g'ridan-to'g'ri import qilingan (client'da, server so'rovsiz — sof
// funksiyalar) — instant fikr-mulohaza uchun; yaratishda server HAM qayta
// tekshiradi (client'ga ishonmaslik).
const METHODS = [
  { key: 'json', label: 'JSON import', icon: FileJson },
  { key: 'dsl', label: 'DSL (Reading)', icon: FileText },
  { key: 'ai', label: 'AI yordamchi (Reading)', icon: Sparkles },
];

const DSL_PLACEHOLDER = `## PASSAGE 1
### The history of glass

[A] Glass has been used by humans for thousands of years...

## QUESTIONS 1-3
type: true_false_notgiven
instruction: Do the following statements agree with the information given in Reading Passage 1?

1. Glass was first made in Mesopotamia. | TRUE | para:A
2. The Romans invented glassblowing. | NOT GIVEN`;

export default function NewTestForm({ token, onCreated }) {
  const [method, setMethod] = useState('json');

  const [jsonText, setJsonText] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [moduleType, setModuleType] = useState('academic');
  const [difficulty, setDifficulty] = useState('medium');

  const [dslText, setDslText] = useState('');
  const [dslErrors, setDslErrors] = useState([]);
  const [dslPassages, setDslPassages] = useState(null);

  const [rawText, setRawText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPassages, setAiPassages] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const runDsl = () => {
    const { passages, errors } = parseReadingDsl(dslText);
    setDslPassages(passages);
    setDslErrors(errors);
  };

  const runAi = async () => {
    if (!rawText.trim()) return;
    setAiGenerating(true);
    setAiError('');
    try {
      const res = await fetch('/api/admin/exam-tests/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      setAiPassages(data.passages);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const { draft, jsonParseError } = useMemo(() => {
    if (method === 'json') {
      if (!jsonText.trim()) return { draft: null, jsonParseError: '' };
      try {
        return { draft: JSON.parse(jsonText), jsonParseError: '' };
      } catch (err) {
        return { draft: null, jsonParseError: err.message };
      }
    }
    const passages = method === 'dsl' ? dslPassages : aiPassages;
    if (!passages) return { draft: null, jsonParseError: '' };
    return {
      draft: { title, slug, module: moduleType, difficulty, sections: { reading: { durationSec: 3600, passages } } },
      jsonParseError: '',
    };
  }, [method, jsonText, dslPassages, aiPassages, title, slug, moduleType, difficulty]);

  const validatorIssues = useMemo(() => (draft ? validateTest(draft) : []), [draft]);
  const dslParseIssues = method === 'dsl' ? dslErrors.map((e) => ({ severity: 'error', path: `${e.line}-qator`, message: e.message })) : [];
  const allIssues = [...dslParseIssues, ...validatorIssues];
  const canCreate = !!draft && !hasBlockingErrors(allIssues);

  const handleCreate = async () => {
    if (!draft) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/admin/exam-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');
      onCreated?.();
      setJsonText('');
      setDslText('');
      setDslPassages(null);
      setDslErrors([]);
      setRawText('');
      setAiPassages(null);
      setTitle('');
      setSlug('');
      setShowPreview(false);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
      <p className="text-sm font-bold text-ink">Yangi test qo&apos;shish</p>

      <div className="flex flex-wrap gap-1.5">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              method === m.key ? 'bg-accent text-on-accent' : 'bg-bg text-muted hover:text-ink'
            }`}
          >
            <m.icon size={13} /> {m.label}
          </button>
        ))}
      </div>

      {method !== 'json' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Test sarlavhasi"
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink outline-none focus:border-accent"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (masalan cambridge-19-test-1)"
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink outline-none focus:border-accent"
          />
          <select
            value={moduleType}
            onChange={(e) => setModuleType(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink outline-none focus:border-accent"
          >
            <option value="academic">Academic</option>
            <option value="general">General Training</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink outline-none focus:border-accent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}

      {method === 'json' && (
        <div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"slug": "...", "title": "...", "module": "academic", "sections": {...}}'
            rows={10}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs font-mono text-ink outline-none focus:border-accent resize-y"
          />
          {jsonParseError && <p className="text-xs text-danger mt-1">JSON xato: {jsonParseError}</p>}
        </div>
      )}

      {method === 'dsl' && (
        <div className="space-y-2">
          <textarea
            value={dslText}
            onChange={(e) => setDslText(e.target.value)}
            placeholder={DSL_PLACEHOLDER}
            rows={10}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs font-mono text-ink outline-none focus:border-accent resize-y"
          />
          <button
            type="button"
            onClick={runDsl}
            className="px-3 py-1.5 bg-bg hover:bg-primary-soft border border-border rounded-lg text-xs font-semibold text-ink transition-colors"
          >
            DSL&apos;ni tahlil qilish
          </button>
        </div>
      )}

      {method === 'ai' && (
        <div className="space-y-2">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Xom passage matni + javob kaliti (formatlanmagan holda, masalan: 1. TRUE  2. NOT GIVEN  3. FALSE...)"
            rows={10}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs text-ink outline-none focus:border-accent resize-y"
          />
          <button
            type="button"
            onClick={runAi}
            disabled={aiGenerating || !rawText.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-on-accent rounded-lg text-xs font-semibold transition-colors"
          >
            {aiGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            AI bilan generatsiya qilish
          </button>
          {aiError && <p className="text-xs text-danger">{aiError}</p>}
        </div>
      )}

      {draft && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-bold text-ink">Validatsiya</p>
          <ValidationIssuesList issues={allIssues} />
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent"
          >
            <Eye size={13} /> {showPreview ? "Preview'ni yashirish" : 'Preview'}
          </button>
          {showPreview && (
            <div className="max-h-96 overflow-y-auto border border-border rounded-lg p-3">
              <TestPreview sections={draft.sections || {}} />
            </div>
          )}
        </div>
      )}

      {createError && <p className="text-xs text-danger">{createError}</p>}
      <button
        type="button"
        onClick={handleCreate}
        disabled={!canCreate || creating}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-on-accent rounded-xl text-sm font-semibold transition-colors"
      >
        {creating ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Draft sifatida yaratish
      </button>
    </div>
  );
}

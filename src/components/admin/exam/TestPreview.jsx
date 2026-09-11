'use client';

// TZ-vocably-v2.md §15.2 — "Preview rejimi: testni foydalanuvchi ko'rgandek
// ko'rish, javoblar bilan." SODDALASHTIRISH: haqiqiy `ExamShell`/split-pane
// UI'sini bu yerda qayta qurish (vaqtinchalik "preview mode" qo'shib)
// ma'no jihatidan foyda-mehnat nisbati past — admin uchun kerak bo'lgan
// narsa "kontent to'g'rimi" tekshiruvi, imtihon topshirish tajribasi emas.
// Shuning uchun tekis, o'qish uchun qulay ro'yxat: savol + variantlar +
// TO'G'RI JAVOB (yashil) + lokator — barchasi bitta joyda, scroll qilib
// ko'rib chiqish uchun.
function QuestionRow({ q, group }) {
  return (
    <div className="border-t border-border pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
      <p className="text-sm text-ink">
        <span className="font-bold mr-1.5">{q.number}.</span>
        {q.promptHtml && <span dangerouslySetInnerHTML={{ __html: q.promptHtml }} />}
      </p>
      {group.type === 'multiple_choice_single' && q.options?.length > 0 && (
        <ul className="mt-1 ml-6 text-xs text-muted space-y-0.5">
          {q.options.map((o) => (
            <li key={o.key}>
              {o.key}) {o.text}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs mt-1 ml-6">
        <span className="text-success font-semibold">Javob: {(q.answer?.accepted || []).join(' / ') || '—'}</span>
        {q.locatorParagraph && <span className="text-muted ml-2">(paragraf {q.locatorParagraph})</span>}
        {q.selectCount && <span className="text-muted ml-2">({q.selectCount} tadan tanlash)</span>}
      </p>
    </div>
  );
}

function GroupBlock({ group }) {
  return (
    <div className="mt-3 bg-bg rounded-lg p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent mb-1">{group.type}</p>
      {group.instructionHtml && <p className="text-xs text-muted mb-1.5" dangerouslySetInnerHTML={{ __html: group.instructionHtml }} />}
      {group.bank?.length > 0 && (
        <ul className="text-xs text-muted mb-1.5 ml-4 list-disc">
          {group.bank.map((b) => (
            <li key={b.key}>
              {b.key}. {b.text}
            </li>
          ))}
        </ul>
      )}
      {(group.questions || []).map((q) => (
        <QuestionRow key={q.number} q={q} group={group} />
      ))}
    </div>
  );
}

function ReadingPreview({ reading }) {
  return (
    <div className="space-y-4">
      {(reading.passages || []).map((p) => (
        <div key={p.order} className="border border-border rounded-xl p-3">
          <p className="text-sm font-bold text-ink">
            Passage {p.order} — {p.title || '(sarlavhasiz)'}
          </p>
          <div className="mt-2 text-xs text-muted leading-relaxed space-y-1 max-h-40 overflow-y-auto">
            {(p.paragraphs || []).map((para, i) => (
              <p key={i}>
                {para.label && <span className="font-bold mr-1">[{para.label}]</span>}
                <span dangerouslySetInnerHTML={{ __html: para.html }} />
              </p>
            ))}
          </div>
          {(p.questionGroups || []).map((g) => (
            <GroupBlock key={g.id} group={g} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ListeningPreview({ listening }) {
  return (
    <div className="space-y-4">
      {(listening.parts || []).map((part) => (
        <div key={part.order} className="border border-border rounded-xl p-3">
          <p className="text-sm font-bold text-ink">Part {part.order}</p>
          <p className="text-xs text-muted mt-1">audioUrl: {part.audioUrl || '(yo‘q)'}</p>
          {(part.questionGroups || []).map((g) => (
            <GroupBlock key={g.id} group={g} />
          ))}
        </div>
      ))}
    </div>
  );
}

function WritingPreview({ writing }) {
  return (
    <div className="space-y-3">
      {(writing.tasks || []).map((task) => (
        <div key={task.order} className="border border-border rounded-xl p-3">
          <p className="text-sm font-bold text-ink">
            Task {task.order} — min {task.minWords} so&apos;z
          </p>
          <div className="text-xs text-muted mt-1" dangerouslySetInnerHTML={{ __html: task.promptHtml || '' }} />
        </div>
      ))}
    </div>
  );
}

export default function TestPreview({ sections }) {
  const hasAny = sections.reading || sections.listening || sections.writing;
  if (!hasAny) return <p className="text-xs text-muted">Hali kontent yo&apos;q.</p>;

  return (
    <div className="space-y-5">
      {sections.reading && (
        <div>
          <p className="text-xs font-bold uppercase text-accent mb-2">Reading</p>
          <ReadingPreview reading={sections.reading} />
        </div>
      )}
      {sections.listening && (
        <div>
          <p className="text-xs font-bold uppercase text-accent mb-2">Listening</p>
          <ListeningPreview listening={sections.listening} />
        </div>
      )}
      {sections.writing && (
        <div>
          <p className="text-xs font-bold uppercase text-accent mb-2">Writing</p>
          <WritingPreview writing={sections.writing} />
        </div>
      )}
    </div>
  );
}

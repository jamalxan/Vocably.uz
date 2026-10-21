'use client';
import ContentBooksPanel from '@/components/admin/content/ContentBooksPanel';

export default function TeacherMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-luxury text-2xl text-ink mb-1">Materiallarim</h1>
        <p className="text-sm text-muted">Kitob (PDF/DOCX) va audio yuklang — tizim ularni testlarga ajratadi.</p>
      </div>
      <ContentBooksPanel newHref="/teacher/materials/new" showAutopilot={false} />
    </div>
  );
}

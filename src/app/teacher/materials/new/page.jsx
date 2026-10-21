'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NewBookWizard from '@/components/admin/content/NewBookWizard';

export default function TeacherNewMaterialPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/teacher/materials" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink min-h-11 md:min-h-0">
          <ArrowLeft size={14} /> Materiallarim
        </Link>
        <h1 className="font-luxury text-2xl text-ink mt-2">Material yuklash</h1>
      </div>
      <NewBookWizard redirectTo="/teacher/materials" canPublishPublic={false} />
    </div>
  );
}

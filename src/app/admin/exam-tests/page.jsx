'use client';
import { useAdmin } from '@/context/AdminContext';
import ExamTestsPanel from '@/components/admin/exam/ExamTestsPanel';

export default function AdminExamTestsPage() {
  const { token } = useAdmin();
  return <ExamTestsPanel token={token} />;
}

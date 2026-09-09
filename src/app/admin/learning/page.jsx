'use client';
import { useAdmin } from '@/context/AdminContext';
import AdminLearningAnalytics from '@/components/admin/AdminLearningAnalytics';

export default function AdminLearningPage() {
  const { token } = useAdmin();
  return <AdminLearningAnalytics token={token} />;
}

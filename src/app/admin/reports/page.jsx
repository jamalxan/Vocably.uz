'use client';
import { useAdmin } from '@/context/AdminContext';
import ReportsQueue from '@/components/admin/ReportsQueue';

export default function AdminReportsPage() {
  const { token } = useAdmin();
  return <ReportsQueue token={token} />;
}

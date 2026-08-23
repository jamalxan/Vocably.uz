'use client';
import { useAdmin } from '@/context/AdminContext';
import AdminStats from '@/components/admin/AdminStats';

export default function AdminOverviewPage() {
  const { token } = useAdmin();
  return <AdminStats token={token} />;
}

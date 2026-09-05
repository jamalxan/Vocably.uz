'use client';
import { useAdmin } from '@/context/AdminContext';
import AdminActivity from '@/components/admin/AdminActivity';

export default function AdminActivityPage() {
  const { token } = useAdmin();
  return <AdminActivity token={token} />;
}

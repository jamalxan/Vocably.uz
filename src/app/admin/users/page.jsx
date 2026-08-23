'use client';
import { useAdmin } from '@/context/AdminContext';
import UsersTable from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const { token } = useAdmin();
  return <UsersTable token={token} />;
}

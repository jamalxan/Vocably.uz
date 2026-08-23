'use client';
import { useAdmin } from '@/context/AdminContext';
import AuditLogTable from '@/components/admin/AuditLogTable';

export default function AdminAuditLogPage() {
  const { token } = useAdmin();
  return <AuditLogTable token={token} />;
}

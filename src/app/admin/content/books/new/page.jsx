'use client';
import { useAdmin } from '@/context/AdminContext';
import NewBookWizard from '@/components/admin/content/NewBookWizard';

export default function AdminNewBookPage() {
  const { token } = useAdmin();
  return <NewBookWizard token={token} />;
}

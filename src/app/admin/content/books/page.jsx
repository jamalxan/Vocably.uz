'use client';
import { useAdmin } from '@/context/AdminContext';
import ContentBooksPanel from '@/components/admin/content/ContentBooksPanel';

export default function AdminContentBooksPage() {
  const { token } = useAdmin();
  return <ContentBooksPanel token={token} />;
}

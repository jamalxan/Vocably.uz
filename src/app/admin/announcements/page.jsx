'use client';
import { useAdmin } from '@/context/AdminContext';
import AnnouncementsPanel from '@/components/admin/AnnouncementsPanel';

export default function AdminAnnouncementsPage() {
  const { token } = useAdmin();
  return <AnnouncementsPanel token={token} />;
}

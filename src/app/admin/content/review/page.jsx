'use client';
import { useAdmin } from '@/context/AdminContext';
import ReviewQueuePanel from '@/components/admin/content/ReviewQueuePanel';

export default function AdminContentReviewPage() {
  const { token } = useAdmin();
  return <ReviewQueuePanel token={token} />;
}

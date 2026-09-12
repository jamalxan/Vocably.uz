'use client';
import { useAdmin } from '@/context/AdminContext';
import AiSettingsPanel from '@/components/admin/content/AiSettingsPanel';

export default function AdminContentAiPage() {
  const { token } = useAdmin();
  return <AiSettingsPanel token={token} />;
}

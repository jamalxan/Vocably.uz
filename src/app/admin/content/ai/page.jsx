'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Loader2, MessageSquare, Settings } from 'lucide-react';
import AiSettingsPanel from '@/components/admin/content/AiSettingsPanel';
import AiPlaygroundChat from '@/components/admin/content/AiPlaygroundChat';

// TZ-vocably-v2.md §11.5 — admin buni endi avvalo CHAT sifatida ochadi
// (foydalanuvchi talabi: "AI qism chat ko'rinishida bo'lsin"), raw
// model/fallback/temperature formasi "Sozlamalar" tabiga ko'chirildi —
// ikkalasi ham kerak: chat sozlamalarni SINASH uchun, forma esa ularni
// O'ZGARTIRISH uchun.
export default function AdminContentAiPage() {
  const { token } = useAdmin();
  const [tab, setTab] = useState('chat');
  const [taskKeys, setTaskKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);

  const loadTaskKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch('/api/admin/ai/config', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTaskKeys((data.configs || []).map((c) => c.taskKey));
    } finally {
      setLoadingKeys(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadTaskKeys();
  }, [token, loadTaskKeys]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 p-1 bg-bg border border-border rounded-xl w-fit">
          <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={MessageSquare} label="Sinov chat" />
          <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Sozlamalar" />
        </div>
        {tab === 'settings' && <p className="text-xs text-muted hidden sm:block">Har bosqich uchun model, fallback va xarajat chegarasi.</p>}
      </div>

      {tab === 'chat' ? (
        loadingKeys ? (
          <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
            <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
          </div>
        ) : taskKeys.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">TaskKey topilmadi.</p>
        ) : (
          <AiPlaygroundChat token={token} taskKeys={taskKeys} />
        )
      ) : (
        <AiSettingsPanel token={token} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        active ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

'use client';
import { useCallback, useEffect, useState } from 'react';
import { Bot, FlaskConical, Loader2, Settings } from 'lucide-react';
import AiSettingsPanel from '@/components/admin/content/AiSettingsPanel';
import AiPlaygroundChat from '@/components/admin/content/AiPlaygroundChat';
import AutopilotPanel from '@/components/admin/content/AutopilotPanel';
import AdminAgentChat from '@/components/admin/content/AdminAgentChat';

// 2026-09-24 (foydalanuvchi so'rovi) — bu ekranning ASOSIY qismi endi
// KONTENT AGENTI chati: admin faylni tashlaydi, agent uni ko'rib chiqib
// Reading/Listening/Writing/Speaking bo'yicha joylashtiradi.
//
// Avvalgi "Sinov chat" (`AiPlaygroundChat`) — taskKey tanlab model
// javobini sinash maydonchasi — YO'QOLMADI, lekin default ekran bo'lishdan
// to'xtadi: u ishlab chiqish uchun kerak, kundalik ish uchun emas ("AI
// chatda keraksiz narsalar bo'lmasin"). Shuning uchun u endi eng oxirgi,
// "Sinov" tabida.
export default function AdminContentAiPage() {
  const [tab, setTab] = useState('agent');
  const [taskKeys, setTaskKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);

  const loadTaskKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch('/api/admin/ai/config');
      const data = await res.json();
      if (res.ok) setTaskKeys((data.configs || []).map((c) => c.taskKey));
    } catch {
      setTaskKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  // TaskKey'lar faqat "Sinov" tabi ochilganda kerak — asosiy chat ularsiz
  // ishlaydi, shuning uchun sahifa ochilishida ortiqcha so'rov yo'q.
  useEffect(() => {
    if (tab === 'playground' && taskKeys.length === 0) loadTaskKeys();
  }, [tab, taskKeys.length, loadTaskKeys]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 p-1 bg-bg border border-border rounded-xl w-fit max-w-full">
        <TabButton active={tab === 'agent'} onClick={() => setTab('agent')} icon={Bot} label="AI chat" />
        <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Sozlamalar" />
        <TabButton active={tab === 'autopilot'} onClick={() => setTab('autopilot')} icon={Bot} label="Avtopilot" />
        <TabButton active={tab === 'playground'} onClick={() => setTab('playground')} icon={FlaskConical} label="Sinov" />
      </div>

      {tab === 'agent' && <AdminAgentChat />}
      {tab === 'settings' && <AiSettingsPanel />}
      {tab === 'autopilot' && <AutopilotPanel />}
      {tab === 'playground' &&
        (loadingKeys ? (
          <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
            <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
          </div>
        ) : taskKeys.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">TaskKey topilmadi.</p>
        ) : (
          <AiPlaygroundChat taskKeys={taskKeys} />
        ))}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 min-h-11 md:min-h-0 whitespace-nowrap rounded-lg text-xs font-semibold transition-colors ${
        active ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

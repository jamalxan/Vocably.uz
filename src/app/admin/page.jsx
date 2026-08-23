'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Users, MessagesSquare, Flag, ScrollText, LogOut } from 'lucide-react';
import AdminStats from '@/components/admin/AdminStats';
import UsersTable from '@/components/admin/UsersTable';
import ConversationViewer from '@/components/admin/ConversationViewer';
import ReportsQueue from '@/components/admin/ReportsQueue';
import AuditLogTable from '@/components/admin/AuditLogTable';

const TABS = [
  { key: 'stats', label: 'Statistika', icon: BarChart3 },
  { key: 'users', label: 'Foydalanuvchilar', icon: Users },
  { key: 'conversations', label: 'Suhbatlar', icon: MessagesSquare },
  { key: 'reports', label: 'Reportlar', icon: Flag },
  { key: 'audit', label: 'Audit log', icon: ScrollText },
];

// Admin panel — mavjud /dashboard'dagi view-state patternidan alohida, haqiqiy
// route (docs/ chat plani "Frontend" bo'limi: spec har doim /admin'ni alohida
// route sifatida rejalashtirgan). Rol tekshiruvi bu yerda faqat UI uchun —
// haqiqiy himoya har bir /api/admin/* route'da serverda (src/lib/chatAuth.js).
export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | ok | denied
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/');
      return;
    }
    fetch('/api/chat/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.role === 'admin') {
          setToken(t);
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => setStatus('denied'));
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-3">
        <p className="text-slate-600">Bu sahifa uchun ruxsatingiz yo'q.</p>
        <a href="/dashboard" className="text-indigo-600 text-sm font-medium hover:underline">
          Bosh sahifaga qaytish
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold font-display">
          Vocably <span className="text-indigo-400">Admin</span>
        </h1>
        <a href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
          <LogOut size={15} /> Ilovaga qaytish
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex gap-1.5 mb-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium flex-shrink-0 transition-colors ${
                tab === key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
          {tab === 'stats' && <AdminStats token={token} />}
          {tab === 'users' && <UsersTable token={token} />}
          {tab === 'conversations' && <ConversationViewer token={token} />}
          {tab === 'reports' && <ReportsQueue token={token} />}
          {tab === 'audit' && <AuditLogTable token={token} />}
        </div>
      </div>
    </div>
  );
}

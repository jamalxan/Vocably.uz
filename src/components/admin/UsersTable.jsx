'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, ShieldCheck, ShieldOff, Ban, Check } from 'lucide-react';

export default function UsersTable({ token }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [usernameDraft, setUsernameDraft] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chat/users?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }, [token, q]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const patchUser = async (id, body) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/chat/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Xatolik');
        return;
      }
      setUsers((prev) => prev.map((u) => (String(u._id) === String(id) ? { ...u, ...data.user } : u)));
    } finally {
      setSavingId(null);
    }
  };

  const grantAccess = (u) => {
    const uname = (usernameDraft[u._id] || u.username || '').trim().toLowerCase();
    if (!uname) return alert('Avval username kiriting');
    patchUser(u._id, { chatAccess: true, username: uname });
  };

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Telefon, ism yoki username qidirish..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-3 py-2.5">Ism / Telefon</th>
                <th className="px-3 py-2.5">Ro'yxatdan o'tgan</th>
                <th className="px-3 py-2.5">Username</th>
                <th className="px-3 py-2.5">Do'stlar</th>
                <th className="px-3 py-2.5">Rol</th>
                <th className="px-3 py-2.5">Ban</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-800">{u.name || '—'}</p>
                    <p className="text-xs text-slate-400">{u.phoneDisplay}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      defaultValue={u.username || ''}
                      placeholder="username"
                      onChange={(e) => setUsernameDraft((d) => ({ ...d, [u._id]: e.target.value }))}
                      className="w-32 px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:border-indigo-400"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {u.chatAccess ? (
                      <button
                        disabled={savingId === u._id}
                        onClick={() => patchUser(u._id, { chatAccess: false })}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs hover:bg-emerald-100"
                      >
                        <ShieldCheck size={12} /> Yoqilgan
                      </button>
                    ) : (
                      <button
                        disabled={savingId === u._id}
                        onClick={() => grantAccess(u)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <ShieldOff size={12} /> Ruxsat berish
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={u.role}
                      disabled={savingId === u._id}
                      onChange={(e) => patchUser(u._id, { role: e.target.value })}
                      className="px-2 py-1 border border-slate-200 rounded text-xs outline-none"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      disabled={savingId === u._id}
                      onClick={() => patchUser(u._id, { chatBanned: !u.chatBanned })}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        u.chatBanned ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {u.chatBanned ? <Ban size={12} /> : <Check size={12} />}
                      {u.chatBanned ? 'Bloklangan' : 'Faol'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Foydalanuvchi topilmadi</p>}
        </div>
      )}
    </div>
  );
}

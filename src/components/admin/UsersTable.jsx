'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, ShieldCheck, ShieldOff, Ban, CheckCircle2, Crown, User as UserIcon } from 'lucide-react';

export default function UsersTable({ token }) {
  const [users, setUsers] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
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
      if (res.ok) {
        setUsers(data.users || []);
        setNextCursor(data.nextCursor || null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, q]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/admin/chat/users?q=${encodeURIComponent(q)}&before=${encodeURIComponent(nextCursor)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...(data.users || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } finally {
      setLoadingMore(false);
    }
  };

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
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Telefon, ism yoki username qidirish..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-primary placeholder:text-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-accent uppercase tracking-[0.15em] border-b border-border">
                  <th className="px-5 py-3.5 font-semibold">Foydalanuvchi</th>
                  <th className="px-5 py-3.5 font-semibold">Ro'yxatdan o'tgan</th>
                  <th className="px-5 py-3.5 font-semibold">Username</th>
                  <th className="px-5 py-3.5 font-semibold">Do'stlar</th>
                  <th className="px-5 py-3.5 font-semibold">Rol</th>
                  <th className="px-5 py-3.5 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-border hover:bg-bg/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-soft border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {u.role === 'admin' ? <Crown size={15} className="text-accent" /> : <UserIcon size={15} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">{u.name || '—'}</p>
                          <p className="text-xs text-muted">{u.phoneDisplay}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        defaultValue={u.username || ''}
                        placeholder="username"
                        onChange={(e) => setUsernameDraft((d) => ({ ...d, [u._id]: e.target.value }))}
                        className="w-32 px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-primary outline-none focus:border-accent transition-colors"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {u.chatAccess ? (
                        <button
                          disabled={savingId === u._id}
                          onClick={() => patchUser(u._id, { chatAccess: false })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-soft border border-accent/25 text-accent rounded-lg text-xs font-medium hover:bg-accent/15 transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck size={13} /> Yoqilgan
                        </button>
                      ) : (
                        <button
                          disabled={savingId === u._id}
                          onClick={() => grantAccess(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border text-muted rounded-lg text-xs font-medium hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-50"
                        >
                          <ShieldOff size={13} /> Ruxsat berish
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        disabled={savingId === u._id}
                        onChange={(e) => {
                          const nextRole = e.target.value;
                          // Rol o'zgartirish qaytarilishi mumkin bo'lsa ham (admin
                          // huquqi berish yoki olib tashlash) og'ir oqibatli — tasodifiy
                          // bosishning oldini olish uchun tasdiqlash so'raladi.
                          if (
                            !confirm(
                              `${u.name || u.phoneDisplay} uchun rolni "${nextRole}"ga o'zgartirasizmi?`
                            )
                          ) {
                            e.target.value = u.role;
                            return;
                          }
                          patchUser(u._id, { role: nextRole });
                        }}
                        className="px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-primary outline-none focus:border-accent transition-colors"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        disabled={savingId === u._id}
                        onClick={() => patchUser(u._id, { chatBanned: !u.chatBanned })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          u.chatBanned
                            ? 'bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25'
                            : 'bg-bg border border-border text-muted hover:text-primary'
                        }`}
                      >
                        {u.chatBanned ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                        {u.chatBanned ? 'Bloklangan' : 'Faol'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="text-center text-sm text-muted py-10">Foydalanuvchi topilmadi</p>}
          {nextCursor && (
            <div className="flex justify-center py-4 border-t border-border">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-bg border border-border rounded-lg text-xs font-medium text-muted hover:text-primary hover:border-accent/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore && <Loader2 size={13} className="animate-spin" />} Yana yuklash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Target } from 'lucide-react';

// EDU-01b (VOCABLY_TZ_FINAL...2026-09-20.md §11 "Dashboard"): "Target Band: 7.0 /
// Current Estimate: 6.0 / Days Left: 43". Sof-presentational — barcha ma'lumot
// allaqachon `/api/dashboard`ning bitta javobida keladi (`examPrep`), bu yerda
// yangi so'rov YO'Q (DashboardHome.jsx'dagi §5.4 qoidasiga rioya qilinadi).
export default function ExamPrepCard({ examPrep }) {
  if (!examPrep) return null;
  const { targetBand, currentEstimate, daysLeft } = examPrep;

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border p-5">
      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Target size={13} /> IELTS tayyorgarlik
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-muted mb-1">Target Band</p>
          {targetBand != null ? (
            <p className="text-xl font-bold text-ink tabular-nums">{targetBand.toFixed(1)}</p>
          ) : (
            <Link href="/app/profil" className="text-xs text-accent font-semibold hover:underline">
              O'rnatilmagan — Profilda belgilang
            </Link>
          )}
        </div>

        <div>
          <p className="text-[11px] text-muted mb-1">Current Estimate</p>
          <p className={`text-xl font-bold tabular-nums ${currentEstimate != null ? 'text-ink' : 'text-muted text-sm'}`}>
            {currentEstimate != null ? currentEstimate.toFixed(1) : 'Hali baholanmagan'}
          </p>
        </div>

        {daysLeft != null && (
          <div>
            <p className="text-[11px] text-muted mb-1">Days Left</p>
            <p className="text-xl font-bold text-ink tabular-nums">{daysLeft >= 0 ? daysLeft : 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}

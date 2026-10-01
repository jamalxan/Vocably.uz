// Monitoring alertlari (TZ §62): `adminVocabAnalytics` natijasidan anomaliyalarni aniqlaydi.
// Sof funksiya (DB'siz). Cron (`/api/internal/vocab/health`) natijani structured log sifatida yozadi —
// Vercel log alert'lari `[vocab-alert]` bo'yicha ishga tushadi.
export type AlertLevel = 'critical' | 'warning';

export interface HealthAlert {
  code: 'low_completion' | 'high_flagged' | 'xp_anomaly' | 'no_activity';
  level: AlertLevel;
  message: string;
  value: number | null;
}

export interface HealthInput {
  games?: { started?: number; completionRate?: number | null };
  integrity?: { flaggedSessions?: number; usersNearDailyXpCap?: number };
}

export const HEALTH_THRESHOLDS = {
  /** Shundan kam sessiya bo'lsa, foizlar ishonchsiz — alert berilmaydi. */
  minSessions: 30,
  completionWarn: 50,
  completionCritical: 30,
  flaggedWarnPct: 5,
  flaggedCriticalPct: 15,
  xpCapUsersWarn: 5,
};

export function evaluateVocabHealth(a: HealthInput): HealthAlert[] {
  const t = HEALTH_THRESHOLDS;
  const alerts: HealthAlert[] = [];
  const started = a.games?.started || 0;
  if (started < t.minSessions) return alerts;

  const cr = a.games?.completionRate;
  if (typeof cr === 'number' && cr < t.completionWarn) {
    alerts.push({
      code: 'low_completion',
      level: cr < t.completionCritical ? 'critical' : 'warning',
      message: `O'yinlarni tugatish ulushi past: ${cr}% (${started} ta sessiya) — xatolik yoki UX muammosi bo'lishi mumkin`,
      value: cr,
    });
  }

  const flagged = a.integrity?.flaggedSessions || 0;
  const flaggedPct = Math.round((flagged / started) * 100);
  if (flaggedPct >= t.flaggedWarnPct) {
    alerts.push({
      code: 'high_flagged',
      level: flaggedPct >= t.flaggedCriticalPct ? 'critical' : 'warning',
      message: `Shubhali sessiyalar ulushi yuqori: ${flaggedPct}% (${flagged}/${started}) — anti-cheat yoki bot faolligi`,
      value: flaggedPct,
    });
  }

  const nearCap = a.integrity?.usersNearDailyXpCap || 0;
  if (nearCap >= t.xpCapUsersWarn) {
    alerts.push({
      code: 'xp_anomaly',
      level: 'warning',
      message: `${nearCap} ta foydalanuvchi kunlik XP chegarasiga yaqin — XP/leaderboard anomaliyasini tekshiring`,
      value: nearCap,
    });
  }
  return alerts;
}

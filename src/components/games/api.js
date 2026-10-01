// O'yinlar uchun yengil fetch qatlami. Autentifikatsiya httpOnly cookie orqali (qo'lda token yo'q).
export class ApiError extends Error {
  constructor(message, { status = 0, code = '', data = null } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function jsonFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new ApiError("Internet aloqasi yo'q. Ulanishni tekshiring.", { status: 0, code: 'network' });
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // bo'sh/yaroqsiz JSON
  }
  if (!res.ok) throw new ApiError(data?.error || 'Xatolik yuz berdi', { status: res.status, code: data?.code || '', data });
  return data;
}

export const getGames = () => jsonFetch('/api/games');
export const getGamificationProfile = () => jsonFetch('/api/gamification/profile');
export const getActiveSession = (key) => jsonFetch(`/api/games/${encodeURIComponent(key)}/active`);
export const startGame = (key, body) => jsonFetch(`/api/games/${encodeURIComponent(key)}/start`, { method: 'POST', body: JSON.stringify(body || {}) });
export const sendAnswers = (sessionId, answers) => jsonFetch(`/api/games/sessions/${sessionId}/answer`, { method: 'POST', body: JSON.stringify({ answers }) });
export const completeGame = (sessionId) => jsonFetch(`/api/games/sessions/${sessionId}/complete`, { method: 'POST', body: '{}' });
export const abandonGame = (sessionId) => jsonFetch(`/api/games/sessions/${sessionId}/abandon`, { method: 'POST', body: '{}' });
export const getWeakWords = (limit = 100) => jsonFetch(`/api/vocabulary/weak?limit=${limit}`);
export const getPlan = (minutes) => jsonFetch(`/api/vocabulary/plan${minutes ? `?minutes=${minutes}` : ''}`);
export const savePlanMinutes = (minutes) => jsonFetch('/api/vocabulary/plan', { method: 'POST', body: JSON.stringify({ minutes }) });
export const getProgress = (days = 30) => jsonFetch(`/api/vocabulary/progress?days=${days}`);
export const getRecommendations = () => jsonFetch('/api/vocabulary/recommendations');
export const getLeaderboard = (period) => jsonFetch(`/api/gamification/leaderboard?period=${period}`);
export const getCoach = () => jsonFetch('/api/vocabulary/coach');
export const getDiagnostic = () => jsonFetch('/api/vocabulary/diagnostic');
export const submitDiagnostic = (answers) => jsonFetch('/api/vocabulary/diagnostic', { method: 'POST', body: JSON.stringify({ answers }) });
export const skipDiagnostic = () => jsonFetch('/api/vocabulary/diagnostic', { method: 'POST', body: JSON.stringify({ skip: true }) });
export const getReminderPrefs = () => jsonFetch('/api/vocabulary/reminders');
export const saveReminderPrefs = (patch) => jsonFetch('/api/vocabulary/reminders', { method: 'PATCH', body: JSON.stringify(patch) });

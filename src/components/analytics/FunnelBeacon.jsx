'use client';
import { useEffect } from 'react';

// Anonymous funnel step (TZ 2.0 §6.12.3) → POST /api/funnel. A random browser id lives in localStorage
// (no cookie, nothing personal); the server keeps one row per day/stage/id and skips signed-in visitors.

const KEY = 'vocably.vid';

function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[a-z0-9]{16,40}$/.test(id)) {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked — don't count rather than count every reload
  }
}

export function trackFunnel(stage) {
  const vid = visitorId();
  if (!vid) return;
  const body = JSON.stringify({ stage, vid, path: window.location.pathname });
  try {
    if (navigator.sendBeacon?.('/api/funnel', new Blob([body], { type: 'text/plain' }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch('/api/funnel', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

export default function FunnelBeacon({ stage }) {
  useEffect(() => {
    trackFunnel(stage);
  }, [stage]);
  return null;
}

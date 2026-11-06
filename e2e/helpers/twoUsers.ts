// Bir nechta tizimga kirgan foydalanuvchi (alohida brauzer kontekstlari) + realtime/qo'ng'iroq
// E2E hook'lari (NEXT_PUBLIC_E2E_HOOKS=1: window.__vocablyRealtime, window.__vocablyCall) uchun yordamchilar.
// PARITY_PLAN WP9, CALLS_SPEC §15.3.
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { loginAs } from '../auth';
import { E2E_FREE_PHONE, E2E_FRIEND_USERNAME, E2E_PHONE, E2E_THIRD_PHONE, E2E_USERNAME } from '../global-setup';

/** Soxta kamera/mikrofon (Chromium) — `test.use(FAKE_MEDIA)`. Ikki kontekst bitta mashinada host candidate'lar bilan ulanadi. */
export const FAKE_MEDIA = {
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--disable-features=WebRtcHideLocalIpsWithMdns',
      '--autoplay-policy=no-user-gesture-required',
    ],
  },
  permissions: ['microphone', 'camera'],
};

export const REALTIME_URL = `http://127.0.0.1:${Number(process.env.E2E_REALTIME_PORT) || 4001}`;

/** Lokal realtime server (/health) ishlayaptimi — ishlamasa realtime'ga bog'liq testlar o'tkazib yuboriladi. */
export async function realtimeUp(): Promise<boolean> {
  const r = await fetch(`${REALTIME_URL}/health`).catch(() => null);
  return !!r?.ok;
}

const UZ_COOKIE = { name: 'vocably_lang', value: 'uz', domain: 'localhost', path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' as const };

export type UserSession = { context: BrowserContext; page: Page; phone: string };

/** Yangi kontekst (o'zbekcha, mikrofon/kamera ruxsati) + login + `path` ga o'tish. */
export async function openUser(browser: Browser, phone: string, path: string): Promise<UserSession> {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    permissions: ['microphone', 'camera'],
    storageState: { cookies: [UZ_COOKIE], origins: [] },
  });
  const page = await context.newPage();
  await loginAs(page, phone);
  await page.goto(path);
  return { context, page, phone };
}

/** Xuddi shu foydalanuvchining shu kontekstdagi ikkinchi tab'i. */
export async function openTab(session: UserSession, path: string): Promise<Page> {
  const page = await session.context.newPage();
  await page.goto(path);
  return page;
}

/** e2euser (caller) <-> e2efriend (callee), har biri bir-birining chatida. */
export async function openPair(browser: Browser) {
  const user = await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`);
  const friend = await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`);
  return { user, friend };
}

/** e2ethird, e2efriend bilan chatda ("band" holati uchun). */
export async function openThird(browser: Browser, path = `/app/friends/${E2E_FRIEND_USERNAME}`) {
  return openUser(browser, E2E_THIRD_PHONE, path);
}

export async function closeAll(...sessions: Array<UserSession | undefined>) {
  await Promise.all(sessions.filter(Boolean).map((s) => s!.context.close().catch(() => {})));
}

export const composer = (page: Page) => page.getByLabel(/Xabar matni|Message text/);

/** RealtimeProvider socket'i ulangan (WP1 hook). */
export async function waitSocket(page: Page, timeout = 30_000) {
  await expect
    .poll(() => page.evaluate(() => !!(window as any).__vocablyRealtime?.socket?.connected).catch(() => false), { timeout, message: 'realtime socket ulanmadi' })
    .toBe(true);
}

/** Chat sarlavhasidagi qo'ng'iroq tugmalari yoqilgan = socket ulangan va qo'ng'iroq mumkin (CS §10.9). */
export async function waitCallReady(page: Page, timeout = 30_000) {
  await expect(page.getByTestId('call-audio-button')).toBeEnabled({ timeout });
}

/** O'zbekcha matnlardagi apostrof (', ʼ, ‘, ’) qaysi biri bo'lishidan qat'iy nazar mos keladigan RegExp. */
export function uzRe(text: string, flags = ''): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['ʻʼ‘’]");
  return new RegExp(escaped, flags);
}

// ---- Qo'ng'iroq hook'lari (CS §9.6: window.__vocablyCall = { getPc, getState }) ----

export async function callStatus(page: Page): Promise<string | null> {
  return page.evaluate(() => (window as any).__vocablyCall?.getState?.()?.status ?? null).catch(() => null);
}

export async function pcState(page: Page): Promise<string | null> {
  return page.evaluate(() => (window as any).__vocablyCall?.getPc?.()?.connectionState ?? null).catch(() => null);
}

/** inbound-rtp `packetsReceived` yig'indisi (soxta mikrofon ~1 s jim — darajaga emas, paketlarga qaraymiz). */
export async function inboundPackets(page: Page, kind: 'audio' | 'video'): Promise<number> {
  return page
    .evaluate(async (k) => {
      const pc: RTCPeerConnection | undefined = (window as any).__vocablyCall?.getPc?.();
      if (!pc) return 0;
      let n = 0;
      (await pc.getStats()).forEach((r: any) => {
        if (r.type === 'inbound-rtp' && r.kind === k) n += r.packetsReceived || 0;
      });
      return n;
    }, kind)
    .catch(() => 0);
}

export const callStatusEl = (page: Page) => page.getByTestId('call-status');

/** Ikkala tomonda ham qo'ng'iroq `active` va RTCPeerConnection `connected`. */
export async function expectActive(...pages: Page[]) {
  for (const p of pages) {
    await expect(callStatusEl(p)).toHaveAttribute('data-state', 'active', { timeout: 20_000 });
    await expect.poll(() => pcState(p), { timeout: 20_000 }).toBe('connected');
  }
}

/** Overlay yopildi (idle'da CallOverlay hech narsa chizmaydi). */
export async function expectNoOverlay(page: Page, timeout = 5_000) {
  await expect(page.getByTestId('call-overlay')).toHaveCount(0, { timeout });
}

/**
 * `call-status` ning `data-state` qiymatlarini sahifa ichida yozib boradi (qisqa "reconnecting" holati
 * poll oralig'ida o'tib ketmasligi uchun). `seenStates(page)` yig'ilganini qaytaradi.
 */
export async function recordStates(page: Page) {
  await page.evaluate(() => {
    const w = window as any;
    w.__seenCallStates = [];
    const push = () => {
      const s = document.querySelector('[data-testid="call-status"]')?.getAttribute('data-state');
      if (s && w.__seenCallStates[w.__seenCallStates.length - 1] !== s) w.__seenCallStates.push(s);
    };
    push();
    new MutationObserver(push).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] });
  });
}

export async function seenStates(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as any).__seenCallStates || []);
}

import { expect, type Page } from '@playwright/test';
import { E2E_PASSWORD } from './global-setup';

// Login API'si raqam bo'yicha daqiqasiga 8 urinish bilan cheklangan (rate limit) — har test boshida qayta kirish bu chegarani
// tezda to'ldiradi. Shuning uchun har raqam uchun BIR marta kiramiz va sessiya cookie'sini keyingi testlarda qayta ishlatamiz
// (workers: 1 — modul holati barcha spec fayllar uchun umumiy).
type Cookies = Awaited<ReturnType<ReturnType<Page['context']>['cookies']>>;
const cache = new Map<string, Cookies>();

export async function loginAs(page: Page, phone: string, password = E2E_PASSWORD) {
  const cached = cache.get(phone);
  if (cached) {
    await page.context().addCookies(cached);
    return;
  }
  const res = await page.request.post('/api/auth/login', { data: { phone, password } });
  expect(res.ok(), await res.text()).toBeTruthy();
  cache.set(phone, await page.context().cookies());
}

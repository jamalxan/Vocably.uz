// To'liq sayt tekshiruvi: barcha statik sahifalar (fayl daraxtidan avtomatik) × rol (mehmon/foydalanuvchi/admin/o'qituvchi) × viewport.
// Tekshiriladi: JS xatolari (pageerror), 5xx javoblar, Next xato ekrani, gorizontal skroll, sarlavha/h1/lang. Konsol xatolari va 4xx
// ro'yxatga olinadi (hisobotga). Natija: test-results/crawl-<guruh>-<project>.json
import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_ADMIN_PHONE, E2E_PHONE, E2E_TEACHER_PHONE } from './global-setup';
import { loginAs } from './auth';

type Group = 'guest' | 'user' | 'admin' | 'teacher';

const APP = path.resolve('src/app');
const pageFiles: string[] = [];
(function walk(d: string) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'api') continue;
      walk(p);
    } else if (/^page\.(jsx|tsx|js)$/.test(e.name)) pageFiles.push(p);
  }
})(APP);

// Fayl yo'li -> URL (route guruhlari "(x)" tushiriladi). Dinamik segmentli sahifalar alohida namunalar bilan.
const SAMPLES: Record<string, string> = {
  '/oyinlar/[game]': '/app/oyinlar/multiple_choice',
  '/dashboard/[[...segments]]': '/dashboard',
};
const urls: string[] = [];
for (const f of pageFiles) {
  const rel = '/' + path.relative(APP, path.dirname(f)).split(path.sep).filter((s) => !/^\(.*\)$/.test(s)).join('/');
  const route = rel === '/.' ? '/' : rel;
  if (/\[/.test(route)) {
    const key = Object.keys(SAMPLES).find((k) => route.endsWith(k));
    if (key) urls.push(SAMPLES[key]);
    continue; // boshqa dinamik sahifalar (id kerak) — alohida testlarda
  }
  urls.push(route);
}
// Ma'lum dinamik namunalar
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SEO_WORDS } = require('../src/lib/seoWords');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BLOG_POSTS } = require('../src/lib/blogPosts');
urls.push(`/lugat/${SEO_WORDS[0].slug}`, `/blog/${BLOG_POSTS[0].slug}`);

const groupOf = (u: string): Group => (u.startsWith('/admin') ? 'admin' : u.startsWith('/teacher') ? 'teacher' : u.startsWith('/app') || u.startsWith('/dashboard') ? 'user' : 'guest');
const byGroup: Record<Group, string[]> = { guest: [], user: [], admin: [], teacher: [] };
for (const u of [...new Set(urls)].sort()) byGroup[groupOf(u)].push(u);

interface Finding {
  url: string;
  kind: string;
  detail: string;
}

async function visit(page: Page, url: string, findings: Finding[]) {
  const add = (kind: string, detail: string) => findings.push({ url, kind, detail: detail.slice(0, 300) });
  const onErr = (e: Error) => add('pageerror', e.message);
  const onConsole = (m: any) => {
    if (m.type() === 'error') add('console', m.text());
  };
  const onResponse = (r: any) => {
    const u = r.url();
    if (!u.startsWith('http://localhost')) return;
    const s = r.status();
    if (s >= 500) add('http5xx', `${s} ${new URL(u).pathname}`);
    else if (s >= 400 && !/_next\/(static|image)|favicon|sw\.js/.test(u)) add('http4xx', `${s} ${new URL(u).pathname}`);
  };
  page.on('pageerror', onErr);
  page.on('console', onConsole);
  page.on('response', onResponse);
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch((e) => {
      add('navigation', String(e.message));
      return null;
    });
    if (resp && resp.status() >= 500) add('http5xx', `${resp.status()} (sahifa)`);
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => add('slow', 'networkidle 20 s ichida kelmadi'));
    await page.waitForTimeout(400);
    // dev'dagi Fast Refresh / kech redirect sahifani qayta yuklashi mumkin ("Execution context was destroyed") — bir marta kutib qayta uriniladi.
    const evalInfo = () => page.evaluate(() => {
      const de = document.documentElement;
      const text = document.body?.innerText || '';
      return {
        overflowX: de.scrollWidth - window.innerWidth,
        title: document.title,
        lang: de.lang,
        h1: document.querySelectorAll('h1').length,
        appError: /Application error|Internal Server Error|This page could not be found|Unhandled Runtime Error/i.test(text),
        imgNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
        btnNoName: [...document.querySelectorAll('button')].filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title') && !b.querySelector('img[alt]')).length,
        path: location.pathname,
      };
    });
    const info = await evalInfo().catch(async () => {
      await page.waitForLoadState('load', { timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(800);
      return evalInfo();
    });
    if (info.appError) add('errorScreen', 'xato/404 matni ko\'rinadi');
    if (info.overflowX > 1) add('overflowX', `scrollWidth - innerWidth = ${info.overflowX}`);
    if (!info.title) add('a11y', 'document.title bo\'sh');
    if (!info.lang) add('a11y', '<html lang> yo\'q');
    if (info.h1 === 0) add('a11y', 'h1 yo\'q');
    if (info.imgNoAlt) add('a11y', `${info.imgNoAlt} ta <img> alt'siz`);
    if (info.btnNoName) add('a11y', `${info.btnNoName} ta tugma nomsiz`);
    if (info.path !== url) add('redirect', `-> ${info.path}`);
  } finally {
    page.off('pageerror', onErr);
    page.off('console', onConsole);
    page.off('response', onResponse);
  }
}

for (const group of ['guest', 'user', 'admin', 'teacher'] as Group[]) {
  test(`crawl: ${group} (${byGroup[group].length} sahifa)`, async ({ page }, testInfo) => {
    test.setTimeout(30 * 60_000);
    if (group === 'user') await loginAs(page, E2E_PHONE);
    if (group === 'admin') await loginAs(page, E2E_ADMIN_PHONE);
    if (group === 'teacher') await loginAs(page, E2E_TEACHER_PHONE);
    const findings: Finding[] = [];
    for (const url of byGroup[group]) await visit(page, url, findings);

    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(`test-results/crawl-${group}-${testInfo.project.name}.json`, JSON.stringify({ pages: byGroup[group], findings }, null, 1));
    const hard = findings.filter((f) => ['pageerror', 'http5xx', 'errorScreen', 'overflowX', 'navigation'].includes(f.kind));
    // eslint-disable-next-line no-console
    console.log(`[crawl ${group}/${testInfo.project.name}] sahifa=${byGroup[group].length} jiddiy=${hard.length} jami=${findings.length}`);
    expect(hard, JSON.stringify(hard, null, 1)).toEqual([]);
  });
}

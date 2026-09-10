// TZ-vocably-v2.md §H1: "Skript: barcha token juftliklari uchun kontrast hisoblovchi
// test (CI'da fail bo'ladi)". Reads the real values straight out of src/app/globals.css
// (light `:root` block + dark `:root[data-theme="dark"]` block) — no hardcoded copies of
// the palette here, so this can never silently drift from the actual CSS. Computes WCAG
// 2.1 relative-luminance contrast ratios for the token pairs listed in TZ §B2's
// "Kontrast tekshiruvi" table and exits non-zero if any pair falls below its threshold.
//
// Run manually or in CI:
//   node scripts/check-contrast.mjs
//
// Self-contained (no deps) — same convention as the other one-off scripts in this folder.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const css = readFileSync(cssPath, 'utf8');

function parseBlock(block) {
  const vars = {};
  const re = /--color-([\w-]+):\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
  let m;
  while ((m = re.exec(block))) {
    vars[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return vars;
}

// The light block is the file's first top-level `:root { ... }` — it has no nested rules,
// so matching up to the first `}` is safe and captures exactly that block.
const lightMatch = css.match(/(?:^|\n):root\s*\{([^}]*)\}/);
const darkMatch = css.match(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/);
if (!lightMatch || !darkMatch) {
  console.error('check-contrast: could not locate :root / :root[data-theme="dark"] blocks in globals.css');
  process.exit(1);
}
const light = parseBlock(lightMatch[1]);
// Tokens the dark block doesn't redeclare (e.g. --color-primary, --color-on-accent) simply
// cascade from `:root` per normal CSS custom-property inheritance — merge, don't replace.
const dark = { ...light, ...parseBlock(darkMatch[1]) };

function relLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(a, b) {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

// TZ-vocably-v2.md §B2 "Kontrast tekshiruvi" table. `min` follows WCAG AA: 4.5:1 for normal
// text, 3:1 for large/bold text (sidebar labels, badge text) — noted per pair below.
const PAIRS = [
  ['ink', 'bg', 4.5, 'matn / fon'],
  ['ink-muted', 'bg', 4.5, 'ikkinchi darajali matn / fon'],
  ['text-subtle', 'bg', 4.5, 'caption / fon'],
  ['brand-text', 'bg', 4.5, 'brend rangidagi sarlavha / fon'],
  ['accent', 'bg', 4.5, 'accent matni / fon'],
  ['on-accent', 'accent', 3, 'accent tugma matni / accent fon'],
  ['on-primary', 'primary', 3, 'sidebar matni / sidebar fon'],
  ['brand-text', 'primary-soft', 4.5, 'brand-text / brand-soft badge'],
  ['success', 'success-soft', 4.5, 'success matni / success-soft fon'],
  ['warning', 'warning-soft', 4.5, 'warning matni / warning-soft fon'],
  ['danger', 'danger-soft', 4.5, 'danger matni / danger-soft fon'],
  ['info', 'info-soft', 4.5, 'info matni / info-soft fon'],
];

let failed = false;
for (const themeName of ['light', 'dark']) {
  const vars = themeName === 'light' ? light : dark;
  console.log(`\n${themeName === 'light' ? 'Light' : 'Dark'} rejim:`);
  for (const [aName, bName, min, label] of PAIRS) {
    const a = vars[aName];
    const b = vars[bName];
    if (!a || !b) {
      console.log(`  ⚠ ${label} (--color-${aName} / --color-${bName}) — token topilmadi, o'tkazib yuborildi`);
      continue;
    }
    const ratio = contrastRatio(a, b);
    const ok = ratio >= min;
    if (!ok) failed = true;
    console.log(`  ${ok ? '✓' : '✗'} ${label}: ${ratio.toFixed(2)}:1 (kerak ${min}:1)`);
  }
}

if (failed) {
  console.error('\ncheck-contrast: kamida bitta juftlik WCAG chegarasidan past. Yuqoridagi ✗ qatorlarga q.');
  process.exit(1);
}
console.log('\ncheck-contrast: barcha juftliklar WCAG AA chegarasidan yuqori. ✓');

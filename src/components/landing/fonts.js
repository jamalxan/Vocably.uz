import localFont from 'next/font/local';

// Landing-page-only typography. These define NEW CSS variables
// (--font-landing-*) that are namespaced separately from the app-wide
// --font-body/--font-display (Poppins, src/app/layout.jsx) so the rest of
// the product (dashboard, auth, chat, exam) is completely unaffected — the
// variable classNames below are applied only on the landing page's root
// element in page.jsx, and CSS custom properties don't leak outside that
// subtree.
//
// Self-hosted (next/font/local) rather than next/font/google: the woff2
// files are fetched once (see font-files/ — basic Latin subset, which is
// all Uzbek Latin copy needs) and committed, so the build has no runtime
// dependency on Google Fonts' CDN being reachable. Falls back to the
// system sans/mono stack for any glyph outside Latin (e.g. Cyrillic), which
// is a graceful degradation rather than a build-time failure.
export const sora = localFont({
  src: [
    { path: './font-files/sora-500.woff2', weight: '500', style: 'normal' },
    { path: './font-files/sora-600.woff2', weight: '600', style: 'normal' },
    { path: './font-files/sora-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-landing-display',
  display: 'swap',
});

export const inter = localFont({
  src: [
    { path: './font-files/inter-400.woff2', weight: '400', style: 'normal' },
    { path: './font-files/inter-500.woff2', weight: '500', style: 'normal' },
    { path: './font-files/inter-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-landing-body',
  display: 'swap',
});

export const jetbrainsMono = localFont({
  src: [
    { path: './font-files/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: './font-files/jetbrains-mono-500.woff2', weight: '500', style: 'normal' },
    { path: './font-files/jetbrains-mono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-landing-mono',
  display: 'swap',
});

export const landingFontVariables = `${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`;

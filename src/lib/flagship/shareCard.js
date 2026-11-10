// 9:16 result card for the flagship games (TZ 2.0 §7: "9:16 formatda natija kartasini yuklab olish").
// cardModel() is pure (tested); drawCard() paints it on a 1080×1920 canvas in the browser —
// no server rendering, no upload. Only numbers and the game name go on the card (no user name).

export const CARD_W = 1080;
export const CARD_H = 1920;
export const CARD_URL = 'vocably.uz';

const GAMES = ['run', 'speak', 'tunnel', 'defense', 'orbit', 'island'];

const T = {
  uz: {
    run: { title: 'Vocably Run', unit: 'ball', stats: ["To'g'ri", 'Aniqlik', 'Kombo', 'Soniya'], cta: "Sen ham sinab ko'r" },
    speak: { title: 'Gapir yoki yiqil', unit: 'soniya chidadim', stats: ['Pauzalar', 'Eng uzun pauza', 'Filler', "So'z/daq"], cta: "Sen nechchi soniya chidaysan?" },
    tunnel: { title: "So'z tunneli", unit: 'ball', stats: ["To'g'ri", 'Aniqlik', 'Kombo', 'Harf/daq'], cta: "Sen ham sinab ko'r" },
    defense: { title: 'Word Defense', unit: 'ball', stats: ["Yo'q qilindi", 'Aniqlik', 'Kombo', 'Qolgan jon'], cta: 'Bazangni himoya qila olasanmi?' },
    orbit: { title: "So'z orbitasi", unit: 'ball', stats: ["To'g'ri", 'Aniqlik', 'Kombo', 'Soniya'], cta: "Sen ham sinab ko'r" },
    island: { title: "So'z oroli", unit: 'ball', stats: ['Mayoqlar', 'Aniqlik', 'Kombo', 'Soniya'], cta: 'Butun orolni yoqa olasanmi?' },
    allLit: 'Orol yondi!',
    win: 'G‘alaba!',
    fell: 'Yiqildim',
    stopped: "To'xtatdim",
    baseFell: 'Baza quladi',
    baseHeld: 'Baza saqlandi',
  },
  en: {
    run: { title: 'Vocably Run', unit: 'points', stats: ['Correct', 'Accuracy', 'Combo', 'Seconds'], cta: 'Can you beat it?' },
    speak: { title: 'Speak or Fall', unit: 'seconds survived', stats: ['Pauses', 'Longest pause', 'Fillers', 'Words/min'], cta: 'How long can you last?' },
    tunnel: { title: 'Word Tunnel', unit: 'points', stats: ['Correct', 'Accuracy', 'Combo', 'Chars/min'], cta: 'Can you beat it?' },
    defense: { title: 'Word Defense', unit: 'points', stats: ['Destroyed', 'Accuracy', 'Combo', 'HP left'], cta: 'Can you hold the base?' },
    orbit: { title: 'Word Orbit', unit: 'points', stats: ['Correct', 'Accuracy', 'Combo', 'Seconds'], cta: 'Can you beat it?' },
    island: { title: 'Word Island', unit: 'points', stats: ['Beacons', 'Accuracy', 'Combo', 'Seconds'], cta: 'Can you light the whole island?' },
    allLit: 'Island lit!',
    win: 'Made it!',
    fell: 'I fell',
    stopped: 'Stopped',
    baseFell: 'Base fell',
    baseHeld: 'Base held',
  },
  ru: {
    run: { title: 'Vocably Run', unit: 'очков', stats: ['Верно', 'Точность', 'Комбо', 'Секунды'], cta: 'Сможешь побить?' },
    speak: { title: 'Говори или падай', unit: 'секунд продержался', stats: ['Паузы', 'Самая длинная пауза', 'Филлеры', 'Слов/мин'], cta: 'Сколько продержишься ты?' },
    tunnel: { title: 'Туннель слов', unit: 'очков', stats: ['Верно', 'Точность', 'Комбо', 'Букв/мин'], cta: 'Сможешь побить?' },
    defense: { title: 'Word Defense', unit: 'очков', stats: ['Уничтожено', 'Точность', 'Комбо', 'Осталось HP'], cta: 'Удержишь базу?' },
    orbit: { title: 'Word Orbit', unit: 'очков', stats: ['Верно', 'Точность', 'Комбо', 'Секунды'], cta: 'Сможешь побить?' },
    island: { title: 'Word Island', unit: 'очков', stats: ['Маяки', 'Точность', 'Комбо', 'Секунды'], cta: 'Зажжёшь весь остров?' },
    allLit: 'Остров зажжён!',
    win: 'Получилось!',
    fell: 'Я упал',
    stopped: 'Остановил',
    baseFell: 'База пала',
    baseHeld: 'База устояла',
  },
};

/** Card content from a game result. `game`: 'run' | 'speak' | 'tunnel' | 'defense' | 'orbit' | 'island'. */
export function cardModel(game, result, locale = 'uz') {
  const t = T[locale] || T.uz;
  const g = GAMES.includes(game) ? t[game] : null;
  if (!g) throw new Error(`unknown game: ${game}`);
  if (game === 'tunnel' || game === 'defense') {
    const tunnel = game === 'tunnel';
    // A round the player ended (or whose session expired) neither held nor lost the base.
    const early = result.why === 'stopped' || result.why === 'expired';
    return {
      game,
      title: g.title,
      big: String(result.score ?? 0),
      unit: g.unit,
      badge: tunnel ? null : early ? t.stopped : (result.hp ?? 0) > 0 ? t.baseHeld : t.baseFell,
      badgeGood: !tunnel && !early && (result.hp ?? 0) > 0,
      stats: [
        [g.stats[0], String((tunnel ? result.correct : result.kills) ?? 0)],
        [g.stats[1], `${result.accuracy ?? 0}%`],
        [g.stats[2], `×${result.maxCombo ?? 0}`],
        [g.stats[3], String((tunnel ? result.cpm : result.hp) ?? 0)],
      ],
      pauses: null,
      cta: g.cta,
      url: `${CARD_URL}/games/${game}`,
      fileName: `vocably-${game}-${result.score ?? 0}.png`,
    };
  }
  if (game === 'island') {
    return {
      game,
      title: g.title,
      big: String(result.score ?? 0),
      unit: g.unit,
      badge: result.allLit ? t.allLit : null,
      badgeGood: Boolean(result.allLit),
      stats: [
        [g.stats[0], `${result.correct ?? 0}/${result.total ?? 0}`],
        [g.stats[1], `${result.accuracy ?? 0}%`],
        [g.stats[2], `×${result.maxCombo ?? 0}`],
        [g.stats[3], String(result.seconds ?? 0)],
      ],
      pauses: null,
      cta: g.cta,
      url: `${CARD_URL}/games/island`,
      fileName: `vocably-island-${result.score ?? 0}.png`,
    };
  }
  if (game === 'run' || game === 'orbit') {
    return {
      game,
      title: g.title,
      big: String(result.score ?? 0),
      unit: g.unit,
      badge: null,
      badgeGood: false,
      stats: [
        [g.stats[0], String(result.correct ?? 0)],
        [g.stats[1], `${result.accuracy ?? 0}%`],
        [g.stats[2], `×${result.maxCombo ?? 0}`],
        [g.stats[3], String(result.seconds ?? 0)],
      ],
      pauses: null,
      cta: g.cta,
      url: `${CARD_URL}/games/${game}`,
      fileName: `vocably-${game}-${result.score ?? 0}.png`,
    };
  }
  return {
    game,
    title: g.title,
    big: `${result.seconds ?? 0}`,
    unit: `/ 60 · ${g.unit}`,
    badge: result.survived ? t.win : result.stopped ? t.stopped : t.fell,
    badgeGood: Boolean(result.survived),
    stats: [
      [g.stats[0], String(result.pauses ?? 0)],
      [g.stats[1], `${result.longestPauseSec ?? 0}s`],
      [g.stats[2], result.asr ? String(result.fillers?.total ?? 0) : '—'],
      [g.stats[3], result.asr && result.wpm ? String(result.wpm) : '—'],
    ],
    // Pause map as fractions of the minute, for the timeline strip.
    pauses: (result.pausesList || []).map((p) => [Math.max(0, p.startMs / 60_000), Math.min(1, p.endMs / 60_000)]),
    cta: g.cta,
    url: `${CARD_URL}/games/speak`,
    fileName: `vocably-speak-${result.seconds ?? 0}s.png`,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fitFont(ctx, text, weight, start, maxWidth, family) {
  let size = start;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 6;
  } while (size > 24 && ctx.measureText(text).width > maxWidth);
}

/** Paints the card. `logo` is an optional loaded HTMLImageElement. */
export function drawCard(ctx, model, { logo = null, family = 'system-ui, -apple-system, "Segoe UI", sans-serif' } = {}) {
  const W = CARD_W;
  const H = CARD_H;
  const accent = '#e0566a';

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1b2350');
  bg.addColorStop(1, '#0b1020');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, W * 0.9);
  glow.addColorStop(0, 'rgba(224,86,106,.45)');
  glow.addColorStop(1, 'rgba(224,86,106,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // perspective lanes (Run) / cliff line (Speak) as a quiet motif
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  if (model.game === 'run') {
    for (const dx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + dx * 60, 1560);
      ctx.lineTo(W / 2 + dx * 560, H);
      ctx.stroke();
    }
  } else if (model.game === 'tunnel') {
    // nested frames receding to a vanishing point
    for (let i = 0; i < 5; i++) {
      const s = 760 - i * 150;
      roundRect(ctx, W / 2 - s / 2, 1600 - s / 4, s, s / 2, 40);
      ctx.stroke();
    }
  } else if (model.game === 'island') {
    // an island on the horizon with its tower
    ctx.beginPath();
    ctx.moveTo(0, 1680);
    ctx.lineTo(W, 1680);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W / 2, 1680, 360, 70, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 26, 1612);
    ctx.lineTo(W / 2 - 16, 1440);
    ctx.lineTo(W / 2 + 16, 1440);
    ctx.lineTo(W / 2 + 26, 1612);
    ctx.stroke();
  } else if (model.game === 'orbit') {
    // two orbits and a planet
    for (const [rx, ry] of [
      [460, 150],
      [300, 96],
    ]) {
      ctx.beginPath();
      ctx.ellipse(W / 2, 1640, rx, ry, -0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(W * 0.8, 1560, 44, 0, Math.PI * 2);
    ctx.stroke();
  } else if (model.game === 'defense') {
    // a reticle over the horizon
    ctx.beginPath();
    ctx.moveTo(0, 1640);
    ctx.lineTo(W, 1640);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W * 0.78, 1640, 120, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, H * 0.86);
    ctx.lineTo(W * 0.78, H * 0.86);
    ctx.lineTo(W * 0.82, H);
    ctx.stroke();
  }
  ctx.restore();

  // header
  const pad = 96;
  if (logo) ctx.drawImage(logo, pad, 120, 82, 96);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `800 52px ${family}`;
  ctx.fillText('vocably', pad + (logo ? 104 : 0), 190);

  ctx.fillStyle = accent;
  ctx.font = `800 40px ${family}`;
  ctx.fillText(model.title.toUpperCase(), pad, 420);

  if (model.badge) {
    ctx.font = `800 40px ${family}`;
    const bw = ctx.measureText(model.badge).width + 64;
    roundRect(ctx, pad, 470, bw, 80, 40);
    ctx.fillStyle = model.badgeGood ? '#22c55e' : 'rgba(255,255,255,.14)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(model.badge, pad + 32, 524);
  }

  // big number
  ctx.fillStyle = '#ffffff';
  fitFont(ctx, model.big, 900, 340, W - pad * 2, family);
  ctx.fillText(model.big, pad - 8, 900);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  fitFont(ctx, model.unit, 700, 56, W - pad * 2, family);
  ctx.fillText(model.unit, pad, 990);

  // stats 2×2
  const gw = (W - pad * 2 - 32) / 2;
  model.stats.forEach(([label, value], i) => {
    const x = pad + (i % 2) * (gw + 32);
    const y = 1080 + Math.floor(i / 2) * 232;
    roundRect(ctx, x, y, gw, 200, 36);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    fitFont(ctx, value, 800, 84, gw - 64, family);
    ctx.fillText(value, x + 40, y + 112);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    fitFont(ctx, label, 600, 36, gw - 64, family);
    ctx.fillText(label, x + 40, y + 164);
  });

  // pause map strip (Speak)
  if (model.pauses) {
    const y = 1572;
    roundRect(ctx, pad, y, W - pad * 2, 44, 22);
    ctx.fillStyle = 'rgba(34,197,94,.35)';
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    for (const [a, b] of model.pauses) {
      const x0 = pad + a * (W - pad * 2);
      ctx.fillRect(x0, y, Math.max(8, (b - a) * (W - pad * 2)), 44);
    }
  }

  // footer CTA
  ctx.fillStyle = '#ffffff';
  fitFont(ctx, model.cta, 800, 56, W - pad * 2, family);
  ctx.fillText(model.cta, pad, 1740);
  ctx.fillStyle = accent;
  ctx.font = `700 44px ${family}`;
  ctx.fillText(model.url, pad, 1810);
}

/** Browser: renders the card to a PNG Blob. */
export async function renderCardBlob(model) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  const logo = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/brand/mark-dark.svg';
  });
  try {
    await document.fonts?.ready;
  } catch { /* fonts API missing — system font is fine */ }
  drawCard(ctx, model, { logo });
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}

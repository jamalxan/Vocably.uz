'use client';

import React, { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { ArrowLeft, Compass, Lock, MapPin, X } from 'lucide-react';
import { useT } from '@/context/LocaleContext';
import { getGames, getGamificationProfile } from './api';
import { StarterIsland3D } from './world/StarterIsland3D';
import { PlayerHero3D } from './world/PlayerHero3D';
import { TouchJoystick } from './world/TouchJoystick';
import { BRIDGE, DOCK, PORTALS, SHORE, SPAWN, VILLAGE } from './world/worldLayout';

/* Vocabulary World — 3D hub. Portallar mavjud server-authoritative o'yinlarga
   (/app/games/:key) olib boradi: savollar, ball, XP va kunlik limit o'sha yerda
   hisoblanadi. Bu yerda klient hech qanday XP/ball o'zi yozmaydi. */

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.error('[vocabulary-world] 3D sahna ishga tushmadi', err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Minimap: dunyo koordinatalari (x, z) -> SVG (0..100).
const MAP = { minX: -30, maxX: 30, minZ: -38, maxZ: 28 };
const mx = (x) => ((x - MAP.minX) / (MAP.maxX - MAP.minX)) * 100;
const mz = (z) => ((z - MAP.minZ) / (MAP.maxZ - MAP.minZ)) * 100;
const mr = (r) => (r / (MAP.maxX - MAP.minX)) * 100;

function Minimap({ positionRef, activeKey, label }) {
  const markerRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = positionRef.current;
      if (p && markerRef.current) {
        const deg = 180 - (p.rot * 180) / Math.PI;
        markerRef.current.setAttribute('transform', `translate(${mx(p.x)} ${mz(p.z)}) rotate(${deg})`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positionRef]);

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden bg-sky-900/80 backdrop-blur-md">
      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={label}>
        <circle cx={mx(SHORE.x)} cy={mz(SHORE.z)} r={mr(SHORE.radius)} fill="#4ade80" opacity="0.85" />
        <circle cx={mx(VILLAGE.x)} cy={mz(VILLAGE.z)} r={mr(VILLAGE.radius)} fill="#22c55e" opacity="0.85" />
        <rect x={mx(BRIDGE.minX)} y={mz(BRIDGE.minZ)} width={mx(BRIDGE.maxX) - mx(BRIDGE.minX)} height={mz(BRIDGE.maxZ) - mz(BRIDGE.minZ)} fill="#92400e" />
        <rect x={mx(DOCK.minX)} y={mz(DOCK.minZ)} width={mx(DOCK.maxX) - mx(DOCK.minX)} height={mz(DOCK.maxZ) - mz(DOCK.minZ)} fill="#92400e" />
        {PORTALS.map((p) => (
          <circle key={p.key} cx={mx(p.x)} cy={mz(p.z)} r={activeKey === p.key ? 4 : 2.6} fill={p.color} stroke="#fff" strokeWidth="0.8" />
        ))}
        <g ref={markerRef} transform={`translate(${mx(SPAWN.x)} ${mz(SPAWN.z)})`}>
          <path d="M0,-4.5 L3.2,3.5 L0,1.8 L-3.2,3.5 Z" fill="#fff" stroke="#0f172a" strokeWidth="0.8" />
        </g>
      </svg>
      <div className="absolute top-0.5 inset-x-0 text-center text-[9px] font-black text-white drop-shadow">N</div>
    </div>
  );
}

function WorldFallback({ games, ts, t }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950">
      <div className="max-w-md w-full bg-slate-900 border border-white/15 rounded-3xl p-6 text-white shadow-2xl">
        <h2 className="text-lg font-extrabold">{t('world.webglTitle')}</h2>
        <p className="text-sm text-slate-300 mt-1">{t('world.webglBody')}</p>
        <ul className="mt-4 grid gap-2">
          {PORTALS.map((p) => {
            const g = games[p.key];
            return (
              <li key={p.key}>
                <Link
                  href={`/app/games/${p.key}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} aria-hidden="true" />
                  <span className="text-sm font-semibold">{g ? ts(g.title) : p.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function GameClient() {
  const router = useRouter();
  const { t, ts } = useT();
  const [profile, setProfile] = useState(null);
  const [gamesByKey, setGamesByKey] = useState({});
  const [loadError, setLoadError] = useState('');
  const [nearKey, setNearKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [webgl, setWebgl] = useState(true);
  const joystickRef = useRef({ x: 0, y: 0 });
  const sprintRef = useRef(false);
  const positionRef = useRef({ x: SPAWN.x, z: SPAWN.z, rot: Math.PI });

  useEffect(() => {
    setWebgl(hasWebGL());
    let cancelled = false;
    Promise.all([getGamificationProfile(), getGames()])
      .then(([p, g]) => {
        if (cancelled) return;
        setProfile(p);
        setGamesByKey(Object.fromEntries((g?.games || []).map((x) => [x.key, x])));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.code === 'feature_disabled' ? t('hub.featureDisabled') : t('world.profileError'));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- faqat bir marta yuklanadi
  }, []);

  // Yaqin portal ustunlik qiladi; yo'q bo'lsa — sichqoncha bilan bosilgan portal.
  const activeKey = nearKey || selectedKey;
  const activePortal = useMemo(() => PORTALS.find((p) => p.key === activeKey) || null, [activeKey]);
  const activeGame = activePortal ? gamesByKey[activePortal.key] : null;
  const locked = !!activeGame && (!activeGame.unlocked || !activeGame.available);
  const lockedReason = activeGame ? ts(!activeGame.unlocked ? activeGame.lockedReason : activeGame.unavailableReason) : '';

  const enterPortal = useCallback(() => {
    if (activePortal) router.push(`/app/games/${activePortal.key}`);
  }, [activePortal, router]);

  const handleNearPortalChange = useCallback((key) => {
    setNearKey(key);
    if (key) setSelectedKey(null);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if ((e.code === 'KeyE' || e.code === 'Enter') && activePortal && tag !== 'button' && tag !== 'a') {
        e.preventDefault();
        enterPortal();
      } else if (e.code === 'Escape') {
        setSelectedKey(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePortal, enterPortal]);

  // Sahifadan chiqqanda portal ustida qolgan "pointer" kursorini tiklash.
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  const level = profile?.level;
  const levelPct = level ? Math.round((level.progress || 0) * 100) : 0;
  const fallback = <WorldFallback games={gamesByKey} ts={ts} t={t} />;

  return (
    <div className="fixed inset-0 overflow-hidden bg-sky-300 select-none font-sans">
      {webgl ? (
        <CanvasErrorBoundary fallback={fallback}>
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [SPAWN.x, 4.35, SPAWN.z + 5.8], fov: 52 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            className="!absolute inset-0"
          >
            <color attach="background" args={['#7dd3fc']} />
            <fog attach="fog" args={['#bae6fd', 45, 150]} />
            <ambientLight intensity={0.8} />
            <hemisphereLight args={['#38bdf8', '#166534', 0.6]} />
            <directionalLight
              position={[25, 35, 20]}
              intensity={1.6}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-near={0.5}
              shadow-camera-far={120}
              shadow-camera-left={-40}
              shadow-camera-right={40}
              shadow-camera-top={40}
              shadow-camera-bottom={-40}
            />
            <StarterIsland3D activePortalKey={activeKey} onPortalSelect={setSelectedKey} />
            <PlayerHero3D
              joystickRef={joystickRef}
              sprintRef={sprintRef}
              positionRef={positionRef}
              onNearPortalChange={handleNearPortalChange}
            />
          </Canvas>
        </CanvasErrorBoundary>
      ) : (
        fallback
      )}

      {/* YUQORI-CHAP: xarita va hudud */}
      <div className="absolute top-4 left-4 z-20 flex items-start gap-3">
        <Minimap positionRef={positionRef} activeKey={activeKey} label={t('world.minimap')} />
        <div className="hidden sm:flex bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 text-white shadow-xl items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Compass size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-wide">{t('world.zone')}</div>
            <div className="text-[10px] text-sky-300 font-medium">{t('world.tagline')}</div>
          </div>
        </div>
      </div>

      {/* YUQORI-O'NG: daraja/XP (serverdan) va chiqish */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:gap-3">
        {level && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl px-3 sm:px-4 py-2 text-white shadow-2xl">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span className="px-1.5 bg-sky-500/30 text-sky-300 rounded font-semibold">{t('world.level', { n: level.level })}</span>
              <span className="hidden sm:inline">{ts(level.name)}</span>
            </div>
            <div
              className="w-24 sm:w-28 h-1.5 bg-black/50 rounded-full overflow-hidden mt-1.5 border border-white/10"
              role="progressbar"
              aria-valuenow={levelPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('world.xpProgress')}
            >
              <div className="h-full bg-sky-400 rounded-full" style={{ width: `${levelPct}%` }} />
            </div>
            <div className="text-[10px] text-amber-300 font-extrabold mt-1">{profile.xp} XP</div>
          </div>
        )}
        <Link
          href="/app/games"
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label={t('world.exit')}
          title={t('world.exit')}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
      </div>

      {/* CHAP: portallar ro'yxati (faqat katta ekranda — mobilda xarita yetarli) */}
      <div className="hidden md:block absolute top-36 left-4 z-20 w-64 bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <MapPin size={14} className="text-amber-400" aria-hidden="true" />
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">{t('world.questTitle')}</div>
        </div>
        <p className="text-xs text-slate-300 leading-snug">{t('world.questHint')}</p>
        <ul className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
          {PORTALS.map((p) => {
            const g = gamesByKey[p.key];
            const isLocked = !!g && (!g.unlocked || !g.available);
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(p.key)}
                  className={`w-full flex items-center gap-2 text-left text-xs rounded-lg px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${activeKey === p.key ? 'bg-white/15' : 'hover:bg-white/10'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} aria-hidden="true" />
                  <span className="flex-1 truncate">{g ? ts(g.title) : p.title}</span>
                  {isLocked && <Lock size={12} className="text-slate-400" aria-label={t('world.locked')} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {loadError && (
        <div role="status" className="absolute top-32 md:top-auto md:bottom-28 left-1/2 -translate-x-1/2 z-20 max-w-[90vw] px-4 py-2 rounded-xl bg-amber-500/90 text-amber-950 text-xs font-semibold shadow-lg">
          {loadError}
        </div>
      )}

      {/* PORTAL PANELI */}
      {activePortal && (
        <div
          role="dialog"
          aria-labelledby="world-portal-title"
          className="absolute left-1/2 -translate-x-1/2 bottom-40 sm:bottom-auto sm:top-28 sm:left-auto sm:translate-x-0 sm:right-6 z-30 w-[min(20rem,calc(100vw-2rem))] bg-slate-950/90 backdrop-blur-xl border border-white/20 rounded-3xl p-5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: activePortal.color }} aria-hidden="true" />
              <h2 id="world-portal-title" className="text-lg font-black tracking-tight truncate">
                {activeGame ? ts(activeGame.title) : activePortal.title}
              </h2>
            </div>
            {!nearKey && (
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label={t('world.close')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {activeGame?.description && <p className="text-xs text-slate-300 mt-2 leading-snug">{ts(activeGame.description)}</p>}
          {locked && lockedReason && <p className="text-[11px] text-amber-300 mt-2">{lockedReason}</p>}
          <button
            type="button"
            onClick={enterPortal}
            className="mt-4 w-full py-2.5 rounded-2xl bg-[#00f0b5] hover:bg-[#00d6a2] text-[#0a0b2e] font-extrabold text-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center gap-2"
          >
            {locked ? t('world.details') : t('world.enter')}
            <kbd className="hidden sm:inline px-1.5 rounded bg-[#0a0b2e]/15 text-[11px] font-bold">E</kbd>
          </button>
        </div>
      )}

      {/* PAST-CHAP: joystik */}
      <div className="absolute bottom-6 left-6 z-20">
        <TouchJoystick valueRef={joystickRef} label={t('world.joystick')} />
      </div>

      {/* PAST-MARKAZ: boshqaruv bo'yicha maslahat */}
      <div className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/15 text-[11px] text-white/90 font-medium pointer-events-none whitespace-nowrap">
        {t('world.controls')}
      </div>

      {/* PAST-O'NG: yugurish (bosib turiladi) */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          type="button"
          aria-label={t('world.sprint')}
          title={t('world.sprint')}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            sprintRef.current = true;
          }}
          onPointerUp={() => { sprintRef.current = false; }}
          onPointerCancel={() => { sprintRef.current = false; }}
          onLostPointerCapture={() => { sprintRef.current = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-16 h-16 rounded-full bg-slate-900/80 active:bg-emerald-600 border-2 border-white/60 backdrop-blur-md shadow-2xl flex items-center justify-center text-2xl touch-none transition-colors"
        >
          <span aria-hidden="true">🏃</span>
        </button>
      </div>
    </div>
  );
}

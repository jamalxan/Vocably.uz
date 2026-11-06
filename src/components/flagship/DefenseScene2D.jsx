'use client';
import { memo, useEffect, useRef } from 'react';

// Word Defense without WebGL (no WebGL2, reduced motion, a slow device, or a scene error): the same
// lane drawn with DOM. Which enemies exist comes from the controller's HUD list (changes a few times
// a second); where they are comes from sceneRef in this component's own rAF, so React never
// re-renders per frame and the controller loop stays the single source of truth.

const LEFT = ['12.5%', '37.5%', '62.5%', '87.5%'];
const TONE = {
  walk: 'bg-violet-500 border-violet-200 text-white',
  pending: 'bg-white border-white text-[#0b1020] animate-pulse',
  revealed: 'bg-rose-500 border-rose-200 text-white',
  dead: 'bg-emerald-400 border-emerald-100 text-white scale-150 opacity-0',
  lost: 'bg-slate-500 border-slate-300 text-white opacity-0',
  breach: 'bg-rose-600 border-rose-200 text-white scale-50 opacity-0',
};

function DefenseScene2D({ sceneRef, enemies = [], targetId = null, running = false, hitKey = 0 }) {
  const root = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    let id;
    const loop = () => {
      const el = root.current;
      const list = sceneRef.current.enemies || [];
      if (el) {
        for (const node of el.querySelectorAll('[data-enemy]')) {
          const e = list.find((x) => String(x.id) === node.dataset.enemy);
          if (e) node.style.top = `${4 + Math.min(1, Math.max(0, e.progress || 0)) * 78}%`;
        }
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, sceneRef]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-[#070a18]" aria-hidden="true">
      <div className="absolute inset-x-3 top-0 bottom-0 grid grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`border-white/10 ${i < 3 ? 'border-r' : ''} bg-gradient-to-b from-transparent to-violet-500/[0.06]`} />
        ))}
      </div>
      <div
        key={hitKey}
        className={`absolute inset-x-0 bottom-0 h-[12%] border-t-2 ${hitKey ? 'border-rose-400 bg-rose-500/25 motion-safe:animate-[pulse_0.5s_ease-out_1]' : 'border-violet-400/70 bg-violet-500/10'}`}
      />
      {enemies.map((e) => (
        <div key={e.id} data-enemy={e.id} className="absolute -translate-x-1/2" style={{ left: LEFT[e.slot] || '50%' }}>
          <span
            className={`grid place-items-center w-9 h-9 rounded-full border-2 text-sm font-black shadow-[0_0_16px_rgba(167,139,250,.55)] transition-[transform,opacity] duration-300 ${TONE[e.state] || TONE.walk} ${e.id === targetId && (e.state === 'walk' || e.state === 'revealed') ? 'ring-4 ring-amber-300/85' : ''}`}
          >
            {e.slot + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export default memo(DefenseScene2D);

'use client';

import React, { useRef, useState } from 'react';

/**
 * Virtual joystik (sensorli ekran va sichqoncha). Qiymat `valueRef.current = {x, y}`
 * ga yoziladi (-1..1) — 3D sikl uni har kadrda o'qiydi, React qayta render qilinmaydi.
 * Pointer capture: barmoq doiradan chiqib ketsa ham boshqaruv uzilmaydi.
 */
export function TouchJoystick({ valueRef, label = 'Joystick', size = 112 }) {
  const containerRef = useRef(null);
  const pointerId = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const travel = size * 0.32;

  const update = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const maxRadius = rect.width / 2;
    const dist = Math.min(Math.hypot(dx, dy), maxRadius);
    const angle = Math.atan2(dy, dx);
    const x = (Math.cos(angle) * dist) / maxRadius;
    const y = (Math.sin(angle) * dist) / maxRadius;
    if (valueRef) valueRef.current = { x, y };
    setKnob({ x, y });
  };

  const release = () => {
    pointerId.current = null;
    if (valueRef) valueRef.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={label}
      onPointerDown={(e) => {
        pointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        if (pointerId.current === e.pointerId) update(e);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      style={{ width: size, height: size }}
      className="rounded-full bg-slate-900/60 border-2 border-white/30 backdrop-blur-md relative flex items-center justify-center touch-none select-none pointer-events-auto shadow-2xl"
    >
      <div
        className={`w-12 h-12 rounded-full shadow-lg border-2 border-white/80 ${pointerId.current != null ? 'bg-emerald-400' : 'bg-white/40'}`}
        style={{ transform: `translate(${knob.x * travel}px, ${knob.y * travel}px)` }}
      />
    </div>
  );
}

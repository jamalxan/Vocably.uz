'use client';
import { useRef, useState } from 'react';
import { Clock, Flag } from 'lucide-react';
import Tilt3DCard from './Tilt3DCard';
import useRevealOnScroll from './useRevealOnScroll';

// Brief §19 — one of the landing's strongest sections: a mock-test product
// interface close to the real IELTS CD atmosphere (timer, tabs, progress,
// score), not a marketing illustration.
const TABS = ['Listening', 'Reading', 'Writing', 'Speaking'];

export default function MockSection() {
  const headingRef = useRef(null);
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Reading');

  useRevealOnScroll(headingRef, { y: 24 });
  useRevealOnScroll(panelRef, { y: 32, delay: 0.1 });

  return (
    <section className="relative px-4 sm:px-6 py-20 sm:py-28 bg-surface border-y border-border">
      <div className="max-w-2xl mx-auto text-center mb-12" ref={headingRef}>
        <p className="font-landing-mono text-xs tracking-widest text-accent uppercase mb-3">IELTS Mock</p>
        <h2 className="font-landing-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">
          Haqiqiy imtihon atmosferasi
        </h2>
      </div>

      <div ref={panelRef} className="max-w-2xl mx-auto">
        <Tilt3DCard max={3}>
          <div className="bg-bg border border-border rounded-2xl shadow-premium overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-surface">
              <div className="flex items-center gap-1.5 font-landing-mono text-sm font-medium text-ink">
                <Clock size={14} className="text-accent" /> 58:32
              </div>
              <span className="font-landing-mono text-xs text-muted">12 / 40</span>
              <button type="button" tabIndex={-1} aria-hidden="true" className="flex items-center gap-1 text-xs font-landing-body text-muted">
                <Flag size={13} /> Belgilash
              </button>
            </div>

            <div className="flex border-b border-border overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-[13px] font-landing-body font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5">
              <div className="h-1.5 rounded-full bg-border overflow-hidden mb-4">
                <div className="h-full w-[30%] rounded-full bg-accent" />
              </div>
              <p className="text-[13px] font-landing-body text-ink leading-relaxed mb-4">
                Read the passage and choose the correct heading for paragraph 3. Consider the main idea rather than
                individual details.
              </p>
              <div className="space-y-2">
                {['A tarixiy kontekst', 'B iqtisodiy ta\'sir', 'C texnologik yechim'].map((opt, i) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] font-landing-body cursor-default ${
                      i === 1 ? 'border-accent bg-accent-soft text-ink' : 'border-border text-muted'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border flex-shrink-0 ${i === 1 ? 'border-accent bg-accent' : 'border-border-strong'}`}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Tilt3DCard>
      </div>
    </section>
  );
}

import { Mic } from 'lucide-react';
import Tilt3DCard from '../Tilt3DCard';

const METRICS = [
  { label: 'Pronunciation', value: 82 },
  { label: 'Fluency', value: 76 },
  { label: 'Grammar', value: 88 },
  { label: 'Vocabulary', value: 91 },
];

const VOICE_BARS = [0.4, 0.7, 1, 0.55, 0.85, 0.3, 0.6, 0.9, 0.45, 0.7];

// Brief §15 — the most "premium AI interaction" card: mic, voice waveform,
// per-criterion AI analysis.
export default function SpeakingCard() {
  return (
    <Tilt3DCard className="h-full">
      <div className="h-full bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <Mic size={17} />
          </div>
          <h3 className="font-landing-display text-lg font-semibold text-ink">Speaking</h3>
        </div>

        <div className="flex items-center justify-center gap-3 bg-bg border border-border rounded-xl py-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-accent text-on-accent flex items-center justify-center shadow-glow">
            <Mic size={18} />
          </div>
          <div className="flex items-end gap-[3px] h-7" aria-hidden="true">
            {VOICE_BARS.map((h, i) => (
              <span
                key={i}
                className="landing-waveform-bar w-[3px] rounded-full bg-accent/70"
                style={{ height: '100%', transform: `scaleY(${h})`, transformOrigin: 'bottom', animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-landing-body text-muted">{m.label}</span>
                <span className="text-xs font-landing-mono font-medium text-ink">{m.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Tilt3DCard>
  );
}

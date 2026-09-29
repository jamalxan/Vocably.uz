import { Ear, Play } from 'lucide-react';
import Tilt3DCard from '../Tilt3DCard';

const BAR_HEIGHTS = [0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1, 0.5, 0.65, 0.35, 0.75, 0.45, 0.85, 0.3, 0.6];

// Brief §14 — audio waveform, play button, listening progress.
export default function ListeningCard() {
  return (
    <Tilt3DCard className="h-full">
      <div className="h-full bg-surface border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <Ear size={17} />
          </div>
          <h3 className="font-landing-display text-lg font-semibold text-ink">Listening</h3>
        </div>

        <div className="bg-bg border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-accent text-on-accent flex items-center justify-center flex-shrink-0 shadow-glow"
            >
              <Play size={15} fill="currentColor" />
            </button>
            <div className="flex items-end gap-[3px] h-9 flex-1" aria-hidden="true">
              {BAR_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="landing-waveform-bar w-full rounded-full"
                  style={{
                    height: '100%',
                    transform: `scaleY(${h})`,
                    transformOrigin: 'bottom',
                    animationDelay: `${i * 70}ms`,
                    background: i < 6 ? 'rgb(var(--color-accent))' : 'rgb(var(--color-border-strong))',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] font-landing-mono text-muted">
            <span>0:14</span>
            <span>0:42</span>
          </div>
          <div className="h-1 rounded-full bg-border mt-1.5 overflow-hidden">
            <div className="h-full w-[35%] rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </Tilt3DCard>
  );
}

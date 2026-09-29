import React, { useState } from 'react';
import {
  Compass,
  FileCode2,
  Palette,
  Terminal,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Clock,
  Zap,
  Code,
  Layers,
  Cpu
} from 'lucide-react';
import { RoadmapSkeleton } from './SkeletonLoader';

const ICON_MAP = {
  Compass,
  FileCode2,
  Palette,
  Terminal,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Clock,
  Zap,
  Code,
  Layers,
  Cpu
};

export default function ProcessRoadmap({ steps = [], loading = false }) {
  const [activeStep, setActiveStep] = useState(0);

  if (loading) {
    return <RoadmapSkeleton />;
  }

  if (!steps || steps.length === 0) {
    return null;
  }

  const current = steps[Math.min(activeStep, steps.length - 1)] || steps[0];
  const StepIcon = (typeof current.icon === 'string' ? ICON_MAP[current.icon] : current.icon) || Terminal;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber/30 bg-amber/10 text-amber font-mono text-xs mb-3">
          <Clock size={13} />
          <span>The Engineering Blueprint</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-3">
          How We Take Your Project From <span className="text-amber">Idea to Production</span>
        </h2>
        <p className="text-sm text-muted font-sans">
          A disciplined, battle-tested {steps.length}-stage roadmap designed for transparency, speed, and zero wasted hours.
        </p>
      </div>

      {/* Step Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
        {steps.map((st, idx) => {
          const Icon = (typeof st.icon === 'string' ? ICON_MAP[st.icon] : st.icon) || Terminal;
          const isActive = activeStep === idx;
          const displayNum = st.num || `0${idx + 1}`;
          const displayTitle = st.title ? st.title.split(' ')[0] : `Stage ${idx + 1}`;

          return (
            <button
              key={st.num || idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-amber/15 border-amber text-text shadow-glow-amber/20 ring-1 ring-amber/50'
                  : 'bg-surface2/40 border-border text-muted hover:border-border hover:text-text'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-xs font-bold ${isActive ? 'text-amber' : 'text-muted'}`}>
                  {displayNum}
                </span>
                <Icon size={14} className={isActive ? 'text-amber' : 'text-cyan'} />
              </div>
              <p className="font-display text-xs font-semibold truncate text-text">{displayTitle}</p>
              {st.timeframe && (
                <span className="text-[10px] font-mono text-muted block truncate mt-0.5">{st.timeframe}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase */}
      <div className="rounded-xl border border-border/80 bg-surface2/60 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Summary */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/30 text-amber flex items-center justify-center font-display font-bold text-base">
                {current.num || `0${activeStep + 1}`}
              </span>
              <div>
                {current.timeframe && (
                  <span className="font-mono text-xs text-amber font-semibold block">{current.timeframe}</span>
                )}
                <h3 className="font-display text-xl sm:text-2xl font-bold text-text">
                  {current.title}
                </h3>
              </div>
            </div>

            {current.tagline && (
              <p className="text-sm text-text/90 font-sans leading-relaxed">
                {current.tagline}
              </p>
            )}

            {current.clientAction && (
              <div className="p-4 rounded-lg bg-surface border border-border/80 text-xs font-mono">
                <span className="text-cyan block mb-1 font-semibold">// Client Touchpoint:</span>
                <p className="text-muted font-sans">{current.clientAction}</p>
              </div>
            )}
          </div>

          {/* Right Deliverables Checklist */}
          {current.deliverables && current.deliverables.length > 0 && (
            <div className="lg:col-span-6 space-y-3">
              <p className="font-mono text-xs text-green uppercase tracking-wider font-semibold">
                Stage Deliverables & Outputs:
              </p>
              <div className="space-y-2.5">
                {current.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60 text-xs font-mono text-text">
                    <CheckCircle2 size={15} className="text-green shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

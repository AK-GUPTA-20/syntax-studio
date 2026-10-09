import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Clock, Sparkles, Tag } from 'lucide-react';

export default function ServiceCard({ service }) {
  const {
    code = '01',
    title,
    shortDescription,
    problemsSolved = [],
    deliverables = [],
    technologies = [],
    typicalTimeline,
    priceLabel,
    price,
    enabled
  } = service;
  
  const displayPrice = priceLabel ? priceLabel : price ? `Starting from ₹${Number(price).toLocaleString('en-IN')}` : null;

  return (
    <div className="rounded-2xl border border-border bg-surface hover:border-cyan/40 p-6 sm:p-8 hover-lift flex flex-col justify-between transition-all duration-300 relative group overflow-hidden shadow-lg">
      {/* Ambient hover glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan/10 transition-colors" />

      <div>
        {/* Header with service index and timeline */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber font-semibold px-2.5 py-1 rounded-md bg-amber/10 border border-amber/30">
              // {code}
            </span>
            {enabled === false && (
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider px-2 py-0.5 rounded bg-surface2 border border-border">
                Unavailable
              </span>
            )}
          </div>
          {typicalTimeline && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted bg-surface2/60 px-2.5 py-1 rounded-md border border-border/50">
              <Clock size={12} className="text-cyan" />
              <span>{typicalTimeline}</span>
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl font-bold text-text group-hover:text-amber transition-colors mb-2">
          {title}
        </h3>
        
        {displayPrice && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber font-mono text-xs font-bold shadow-sm">
            <Tag size={12} />
            <span>{displayPrice}</span>
          </div>
        )}

        <p className="text-sm text-muted leading-relaxed mb-6 font-sans">
          {shortDescription}
        </p>

        {/* Deliverables checklist if available */}
        {deliverables.length > 0 && (
          <div className="mb-6 space-y-2.5 pt-4 border-t border-border/60">
            <p className="font-mono text-xs text-cyan uppercase tracking-wider font-semibold">
              Included Deliverables:
            </p>
            <ul className="space-y-1.5 text-xs text-text/80">
              {deliverables.map((item, idx) => {
                const text = typeof item === 'object' ? item.text : item;
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-green mt-0.5 shrink-0" />
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Problems solved */}
        {problemsSolved.length > 0 && (
          <div className="mb-6 space-y-2 pt-2 border-t border-border/40">
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              Pain Points Addressed:
            </p>
            <ul className="space-y-1 text-xs text-muted">
              {problemsSolved.map((prob, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber mt-0.5">›</span>
                  <span>{prob}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/70">
        {/* Tech tags */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {technologies.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface2 border border-border text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/contact?projectType=${encodeURIComponent(title)}`}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-amber text-ink hover:bg-amber/90 transition-all text-center active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Book Scope ({title.split(' ')[0]})</span>
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/services#estimator"
            className="py-2.5 px-3 rounded-xl text-xs font-mono bg-surface2 border border-border text-muted hover:text-text hover:border-amber/50 transition-colors"
            title="Calculate scope in estimator"
          >
            calc()
          </Link>
        </div>
      </div>
    </div>
  );
}

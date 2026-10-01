import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

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
  
  const displayPrice = priceLabel ? priceLabel : price ? `₹${Number(price).toLocaleString('en-IN')}` : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-7 hover-lift flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Header with service index */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber font-semibold px-2.5 py-1 rounded bg-amber/10 border border-amber/30">
              // {code}
            </span>
            {enabled === false && (
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider px-2 py-0.5 rounded bg-surface2 border border-border">
                Unavailable
              </span>
            )}
          </div>
          {typicalTimeline && (
            <span className="font-mono text-xs text-muted">
              {typicalTimeline}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-bold text-text mb-1.5">
          {title}
        </h3>
        
        {displayPrice && (
          <div className="mb-3">
            <span className="font-mono text-sm text-amber font-bold">
              {displayPrice}
            </span>
          </div>
        )}
        <p className="text-sm text-muted leading-relaxed mb-6">
          {shortDescription}
        </p>

        {/* Problems solved */}
        {problemsSolved.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="font-mono text-xs text-cyan uppercase tracking-wider">
              Problems We Solve:
            </p>
            <ul className="space-y-1.5 text-xs text-muted">
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

      <div>
        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/60 mb-5">
          {technologies.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface2 border border-border text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        <Link
          to={`/contact?service=${encodeURIComponent(title)}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-amber hover:text-cyan transition-colors"
        >
          <span>request_proposal()</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

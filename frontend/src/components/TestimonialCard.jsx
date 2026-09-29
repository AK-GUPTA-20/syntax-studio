import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export default function TestimonialCard({ testimonial }) {
  const {
    clientName,
    role,
    company,
    content,
    rating = 5,
    projectRef,
    verified = true
  } = testimonial;

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-7 flex flex-col justify-between hover-lift relative">
      <div>
        {/* Rating and Verification Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 text-amber">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={14} fill="#E8A33D" stroke="#E8A33D" />
            ))}
          </div>
          {verified && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-green/10 border border-green/30 text-green flex items-center gap-1">
              <ShieldCheck size={11} />
              <span>Verified Client</span>
            </span>
          )}
        </div>

        {/* Quote text */}
        <p className="text-sm text-text/90 leading-relaxed italic mb-6">
          "{content}"
        </p>
      </div>

      <div className="pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-semibold text-text text-sm">
              {clientName}
            </h4>
            <p className="text-xs text-muted">
              {role}{company ? `, ${company}` : ''}
            </p>
          </div>
          {projectRef && (
            <div className="text-right">
              <span className="font-mono text-[11px] text-cyan block">
                // {projectRef}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 flex flex-col justify-between hover-lift relative overflow-hidden group shadow-lg">
      {/* Decorative background watermark */}
      <div className="absolute -top-3 -right-3 text-surface2/50 group-hover:text-amber/10 transition-colors pointer-events-none">
        <Quote size={80} />
      </div>

      <div className="relative z-10">
        {/* Rating and Verification Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 text-amber">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={13} fill="#E8A33D" stroke="#E8A33D" />
            ))}
          </div>
          {verified && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green/10 border border-green/30 text-green flex items-center gap-1 shadow-sm">
              <ShieldCheck size={11} />
              <span>Verified Client</span>
            </span>
          )}
        </div>

        {/* Quote text */}
        <p className="text-sm text-text/90 leading-relaxed font-sans italic mb-6">
          "{content}"
        </p>
      </div>

      <div className="pt-4 border-t border-border/60 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display font-semibold text-text text-sm">
              {clientName}
            </h4>
            <p className="text-xs text-muted font-sans">
              {role}{company ? `, ${company}` : ''}
            </p>
          </div>
          {projectRef && (
            <div className="text-right">
              <span className="font-mono text-[11px] text-cyan block bg-surface2 px-2 py-0.5 rounded border border-border/50">
                // {projectRef}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

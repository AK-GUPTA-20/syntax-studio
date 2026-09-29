import React from 'react';
import { Check, X, Shield, Award } from 'lucide-react';
import { ComparisonSkeleton } from './SkeletonLoader';

export default function AgencyComparison({ comparisons = [], loading = false }) {
  if (loading) {
    return <ComparisonSkeleton />;
  }

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/10 text-cyan font-mono text-xs mb-3">
          <Award size={13} />
          <span>The Studio Advantage</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-3">
          Why Ambitious Founders Choose <span className="text-amber">Syntax Studio</span>
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto font-sans">
          We stripped out the agency bureaucracy, junior outsourcing, and template bloat to give you pure engineering excellence.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-border/80">
              <th className="py-4 px-4 font-mono text-xs text-muted uppercase tracking-wider w-1/4">
                Comparison Factor
              </th>
              <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-amber bg-amber/5 rounded-t-xl border-x border-t border-amber/30 w-1/3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse"></span>
                  Syntax Studio
                </div>
              </th>
              <th className="py-4 px-4 font-mono text-xs text-muted uppercase tracking-wider w-1/4">
                Traditional Big Agencies
              </th>
              <th className="py-4 px-4 font-mono text-xs text-muted uppercase tracking-wider w-1/6">
                Freelance Platforms
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs font-mono">
            {comparisons.map((row, i) => (
              <tr key={i} className="hover:bg-surface2/30 transition-colors">
                <td className="py-4 px-4 font-medium text-text">
                  {row.feature}
                </td>
                <td className="py-4 px-5 font-semibold text-text bg-amber/5 border-x border-amber/30">
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-green shrink-0 mt-0.5" />
                    <span className="text-text">{row.syntax}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted">
                  <div className="flex items-start gap-2">
                    <X size={14} className="text-red shrink-0 mt-0.5" />
                    <span>{row.bigAgency}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted">
                  <div className="flex items-start gap-2">
                    <X size={14} className="text-red shrink-0 mt-0.5" />
                    <span>{row.freelancers}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footnote Trust Callout */}
      <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-cyan" />
          <span>Every build is protected by our standard 14-day post-launch warranty.</span>
        </div>
        <div className="flex items-center gap-1.5 text-text font-semibold">
          <span className="text-amber">100%</span> Client Satisfaction & Direct Communication SLA
        </div>
      </div>
    </div>
  );
}

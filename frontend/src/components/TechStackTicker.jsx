import React from 'react';
import {
  Code2,
  Cpu,
  Database,
  Layers,
  Zap,
  ShieldCheck,
  Server,
  Terminal,
  Activity,
  Globe,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const TECH_ITEMS = [
  { name: 'React 19', tag: 'UI Library', color: 'text-cyan', icon: Code2 },
  { name: 'TypeScript', tag: 'Type-Safe', color: 'text-cyan', icon: Terminal },
  { name: 'Next.js', tag: 'SSR & Edge', color: 'text-text', icon: Globe },
  { name: 'Node.js & Express', tag: 'High-perf APIs', color: 'text-green', icon: Server },
  { name: 'PostgreSQL', tag: 'Relational DB', color: 'text-cyan', icon: Database },
  { name: 'Firebase Cloud', tag: 'Auth & NoSQL', color: 'text-amber', icon: Zap },
  { name: 'Tailwind CSS', tag: 'Design System', color: 'text-cyan', icon: Layers },
  { name: 'Redis', tag: 'Low-Latency Cache', color: 'text-red', icon: Cpu },
  { name: 'Docker', tag: 'Containerization', color: 'text-cyan', icon: Server },
  { name: 'OWASP Top 10', tag: '25/25 Hardened', color: 'text-green', icon: ShieldCheck },
  { name: 'ImageKit CDN', tag: 'Asset Optimization', color: 'text-amber', icon: Sparkles },
  { name: 'WebSockets', tag: 'Realtime Sync', color: 'text-cyan', icon: Activity },
];

export default function TechStackTicker() {
  // Duplicate array for seamless infinite marquee loop
  const duplicatedItems = [...TECH_ITEMS, ...TECH_ITEMS];

  return (
    <div className="w-full border-y border-border/80 bg-surface/50 backdrop-blur-md py-4 overflow-hidden relative">
      {/* Edge Gradients for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-4">
        {duplicatedItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={`${item.name}-${index}`}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-surface2/70 border border-border/70 hover:border-border transition-colors text-xs font-mono shrink-0 shadow-sm"
            >
              <IconComponent size={14} className={item.color} />
              <span className="font-semibold text-text">{item.name}</span>
              <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded border border-border/50">
                {item.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

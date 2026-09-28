import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  BookOpen,
  Award
} from 'lucide-react';
import { getSettings } from '../api/client';

export default function AboutPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => null);
  }, []);

  const defaultValues = [
    {
      title: "Zero Template Bloat",
      desc: "Every line of CSS, component code, and backend handler is intentionally crafted. No 50MB theme bundles slowing down your customers."
    },
    {
      title: "Algorithmic Rigor",
      desc: "With 850+ DSA problems solved between both founders, we apply computer science fundamentals to database indexing, write integrity, and latency reduction."
    },
    {
      title: "Direct Founder Access",
      desc: "You always communicate directly with the software engineers writing your code. Zero layers of account managers or junior interns."
    },
    {
      title: "Production-Grade Security",
      desc: "Input sanitization, helmet headers, strict CORS, rate limiting, and role-based access control are baseline standards on every build."
    }
  ];

  const displayedValues = settings?.values && settings.values.length > 0 ? settings.values : defaultValues;
  const foundersName = settings?.founders && settings.founders.length > 0 ? settings.founders.join(' & ') : "Akshat Gupta & Vasu Singhal";
  const problemSolvingStat = settings?.stats?.[0]?.value ? `${settings.stats[0].value} DSA Solutions` : "850+ DSA Solutions";

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono mb-4 text-cyan">
          <span>{settings?.aboutBadge || "// Our Story & Philosophy"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-6 leading-tight">
          {settings?.tagline || "Engineering Websites That Move Businesses Forward"}
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          {settings?.subtagline || "Syntax Studio was founded by two software engineers who believe modern businesses deserve better than sluggish, generic web templates and overpriced agency bureaucracy."}
        </p>
      </div>

      {/* Narrative Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-muted leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-text">
            {settings?.aboutStoryTitle || "The Studio Story"}
          </h2>
          {settings?.aboutStory ? (
            <p className="whitespace-pre-line leading-relaxed font-sans">{settings.aboutStory}</p>
          ) : (
            <>
              <p>
                Akshat Gupta (Galgotias University CSE, Data Science) and Vasu Singhal (ABES Engineering College IT) met through their shared obsession with full-stack software development and competitive programming.
              </p>
              <p>
                Between them, they have solved over 850+ algorithmic problems across LeetCode, CodeChef, and collegiate hackathons, while building production systems ranging from atomic banking ledgers to vendor e-commerce platforms.
              </p>
              <p>
                They noticed a major pain point in the web development industry: businesses were forced to choose between bloated agency firms charging exorbitant fees for junior-level work, or low-cost freelancers building fragile templates that break the moment traffic spikes.
              </p>
              <p>
                Syntax Studio was established to offer the ideal alternative: a lean, highly technical 2-person studio where founders communicate directly with clients and write every line of production code.
              </p>
            </>
          )}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 p-7 rounded-2xl border border-border bg-surface space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-amber">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-text text-base">{settings?.companyName || "Syntax Studio"}</h3>
              <p className="text-xs font-mono text-muted">Est. {settings?.establishedYear || "2024"} • {settings?.location || "Uttar Pradesh, India"}</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs text-muted">
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-cyan">Founders:</span>
              <span className="text-text font-semibold">{foundersName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-cyan">Primary Stack:</span>
              <span className="text-text">{settings?.primaryStack || "React, Node, Express, Firebase"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-cyan">Academic Centers:</span>
              <span className="text-text">{settings?.academicCenters || "Galgotias & ABES Colleges"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-cyan">Problem Solving:</span>
              <span className="text-amber font-bold">{problemSolvingStat}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-cyan">Contact:</span>
              <span className="text-text">{settings?.contactEmail || "guptaakshat7795@gmail.com"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Studio Values */}
      <section className="mb-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
            {settings?.principlesBadge || "// Principles"}
          </p>
          <h2 className="font-display text-3xl font-bold text-text">
            {settings?.principlesTitle || "What We Believe"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedValues.map((v, i) => (
            <div key={i} className="p-6 sm:p-7 rounded-xl border border-border bg-surface hover-lift">
              <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-cyan mb-4 font-mono text-xs font-bold">
                0{i + 1}
              </div>
              <h3 className="font-display font-semibold text-text text-lg mb-2">
                {v.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Founders Teaser */}
      <section className="p-8 sm:p-12 rounded-2xl border border-border bg-surface2/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-text mb-2">
            {settings?.meetFoundersTitle || `Meet ${foundersName}`}
          </h2>
          <p className="text-sm text-muted max-w-xl">
            {settings?.meetFoundersSubtitle || "Read each founder's personal journey, inspect individual projects, and view their GitHub contributions."}
          </p>
        </div>
        <Link
          to="/team"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shrink-0"
        >
          <span>View Team Profiles</span>
          <ArrowUpRight size={14} />
        </Link>
      </section>
    </div>
  );
}

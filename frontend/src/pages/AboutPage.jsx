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
  Award,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Users,
  Lock,
  GitBranch,
  Timer
} from 'lucide-react';
import { getSettings, getTeam } from '../api/client';
import { SafeExternalLink } from '../utils/security';

const VALUE_ICONS = [Zap, Cpu, Users, ShieldCheck, Layers, GitBranch];

export default function AboutPage() {
  const [settings, setSettings] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSettings().catch(() => null),
      getTeam().catch(() => [])
    ])
      .then(([sett, teamData]) => {
        setSettings(sett);
        setTeam(teamData || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayedValues = settings?.values || [];
  const displayedStats = settings?.stats || [];
  const foundersName = settings?.founders && settings.founders.length > 0
    ? settings.founders.join(' & ')
    : (team.length > 0 ? team.map(m => m.name).join(' & ') : "Akshat Gupta & Vasu Singhal");

  const problemSolvingStat = displayedStats.find(s => s.label?.toLowerCase().includes('dsa') || s.label?.toLowerCase().includes('problem'))?.value
    ? `${displayedStats.find(s => s.label?.toLowerCase().includes('dsa') || s.label?.toLowerCase().includes('problem')).value} Problems`
    : (displayedStats[0]?.value ? `${displayedStats[0].value} Solved` : "850+ Solutions");

  return (
    <div className="relative pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-24 left-1/3 w-72 sm:w-96 h-72 sm:h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Page Header */}
      <div className="max-w-4xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-xs font-mono mb-4 text-cyan backdrop-blur-sm">
          <Sparkles size={13} className="text-cyan animate-pulse" />
          <span>{settings?.aboutBadge || "// Our Story & Philosophy"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-text mb-6 leading-tight tracking-tight">
          {settings?.tagline || "Engineering Digital Systems That Move Businesses Forward"}
        </h1>
        <p className="text-base sm:text-xl text-muted leading-relaxed max-w-3xl">
          {settings?.subtagline || "Syntax Studio was founded by software engineers who believe modern businesses deserve better than sluggish, generic web templates and overpriced agency bureaucracy."}
        </p>
      </div>

      {/* Engineering Foundations Quick Stats (Dynamic from settings.stats) */}
      {displayedStats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {displayedStats.slice(0, 4).map((st, i) => {
            const colors = ['text-amber', 'text-cyan', 'text-green', 'text-amber'];
            const color = colors[i % colors.length];
            return (
              <div key={i} className="p-5 rounded-2xl border border-border bg-surface/80 backdrop-blur-sm space-y-1">
                <div className={`font-mono text-2xl sm:text-3xl font-bold ${color}`}>{st.value}</div>
                <div className="font-display font-semibold text-text text-sm">{st.label}</div>
                <p className="text-[11px] text-muted">Studio engineering benchmark & performance standard</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Narrative Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-muted leading-relaxed">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
            {settings?.aboutStoryTitle || "The Studio Story"}
          </h2>
          {settings?.aboutStory ? (
            <p className="whitespace-pre-line leading-relaxed font-sans">{settings.aboutStory}</p>
          ) : (
            <>
              <p>
                Akshat Gupta (Galgotias University CSE, Data Science) and Vasu Singhal (ABES Engineering College IT) met through their shared obsession with full-stack software architecture, clean code standards, and competitive algorithms.
              </p>
              <p>
                Between them, they have solved hundreds of algorithmic challenges across LeetCode and CodeChef, and constructed production platforms spanning atomic banking ledgers, multi-vendor e-commerce marketplaces, and high-frequency real-time web applications.
              </p>
              <p>
                They observed a critical deficiency in the agency marketplace: modern businesses were forced to choose between massive corporate firms charging tens of thousands of dollars for work delegated to junior interns, or low-cost freelancers delivering fragile templates that break the moment traffic scales.
              </p>
              <p>
                Syntax Studio was created as the lean, highly-technical alternative: a 2-person engineering studio where clients work directly with the system architects writing every single line of production code.
              </p>
            </>
          )}

          {/* Key Engineering Tenets Checklist */}
          <div className="pt-4 space-y-3 font-mono text-xs text-text/90">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-green shrink-0" />
              <span>Full GitHub Repository & Intellectual Property Transfer on Day 1</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-green shrink-0" />
              <span>Direct WhatsApp & Slack communication directly with the founding engineers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-green shrink-0" />
              <span>14-Day Free Post-Launch Warranty covering any edge-case bug fixes</span>
            </div>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 p-5 sm:p-8 rounded-2xl border border-border bg-surface/80 backdrop-blur-md space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-11 h-11 rounded-xl bg-surface2 border border-border flex items-center justify-center text-amber shadow-sm shrink-0">
              <Terminal size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-text text-base truncate">{settings?.companyName || "Syntax Studio"}</h3>
              <p className="text-xs font-mono text-muted truncate">Est. {settings?.establishedYear || "2024"} • {settings?.location || "Uttar Pradesh, India"}</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs text-muted">
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-1">
              <span className="text-cyan shrink-0">Founders:</span>
              <span className="text-text font-semibold sm:text-right">{foundersName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-1">
              <span className="text-cyan shrink-0">Core Technologies:</span>
              <span className="text-text sm:text-right font-medium">React, Vite, Node, Express, Firebase</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-1">
              <span className="text-cyan shrink-0">Academic Centers:</span>
              <span className="text-text sm:text-right">{settings?.academicCenters || "Galgotias Univ & ABES Eng College"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-1">
              <span className="text-cyan shrink-0">Problem Solving:</span>
              <span className="text-amber font-bold sm:text-right">{problemSolvingStat}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-1">
              <span className="text-cyan shrink-0">NDA Policy:</span>
              <span className="text-green font-semibold sm:text-right">100% Protected & Signed</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 gap-1">
              <span className="text-cyan shrink-0">Direct Email:</span>
              <span className="text-text break-all sm:text-right">{settings?.contactEmail || "guptaakshat7795@gmail.com"}</span>
            </div>
          </div>

          <Link
            to="/contact"
            className="w-full py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Inquire Directly</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* Core Studio Values (Dynamic from settings.values) */}
      {displayedValues.length > 0 && (
        <section className="mb-24">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
              {settings?.principlesBadge || "// Principles"}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
              {settings?.principlesTitle || "Our Engineering Standards"}
            </h2>
            <p className="text-sm text-muted mt-2 font-sans">
              Non-negotiable benchmarks that govern every repository, pull request, and deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayedValues.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <div key={i} className="p-7 rounded-2xl border border-border bg-surface hover:border-border/80 transition-all hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-surface2 border border-border flex items-center justify-center text-cyan font-mono text-xs font-bold">
                      0{i + 1}
                    </div>
                    <Icon size={18} className="text-amber" />
                  </div>
                  <h3 className="font-display font-semibold text-text text-lg mb-2">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Meet Founders Profiles Section (Dynamic from team) */}
      <section className="p-5 sm:p-8 lg:p-12 rounded-2xl border border-border bg-gradient-to-br from-surface2/50 via-surface to-surface shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan mb-2">
              <Users size={14} />
              <span>Direct Leadership</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
              {settings?.meetFoundersTitle || `Meet the Partners: ${foundersName}`}
            </h2>
            <p className="text-sm text-muted max-w-xl mt-1">
              {settings?.meetFoundersSubtitle || "Inspect each founder's personal profile, explore individual engineering projects, and review verified credentials."}
            </p>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shrink-0 self-start sm:self-center shadow-sm"
          >
            <span>View All Profiles</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Dynamic Founder Peek Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((member, idx) => (
            <div key={member.id || idx} className="p-6 rounded-xl border border-border bg-surface space-y-4 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-text">{member.name}</h3>
                  <p className="font-mono text-xs text-amber">{member.role}</p>
                </div>
                {member.education?.institution && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan/10 border border-cyan/30 text-cyan">
                    {member.education.institution.split(' ')[0]}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed line-clamp-3">
                {member.shortBio || member.overview || member.specialty}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-muted">
                  {member.stats?.[0] ? `${member.stats[0].value} ${member.stats[0].label}` : 'Verified Partner'}
                </span>
                <Link
                  to={`/team/${member.slug}`}
                  className="text-xs font-mono text-amber hover:underline flex items-center gap-1"
                >
                  <span>View Full Portfolio</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

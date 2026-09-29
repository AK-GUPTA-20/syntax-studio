import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  CheckCircle2,
  Shield,
  Code,
  Cpu,
  Sparkles,
  Zap,
  Lock,
  GitBranch,
  Layers,
  MessageSquare
} from 'lucide-react';
import { getTeam, getSettings } from '../api/client';
import TeamCard from '../components/TeamCard';

const ADVANTAGE_ICONS = [MessageSquare, Cpu, GitBranch, Shield, Zap, Layers];
const ADVANTAGE_COLORS = ['text-cyan', 'text-amber', 'text-green', 'text-cyan', 'text-amber'];

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamData, settingsData] = await Promise.all([getTeam(), getSettings()]);
        setTeam(teamData || []);
        setSettings(settingsData || null);
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const advantages = settings?.advantages || [];

  return (
    <div className="relative pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Page Header */}
      <div className="max-w-4xl mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-xs font-mono mb-4 text-cyan backdrop-blur-sm">
          <Sparkles size={13} className="text-cyan animate-pulse" />
          <span>{settings?.teamPageBadge || "// The Engineers Behind Syntax Studio"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-text mb-5 leading-tight tracking-tight">
          {settings?.teamPageTitle || "Meet the Founders & Core Engineers"}
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl font-sans">
          {settings?.teamPageSubtitle || "We are a tight-knit 2-person studio. When you work with us, you speak directly with the engineers architecting your database and designing your UI. No account managers, no junior subcontractors, no miscommunication."}
        </p>
      </div>

      {/* Founders Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>

      {/* Why a 2-Person Studio Works Better (Dynamic from settings.advantages) */}
      {advantages.length > 0 && (
        <div className="p-5 sm:p-8 lg:p-12 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface2/40 mb-20 shadow-xl">
          <div className="max-w-2xl mb-10">
            <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={14} />
              <span>{settings?.advantageBadge || "// The 2-Person Advantage"}</span>
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text mb-3">
              {settings?.advantageTitle || "Why Working Directly With Founders Wins"}
            </h2>
            <p className="text-sm text-muted font-sans">
              {settings?.advantageSubtitle || "Large agencies bill for layers of middle management. We deliver code."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {advantages.map((adv, idx) => {
              const IconComponent = ADVANTAGE_ICONS[idx % ADVANTAGE_ICONS.length];
              const colorClass = ADVANTAGE_COLORS[idx % ADVANTAGE_COLORS.length];
              return (
                <div key={idx} className="p-6 rounded-xl border border-border bg-surface hover:border-border/80 transition-all hover-lift">
                  <div className={`w-9 h-9 rounded-lg bg-surface2 border border-border flex items-center justify-center ${colorClass} mb-3.5 font-mono shadow-sm`}>
                    <IconComponent size={18} />
                  </div>
                  <h3 className="font-display font-semibold text-text text-base mb-1.5">
                    {adv.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    {adv.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="p-8 sm:p-12 rounded-2xl border border-border bg-surface text-center max-w-3xl mx-auto space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-text">
          {settings?.teamCtaTitle || `Want to discuss a project with ${team.map(m => m.name.split(' ')[0]).join(' or ') || 'the founders'}?`}
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed font-sans">
          {settings?.teamCtaSubtitle || "Schedule an introductory technical discovery session to review your scope and get a guaranteed 24-hour turnaround plan."}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-glow-amber/20 shadow-md active:scale-95"
          >
            <span>Book Technical Discovery →</span>
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-mono text-muted hover:text-text border border-border bg-surface2 transition-colors"
          >
            <span>Inspect All Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

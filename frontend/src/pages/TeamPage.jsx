import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Mail, CheckCircle2, Shield, Code, Cpu, Sparkles } from 'lucide-react';
import { getTeam, getSettings } from '../api/client';
import TeamCard from '../components/TeamCard';

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

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono mb-4 text-cyan">
          <span>{settings?.teamPageBadge || "// The Engineers Behind Syntax Studio"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-5 leading-tight">
          {settings?.teamPageTitle || "Meet the Founders & Core Engineers"}
        </h1>
        <p className="text-base text-muted leading-relaxed">
          {settings?.teamPageSubtitle || "We are a tight-knit 2-person studio. When you work with us, you speak directly with the engineers architecting your database and designing your UI. No account managers, no junior subcontractors, no miscommunication."}
        </p>
      </div>

      {/* Founders Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>

      {/* Why a 2-Person Studio Works Better */}
      <div className="p-8 sm:p-12 rounded-2xl border border-border bg-surface/50 mb-20">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
            {settings?.advantageBadge || "// The 2-Person Advantage"}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text mb-3">
            {settings?.advantageTitle || "Why Working Directly With Founders Wins"}
          </h2>
          <p className="text-sm text-muted">
            {settings?.advantageSubtitle || "Large agencies bill for layers of middle management. We deliver code."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(settings?.advantages || [
            {
              title: "Direct Technical Line",
              desc: "Every design decision and architectural choice is discussed directly with the founders. Zero translation losses."
            },
            {
              title: "Algorithmic Discipline",
              desc: "With 850+ combined DSA problems solved across LeetCode, we engineer for efficiency, edge-case safety, and clean complexity."
            },
            {
              title: "Complete Accountability",
              desc: "Our reputations are directly tied to the performance and uptime of the systems we deliver. We stand behind our work."
            }
          ]).map((adv, idx) => {
            const icons = [Cpu, Code, Shield, Sparkles];
            const colors = ['text-cyan', 'text-amber', 'text-green', 'text-cyan'];
            const IconComponent = icons[idx % icons.length];
            const colorClass = colors[idx % colors.length];

            return (
              <div key={idx} className="p-5 rounded-xl border border-border bg-surface">
                <div className={`w-9 h-9 rounded-lg bg-surface2 border border-border flex items-center justify-center ${colorClass} mb-3 font-mono`}>
                  <IconComponent size={18} />
                </div>
                <h3 className="font-display font-semibold text-text text-base mb-1.5">
                  {adv.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h3 className="font-display text-2xl font-bold text-text">
          {settings?.teamCtaTitle || `Want to discuss a project with ${team.map(m => m.name.split(' ')[0]).join(' or ') || 'the founders'}?`}
        </h3>
        <p className="text-xs sm:text-sm text-muted">
          {settings?.teamCtaSubtitle || "Schedule an introductory technical discovery session to review your scope."}
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md"
        >
          <span>Get in Touch</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}

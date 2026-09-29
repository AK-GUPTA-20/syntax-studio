import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Linkedin, Mail, Award, BookOpen } from 'lucide-react';
import { SafeExternalLink, sanitizeUrl } from '../utils/security';

export default function TeamCard({ member, compact = false }) {
  const {
    slug,
    name,
    role,
    specialty,
    profileImage,
    shortBio,
    stats = [],
    education,
    skills = [],
    contact = {}
  } = member;

  const isAkshat = slug?.includes('akshat');

  if (compact) {
    return (
      <Link
        to={`/team/${slug}`}
        className="group block rounded-2xl border border-border bg-surface hover:border-amber/60 hover:bg-surface2/60 transition-all duration-300 p-5 sm:p-7 shadow-lg hover:shadow-glow-amber/20 hover-lift cursor-pointer"
        title={`Click to view ${name}'s full portfolio`}
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-border group-hover:border-amber/70 bg-surface2 profile-pulse transition-colors">
              <img
                src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span
              className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                isAkshat ? 'bg-cyan text-ink' : 'bg-amber text-ink'
              }`}
            >
              Co-Founder
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-text group-hover:text-amber transition-colors truncate">
                {name}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-surface2 border border-border group-hover:border-amber/50 group-hover:bg-amber group-hover:text-ink flex items-center justify-center text-muted shrink-0 transition-all">
                <ArrowUpRight size={15} />
              </div>
            </div>
            <p className="text-xs font-mono text-amber font-medium mt-0.5">
              {role}
            </p>
            <p className="text-xs text-muted mt-1 leading-snug">
              {specialty}
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-cyan group-hover:underline">
              <span>view_portfolio()</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden hover-lift flex flex-col justify-between transition-all duration-300">
      {/* Top Banner with Role */}
      <div className="p-5 sm:p-7 border-b border-border/70 bg-surface2/30">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-border bg-surface2 profile-pulse">
              <img
                src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                isAkshat ? 'bg-cyan text-ink' : 'bg-amber text-ink'
              }`}
            >
              Co-Founder
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-text truncate">
              {name}
            </h3>
            <p className="text-xs font-mono text-amber font-medium mt-0.5">
              {role}
            </p>
            <p className="text-xs text-muted mt-1 leading-snug">
              {specialty}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Bio & Credentials */}
      <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <p className="text-sm text-muted leading-relaxed mb-5">
            {shortBio}
          </p>

          {/* Education pill */}
          {education && (
            <div className="p-3 rounded-lg border border-border bg-surface2/60 mb-5 flex items-start gap-2.5 text-xs font-mono">
              <BookOpen size={15} className="text-cyan shrink-0 mt-0.5" />
              <div>
                <span className="text-text font-semibold">{education.institution}</span>
                <p className="text-muted text-[11px] mt-0.5">{education.score} • {education.duration}</p>
              </div>
            </div>
          )}

          {/* Key Stats Counter Grid */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {stats.slice(0, 4).map((st, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-border bg-surface2 text-center"
              >
                <div className="font-display text-lg sm:text-xl font-bold text-amber">
                  {st.value}{st.suffix}
                </div>
                <div className="text-[11px] font-mono text-muted truncate mt-0.5">
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* Skills Badges */}
          <div>
            <p className="text-xs font-mono text-cyan mb-2.5">// Core Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {(skills[0]?.items || []).concat(skills[1]?.items || []).slice(0, 8).map((sk) => (
                <span
                  key={sk}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface2 border border-border text-text/80"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Portfolio Button */}
        <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {contact.github && (
              <SafeExternalLink
                href={contact.github}
                className="text-muted hover:text-text transition-colors"
                title="GitHub"
              >
                <Github size={16} />
              </SafeExternalLink>
            )}
            {contact.linkedin && (
              <SafeExternalLink
                href={contact.linkedin}
                className="text-muted hover:text-text transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={16} />
              </SafeExternalLink>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-muted hover:text-text transition-colors"
                title="Email"
              >
                <Mail size={16} />
              </a>
            )}
          </div>

          <Link
            to={`/team/${slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-surface2 border border-border text-text hover:border-amber/50 hover:text-amber transition-all"
          >
            <span>view_personal_portfolio()</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

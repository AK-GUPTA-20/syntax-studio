import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Linkedin, Mail, Phone, ArrowUpRight, Heart, Code2 } from 'lucide-react';
import { getSettings, getTeam } from '../api/client';
import { SafeExternalLink } from '../utils/security';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    Promise.all([
      getSettings().catch(() => null),
      getTeam().catch(() => [])
    ]).then(([settData, teamData]) => {
      setSettings(settData);
      setTeam(teamData || []);
    });
  }, []);

  const foundersName = settings?.founders && settings.founders.length > 0
    ? settings.founders.join(' & ')
    : team.length > 0
    ? team.map((m) => m.name).join(' & ')
    : 'Akshat Gupta & Vasu Singhal';

  return (
    <footer className="border-t border-border bg-ink relative z-10 pt-16 pb-12 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-mono text-base">
              <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-amber">
                <Terminal size={17} />
              </div>
              <span className="font-display font-bold text-xl text-text">
                {settings?.companyName || (
                  <>syntax<span className="text-amber">.studio</span></>
                )}
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm">
              {settings?.subtagline || 'A 2-person digital studio engineering modern, fast, full-stack websites, scalable REST APIs, and high-conversion digital experiences.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green/30 bg-green/10 text-green font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
              {settings?.heroAnnouncement || 'Available for new projects & retainers'}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 font-mono text-xs">
            <p className="text-amber font-semibold uppercase tracking-wider">// Agency</p>
            <ul className="space-y-2 text-muted">
              <li><Link to="/projects" className="hover:text-text transition-colors">Work & Case Studies</Link></li>
              <li><Link to="/services" className="hover:text-text transition-colors">Services Offered</Link></li>
              <li><Link to="/about" className="hover:text-text transition-colors">About Our Studio</Link></li>
              <li><Link to="/team" className="hover:text-text transition-colors">The Founders</Link></li>
              <li><Link to="/contact" className="hover:text-text transition-colors">Start a Project</Link></li>
              <li><Link to="/terms" className="hover:text-text transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/admin" className="hover:text-text transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* Dynamic Founder Columns from Team collection */}
          {team.slice(0, 2).map((founder, idx) => {
            const isFirst = idx === 0;
            const accentColor = isFirst ? 'text-cyan' : 'text-amber';
            return (
              <div key={founder.id || idx} className="space-y-3 font-mono text-xs">
                <p className={`${accentColor} font-semibold uppercase tracking-wider`}>
                  // {founder.name}
                </p>
                <p className="text-muted text-[11px] leading-relaxed line-clamp-2">
                  {founder.role}. {founder.education?.institution ? `${founder.education.institution} (${founder.education.score || ''})` : founder.specialty}.
                </p>
                <div className="space-y-1.5 pt-1">
                  <Link
                    to={`/team/${founder.slug}`}
                    className={`flex items-center gap-1 ${accentColor} hover:underline`}
                  >
                    <span>View Portfolio</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  {founder.contact?.github && (
                    <SafeExternalLink
                      href={founder.contact.github}
                      className="flex items-center gap-1.5 text-muted hover:text-text transition-colors"
                    >
                      <Github size={13} />
                      <span className="truncate max-w-[170px]">{founder.contact.github.replace('https://', '')}</span>
                    </SafeExternalLink>
                  )}
                  {founder.contact?.linkedin && (
                    <SafeExternalLink
                      href={founder.contact.linkedin}
                      className="flex items-center gap-1.5 text-muted hover:text-text transition-colors"
                    >
                      <Linkedin size={13} />
                      <span>LinkedIn Profile</span>
                    </SafeExternalLink>
                  )}
                  {founder.contact?.email && (
                    <a
                      href={`mailto:${founder.contact.email}`}
                      className="flex items-center gap-1.5 text-muted hover:text-text transition-colors"
                    >
                      <Mail size={13} />
                      <span className="truncate max-w-[170px]">{founder.contact.email}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center sm:justify-between gap-4 font-mono text-xs text-muted text-center sm:text-left">
          <div>
            © {currentYear} {settings?.companyName || 'Syntax Studio'}. Founded by {foundersName}.
          </div>
          <div className="flex items-center gap-3">
            <span>{settings?.footerTechStack || 'Built with React + Tailwind + Express + Firebase • Zero generic templates'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

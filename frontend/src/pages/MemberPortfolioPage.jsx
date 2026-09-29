import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  FileText,
  Award,
  BookOpen,
  Code2,
  Terminal,
  ExternalLink,
  Check,
  Copy,
  ChevronRight,
  MapPin,
  Sparkles
} from 'lucide-react';
import { getTeamMemberBySlug, getProjects } from '../api/client';
import { SafeExternalLink } from '../utils/security';

export default function MemberPortfolioPage() {
  const { slug } = useParams();
  const [member, setMember] = useState(null);
  const [memberProjects, setMemberProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Typewriter effect state for roles
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [typingState, setTypingState] = useState('typing'); // typing, pausing, deleting

  // Category filter for projects
  const [projectFilter, setProjectFilter] = useState('all');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      setError(null);
      try {
        const [memberData, allProjects] = await Promise.all([
          getTeamMemberBySlug(slug),
          getProjects()
        ]);
        setMember(memberData);

        // Filter projects authored by this member
        const authored = (allProjects || []).filter(
          (p) => p.authorSlug === slug || (memberData?.name && p.author?.includes(memberData.name.split(' ')[0]))
        );
        setMemberProjects(authored);
      } catch (err) {
        console.error('Failed to load member portfolio:', err);
        setError('Founder profile not found.');
      } finally {
        setLoading(false);
      }
    }
    loadMember();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Typewriter ticker
  useEffect(() => {
    if (!member?.rolesTypewriter || member.rolesTypewriter.length === 0) return;
    const fullText = member.rolesTypewriter[typewriterIndex % member.rolesTypewriter.length];

    let timer;
    if (typingState === 'typing') {
      if (currentText.length < fullText.length) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => setTypingState('pausing'), 1500);
      }
    } else if (typingState === 'pausing') {
      timer = setTimeout(() => setTypingState('deleting'), 600);
    } else if (typingState === 'deleting') {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullText.slice(0, currentText.length - 1));
        }, 30);
      } else {
        setTypewriterIndex((prev) => (prev + 1) % member.rolesTypewriter.length);
        setTypingState('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [currentText, typingState, typewriterIndex, member]);

  const copyEmail = () => {
    if (!member?.contact?.email) return;
    navigator.clipboard.writeText(member.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-40 pb-28 max-w-4xl mx-auto px-5 sm:px-8 text-center font-mono text-sm text-muted">
        <span className="text-amber">⏳</span> loading_portfolio({slug})...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="pt-40 pb-28 max-w-xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <p className="font-mono text-xs text-red">// 404</p>
        <h2 className="font-display text-2xl font-bold text-text">Founder profile not found</h2>
        <Link
          to="/team"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-amber hover:bg-surface2"
        >
          <ArrowLeft size={14} /> Back to Team
        </Link>
      </div>
    );
  }

  const isAkshat = slug.includes('akshat');

  return (
    <div className="relative pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      {/* Top Breadcrumb & Studio Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Link to="/team" className="hover:text-text flex items-center gap-1">
            <ArrowLeft size={13} />
            <span>~/team</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-amber font-semibold truncate max-w-[180px] sm:max-w-none">{member.name.toLowerCase().replace(' ', '.')}</span>
        </div>
        <span className="text-cyan px-2.5 py-0.5 rounded bg-cyan/10 border border-cyan/30 text-[11px] shrink-0">
          Syntax Studio Partner
        </span>
      </div>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Avatar & Pulse */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-border bg-surface2 profile-pulse shadow-2xl">
                <img
                  src={member.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber text-ink shadow-md">
                Co-Founder
              </div>
            </div>

            {/* Location & Status */}
            <div className="mt-5 space-y-1.5 text-xs font-mono text-muted text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <MapPin size={13} className="text-cyan" />
                <span>{member.contact?.location || "Uttar Pradesh, India"}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start text-green">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
                <span>Active on Studio Projects</span>
              </div>
            </div>
          </div>

          {/* Bio & Typewriter Headline */}
          <div className="lg:col-span-8 space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-text">
              {member.name}
            </h1>

            {/* Typewriter role */}
            <div className="min-h-[2.25rem] font-mono text-lg sm:text-2xl text-cyan flex flex-wrap items-center break-words">
              <span>{currentText}</span>
              <span className="text-amber cursor-blink ml-0.5">_</span>
            </div>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl font-sans">
              {member.bio}
            </p>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {member.contact?.resumeUrl && member.contact.resumeUrl !== '#' && (
                <SafeExternalLink
                  href={member.contact.resumeUrl}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm"
                >
                  <FileText size={14} />
                  <span>resume.pdf</span>
                </SafeExternalLink>
              )}
              {member.contact?.github && (
                <SafeExternalLink
                  href={member.contact.github}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-surface border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
                >
                  <Github size={14} />
                  <span>GitHub Profile</span>
                </SafeExternalLink>
              )}
              {member.contact?.linkedin && (
                <SafeExternalLink
                  href={member.contact.linkedin}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-surface border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </SafeExternalLink>
              )}
              <Link
                to={`/contact?founder=${encodeURIComponent(member.name)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-surface2 border border-border text-amber hover:border-amber transition-all"
              >
                <span>Hire {member.name.split(' ')[0]}</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="mb-16 p-4 sm:p-6 rounded-xl border border-border bg-surface grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
        {member.stats?.map((stat, i) => (
          <div key={i} className="p-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-amber">
              {stat.value}{stat.suffix}
            </div>
            <div className="text-xs font-mono text-muted mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Academic Background & Philosophy */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        {member.education && (
          <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan uppercase tracking-wider">
              <BookOpen size={15} />
              <span>// Education & Credentials</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text">
              {member.education.degree}
            </h3>
            <p className="text-sm text-text font-medium">
              {member.education.institution}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-muted pt-1">
              <span className="px-2 py-0.5 rounded bg-surface2 border border-border text-amber">
                {member.education.score}
              </span>
              <span>{member.education.duration}</span>
            </div>
          </div>
        )}

        {member.quote && (
          <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber uppercase tracking-wider">
                <Sparkles size={15} />
                <span>// Engineering Philosophy</span>
              </div>
              <p className="text-sm sm:text-base text-text/90 italic leading-relaxed pt-1">
                "{member.quote}"
              </p>
            </div>
            <p className="text-xs font-mono text-muted pt-3">
              — {member.name}
            </p>
          </div>
        )}
      </section>

      {/* Skills Matrix */}
      <section className="mb-16">
        <div className="mb-8">
          <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-1">// Skill Set</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
            Technical Stack & Tooling
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {member.skills?.map((categoryGroup, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-surface hover-lift"
            >
              <h3 className="font-mono text-xs font-bold text-amber uppercase tracking-wider mb-3">
                // {categoryGroup.category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {categoryGroup.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-surface2 border border-border text-text hover:border-cyan/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Authored Projects */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-amber uppercase tracking-wider mb-1">// Built by {member.name.split(' ')[0]}</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
              Projects & Engineering Deliveries
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
          >
            <span>view_all_agency_projects()</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {memberProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover-lift"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan/10 border border-cyan/30 text-cyan">
                      {project.category}
                    </span>
                    <span className="text-xs font-mono text-muted">{project.year}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-text mb-2">
                    <Link to={`/projects/${project.slug}`} className="hover:text-amber transition-colors">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                    {project.shortDescription}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(project.technologies || []).slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface2 border border-border text-muted">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs font-mono">
                    {project.githubUrl && (
                      <SafeExternalLink href={project.githubUrl} className="text-muted hover:text-text flex items-center gap-1">
                        <Github size={13} /> Source
                      </SafeExternalLink>
                    )}
                    <Link to={`/projects/${project.slug}`} className="text-amber hover:underline flex items-center gap-1 font-semibold ml-auto">
                      Case Study <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-muted">No isolated projects found.</p>
        )}
      </section>

      {/* Engineering Journey Timeline */}
      {member.journey && member.journey.length > 0 && (
        <section className="mb-16">
          <div className="mb-8">
            <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-1">// Career & Milestones</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
              Engineering Journey
            </h2>
          </div>

          <div className="space-y-4">
            {member.journey.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="px-3 py-1 rounded bg-amber/15 border border-amber/30 text-amber font-mono text-xs font-bold shrink-0">
                  {item.year}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-text text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Direct Contact Card */}
      <section className="p-5 sm:p-8 lg:p-10 rounded-2xl border border-border bg-surface text-center space-y-4">
        <h3 className="font-display text-2xl font-bold text-text">
          Connect directly with {member.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
          Need direct consulting, technical advisory, or want to discuss full-stack contract work? Reach out directly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {member.contact?.email && (
            <button
              onClick={copyEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono bg-surface2 border border-border text-amber hover:border-amber transition-all max-w-full"
            >
              {copiedEmail ? <Check size={14} className="text-green shrink-0" /> : <Copy size={14} className="shrink-0" />}
              <span className="break-all">{copiedEmail ? "Email copied!" : member.contact.email}</span>
            </button>
          )}

          {member.contact?.phone && (
            <a
              href={`tel:${member.contact.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono bg-surface2 border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
            >
              <Phone size={14} />
              <span>{member.contact.phone}</span>
            </a>
          )}

          <Link
            to={`/contact?founder=${encodeURIComponent(member.name)}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md"
          >
            <span>Book Discovery Call</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

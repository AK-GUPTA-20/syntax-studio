import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  Clock,
  UserCheck,
  Zap,
  ShieldCheck,
  Sparkles,
  Gauge
} from 'lucide-react';
import { getProjectBySlug, getProjects, getSettings } from '../api/client';
import { SafeExternalLink, safeWindowOpen } from '../utils/security';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [projData, projectsList, settData] = await Promise.all([
          getProjectBySlug(slug),
          getProjects(),
          getSettings().catch(() => null)
        ]);
        setProject(projData);
        setAllProjects(projectsList || []);
        setSettings(settData || null);
      } catch (err) {
        console.error('Failed to load project details:', err);
        setError('Project not found or unable to load details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-28 max-w-4xl mx-auto px-5 sm:px-8 text-center font-mono text-sm text-muted">
        <span className="text-amber">⏳</span> loading_case_study({slug})...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-40 pb-28 max-w-xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <p className="font-mono text-xs text-red">// Error 404</p>
        <h2 className="font-display text-2xl font-bold text-text">Case study not found</h2>
        <p className="text-sm text-muted">{error}</p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-amber hover:bg-surface2"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </div>
    );
  }

  // Next project navigation
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : allProjects[0];

  return (
    <div className="relative pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted mb-8">
        <Link to="/projects" className="hover:text-text flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>~/projects</span>
        </Link>
        <span className="text-border">/</span>
        <span className="text-amber truncate max-w-[200px] sm:max-w-none">{project.slug}</span>
      </div>

      {/* Hero Header */}
      <div className="space-y-4 mb-10 pb-8 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-cyan/10 border border-cyan/30 text-cyan">
            {project.category}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-surface border border-border text-muted">
            Year: {project.year}
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-surface2 border border-border text-amber">
            {settings?.companyName || 'Syntax Studio'} Engineering
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-text leading-tight">
          {project.title}
        </h1>

        <p className="text-base sm:text-lg text-muted leading-relaxed font-sans max-w-3xl">
          {project.shortDescription}
        </p>

        {/* Action Buttons (Author & GitHub URLs removed) */}
        {(() => {
          const hasLiveDeploy = Boolean(
            project.liveUrl &&
            project.liveUrl.trim() !== '' &&
            project.liveUrl !== '#' &&
            !project.liveUrl.includes('github.com')
          );
          const unavailableUrl = `/not-available?project=${encodeURIComponent(project.slug)}&title=${encodeURIComponent(project.title)}`;

          return (
            <div className="space-y-6 pt-3">
              <div className="flex flex-wrap items-center gap-3">
                {hasLiveDeploy ? (
                  <SafeExternalLink
                    href={project.liveUrl}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm"
                  >
                    <ExternalLink size={14} />
                    <span>Launch Live Deployment ↗</span>
                  </SafeExternalLink>
                ) : (
                  <Link
                    to={unavailableUrl}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-surface border border-amber/30 text-amber hover:bg-amber/10 transition-all shadow-sm"
                  >
                    <AlertTriangle size={14} />
                    <span>Deployment Unavailable (404 ↗)</span>
                  </Link>
                )}
              </div>

              {/* Clickable Project Cover Banner */}
              <div
                onClick={() => {
                  if (hasLiveDeploy) {
                    safeWindowOpen(project.liveUrl);
                  } else {
                    navigate(unavailableUrl);
                  }
                }}
                className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-border bg-surface2 cursor-pointer group shadow-2xl"
                title={hasLiveDeploy ? `Click to launch ${project.title} live demo` : `${project.title} — Deployment Unavailable (Click for 404 details)`}
              >
                <img
                  src={project.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/20 transition-all flex items-center justify-center">
                  <div className="px-5 py-2.5 rounded-xl bg-ink/90 border border-amber/70 text-amber font-mono text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasLiveDeploy ? (
                      <>
                        <ExternalLink size={15} />
                        <span>Click to Launch Live Demo Website ↗</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={15} className="text-red" />
                        <span className="text-red">Deployment Not Available (404) ↗</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-ink/90 border border-border text-xs font-mono text-cyan flex items-center gap-2 backdrop-blur-md">
                  {hasLiveDeploy ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
                      <span>Live Application Active</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber/80"></span>
                      <span className="text-muted">Private / VPC Staging</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">
        {/* Project Overview */}
        {project.overview && (
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-text flex items-center gap-2">
              <span className="font-mono text-cyan text-base font-normal">// 01</span>
              Project Overview
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {project.overview}
            </p>
          </section>
        )}

        {/* Problem & Solution Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem */}
          {project.problem && (
            <div className="p-6 sm:p-7 rounded-xl border border-red/30 bg-surface">
              <div className="flex items-center gap-2 text-xs font-mono text-red mb-3">
                <AlertTriangle size={15} />
                <span>THE CHALLENGE</span>
              </div>
              <h3 className="font-display text-lg font-bold text-text mb-2">The Problem</h3>
              <p className="text-sm text-muted leading-relaxed">
                {project.problem}
              </p>
            </div>
          )}

          {/* Solution */}
          {project.solution && (
            <div className="p-6 sm:p-7 rounded-xl border border-green/30 bg-surface">
              <div className="flex items-center gap-2 text-xs font-mono text-green mb-3">
                <Lightbulb size={15} />
                <span>OUR ARCHITECTURE</span>
              </div>
              <h3 className="font-display text-lg font-bold text-text mb-2">The Solution</h3>
              <p className="text-sm text-muted leading-relaxed">
                {project.solution}
              </p>
            </div>
          )}
        </section>

        {/* Engineering Approach */}
        {project.approach && (
          <section className="p-6 sm:p-8 rounded-xl border border-border bg-surface space-y-3">
            <h2 className="font-display text-xl font-bold text-text flex items-center gap-2">
              <Cpu size={18} className="text-amber" />
              Technical & Architectural Approach
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {project.approach}
            </p>
          </section>
        )}

        {/* Key Features */}
        {project.keyFeatures && project.keyFeatures.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-text flex items-center gap-2">
              <span className="font-mono text-cyan text-base font-normal">// 02</span>
              Key Technical Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border bg-surface flex items-start gap-3"
                >
                  <CheckCircle2 size={16} className="text-cyan shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-text/90 leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technologies Employed */}
        {project.technologies && project.technologies.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-text flex items-center gap-2">
              <Layers size={18} className="text-cyan" />
              Technologies & Frameworks
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono text-text flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber"></span>
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Results & Metrics */}
        {(project.challenges || project.results) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {project.challenges && (
              <div className="p-6 rounded-xl border border-border bg-surface">
                <h3 className="font-display text-base font-bold text-text mb-2">
                  Obstacles Overcome
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {project.challenges}
                </p>
              </div>
            )}

            {project.results && (
              <div className="p-6 rounded-xl border border-border bg-surface">
                <h3 className="font-display text-base font-bold text-text mb-2 text-green">
                  Measurable Impact & Metrics
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {project.results}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Studio Production Standards Scorecard */}
        <section className="p-6 sm:p-8 rounded-2xl border border-border bg-surface2/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-text flex items-center gap-2">
              <Gauge size={18} className="text-amber" />
              Architecture & Production Standards
            </h2>
            <span className="text-[11px] font-mono text-cyan bg-cyan/10 border border-cyan/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              // Studio Benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-3">
              <Zap size={18} className="text-amber shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-xs font-bold text-text">95+ Performance</div>
                <div className="text-[11px] text-muted">Lighthouse Web Vitals</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-3">
              <Cpu size={18} className="text-cyan shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-xs font-bold text-text">&lt;100ms Backend</div>
                <div className="text-[11px] text-muted">Database Query SLA</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-3">
              <ShieldCheck size={18} className="text-green shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-xs font-bold text-text">Strict Security</div>
                <div className="text-[11px] text-muted">Sanitization & CSP</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-xs font-bold text-text">100% Hand-Coded</div>
                <div className="text-[11px] text-muted">Clean Component Tree</div>
              </div>
            </div>
          </div>
        </section>

        {/* High-Conversion "Want a System Like This?" Card */}
        <section className="p-5 sm:p-8 lg:p-10 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface2 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber">
              <Sparkles size={13} />
              <span>Tailored Digital Engineering</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-text">
              Want a similar system built for your company?
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Skip agency bureaucracy. Speak directly with Akshat & Vasu to architect, design, and deploy a custom solution tailored to your product roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              to={`/contact?service=${encodeURIComponent(project.category || 'Custom Engineering')}&project=${encodeURIComponent(project.slug)}`}
              className="px-6 py-3 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all text-center shadow-glow-amber/20 shadow-md active:scale-95"
            >
              Build a Similar Project →
            </Link>
            <Link
              to="/services"
              className="px-5 py-3 rounded-lg text-xs font-mono text-muted hover:text-text border border-border bg-surface2 text-center transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </section>
      </div>

      {/* Next Project Footer Bar */}
      {nextProject && (
        <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted">Next Case Study</p>
            <h4 className="font-display text-lg font-bold text-text hover:text-amber">
              <Link to={`/projects/${nextProject.slug}`}>
                {nextProject.title} →
              </Link>
            </h4>
          </div>
          <Link
            to="/projects"
            className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-text"
          >
            view_all_projects()
          </Link>
        </div>
      )}
    </div>
  );
}

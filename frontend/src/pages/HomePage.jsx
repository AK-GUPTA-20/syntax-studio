import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Database,
  CheckCircle,
  ExternalLink,
  Award,
  Clock,
  HelpCircle,
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { getProjects, getServices, getTeam, getTestimonials, getSettings } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import ServiceCard from '../components/ServiceCard';
import TeamCard from '../components/TeamCard';
import TestimonialCard from '../components/TestimonialCard';
import TerminalBox from '../components/TerminalBox';
import AgencyComparison from '../components/AgencyComparison';
import ProcessRoadmap from '../components/ProcessRoadmap';
import FaqAccordion from '../components/FaqAccordion';
import { ProjectSkeleton, ServiceSkeleton, TestimonialSkeleton } from '../components/SkeletonLoader';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [projRes, servRes, teamRes, testRes, settRes] = await Promise.all([
          getProjects({ featured: 'true' }),
          getServices(),
          getTeam(),
          getTestimonials(),
          getSettings().catch(() => null)
        ]);
        setProjects(projRes || []);
        setServices(servRes || []);
        setTeam(teamRes || []);
        setTestimonials(testRes || []);
        setSettings(settRes || null);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const displayedCapabilities = (settings?.capabilities && settings.capabilities.length > 0)
    ? [...settings.capabilities]
        .map((c) => (typeof c === 'string' ? { title: c, desc: "Specialized engineering capability provided by our studio." } : c))
        .sort((a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999))
    : [];

  const top4PriorityProjects = [...projects]
    .sort((a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999))
    .slice(0, 4);

  const displayedStats = settings?.stats || [];

  return (
    <div className="relative">
      {/* 1. HERO SECTION WITH AMBIENT GLOW */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Ambient Neon Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber/15 via-cyan/10 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface/80 backdrop-blur-md text-xs font-mono mb-8 text-cyan shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
            <span>// {settings?.heroAnnouncement || '2-person engineering studio • Galgotias & ABES co-founders • Q4 Sprints Open'}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.08]">
                {settings?.tagline ? (
                  settings.tagline
                ) : (
                  <>
                    We build websites & APIs that <span className="gradient-text-amber">move businesses</span> forward.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl font-sans">
                {settings?.subtagline || 'We engineer custom web applications, e-commerce platforms, and resilient backend systems. Built for speed, scale, and clean architecture.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 hover:shadow-glow-amber transition-all shadow-md active:scale-95"
                >
                  Start a Project
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/projects"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-mono font-semibold bg-surface border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
                >
                  Explore Case Studies
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              {/* Quick Trust Highlights (Dynamic from settings.stats) */}
              {displayedStats.length > 0 && (
                <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/60 font-mono text-xs text-muted">
                  {displayedStats.map((stat, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface/50 border border-border/40">
                      <span className="font-display text-xl sm:text-2xl font-bold text-amber block">{stat.value}</span>
                      <span className="text-[11px] text-muted">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Terminal Interactive Showcase */}
            <div className="lg:col-span-5">
              <TerminalBox settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / CAPABILITIES SECTION (Dynamic from settings.capabilities) */}
      {(loading || displayedCapabilities.length > 0) && (
        <section className="py-20 border-y border-border/80 bg-surface/30">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
                  {settings?.capabilitiesBadge || "// Full-Cycle Capabilities"}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
                  {settings?.capabilitiesTitle || "Full-cycle web engineering capabilities."}
                </h2>
              </div>
              <p className="text-sm text-muted max-w-md font-sans">
                {settings?.capabilitiesSubtitle || "We cover the entire product lifecycle — combining computer science fundamentals with modern frontend craftsmanship."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedCapabilities.map((cap, i) => (
                <div
                  key={cap.id || i}
                  className="p-5 rounded-xl border border-border bg-surface hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-cyan font-mono text-xs font-bold">
                        0{i + 1}
                      </div>
                      {cap.priority && (
                        <span className="font-mono text-[10px] text-muted px-1.5 py-0.5 rounded bg-surface2 border border-border/70">
                          P{cap.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-text text-base mb-2">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed font-sans">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PROJECTS SECTION (Top 4 Priority Projects) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-2">
                {settings?.featuredProjectsBadge || "// Featured Projects"}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
                {settings?.featuredProjectsTitle || "Work engineered to deliver results."}
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber hover:text-cyan transition-colors"
            >
              <span>view_all_projects({projects.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => <ProjectSkeleton key={n} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {top4PriorityProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY FOUNDERS CHOOSE US (Agency Comparison Matrix) */}
      <section className="py-24 border-t border-border bg-surface/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <AgencyComparison comparisons={settings?.comparisonData} loading={loading} />
        </div>
      </section>

      {/* 6. 6-STAGE PROCESS ROADMAP */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <ProcessRoadmap steps={settings?.processSteps} loading={loading} />
        </div>
      </section>

      {/* 7. SERVICES SECTION */}
      <section className="py-24 border-t border-border bg-surface/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
              {settings?.servicesSectionBadge || "// What We Do"}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4">
              {settings?.servicesSectionTitle || "Comprehensive web development services."}
            </h2>
            <p className="text-sm text-muted">
              {settings?.servicesSectionSubtitle || "Whether you need a brand-new website from scratch or a high-traffic backend overhauled, we handle the engineering."}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => <ServiceSkeleton key={n} />)}
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${services.filter(s => s.enabled !== false).length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
              {services.filter(s => s.enabled !== false).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TEAM PREVIEW SECTION */}
      <section className="py-24 border-t border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
                {settings?.teamSectionBadge || "// The Studio Founders"}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
                {settings?.teamSectionTitle || "Two dedicated engineers. One unified studio."}
              </h2>
            </div>
            <p className="text-sm text-muted max-w-md">
              {settings?.teamSectionSubtitle || "We don't outsource your project to junior contractors. You communicate directly with the two engineers writing your code."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} compact={true} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS (Dynamic from Firestore) */}
      {(loading || testimonials.length > 0) && (
        <section className="py-24 border-t border-border bg-surface/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
                {settings?.testimonialsSectionBadge || "// Client Feedback"}
              </p>
              <h2 className="font-display text-3xl font-bold text-text mb-3">
                {settings?.testimonialsSectionTitle || "What collaborators say about working with us."}
              </h2>
              <p className="text-xs text-muted">
                {settings?.testimonialsSectionSubtitle || "Feedback from beta trials, campus organizations, and project collaborations."}
              </p>
            </div>

            {loading ? (
              <TestimonialSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((test) => (
                  <TestimonialCard key={test.id} testimonial={test} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 11. FAQ ACCORDION */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-2">
              // Client Questions Answered
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-3">
              Everything You Need To Know Before Kickoff
            </h2>
            <p className="text-sm text-muted font-sans">
              Have a question that isn't answered here? Reach out directly to Akshat or Vasu.
            </p>
          </div>

          <FaqAccordion customFaqs={settings?.faqs} loading={loading} />
        </div>
      </section>

      {/* 12. STRONG FINAL CTA WITH GUARANTEE */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <div className="p-8 sm:p-14 rounded-2xl border border-border bg-surface relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green/30 bg-green/10 text-green font-mono text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
              <span>Accepting New Client Sprints for Q4</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold text-text mb-5 leading-tight">
              {settings?.ctaTitle || (
                <>
                  Have an ambitious project in mind?<br />
                  <span className="gradient-text-amber">Let's build something exceptional.</span>
                </>
              )}
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-8 font-sans">
              {settings?.ctaDescription || "Share your requirements, business goals, or technical challenges. Our founders review inquiries within 24 hours with architectural scope and milestone estimates."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 rounded-lg text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 hover:shadow-glow-amber transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Start a Project with Us</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/services"
                className="px-6 py-4 rounded-lg text-sm font-mono font-semibold bg-surface2 border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
              >
                Explore Engineering Services
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted">
              <span className="flex items-center gap-1.5 text-green">
                <CheckCircle2 size={13} /> Direct Founder Communication
              </span>
              <span className="flex items-center gap-1.5 text-cyan">
                <CheckCircle2 size={13} /> 100% IP & Repo Ownership
              </span>
              <span className="flex items-center gap-1.5 text-amber">
                <CheckCircle2 size={13} /> 14-Day Free Bug Warranty
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

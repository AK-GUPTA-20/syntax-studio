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
  ExternalLink
} from 'lucide-react';
import { getProjects, getServices, getTeam, getTestimonials, getSettings } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import ServiceCard from '../components/ServiceCard';
import TeamCard from '../components/TeamCard';
import TestimonialCard from '../components/TestimonialCard';
import TerminalBox from '../components/TerminalBox';
import { ProjectSkeleton, ServiceSkeleton } from '../components/SkeletonLoader';

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

  const capabilities = [
    { title: "Full-Stack Development", desc: "End-to-end applications from front to back with zero data mismatches." },
    { title: "Bespoke Web Design", desc: "Modern, human-crafted interfaces that elevate brand authority." },
    { title: "High-Performance APIs", desc: "Low-latency RESTful microservices and resilient architectures." },
    { title: "E-Commerce Architecture", desc: "Custom stores with instant catalogs, cart state, and payment webhooks." },
    { title: "Web Applications & SaaS", desc: "Interactive dashboards, portals, and MVPs designed for rapid scale." },
    { title: "Database Optimization", desc: "Schema design, indexing, and caching reducing response times by up to 85%." },
    { title: "AI & Data Pipelines", desc: "Structured LLM workflow integrations, batch parsers, and automation." },
    { title: "Continuous Maintenance", desc: "Proactive uptime monitoring, security audits, and guaranteed turnaround SLAs." },
  ];

  const technologies = [
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Express.js", category: "Backend" },
    { name: "Firebase", category: "Cloud Database" },
    { name: "PostgreSQL", category: "Relational DB" },
    { name: "Next.js", category: "Full-Stack" },
    { name: "TypeScript", category: "Language" },
    { name: "JavaScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Framer Motion", category: "Animation" },
    { name: "Redis", category: "Caching" },
    { name: "Docker", category: "DevOps" },
    { name: "Git & GitHub", category: "Version Control" },
    { name: "Figma", category: "UI/UX" },
  ];

  const displayedCapabilities = (settings?.capabilities && settings.capabilities.length > 0)
    ? [...settings.capabilities]
        .map((c, i) => (typeof c === 'string' ? { title: c, desc: capabilities[i]?.desc || "Specialized engineering capability provided by our studio." } : c))
        .sort((a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999))
    : capabilities;

  const top4PriorityProjects = [...projects]
    .sort((a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999))
    .slice(0, 4);

  const displayedStats = (settings?.stats && settings.stats.length > 0)
    ? settings.stats
    : [
        { value: "850+", label: "DSA Problems Solved" },
        { value: "100%", label: "Custom Hand-Coded" },
        { value: "<100ms", label: "Average API Latency" }
      ];

  const displayedTechnologies = (settings?.technologies && settings.technologies.length > 0)
    ? settings.technologies
    : technologies;

  return (
    <div className="relative">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-mono mb-8 text-cyan shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
            <span>// {settings?.heroAnnouncement || '2-person engineering studio • Galgotias & ABES co-founders'}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.08]">
                {settings?.tagline ? (
                  settings.tagline
                ) : (
                  <>We build websites that <span className="text-amber">move businesses</span> forward.</>
                )}
              </h1>

              <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl font-sans">
                {settings?.subtagline || 'From technical strategy and custom UI/UX design to high-throughput backend systems and cloud deployment, we craft fast, modern digital experiences for ambitious companies.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md active:scale-95"
                >
                  Start a Project
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/projects"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-mono font-semibold bg-surface border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
                >
                  Explore Our Work
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 max-w-lg font-mono text-xs text-muted">
                {displayedStats.map((stat, i) => (
                  <div key={i}>
                    <span className="font-display text-xl font-bold text-text block">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Terminal Interactive Showcase */}
            <div className="lg:col-span-5">
              <TerminalBox settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / CAPABILITIES SECTION */}
      <section className="py-20 border-y border-border/80 bg-surface/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
                {settings?.capabilitiesBadge || "// Capabilities"}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
                {settings?.capabilitiesTitle || "Full-cycle web engineering capabilities."}
              </h2>
            </div>
            <p className="text-sm text-muted max-w-md font-sans">
              {settings?.capabilitiesSubtitle || "We cover the entire product lifecycle — combining systems programming discipline with modern frontend craftsmanship."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedCapabilities.map((cap, i) => (
              <div
                key={cap.id || i}
                className="p-5 rounded-xl border border-border bg-surface hover-lift"
              >
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
                <p className="text-xs text-muted leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS SECTION (Top 4 Priority Projects) */}
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
              <span>view_all_projects({projects.length || 8})</span>
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

      {/* 4. SERVICES SECTION */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => <ServiceSkeleton key={n} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. TEAM PREVIEW SECTION */}
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
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TECHNOLOGIES WE WORK WITH */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-2">
            {settings?.techSectionBadge || "// Technology Arsenal"}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text mb-3">
            {settings?.techSectionTitle || "Modern, battle-tested tools. Zero obsolete bloat."}
          </h2>
          <p className="text-xs text-muted max-w-xl mx-auto mb-10">
            {settings?.techSectionSubtitle || "We intentionally build on Firebase, PostgreSQL, React, and Node.js for predictable performance, airtight security, and cloud scalability."}
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {displayedTechnologies.map((tech) => (
              <div
                key={tech.name}
                className="px-4 py-2 rounded-lg border border-border bg-surface hover:border-amber/40 flex items-center gap-2 transition-all hover-lift"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber"></span>
                <span className="font-mono text-xs text-text font-medium">{tech.name}</span>
                <span className="text-[10px] font-mono text-muted">({tech.category})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <TestimonialCard key={test.id} testimonial={test} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. STRONG FINAL CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <div className="p-8 sm:p-14 rounded-2xl border border-border bg-surface relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

            <p className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">
              {settings?.ctaBadge || "// Ready To Build?"}
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-text mb-5 leading-tight">
              {settings?.ctaTitle || (
                <>
                  Have a project in mind?<br />
                  <span className="text-amber">Let's build something that works.</span>
                </>
              )}
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-xl mx-auto mb-8 font-sans">
              {settings?.ctaDescription || "Tell us about your timeline, business requirements, or technical challenges. We respond with technical feedback and estimated scope within 24 hours."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact"
                className="px-7 py-3.5 rounded-lg text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Start a Conversation</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/services"
                className="px-6 py-3.5 rounded-lg text-sm font-mono font-semibold bg-surface2 border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all"
              >
                Explore Services & Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

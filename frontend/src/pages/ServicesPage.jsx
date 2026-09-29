import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  HelpCircle,
  Layers,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Award,
  Check
} from 'lucide-react';
import { getServices, getSettings } from '../api/client';
import { ServiceSkeleton, TierSkeleton } from '../components/SkeletonLoader';
import FaqAccordion from '../components/FaqAccordion';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, settingsData] = await Promise.all([
          getServices(),
          getSettings().catch(() => null)
        ]);
        setServices(servicesData || []);
        setSettings(settingsData || null);
      } catch (err) {
        console.error('Failed to load services data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const engagementTiers = settings?.engagementTiers || [];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-mono mb-4 text-cyan shadow-sm">
          <span>{settings?.servicesPageBadge || "// Full-Cycle Engineering Services"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-5 leading-tight">
          {settings?.servicesPageTitle || "Engineered for Velocity, Scale & Security"}
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
          {settings?.servicesPageSubtitle || "From responsive, hand-crafted frontend interfaces to resilient high-throughput backend APIs, we engineer custom software that solves real business bottlenecks."}
        </p>
      </div>

      {/* Engagement Models & Tiers */}
      {(loading || engagementTiers.length > 0) && (
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">// Engagement Models</p>
            <h2 className="font-display text-3xl font-bold text-text">Transparent, Milestone-Based Sprints</h2>
            <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
              Every engagement is fixed-price. Zero hourly surprises, zero retainers until work is delivered.
            </p>
          </div>

          {loading ? (
            <TierSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {engagementTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
                    tier.popular
                      ? 'bg-surface2/80 border-amber shadow-glow-amber/20 ring-1 ring-amber/50'
                      : 'bg-surface border-border hover:border-border/80'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber text-ink text-[11px] font-mono font-bold uppercase tracking-wider">
                      ★ Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {tier.badge && (
                        <span className="text-[11px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                          {tier.badge}
                        </span>
                      )}
                      {tier.timeline && (
                        <span className="text-xs font-mono text-muted flex items-center gap-1">
                          <Clock size={12} className="text-amber" />
                          {tier.timeline}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-text mb-2">{tier.name}</h3>
                    {tier.target && (
                      <p className="text-xs text-muted leading-relaxed font-sans mb-5">{tier.target}</p>
                    )}

                    {tier.price && (
                      <div className="pb-5 mb-5 border-b border-border/80">
                        <span className="font-mono text-xs text-muted block">Fixed-Price Range</span>
                        <span className="font-display text-2xl font-bold text-amber">{tier.price}</span>
                      </div>
                    )}

                    {tier.features && tier.features.length > 0 && (
                      <div className="space-y-2.5 mb-8">
                        <p className="text-[11px] font-mono text-text font-semibold uppercase tracking-wider">// Included Deliverables:</p>
                        {tier.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs font-mono text-muted">
                            <Check size={14} className="text-green shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/contact?service=${encodeURIComponent(tier.name)}&budget=${encodeURIComponent(tier.price || '')}`}
                    className={`w-full py-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all ${
                      tier.popular
                        ? 'bg-amber text-ink hover:bg-amber/90 shadow-md'
                        : 'bg-surface2 border border-border text-text hover:border-cyan/50 hover:text-cyan'
                    }`}
                  >
                    <span>{tier.ctaText || 'Inquire for Sprint'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Services Detailed List */}
      <section className="mb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-mono text-xs text-cyan uppercase tracking-wider mb-2">// Capabilities Catalog</p>
          <h2 className="font-display text-3xl font-bold text-text">Specialized Engineering Modules</h2>
          <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
            Modular services we assemble to create tailored solutions for your platform.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {[1, 2, 3, 4].map((n) => <ServiceSkeleton key={n} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 rounded-2xl border border-border bg-surface text-center space-y-3 font-mono text-xs">
            <p className="text-text font-medium text-sm">No engineering services found in the database.</p>
            <p className="text-muted">Use the administrative panel to publish new service modules.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {services.map((service, index) => (
              <div
                key={service.id || index}
                className="rounded-2xl border border-border bg-surface p-8 sm:p-10 hover-lift relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Overview Column */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-amber font-semibold px-2.5 py-1 rounded bg-amber/10 border border-amber/30">
                        // {service.code || `0${index + 1}`}
                      </span>
                      {service.typicalTimeline && (
                        <span className="font-mono text-xs text-muted flex items-center gap-1">
                          <Clock size={12} className="text-amber" />
                          <span>Timeline: {service.typicalTimeline}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-text">
                      {service.title}
                    </h2>

                    <p className="text-sm text-muted leading-relaxed font-sans">
                      {service.overview || service.shortDescription}
                    </p>

                    {/* Tech stack */}
                    {service.technologies && service.technologies.length > 0 && (
                      <div className="pt-2">
                        <p className="font-mono text-xs text-cyan mb-2">// Core Stack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 rounded text-xs font-mono bg-surface2 border border-border text-text/90"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Link
                        to={`/contact?service=${encodeURIComponent(service.title)}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
                      >
                        <span>Inquire About {service.title}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Columns: Problems & Deliverables */}
                  <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface2/40 p-6 rounded-xl border border-border/60">
                    {/* Problems We Solve */}
                    <div>
                      <h3 className="font-mono text-xs text-amber uppercase tracking-wider mb-3 font-semibold">
                        Problems We Solve:
                      </h3>
                      <ul className="space-y-2 text-xs text-muted font-sans">
                        {(service.problemsSolved || []).map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber mt-0.5 font-bold">›</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <h3 className="font-mono text-xs text-green uppercase tracking-wider mb-3 font-semibold">
                        What We Deliver:
                      </h3>
                      <ul className="space-y-2 text-xs text-muted font-sans">
                        {(service.deliverables || []).map((d, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-green shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Client Questions & Answers */}
      <section className="mb-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
            // Client Questions & Answers
          </p>
          <h2 className="font-display text-3xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 font-sans">
            Clear, honest answers about our engineering process, milestones, and guarantees.
          </p>
        </div>

        <FaqAccordion customFaqs={settings?.faqs} loading={loading} />
      </section>

      {/* Final Call to Action */}
      <div className="p-8 sm:p-14 rounded-2xl border border-border bg-surface text-center space-y-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="font-display text-3xl sm:text-4xl font-bold text-text">
          {settings?.ctaTitle || "Ready to launch your project on schedule?"}
        </h2>
        <p className="text-sm text-muted max-w-lg mx-auto font-sans">
          {settings?.ctaDescription || "Contact our team today to get a detailed technical architecture proposal and sprint timeline estimate."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md active:scale-95"
          >
            <span>Start a Project</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Cpu, HelpCircle, Layers } from 'lucide-react';
import { getServices, getSettings } from '../api/client';
import { ServiceSkeleton } from '../components/SkeletonLoader';

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

  const defaultFaqs = [
    {
      q: "How does working with a 2-person studio differ from a traditional agency?",
      a: "Traditional agencies bill for account managers, sales reps, and overhead, often handing actual coding off to junior contractors. At Syntax Studio, you collaborate directly with founders Akshat Gupta & Vasu Singhal from architecture to deployment."
    },
    {
      q: "What is your typical project timeline?",
      a: "Landing pages and corporate business websites typically take 1 to 2 weeks. Full-scale web applications, custom e-commerce stores, and complex REST backends typically take 3 to 5 weeks with weekly milestone demos."
    },
    {
      q: "Why do you use Firebase & PostgreSQL instead of generic shared hosting?",
      a: "We choose technologies that provide sub-second query performance, automated zero-downtime backups, and predictable cloud scaling without security vulnerabilities."
    },
    {
      q: "Do you offer post-launch maintenance and support?",
      a: "Yes. We offer monthly engineering retainers covering 24/7 uptime monitoring, security patching, dependency upgrades, and rapid feature iterations."
    }
  ];

  const displayedFaqs = settings?.faqs && settings.faqs.length > 0 ? settings.faqs : defaultFaqs;

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono mb-4 text-cyan">
          <span>{settings?.servicesPageBadge || "// Full-Cycle Engineering Services"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-5 leading-tight">
          {settings?.servicesPageTitle || "Services Designed for Scale & Reliability"}
        </h1>
        <p className="text-base text-muted leading-relaxed">
          {settings?.servicesPageSubtitle || "From high-performance frontend interfaces to high-throughput backend APIs, we engineer custom web software that solves real business problems."}
        </p>
      </div>

      {/* Services Detailed List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {[1, 2, 3, 4].map((n) => <ServiceSkeleton key={n} />)}
        </div>
      ) : (
        <div className="space-y-12 mb-24">
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
                      <span className="font-mono text-xs text-muted">
                        Timeline: {service.typicalTimeline}
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
                  <div className="pt-2">
                    <p className="font-mono text-xs text-cyan mb-2">// Core Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(service.technologies || []).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded text-xs font-mono bg-surface2 border border-border text-text/90"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm"
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
                    <h3 className="font-mono text-xs text-amber uppercase tracking-wider mb-3">
                      Problems We Solve:
                    </h3>
                    <ul className="space-y-2 text-xs text-muted">
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
                    <h3 className="font-mono text-xs text-green uppercase tracking-wider mb-3">
                      What We Deliver:
                    </h3>
                    <ul className="space-y-2 text-xs text-muted">
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

      {/* Frequently Asked Questions */}
      <section className="mb-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-amber uppercase tracking-wider mb-2">
            {settings?.faqBadge || "// FAQ"}
          </p>
          <h2 className="font-display text-3xl font-bold text-text">
            {settings?.faqTitle || "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedFaqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-surface">
              <h3 className="font-display font-semibold text-text text-base mb-2 flex items-start gap-2">
                <HelpCircle size={17} className="text-cyan shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <div className="p-8 sm:p-12 rounded-2xl border border-border bg-surface text-center space-y-4">
        <h2 className="font-display text-3xl font-bold text-text">
          {settings?.ctaTitle || "Ready to launch your project?"}
        </h2>
        <p className="text-sm text-muted max-w-lg mx-auto">
          {settings?.ctaDescription || "Contact our team today to get a detailed proposal and technical estimate."}
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-md"
        >
          <span>Start a Project</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

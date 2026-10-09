import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  ArrowRight,
  Cpu,
  Database,
  Code2,
  Percent,
  RefreshCw
} from 'lucide-react';

const PROJECT_TYPES = [
  {
    id: 'ecommerce',
    title: 'E-Commerce Storefront',
    description: 'High-converting online store with cart, payment gateway, inventory & order dashboard.',
    basePrice: 12000,
    baseWeeks: 3,
    icon: Layers,
    recommendedStack: ['Next.js', 'Node.js', 'Razorpay', 'Firestore', 'Tailwind']
  },
  {
    id: 'saas',
    title: 'Full-Stack SaaS Platform',
    description: 'Multi-tenant cloud application with role-based auth, subscription billing, and real-time dashboard.',
    basePrice: 18000,
    baseWeeks: 4,
    icon: Cpu,
    recommendedStack: ['React', 'Express', 'JWT Auth', 'PostgreSQL/Firestore', 'Stripe']
  },
  {
    id: 'website',
    title: 'Modern Digital Presence',
    description: 'Ultra-fast marketing website with rich animations, CMS content management & 100/100 Lighthouse SEO.',
    basePrice: 8000,
    baseWeeks: 2,
    icon: Code2,
    recommendedStack: ['Vite', 'React', 'Framer Motion', 'Tailwind CSS', 'Vercel']
  },
  {
    id: 'backend',
    title: 'Scalable APIs & Systems',
    description: 'High-throughput microservices, database schema design, caching layers & secure webhooks.',
    basePrice: 14000,
    baseWeeks: 3,
    icon: Database,
    recommendedStack: ['Node.js', 'Express', 'Redis', 'Firebase Admin', 'Docker']
  }
];

const FEATURE_ADDONS = [
  { id: 'auth', label: 'Auth & Role Permissions', price: 2000, days: 3 },
  { id: 'payment', label: 'Payment Gateway (UPI/Cards)', price: 3000, days: 4 },
  { id: 'ai', label: 'Gemini / AI Intelligence', price: 4500, days: 5 },
  { id: 'realtime', label: 'Live WebSockets / Notifications', price: 2500, days: 3 },
  { id: 'admin', label: 'Executive Admin Dashboard', price: 3500, days: 4 },
  { id: 'media', label: 'ImageKit / Cloud CDN Delivery', price: 1500, days: 2 },
  { id: 'seo', label: 'Enterprise SEO & Schema Markup', price: 1800, days: 2 },
  { id: 'audit', label: 'Bank-Grade Security Hardening', price: 2200, days: 3 }
];

const TIMELINE_SPEEDS = [
  { id: 'standard', label: 'Standard Delivery', multiplier: 1.0, badge: 'Standard Sprint' },
  { id: 'express', label: 'Accelerated Pace', multiplier: 1.25, badge: '25% Faster' },
  { id: 'urgent', label: 'Rapid Prototype / MVP', multiplier: 1.5, badge: 'Priority Sprint' }
];

export default function ProjectEstimator({ promoDiscount = 10 }) {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState('ecommerce');
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'payment', 'admin']);
  const [selectedSpeed, setSelectedSpeed] = useState('standard');
  const [applyPromo, setApplyPromo] = useState(true);

  const toggleFeature = (id) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const project = PROJECT_TYPES.find(p => p.id === selectedType) || PROJECT_TYPES[0];
    const featuresCost = selectedFeatures.reduce((acc, featId) => {
      const feat = FEATURE_ADDONS.find(f => f.id === featId);
      return acc + (feat ? feat.price : 0);
    }, 0);

    const featureDays = selectedFeatures.reduce((acc, featId) => {
      const feat = FEATURE_ADDONS.find(f => f.id === featId);
      return acc + (feat ? feat.days : 0);
    }, 0);

    const speed = TIMELINE_SPEEDS.find(s => s.id === selectedSpeed) || TIMELINE_SPEEDS[0];

    const subtotal = (project.basePrice + featuresCost) * speed.multiplier;
    const discountAmount = applyPromo ? (subtotal * promoDiscount) / 100 : 0;
    const finalEstimate = Math.round(subtotal - discountAmount);

    const totalDays = Math.round((project.baseWeeks * 7 + featureDays) / (speed.multiplier === 1.5 ? 1.6 : (speed.multiplier === 1.25 ? 1.3 : 1)));
    const totalWeeks = Math.max(1, Math.round(totalDays / 7));

    return {
      project,
      subtotal: Math.round(subtotal),
      discountAmount: Math.round(discountAmount),
      finalEstimate,
      estimatedWeeks: totalWeeks,
      estimatedDays: totalDays,
      speed
    };
  }, [selectedType, selectedFeatures, selectedSpeed, applyPromo, promoDiscount]);

  const handleProceedToContact = () => {
    const typeObj = PROJECT_TYPES.find(p => p.id === selectedType);
    const budgetRange = `₹${calculation.finalEstimate.toLocaleString('en-IN')} (Estimated)`;
    const timelineLabel = `${calculation.estimatedWeeks} — ${calculation.estimatedWeeks + 1} Weeks (${calculation.speed.label})`;
    const featureLabels = selectedFeatures
      .map(id => FEATURE_ADDONS.find(f => f.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const params = new URLSearchParams({
      projectType: typeObj?.title || 'Custom Engineering',
      budget: budgetRange,
      timeline: timelineLabel,
      code: applyPromo ? 'syntaxStudio' : '',
      scopeSummary: `Custom Scope: ${typeObj?.title} with [${featureLabels}]. Estimated ₹${calculation.finalEstimate.toLocaleString('en-IN')} within ${timelineLabel}.`
    });

    navigate(`/contact?${params.toString()}`);
  };

  return (
    <div className="relative rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
      {/* Ambient background glow inside card */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan mb-2">
            <Calculator size={13} className="text-cyan animate-pulse" />
            <span>Interactive Scope & Investment Estimator</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-text">
            Configure Your Project Architecture
          </h3>
          <p className="text-sm text-muted mt-1 max-w-xl">
            Select your target specifications, modules, and sprint velocity. Receive an instant transparent ballpark estimate backed by our fixed-milestone guarantee.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedType('ecommerce');
            setSelectedFeatures(['auth', 'payment', 'admin']);
            setSelectedSpeed('standard');
            setApplyPromo(true);
          }}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 text-xs font-mono text-muted hover:text-text hover:border-border transition-all"
          title="Reset to default scope"
        >
          <RefreshCw size={12} />
          <span>reset()</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Project Type Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
              <span>01 // Select Platform Architecture</span>
              <span className="text-cyan font-semibold">1 of 3</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`text-left p-4 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'border-cyan bg-cyan/10 shadow-glow-cyan/20 ring-1 ring-cyan/40'
                        : 'border-border/70 bg-surface2/60 hover:border-border hover:bg-surface2'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan text-ink' : 'bg-surface3 text-cyan'}`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-mono text-xs text-muted">
                        from ₹{type.basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="font-display font-semibold text-sm text-text">
                      {type.title}
                    </div>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Essential Modules & Add-ons */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
              <span>02 // Choose Modular Add-Ons</span>
              <span className="text-amber font-semibold">{selectedFeatures.length} Selected</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FEATURE_ADDONS.map((feat) => {
                const isChecked = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isChecked
                        ? 'border-amber bg-amber/10 shadow-glow-amber/20 ring-1 ring-amber/30 text-text'
                        : 'border-border/60 bg-surface2/40 hover:border-border text-muted hover:text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors">
                        {isChecked && <CheckCircle2 size={13} className="text-amber" />}
                      </div>
                      <span className="text-[10px] font-mono text-muted">+₹{feat.price}</span>
                    </div>
                    <div className="text-xs font-medium leading-tight">
                      {feat.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Sprint Velocity */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
              <span>03 // Sprint Timeline & Velocity</span>
              <span className="text-green font-semibold">Speed Profile</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TIMELINE_SPEEDS.map((speed) => {
                const isSpeedSelected = selectedSpeed === speed.id;
                return (
                  <button
                    key={speed.id}
                    type="button"
                    onClick={() => setSelectedSpeed(speed.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSpeedSelected
                        ? 'border-green bg-green/10 ring-1 ring-green/40 shadow-sm'
                        : 'border-border/60 bg-surface2/40 hover:border-border text-muted hover:text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-text">{speed.label}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface3 text-green">
                        {speed.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">
                      {speed.id === 'standard' && 'Balanced sprints with comprehensive unit testing.'}
                      {speed.id === 'express' && 'Dedicated daily pair-programming velocity.'}
                      {speed.id === 'urgent' && 'Fastest track with prioritized architecture delivery.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Live Estimate Breakdown Card */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/80 bg-surface2/70 p-6 sm:p-7 relative overflow-hidden shadow-inner">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">// Live Scope Breakdown</span>
              <div className="flex items-center gap-1.5 text-xs text-green font-mono">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>

            {/* Architecture Stack Tag Chips */}
            <div>
              <div className="text-xs font-mono text-muted mb-2">Recommended Engine:</div>
              <div className="flex flex-wrap gap-1.5">
                {calculation.project.recommendedStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md bg-surface3 border border-border/80 text-[11px] font-mono text-cyan"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-muted">
                <span>Base Platform:</span>
                <span className="text-text font-semibold">₹{calculation.project.basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Selected Add-Ons ({selectedFeatures.length}):</span>
                <span className="text-text font-semibold">
                  +₹{selectedFeatures.reduce((acc, id) => acc + (FEATURE_ADDONS.find(f => f.id === id)?.price || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              {calculation.speed.multiplier > 1.0 && (
                <div className="flex justify-between text-muted">
                  <span>Sprint Acceleration:</span>
                  <span className="text-amber">+{Math.round((calculation.speed.multiplier - 1) * 100)}%</span>
                </div>
              )}
              {applyPromo && calculation.discountAmount > 0 && (
                <div className="flex justify-between text-green">
                  <span className="flex items-center gap-1">
                    <Percent size={11} />
                    <span>Promo Discount ({promoDiscount}%):</span>
                  </span>
                  <span>-₹{calculation.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Promo Code Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyPromo}
                  onChange={(e) => setApplyPromo(e.target.checked)}
                  className="rounded border-border text-amber focus:ring-amber bg-surface3"
                />
                <span className="text-muted">
                  Apply active studio discount code (<span className="text-amber font-semibold">syntaxStudio</span>)
                </span>
              </label>
            </div>

            {/* Big Total & Timeline */}
            <div className="p-4 rounded-xl bg-ink/70 border border-border/80 space-y-3">
              <div>
                <div className="text-[11px] font-mono text-muted uppercase tracking-wider">Ballpark Investment</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-amber">
                    ₹{calculation.finalEstimate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-mono text-muted">/ milestone-fixed</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs font-mono text-cyan">
                <Clock size={14} className="text-cyan shrink-0" />
                <span>Estimated Timeline: ~{calculation.estimatedWeeks} Weeks ({calculation.estimatedDays} Days)</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <button
              onClick={handleProceedToContact}
              className="w-full group py-3 px-5 rounded-xl bg-amber hover:bg-amber/90 text-ink font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-amber/25 hover:shadow-glow-amber-lg active:scale-[0.99]"
            >
              <span>Lock In This Scope & Book Sprint</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[11px] text-center text-muted mt-2 font-mono">
              Pre-fills your inquiry details • 14-day warranty included • Zero obligation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

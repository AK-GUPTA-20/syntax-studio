import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Calculator,
  MessageSquare,
  Sparkles,
  X,
  ArrowRight,
  Mail,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function QuickActionPill() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Don't render on admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <aside aria-label="Quick action reachout menu" className="fixed bottom-6 right-6 z-40 font-mono">
      {/* Expanded Modal / Card */}
      {isOpen ? (
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-2xl max-w-xs w-80 animate-fadeSlideDown relative backdrop-blur-xl bg-surface/95">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse"></span>
              <span className="text-xs font-bold text-text">Founders Available</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted hover:text-text hover:bg-surface2 transition-colors"
              aria-label="Close reachout widget"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-xs text-muted mb-4 font-sans leading-relaxed">
            Need an accurate timeline, architecture advice, or quick budget estimate?
          </p>

          <div className="space-y-2">
            <Link
              to="/services#estimator"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface2 border border-border hover:border-amber/50 hover:bg-amber/5 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber/10 text-amber flex items-center justify-center">
                  <Calculator size={14} />
                </div>
                <div>
                  <div className="font-bold text-text group-hover:text-amber transition-colors">
                    Scope & Cost Estimator
                  </div>
                  <div className="text-[10px] text-muted">Instant price calculator</div>
                </div>
              </div>
              <ArrowRight size={13} className="text-muted group-hover:text-amber group-hover:translate-x-0.5 transition-all" />
            </Link>

            <a
              href="https://wa.me/9027278481?text=Hi%20Syntax%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project%20scope."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface2 border border-border hover:border-green/50 hover:bg-green/5 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-green/10 text-green flex items-center justify-center">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <div className="font-bold text-text group-hover:text-green transition-colors">
                    Direct WhatsApp Chat
                  </div>
                  <div className="text-[10px] text-muted">Chat with Akshat & Vasu</div>
                </div>
              </div>
              <ArrowRight size={13} className="text-muted group-hover:text-green group-hover:translate-x-0.5 transition-all" />
            </a>

            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-amber text-ink font-bold hover:bg-amber/90 transition-all text-xs active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>Start a Project Inquiry</span>
              </div>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 text-[10px] text-muted flex items-center justify-between">
            <span className="flex items-center gap-1 text-green">
              <CheckCircle2 size={10} /> 24h Response SLA
            </span>
            <span>100% Confidential</span>
          </div>
        </div>
      ) : (
        /* Collapsed Floating Pill */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface/90 border border-border hover:border-amber/60 text-text hover:text-amber shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Open reachout widget"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
          </span>
          <span className="text-xs font-bold text-text group-hover:text-amber transition-colors flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber" />
            <span>Estimate Scope</span>
          </span>
        </button>
      )}
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Clock } from 'lucide-react';
import { getSettings } from '../api/client';

export default function TermsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-amber/20 border-t-amber animate-spin" />
          <span className="font-mono text-sm text-muted">loading_terms()...</span>
        </div>
      </div>
    );
  }

  const termsContent = settings?.termsAndConditions;
  
  if (!termsContent) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-text mb-2">No Terms Configured</h2>
          <p className="text-muted text-sm mb-6">The terms and conditions have not been set up yet.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface2 text-text font-mono text-sm border border-border hover:border-amber/50 transition-all"
          >
            <ArrowLeft size={16} />
            back_to_contact()
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-muted hover:text-text font-mono text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            back_to_contact()
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-cyan" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text">
              Terms & Conditions
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-muted">
            {settings?.termsLastUpdated && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber" />
                <span>Last Updated: {settings.termsLastUpdated}</span>
              </div>
            )}
            {settings?.termsVersion && (
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-cyan" />
                <span>Version {settings.termsVersion}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-10">
          <div className="prose prose-invert max-w-none text-text">
            {termsContent.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4 text-sm md:text-base leading-relaxed text-muted">
                  {paragraph}
                </p>
              ) : <div key={index} className="h-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

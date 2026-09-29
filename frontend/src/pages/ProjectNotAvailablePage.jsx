import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Layers, Mail } from 'lucide-react';

export default function ProjectNotAvailablePage() {
  const [searchParams] = useSearchParams();
  const projectSlug = searchParams.get('project') || '';
  const projectTitle = searchParams.get('title') || 'Requested Project';

  return (
    <div className="relative pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted mb-8">
        <Link to="/projects" className="hover:text-text flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>~/projects</span>
        </Link>
        <span className="text-border">/</span>
        <span className="text-amber truncate max-w-[200px] sm:max-w-none">404-deployment-not-available</span>
      </div>

      {/* Main Terminal Error Card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border bg-surface2/70 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green/80 inline-block"></span>
            <span className="text-muted ml-2 truncate max-w-[170px] sm:max-w-none">syntax_edge_router // status_code: 404</span>
          </div>
          <span className="text-red font-semibold uppercase tracking-wider text-[11px] shrink-0">
            DEPLOYMENT_RESTRICTED
          </span>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 lg:p-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red/30 bg-red/10 text-xs font-mono text-red">
              <ShieldAlert size={14} />
              <span>// 404 — Public Deployment Not Available</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-text leading-tight">
              Deployment Unavailable
            </h1>

            <p className="text-base text-muted max-w-2xl leading-relaxed">
              The public deployment URL for{' '}
              <span className="text-amber font-semibold">{decodeURIComponent(projectTitle)}</span>{' '}
              is currently not accessible on the open web.
            </p>
          </div>

          {/* Diagnostic Details Box */}
          <div className="p-6 rounded-xl border border-border bg-surface2/50 font-mono text-xs space-y-3">
            <div className="text-cyan font-bold uppercase tracking-wider">// Technical Reason:</div>
            <ul className="space-y-2 text-muted list-disc list-inside">
              <li>
                <span className="text-text">Private Staging / Client VPC:</span> Built for private internal infrastructure or enterprise intranet.
              </li>
              <li>
                <span className="text-text">Client Confidentiality:</span> Live instances are protected under non-disclosure agreements.
              </li>
              <li>
                <span className="text-text">Scheduled Architecture Maintenance:</span> The deployment instance is undergoing database or security upgrades.
              </li>
            </ul>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
            {projectSlug && (
              <Link
                to={`/projects/${projectSlug}`}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all flex items-center gap-1.5 shadow-md"
              >
                <Layers size={14} />
                <span>Read Technical Case Study</span>
              </Link>
            )}

            <Link
              to="/projects"
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-surface border border-border text-text hover:border-cyan/50 hover:text-cyan transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Browse All Projects</span>
            </Link>

            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-surface2 border border-border text-muted hover:text-text transition-all flex items-center gap-1.5"
            >
              <Mail size={14} />
              <span>Request Private Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

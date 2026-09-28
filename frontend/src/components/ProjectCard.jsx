import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Globe, AlertTriangle } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const {
    slug,
    title,
    shortDescription,
    category,
    year,
    technologies = [],
    liveUrl,
    coverImage,
    accentColor = '#5FC8C8'
  } = project;

  const hasLiveDeploy = Boolean(
    liveUrl && liveUrl.trim() !== '' && liveUrl !== '#' && !liveUrl.includes('github.com')
  );
  const unavailableUrl = `/not-available?project=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (hasLiveDeploy) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(unavailableUrl);
    }
  };

  const displayImage = coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80';

  return (
    <article className="group rounded-xl border border-border bg-surface overflow-hidden hover-lift flex flex-col justify-between transition-all duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface2/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          <span className="text-muted">{category}</span>
          <span className="text-border">/</span>
          <span className="text-muted">{year}</span>
        </div>

        {/* Deploy Status Indicator (No GitHub URL) */}
        <div className="flex items-center gap-2">
          {hasLiveDeploy ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-amber transition-colors flex items-center gap-1 font-semibold text-xs"
              title="Open Live Website"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe size={13} className="text-amber" />
              <span>live ↗</span>
            </a>
          ) : (
            <Link
              to={unavailableUrl}
              className="text-muted/70 hover:text-amber transition-colors flex items-center gap-1 text-[11px]"
              title="Deployment not publicly available (404)"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle size={12} className="text-amber/90" />
              <span>deploy: 404</span>
            </Link>
          )}
        </div>
      </div>

      {/* Clickable Image Banner (Opens live website or 404 not available page) */}
      <div
        onClick={handleImageClick}
        className="relative h-48 w-full overflow-hidden bg-surface2 cursor-pointer group/img border-b border-border/60"
        title={hasLiveDeploy ? `Click to launch ${title} live website` : `${title} — Deployment Unavailable (Click for details)`}
      >
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
        />

        {/* Overlay with Launch or 404 Badge */}
        <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
          <div className="px-4 py-2 rounded-lg bg-ink/90 border border-amber/60 text-amber font-mono text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-sm">
            {hasLiveDeploy ? (
              <>
                <ExternalLink size={14} />
                <span>Launch Live Website ↗</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="text-red" />
                <span className="text-red">Deployment Not Available (404) ↗</span>
              </>
            )}
          </div>
        </div>

        {/* Direct Status Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-ink/80 border border-border text-[10px] font-mono text-cyan flex items-center gap-1.5 backdrop-blur-sm shadow-md">
          {hasLiveDeploy ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
              <span>click to open site</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber/80"></span>
              <span className="text-muted">private staging</span>
            </>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-text group-hover:text-amber transition-colors mb-2.5">
            <Link to={`/projects/${slug}`}>
              {title}
            </Link>
          </h3>
          <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-5">
            {shortDescription}
          </p>
        </div>

        <div>
          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {technologies.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface2 border border-border text-text/80"
              >
                {tech}
              </span>
            ))}
            {technologies.length > 5 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface2 border border-border text-muted">
                +{technologies.length - 5}
              </span>
            )}
          </div>

          {/* Card Footer: Case Study Link (No Author) */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
            <span className="text-[11px] text-muted">
              {hasLiveDeploy ? 'Production Verified' : 'VPC / Internal Staging'}
            </span>
            <Link
              to={`/projects/${slug}`}
              className="flex items-center gap-1 text-cyan hover:text-amber transition-colors font-semibold ml-auto"
            >
              <span>case_study()</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

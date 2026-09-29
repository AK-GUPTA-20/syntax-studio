import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Cpu,
  X
} from 'lucide-react';
import { getProjects, getSettings } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import { ProjectSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLiveDemos, setOnlyLiveDemos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 6;

  useEffect(() => {
    async function loadData() {
      try {
        const [projData, settData] = await Promise.all([
          getProjects(),
          getSettings().catch(() => null)
        ]);
        setProjects(projData || []);
        setSettings(settData || null);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Derive categories dynamically from projects stored in Firestore database
  const rawCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  const categories = ['All', ...rawCategories];

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleToggleLiveDemos = () => {
    setOnlyLiveDemos((prev) => !prev);
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setOnlyLiveDemos(false);
    setCurrentPage(1);
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesCategory =
      activeCategory === 'All' ||
      proj.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.technologies || []).some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLive =
      !onlyLiveDemos ||
      (Boolean(proj.liveUrl) &&
        proj.liveUrl.trim() !== '' &&
        proj.liveUrl !== '#' &&
        !proj.liveUrl.includes('github.com'));

    return matchesCategory && matchesSearch && matchesLive;
  });

  // Sort by priority (lower number = higher rank)
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999)
  );

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = sortedProjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const isFiltered = activeCategory !== 'All' || searchQuery.trim() !== '' || onlyLiveDemos;

  return (
    <div className="relative pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-60 right-10 w-80 h-80 bg-amber/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="max-w-4xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-xs font-mono mb-4 text-cyan backdrop-blur-sm">
          <Sparkles size={13} className="text-cyan animate-pulse" />
          <span>{settings?.projectsPageBadge || "// Case Studies & Production Portfolio"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-text mb-4 tracking-tight">
          {settings?.projectsPageTitle || "Selected Projects & Case Studies"}
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-8">
          {settings?.projectsPageSubtitle || "Explore real-world software, web applications, high-concurrency systems, and e-commerce platforms engineered by our full-stack studio."}
        </p>

        {/* Studio Architectural Guarantee Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <Zap size={16} className="text-amber shrink-0" />
            <div>
              <div className="font-bold text-text">95+ Lighthouse</div>
              <div className="text-[10px] text-muted">Core Web Vitals</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <Cpu size={16} className="text-cyan shrink-0" />
            <div>
              <div className="font-bold text-text">&lt;100ms Latency</div>
              <div className="text-[10px] text-muted">Optimized APIs</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-green shrink-0" />
            <div>
              <div className="font-bold text-text">100% Clean Code</div>
              <div className="text-[10px] text-muted">Zero Theme Bloat</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <Globe size={16} className="text-amber shrink-0" />
            <div>
              <div className="font-bold text-text">100% IP Hand-Off</div>
              <div className="text-[10px] text-muted">Day-1 Repo Ownership</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface/70 backdrop-blur-md mb-10 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const count = cat === 'All'
                ? projects.length
                : projects.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber text-ink font-semibold shadow-glow-amber/20 shadow-sm'
                      : 'bg-surface2/60 border border-border text-muted hover:text-text hover:border-border/80'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-ink/20 text-ink' : 'bg-surface text-muted'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Toggle Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Only Filter Toggle */}
            <button
              onClick={handleToggleLiveDemos}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 border ${
                onlyLiveDemos
                  ? 'border-green/50 bg-green/10 text-green font-semibold shadow-sm'
                  : 'border-border bg-surface2/60 text-muted hover:text-text'
              }`}
              title="Show only projects with live deployed URLs"
            >
              <span className={`w-2 h-2 rounded-full ${onlyLiveDemos ? 'bg-green animate-pulse' : 'bg-muted'}`} />
              <span>Live Demos Only</span>
            </button>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search stack or features..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface2 border border-border text-xs font-mono text-text placeholder:text-muted/60 focus:border-cyan transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Reset Filter Button if active */}
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-2 text-xs font-mono text-amber hover:text-amber/80 flex items-center justify-center gap-1 transition-colors"
              >
                <X size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Results Summary */}
        <div className="flex items-center justify-between text-xs font-mono text-muted pt-2 border-t border-border/50">
          <span>
            Displaying <span className="text-text font-semibold">{filteredProjects.length}</span> of{' '}
            <span className="text-text font-semibold">{projects.length}</span> projects
            {isFiltered && <span className="text-amber ml-1">(filtered)</span>}
          </span>
          {onlyLiveDemos && (
            <span className="text-green text-[11px] flex items-center gap-1">
              <CheckCircle2 size={12} /> Live preview filter active
            </span>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => <ProjectSkeleton key={n} />)}
        </div>
      ) : paginatedProjects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <span className="text-muted">
                Showing{' '}
                <span className="text-text font-bold">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedProjects.length)}</span>{' '}
                of <span className="text-text font-bold">{sortedProjects.length}</span> projects
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'border-amber bg-amber text-ink shadow-sm'
                          : 'border-border bg-surface text-muted hover:text-text hover:border-cyan/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 border border-border rounded-2xl bg-surface/50 p-8">
          <div className="w-12 h-12 rounded-xl bg-surface2 border border-border mx-auto flex items-center justify-center text-muted mb-4 font-mono">
            // 0
          </div>
          <p className="font-mono text-sm text-text font-semibold mb-2">No matching projects found</p>
          <p className="text-xs text-muted mb-6 max-w-sm mx-auto">
            We couldn't find any projects matching your current search terms or filter selection.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-lg bg-surface2 border border-amber/40 text-xs font-mono text-amber hover:bg-surface2/80 transition-all shadow-sm"
          >
            reset_all_filters()
          </button>
        </div>
      )}

      {/* Bottom Conversion Banner */}
      <div className="mt-20 p-8 sm:p-10 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface2/50 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber">
            <Sparkles size={13} />
            <span>Ready for your own production deployment?</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-text">
            Need a high-performance system engineered for your company?
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Get an architectural blueprint, transparent scope breakdown, and upfront timeline directly from Akshat & Vasu within 24 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all text-center shadow-glow-amber/20 shadow-md active:scale-95"
          >
            Discuss Your Architecture →
          </Link>
          <Link
            to="/services"
            className="px-5 py-3 rounded-lg text-xs font-mono text-muted hover:text-text border border-border bg-surface2 text-center transition-colors"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}

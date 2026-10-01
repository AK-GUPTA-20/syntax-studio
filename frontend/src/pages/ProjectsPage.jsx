import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Cpu,
  X,
  ArrowDownUp,
  Dot,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Eye,
  Code2,
  Rocket
} from 'lucide-react';
import { getProjects, getSettings } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import { ProjectSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'priority', label: 'Featured First' },
  { value: 'year_desc', label: 'Newest First' },
  { value: 'year_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'A → Z' },
];

const PER_PAGE_OPTIONS = [6, 9, 12, 18];

// ─── Pagination Component ─────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, totalItems, startIdx, endIdx }) {
  if (totalPages <= 1) return null;

  // Build smart page number list with ellipsis
  const buildPages = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '…', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
    }
    return pages;
  };

  const pages = buildPages();

  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Info row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <p className="text-xs font-mono text-muted">
          Showing{' '}
          <span className="text-text font-bold">{startIdx + 1}–{endIdx}</span>{' '}
          of{' '}
          <span className="text-text font-bold">{totalItems}</span>{' '}
          projects
        </p>
        <p className="text-xs font-mono text-muted">
          Page <span className="text-amber font-bold">{currentPage}</span> of <span className="text-text font-bold">{totalPages}</span>
        </p>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-cyan/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          title="First page"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-3 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-cyan/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-mono"
        >
          <ChevronLeft size={13} /> Prev
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === '…' ? (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted text-xs font-mono select-none">
                ···
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center ${
                  currentPage === p
                    ? 'border-amber bg-amber text-ink shadow-glow-amber'
                    : 'border-border bg-surface text-muted hover:text-text hover:border-cyan/50 hover:bg-surface2'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-3 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-cyan/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-xs font-mono"
        >
          Next <ChevronRight size={13} />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg border border-border bg-surface text-muted hover:text-text hover:border-cyan/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          title="Last page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-1 rounded-full bg-surface2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan to-amber transition-all duration-500"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stats strip data ─────────────────────────────────────────────────────────
const GUARANTEE_BADGES = [
  { icon: Zap,        color: 'text-amber', title: '95+ Lighthouse',    sub: 'Core Web Vitals' },
  { icon: Cpu,        color: 'text-cyan',  title: '<100ms Latency',    sub: 'Optimized APIs' },
  { icon: ShieldCheck,color: 'text-green', title: '100% Clean Code',   sub: 'Zero Theme Bloat' },
  { icon: Globe,      color: 'text-amber', title: '100% IP Hand-Off',  sub: 'Day-1 Repo Ownership' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects]     = useState([]);
  const [settings, setSettings]     = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [onlyLiveDemos, setOnlyLiveDemos]   = useState(false);
  const [sortBy, setSortBy]                 = useState('priority');
  const [itemsPerPage, setItemsPerPage]     = useState(6);
  const [currentPage, setCurrentPage]       = useState(1);
  const [loading, setLoading]               = useState(true);
  const [showSortMenu, setShowSortMenu]     = useState(false);
  const sortMenuRef                         = useRef(null);
  const gridRef                             = useRef(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [projData, settData] = await Promise.all([
          getProjects(),
          getSettings().catch(() => null)
        ]);
        setProjects(projData || []);
        setSettings(settData || null);
      } catch {
        // Fallback to empty project list
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Derived categories
  const rawCategories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
  const categories = ['All', ...rawCategories];

  const resetPage = () => setCurrentPage(1);

  const handleCategoryChange = (cat) => { setActiveCategory(cat); resetPage(); };
  const handleSearchChange   = (val) => { setSearchQuery(val);    resetPage(); };
  const handleToggleLive     = ()    => { setOnlyLiveDemos(p => !p); resetPage(); };
  const handleSortChange     = (val) => { setSortBy(val); setShowSortMenu(false); resetPage(); };
  const handlePerPageChange  = (val) => { setItemsPerPage(val); resetPage(); };

  const resetAllFilters = () => {
    setActiveCategory('All'); setSearchQuery(''); setOnlyLiveDemos(false);
    setSortBy('priority'); resetPage();
  };

  // Filter
  const filteredProjects = useMemo(() => projects.filter(proj => {
    const matchesCategory = activeCategory === 'All' || proj.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch   = searchQuery.trim() === '' ||
      proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.technologies || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLive = !onlyLiveDemos || (
      Boolean(proj.liveUrl) && proj.liveUrl.trim() !== '' && proj.liveUrl !== '#' && !proj.liveUrl.includes('github.com')
    );
    return matchesCategory && matchesSearch && matchesLive;
  }), [projects, activeCategory, searchQuery, onlyLiveDemos]);

  // Sort
  const sortedProjects = useMemo(() => {
    const arr = [...filteredProjects];
    switch (sortBy) {
      case 'year_desc':  return arr.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      case 'year_asc':   return arr.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
      case 'title_asc':  return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:           return arr.sort((a, b) => (Number(a.priority) || 999) - (Number(b.priority) || 999));
    }
  }, [filteredProjects, sortBy]);

  // Paginate
  const totalPages   = Math.max(1, Math.ceil(sortedProjects.length / itemsPerPage));
  const safePage     = Math.min(currentPage, totalPages);
  const startIndex   = (safePage - 1) * itemsPerPage;
  const endIndex     = Math.min(startIndex + itemsPerPage, sortedProjects.length);
  const pageProjects = sortedProjects.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isFiltered = activeCategory !== 'All' || searchQuery.trim() !== '' || onlyLiveDemos;
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort';

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-x-clip">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-72 h-72 bg-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-[11px] font-mono mb-5 text-cyan backdrop-blur-sm">
            <Sparkles size={12} className="text-cyan animate-pulse" />
            <span>{settings?.projectsPageBadge || '// Case Studies & Production Portfolio'}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-text mb-4 tracking-tight leading-tight">
            {settings?.projectsPageTitle || 'Selected Projects &'}{' '}
            <span className="text-amber">Case Studies</span>
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-10">
            {settings?.projectsPageSubtitle || 'Explore real-world software, web applications, high-concurrency systems, and e-commerce platforms engineered by our full-stack studio.'}
          </p>

          {/* Guarantee badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {GUARANTEE_BADGES.map(({ icon: Icon, color, title, sub }) => (
              <div key={title} className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5 hover:border-border/60 transition-colors">
                <Icon size={16} className={`${color} shrink-0`} />
                <div>
                  <div className="font-bold text-text">{title}</div>
                  <div className="text-[10px] text-muted">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter / Search / Sort Bar ───────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md mb-10 shadow-glass overflow-hidden">
          {/* Top row: Categories + controls */}
          <div className="px-5 pt-5 pb-4 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-start justify-between gap-4">

              {/* Category pills */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map(cat => {
                  const count = cat === 'All'
                    ? projects.length
                    : projects.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-amber text-ink font-semibold shadow-glow-amber shadow-sm'
                          : 'bg-surface2/60 border border-border text-muted hover:text-text hover:border-border/60'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-ink/20 text-ink' : 'bg-surface3 text-muted'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">

                {/* Live-only toggle */}
                <button
                  onClick={handleToggleLive}
                  className={`h-8 px-3 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                    onlyLiveDemos
                      ? 'border-green/50 bg-green/10 text-green font-semibold'
                      : 'border-border bg-surface2/60 text-muted hover:text-text'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${onlyLiveDemos ? 'bg-green animate-pulse' : 'bg-muted'}`} />
                  Live Only
                </button>

                {/* Sort dropdown */}
                <div className="relative" ref={sortMenuRef}>
                  <button
                    onClick={() => setShowSortMenu(p => !p)}
                    className="h-8 px-3 rounded-lg text-xs font-mono border border-border bg-surface2/60 text-muted hover:text-text transition-all flex items-center gap-1.5"
                  >
                    <ArrowDownUp size={12} />
                    <span>{activeSortLabel}</span>
                    <ChevronRight size={11} className={`transition-transform ${showSortMenu ? 'rotate-90' : ''}`} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden animate-fade-in">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full px-4 py-2.5 text-xs font-mono text-left flex items-center gap-2 transition-colors ${
                            sortBy === opt.value
                              ? 'bg-amber/10 text-amber font-semibold'
                              : 'text-muted hover:text-text hover:bg-surface2'
                          }`}
                        >
                          {sortBy === opt.value && <Dot size={14} className="text-amber shrink-0" />}
                          <span className={sortBy === opt.value ? '' : 'ml-4'}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Per-page selector */}
                <div className="flex items-center gap-1 h-8 px-2 rounded-lg border border-border bg-surface2/60">
                  <span className="text-[10px] font-mono text-muted mr-1 hidden sm:inline">Per page:</span>
                  {PER_PAGE_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => handlePerPageChange(n)}
                      className={`w-7 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                        itemsPerPage === n
                          ? 'bg-amber text-ink'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="Search stack, title…"
                    className="h-8 pl-8 pr-7 rounded-lg bg-surface2 border border-border text-xs font-mono text-text placeholder:text-muted/60 focus:border-cyan outline-none transition-colors w-48"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Reset */}
                {isFiltered && (
                  <button
                    onClick={resetAllFilters}
                    className="h-8 px-2.5 text-xs font-mono text-amber hover:text-amber/80 flex items-center gap-1 transition-colors"
                  >
                    <X size={12} /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: results summary + page info */}
          <div className="px-5 py-3 border-t border-border/50 bg-surface2/30 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted">
            <div className="flex items-center gap-4">
              <span>
                <span className="text-text font-semibold">{filteredProjects.length}</span> of <span className="text-text font-semibold">{projects.length}</span> projects
                {isFiltered && <span className="text-amber ml-1.5">(filtered)</span>}
              </span>
              {onlyLiveDemos && (
                <span className="text-green flex items-center gap-1">
                  <CheckCircle2 size={11} /> Live filter on
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <span className="text-muted">
                Page <span className="text-amber font-bold">{safePage}</span> / <span className="text-text font-bold">{totalPages}</span>
                {' — '}
                <span className="text-text font-semibold">{startIndex + 1}–{endIndex}</span> shown
              </span>
            )}
          </div>
        </div>

        {/* ── Projects Grid ────────────────────────────────────────────────── */}
        <div ref={gridRef}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: itemsPerPage }).map((_, n) => <ProjectSkeleton key={n} />)}
            </div>
          ) : pageProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* ── Pagination ──────────────────────────────────────────── */}
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={sortedProjects.length}
                startIdx={startIndex}
                endIdx={endIndex}
              />
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-24 border border-border rounded-2xl bg-surface/50">
              <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border mx-auto flex items-center justify-center mb-5">
                <Search size={24} className="text-muted" />
              </div>
              <p className="font-display text-xl font-bold text-text mb-2">No matching projects</p>
              <p className="text-sm text-muted mb-8 max-w-sm mx-auto">
                No projects match your current search or filter. Try adjusting the category, search term, or live demo filter.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-surface2 border border-amber/40 text-xs font-mono text-amber hover:bg-surface3 transition-all shadow-sm"
              >
                reset_all_filters()
              </button>
            </div>
          )}
        </div>

        {/* ── Quick Nav: Jump to page ───────────────────────────────────── */}
        {!loading && totalPages > 3 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="text-xs font-mono text-muted">Jump to page:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    safePage === p
                      ? 'bg-amber text-ink'
                      : 'bg-surface2 border border-border text-muted hover:text-text hover:border-cyan/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA Banner ───────────────────────────────────────────────────── */}
        <div className="mt-20 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface2/50 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
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

              {/* mini stat pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Rocket,   label: '50+ shipped' },
                  { icon: Star,     label: '4.9★ rating' },
                  { icon: Eye,      label: '<24h response' },
                  { icon: Code2,    label: 'Day-1 repo transfer' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-surface2/60 text-[10px] font-mono text-muted">
                    <Icon size={11} className="text-amber" />{label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all text-center shadow-glow-amber active:scale-95"
              >
                Discuss Your Architecture →
              </Link>
              <Link
                to="/services"
                className="px-5 py-3 rounded-xl text-xs font-mono text-muted hover:text-text border border-border bg-surface2 text-center transition-colors"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>

      </div>{/* /container */}
    </div>
  );
}

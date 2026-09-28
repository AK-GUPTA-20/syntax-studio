import React, { useState, useEffect } from 'react';
import { Search, Filter, Layers, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjects, getSettings } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import { ProjectSkeleton } from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
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
  const categories = [
    'All',
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
  ];

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
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

    return matchesCategory && matchesSearch;
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
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono mb-4 text-cyan">
          <span>{settings?.projectsPageBadge || "// Case Studies & Engineering Portfolio"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4">
          {settings?.projectsPageTitle || "Selected Projects & Case Studies"}
        </h1>
        <p className="text-base text-muted leading-relaxed">
          {settings?.projectsPageSubtitle || "Explore real-world software, web applications, high-concurrency systems, and e-commerce platforms engineered by our full-stack studio."}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 mb-10 border-b border-border">
        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber text-ink font-semibold shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-text hover:border-border/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects or stack..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-text focus:border-cyan transition-colors"
          />
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
        <div className="text-center py-20 border border-border rounded-xl bg-surface p-8">
          <p className="font-mono text-sm text-muted mb-3">// No matching projects found</p>
          <p className="text-xs text-muted mb-6">Try clearing your search terms or category filter.</p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); setCurrentPage(1); }}
            className="px-4 py-2 rounded-lg bg-surface2 border border-border text-xs font-mono text-amber hover:bg-surface2/80"
          >
            reset_filters()
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-20 p-8 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display text-xl font-bold text-text mb-1">
            Need a custom web solution built?
          </h3>
          <p className="text-xs text-muted">
            We build custom full-stack solutions tailored to your unique specifications.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shrink-0"
        >
          Discuss Your Project →
        </Link>
      </div>
    </div>
  );
}

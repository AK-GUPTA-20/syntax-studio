import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sparkles,
  Clock,
  Calendar,
  ArrowRight,
  User,
  Tag,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { getBlogPosts } from '../api/client';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getBlogPosts();
        setPosts(data || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
    window.scrollTo(0, 0);
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        searchQuery === '' ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'all' ||
        (Array.isArray(post.tags) && post.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  return (
    <div className="relative pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 right-4 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Page Header */}
      <div className="max-w-4xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-xs font-mono mb-4 text-cyan backdrop-blur-sm">
          <BookOpen size={13} className="text-cyan animate-pulse" />
          <span>// Engineering Dispatches & Case Studies</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-[1.1]">
          Architectural Insights & <span className="gradient-text-cyan">Technical Notes</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Deep-dives into scalable database schemas, high-throughput REST APIs, resilient state management, and modern digital engineering authored by Syntax Studio co-founders.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-10 pb-6 border-b border-border/60">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search architectural topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface2/80 border border-border text-sm text-text placeholder-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedTag === 'all'
                ? 'bg-cyan text-ink font-semibold'
                : 'bg-surface2 text-muted hover:text-text border border-border/70'
            }`}
          >
            All Articles
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedTag === tag
                  ? 'bg-cyan text-ink font-semibold'
                  : 'bg-surface2 text-muted hover:text-text border border-border/70'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-6 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-surface2 rounded" />
              <div className="h-4 w-full bg-surface2 rounded" />
              <div className="h-4 w-5/6 bg-surface2 rounded" />
              <div className="h-10 w-24 bg-surface2 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 border border-border/60 rounded-2xl bg-surface/50">
          <Terminal size={36} className="mx-auto text-muted mb-3 opacity-60" />
          <h3 className="font-display text-lg font-semibold text-text">No articles found</h3>
          <p className="text-xs font-mono text-muted mt-1">
            Try adjusting your search query or clear the selected tag filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id || post.slug}
              className="group rounded-2xl border border-border/80 bg-surface/80 hover:border-cyan/50 hover:bg-surface2/50 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-glow-cyan/15"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
                  {post.author && (
                    <span className="flex items-center gap-1.5 text-cyan">
                      <User size={13} />
                      <span>{post.author}</span>
                    </span>
                  )}
                  {post.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{post.readTime}</span>
                    </span>
                  )}
                  {post.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-display text-xl sm:text-2xl font-bold text-text group-hover:text-cyan transition-colors leading-tight">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                  {post.excerpt || (post.content ? post.content.slice(0, 180) + '...' : '')}
                </p>

                {/* Tags */}
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface3 border border-border/70 text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Read Action CTA */}
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-cyan hover:text-cyan/80 transition-colors"
                >
                  <span>read_article()</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

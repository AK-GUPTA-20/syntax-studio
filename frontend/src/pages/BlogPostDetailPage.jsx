import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Check,
  BookOpen,
  ArrowRight,
  Terminal,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts } from '../api/client';

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const [postData, allPosts] = await Promise.all([
          getBlogPostBySlug(slug),
          getBlogPosts()
        ]);
        setPost(postData);
        setRelatedPosts((allPosts || []).filter(p => p.slug !== slug).slice(0, 2));
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  if (loading) {
    return (
      <div className="pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-surface2 rounded" />
        <div className="h-12 w-3/4 bg-surface2 rounded" />
        <div className="h-4 w-1/2 bg-surface2 rounded" />
        <div className="h-64 bg-surface2 rounded-xl mt-8" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-40 pb-28 max-w-xl mx-auto px-4 text-center space-y-4">
        <Terminal size={40} className="mx-auto text-amber opacity-70" />
        <h2 className="font-display text-2xl font-bold text-text">Article Not Found</h2>
        <p className="text-sm text-muted">The requested engineering dispatch could not be located on this server.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface2 border border-border text-xs font-mono text-cyan hover:border-cyan transition-all"
        >
          <ArrowLeft size={14} />
          <span>return_to_blog()</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-cyan transition-colors"
        >
          <ArrowLeft size={14} />
          <span>cd ../blog</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-6 mb-12 pb-8 border-b border-border/70">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
          {post.author && (
            <span className="flex items-center gap-1.5 text-cyan font-semibold">
              <User size={14} />
              <span>{post.author}</span>
            </span>
          )}
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime}</span>
            </span>
          )}
          {post.createdAt && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-text leading-[1.15]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-base sm:text-lg text-muted leading-relaxed font-sans">
            {post.excerpt}
          </p>
        )}

        {/* Share Button & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(post.tags) && post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface2 border border-border text-cyan"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface2 text-xs font-mono text-muted hover:text-text hover:border-cyan transition-all"
          >
            {copiedShare ? (
              <>
                <Check size={13} className="text-green" />
                <span className="text-green">link_copied!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>share_dispatch()</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Article Body Content */}
      <main className="prose prose-invert max-w-none text-text/90 font-sans leading-relaxed space-y-6">
        {post.content.split('\n\n').map((paragraph, idx) => {
          // If paragraph starts with # or ## or ###, render as headings
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-display text-xl font-bold text-text pt-4 pb-1 border-b border-border/50">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={idx} className="font-display text-2xl font-bold text-cyan pt-6 pb-2">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-display text-3xl font-bold text-amber pt-6 pb-2">
                {paragraph.replace('# ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('```')) {
            const cleanCode = paragraph.replace(/```[a-z]*\n?/gi, '').trim();
            return (
              <div key={idx} className="my-6 rounded-xl bg-ink border border-border/80 p-4 font-mono text-xs overflow-x-auto text-green">
                <pre>{cleanCode}</pre>
              </div>
            );
          }
          return (
            <p key={idx} className="text-sm sm:text-base text-muted/90 leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </main>

      {/* Author Card Footer */}
      <div className="mt-16 p-6 sm:p-8 rounded-2xl border border-border/80 bg-surface2/60 backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan shrink-0 font-display font-bold text-xl">
          {post.author ? post.author.split(' ').map(n => n[0]).join('') : 'SS'}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="font-display font-bold text-lg text-text">
            Written by {post.author || 'Syntax Studio Engineer'}
          </div>
          <p className="text-xs text-muted leading-relaxed max-w-xl">
            Co-Founder & Lead Systems Engineer at Syntax Studio. Crafts fault-tolerant digital architectures, high-concurrency APIs, and bespoke software systems for fast-growing companies.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber hover:text-amber/80 transition-colors"
            >
              <span>Consult on this architecture</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-border/70">
          <h3 className="font-display text-xl font-bold text-text mb-6">
            More Engineering Dispatches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id || related.slug}
                to={`/blog/${related.slug}`}
                className="group p-5 rounded-xl border border-border/70 bg-surface/80 hover:border-cyan/50 hover:bg-surface2/50 transition-all space-y-2 block"
              >
                <div className="text-xs font-mono text-cyan">#{related.tags?.[0] || 'engineering'}</div>
                <h4 className="font-display font-semibold text-base text-text group-hover:text-cyan transition-colors">
                  {related.title}
                </h4>
                <p className="text-xs text-muted line-clamp-2">
                  {related.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

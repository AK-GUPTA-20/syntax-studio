import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  User,
  Clock,
  Calendar,
  Tag,
  Save,
  X,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import ImageUploader from '../ImageUploader';

export default function AdminBlogManager({
  blogPosts = [],
  token,
  onSavePost,
  onDeletePost,
  showToast,
  loading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const filteredPosts = blogPosts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q);
  });

  const handleStartCreate = () => {
    setCurrentPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Akshat Gupta',
      coverImage: '',
      tags: ['Engineering', 'System Design'],
      published: true,
      readTime: '5 min read'
    });
    setTagInput('');
    setIsEditing(true);
  };

  const handleStartEdit = (post) => {
    setCurrentPost({ ...post });
    setTagInput('');
    setIsEditing(true);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!currentPost.tags?.includes(cleanTag)) {
      setCurrentPost({
        ...currentPost,
        tags: [...(currentPost.tags || []), cleanTag]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setCurrentPost({
      ...currentPost,
      tags: (currentPost.tags || []).filter(t => t !== tagToRemove)
    });
  };

  const autoGenerateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    // Auto-generate slug if it's a new post or slug was auto-generated
    if (!currentPost.id || currentPost.slug === autoGenerateSlug(currentPost.title)) {
      setCurrentPost({
        ...currentPost,
        title: val,
        slug: autoGenerateSlug(val)
      });
    } else {
      setCurrentPost({ ...currentPost, title: val });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.slug || !currentPost.content) {
      showToast('Please fill in title, slug, and content.');
      return;
    }
    onSavePost(currentPost);
    setIsEditing(false);
  };

  const handleTogglePublished = (post) => {
    const updated = { ...post, published: !post.published };
    onSavePost(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-text">Blog & Technical Case Studies</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
              {blogPosts.length} Articles
            </span>
          </div>
          <p className="text-xs font-mono text-muted mt-1">
            Manage thought leadership dispatches, architectural deep dives, and system case studies
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber text-ink font-semibold text-xs font-mono hover:bg-amber/90 transition-all shadow-glow-amber/20 active:scale-95"
        >
          <Plus size={15} />
          <span>New Article</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-surface/80 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, slug, or author..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface2 border border-border text-xs text-text placeholder-muted focus:outline-none focus:border-cyan"
          />
        </div>
        <span className="font-mono text-xs text-muted hidden sm:inline">
          {filteredPosts.length} of {blogPosts.length} posts
        </span>
      </div>

      {/* Posts Table / Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 border border-border/70 rounded-2xl bg-surface/50 font-mono text-xs text-muted">
          <BookOpen size={32} className="mx-auto text-muted mb-2 opacity-60" />
          <p>No articles found. Click "New Article" to create your first dispatch.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface2/80 text-muted uppercase tracking-wider text-[10px] border-b border-border/80">
                <tr>
                  <th className="py-3.5 px-4">Article Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPosts.map((post) => (
                  <tr key={post.id || post.slug} className="hover:bg-surface2/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <span>{post.title}</span>
                      </div>
                      <div className="text-[10px] text-muted font-normal truncate mt-0.5">/blog/{post.slug}</div>
                    </td>
                    <td className="py-3.5 px-4 text-cyan font-medium">
                      {post.author || 'Akshat Gupta'}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {post.readTime || '5 min read'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(post)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                          post.published !== false
                            ? 'bg-green/15 text-green border border-green/30 hover:bg-green/25'
                            : 'bg-surface3 text-muted border border-border hover:text-text'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {post.published !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{post.published !== false ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-border bg-surface2 text-muted hover:text-cyan hover:border-cyan transition-colors"
                          title="Preview article"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(post)}
                          className="p-1.5 rounded-lg border border-border bg-surface2 text-muted hover:text-amber hover:border-amber transition-colors"
                          title="Edit article"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id || post.slug, post.title)}
                          className="p-1.5 rounded-lg border border-border bg-surface2 text-muted hover:text-red hover:border-red transition-colors"
                          title="Delete article"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isEditing && currentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fadeIn">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeSlideDown font-mono text-xs">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">
                {currentPost.id ? 'Edit Article Dispatch' : 'Author New Dispatch'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded text-muted hover:text-text active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Cover Image */}
              <div className="p-4 rounded-xl border border-border bg-surface2 space-y-2">
                <ImageUploader
                  label="COVER IMAGE (IMAGEKIT CLOUD UPLOAD)"
                  currentImageUrl={currentPost.coverImage}
                  folder="/syntax-studio/blog"
                  token={token}
                  onUploadComplete={(url) => {
                    setCurrentPost({ ...currentPost, coverImage: url });
                    showToast('Cover image uploaded to ImageKit!');
                  }}
                />
                <input
                  type="text"
                  placeholder="Or enter direct image URL"
                  value={currentPost.coverImage || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                  className="w-full px-3 py-1.5 rounded bg-surface border border-border text-text text-[11px]"
                />
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1 font-semibold">TITLE *</label>
                  <input
                    type="text"
                    required
                    value={currentPost.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text focus:outline-none focus:border-cyan"
                    placeholder="e.g. Architecting Distributed Message Queues"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1 font-semibold">URL SLUG *</label>
                  <input
                    type="text"
                    required
                    value={currentPost.slug}
                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text focus:outline-none focus:border-cyan"
                    placeholder="architecting-distributed-queues"
                  />
                </div>
              </div>

              {/* Author & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1 font-semibold">AUTHOR *</label>
                  <select
                    value={currentPost.author || 'Akshat Gupta'}
                    onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text focus:outline-none focus:border-cyan"
                  >
                    <option value="Akshat Gupta">Akshat Gupta (Lead Backend Architect)</option>
                    <option value="Vasu Singhal">Vasu Singhal (Lead Full-Stack / UI-UX)</option>
                    <option value="Syntax Studio Engineering Team">Syntax Studio Engineering Team</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cyan mb-1 font-semibold">READ TIME</label>
                  <input
                    type="text"
                    value={currentPost.readTime || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, readTime: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                    placeholder="e.g. 6 min read"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-cyan mb-1 font-semibold">EXCERPT / SUMMARY</label>
                <textarea
                  rows={2}
                  value={currentPost.excerpt || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text focus:outline-none focus:border-cyan"
                  placeholder="Brief summary appearing on cards and meta descriptions..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-cyan mb-1 font-semibold">TAGS</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type tag (e.g. Redis, WebSockets) and click Add"
                    className="flex-1 px-3 py-1.5 rounded bg-surface2 border border-border text-text"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded bg-surface3 border border-border text-cyan hover:border-cyan transition-colors"
                  >
                    + Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentPost.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface2 border border-border text-[11px] text-text"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-muted hover:text-red"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Body (Markdown) */}
              <div>
                <label className="block text-cyan mb-1 font-semibold">ARTICLE BODY (MARKDOWN SUPPORTED) *</label>
                <textarea
                  rows={10}
                  required
                  value={currentPost.content || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  className="w-full p-3 rounded bg-surface2 border border-border text-text font-mono text-xs focus:outline-none focus:border-cyan"
                  placeholder="Write article paragraphs, headings with ## or ###, and code snippets..."
                />
              </div>

              {/* Published Toggle */}
              <div className="p-3 rounded-lg bg-surface2 border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">Visibility Status</div>
                  <div className="text-[11px] text-muted">
                    {currentPost.published ? 'Live and visible on public /blog page' : 'Draft mode (hidden from visitors)'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPost.published !== false}
                    onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-surface2 border border-border text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan hover:bg-cyan/90 text-ink font-semibold transition-all shadow-md active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

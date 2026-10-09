import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput, sanitizeSlug } from '../utils/sanitize.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const blogService = new FirestoreService('blogPosts');

// Permitted fields (BOPLA prevention)
const ALLOWED_BLOG_FIELDS = [
  'title',
  'slug',
  'excerpt',
  'content',
  'author',
  'coverImage',
  'tags',
  'published',
  'readTime'
];

function pickBlogData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_BLOG_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, field === 'content' ? 50000 : 1000);
      } else if (field === 'slug' && typeof val === 'string') {
        picked[field] = sanitizeSlug(val);
      } else if (field === 'tags' && Array.isArray(val)) {
        picked[field] = val.map(t => sanitizeInput(String(t), 50)).filter(Boolean);
      } else if (field === 'published') {
        picked[field] = Boolean(val);
      } else {
        picked[field] = val;
      }
    }
  }
  return picked;
}

export const getAllBlogPosts = async (req, res, next) => {
  try {
    const { includeDrafts } = req.query;
    let posts = await blogService.getAll();

    // If public request, show only published posts
    if (includeDrafts !== 'true') {
      posts = posts.filter(p => p.published !== false);
    }

    // Sort descending by creation date
    posts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return ApiResponse.success(res, 'Blog posts retrieved successfully', posts);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    const post = await blogService.getByField('slug', slug);
    if (!post) {
      return ApiResponse.error(res, `Blog post '${slug}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Blog post retrieved successfully', post);
  } catch (error) {
    next(error);
  }
};

export const createBlogPost = async (req, res, next) => {
  try {
    const cleanData = pickBlogData(req.body);
    const existing = await blogService.getByField('slug', cleanData.slug);
    if (existing) {
      return ApiResponse.error(res, `Post with slug '${cleanData.slug}' already exists`, null, 409);
    }

    const created = await blogService.create(cleanData);

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_CREATED, // generic content creation event
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'blog_post_created', id: created.id, title: created.title, slug: created.slug }
    });

    return ApiResponse.success(res, 'Blog post created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanData = pickBlogData(req.body);
    const updated = await blogService.update(id, cleanData);
    if (!updated) {
      return ApiResponse.error(res, `Blog post with id '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_UPDATED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'blog_post_updated', id, title: updated.title }
    });

    return ApiResponse.success(res, 'Blog post updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await blogService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Blog post with id '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_DELETED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'blog_post_deleted', id }
    });

    return ApiResponse.success(res, 'Blog post deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

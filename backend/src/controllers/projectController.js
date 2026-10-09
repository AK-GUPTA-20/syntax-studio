import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput, sanitizeSlug } from '../utils/sanitize.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const projectService = new FirestoreService('projects');

// Permitted fields whitelist (Mass Assignment / BOPLA prevention)
const ALLOWED_PROJECT_FIELDS = [
  'title',
  'slug',
  'category',
  'shortDescription',
  'overview',
  'author',
  'technologies',
  'featured',
  'client',
  'link',
  'github',
  'images',
  'thumbnail',
  'order'
];

function pickProjectData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_PROJECT_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, field === 'overview' ? 10000 : 1000);
      } else if (field === 'slug' && typeof val === 'string') {
        picked[field] = sanitizeSlug(val);
      } else if (field === 'technologies' && Array.isArray(val)) {
        picked[field] = val.map(t => sanitizeInput(String(t), 50)).filter(Boolean);
      } else if (field === 'images' && Array.isArray(val)) {
        picked[field] = val.map(img => sanitizeInput(String(img), 1000)).filter(Boolean);
      } else if (field === 'featured') {
        picked[field] = Boolean(val);
      } else if (field === 'order') {
        picked[field] = parseInt(val, 10) || 0;
      } else {
        picked[field] = val;
      }
    }
  }
  return picked;
}

export const getAllProjects = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    let projects = await projectService.getAll();

    if (category && category !== 'all') {
      const cleanCategory = sanitizeInput(category, 50).toLowerCase();
      projects = projects.filter(p => p.category?.toLowerCase() === cleanCategory);
    }

    if (featured === 'true') {
      projects = projects.filter(p => p.featured === true);
    }

    return ApiResponse.success(res, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    const project = await projectService.getByField('slug', slug);
    if (!project) {
      return ApiResponse.error(res, `Project '${slug}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const cleanData = pickProjectData(req.body);
    const existing = await projectService.getByField('slug', cleanData.slug);
    if (existing) {
      return ApiResponse.error(res, `Project with slug '${cleanData.slug}' already exists`, null, 409);
    }

    const created = await projectService.create(cleanData);

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_CREATED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { id: created.id, title: created.title, slug: created.slug }
    });

    return ApiResponse.success(res, 'Project created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanData = pickProjectData(req.body);

    const updated = await projectService.update(id, cleanData);
    if (!updated) {
      return ApiResponse.error(res, `Project with id '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_UPDATED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { id, title: updated.title }
    });

    return ApiResponse.success(res, 'Project updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await projectService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Project with id '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.PROJECT_DELETED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { id }
    });

    return ApiResponse.success(res, 'Project deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

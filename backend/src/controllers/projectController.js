import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

const projectService = new FirestoreService('projects');

export const getAllProjects = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    let projects = await projectService.getAll();

    if (category && category !== 'all') {
      projects = projects.filter(p => p.category?.toLowerCase() === category.toLowerCase());
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
    const { slug } = req.params;
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
    const sanitizedData = sanitizeObject(req.body);
    const existing = await projectService.getByField('slug', sanitizedData.slug);
    if (existing) {
      return ApiResponse.error(res, `Project with slug '${sanitizedData.slug}' already exists`, null, 409);
    }
    const created = await projectService.create(sanitizedData);
    return ApiResponse.success(res, 'Project created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeObject(req.body);
    const updated = await projectService.update(id, sanitizedData);
    if (!updated) {
      return ApiResponse.error(res, `Project with id '${id}' not found`, null, 404);
    }
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
    return ApiResponse.success(res, 'Project deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

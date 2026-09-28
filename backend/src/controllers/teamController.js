import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

const teamService = new FirestoreService('teamMembers');

export const getAllTeamMembers = async (req, res, next) => {
  try {
    const members = await teamService.getAll();
    return ApiResponse.success(res, 'Team members retrieved successfully', members);
  } catch (error) {
    next(error);
  }
};

export const getTeamMemberBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const member = await teamService.getByField('slug', slug);
    if (!member) {
      return ApiResponse.error(res, `Team member '${slug}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Team member retrieved successfully', member);
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req, res, next) => {
  try {
    const sanitizedData = sanitizeObject(req.body);
    const existing = await teamService.getByField('slug', sanitizedData.slug);
    if (existing) {
      return ApiResponse.error(res, `Team member with slug '${sanitizedData.slug}' already exists`, null, 409);
    }
    const created = await teamService.create(sanitizedData);
    return ApiResponse.success(res, 'Team member created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeObject(req.body);
    const updated = await teamService.update(id, sanitizedData);
    if (!updated) {
      return ApiResponse.error(res, `Team member with id '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Team member updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await teamService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Team member with id '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Team member deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

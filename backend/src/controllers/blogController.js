import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

const blogService = new FirestoreService('blogPosts');

export const getAllBlogPosts = async (req, res, next) => {
  try {
    const posts = await blogService.getAll();
    return ApiResponse.success(res, 'Blog posts retrieved successfully', posts);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
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
    const sanitizedData = sanitizeObject(req.body);
    const existing = await blogService.getByField('slug', sanitizedData.slug);
    if (existing) {
      return ApiResponse.error(res, `Post with slug '${sanitizedData.slug}' already exists`, null, 409);
    }
    const created = await blogService.create(sanitizedData);
    return ApiResponse.success(res, 'Blog post created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeObject(req.body);
    const updated = await blogService.update(id, sanitizedData);
    if (!updated) {
      return ApiResponse.error(res, `Blog post with id '${id}' not found`, null, 404);
    }
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
    return ApiResponse.success(res, 'Blog post deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

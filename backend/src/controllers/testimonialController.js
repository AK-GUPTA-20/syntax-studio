import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

const testimonialService = new FirestoreService('testimonials');

export const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await testimonialService.getAll();
    return ApiResponse.success(res, 'Testimonials retrieved successfully', testimonials);
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const sanitizedData = sanitizeObject(req.body);
    const created = await testimonialService.create(sanitizedData);
    return ApiResponse.success(res, 'Testimonial created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeObject(req.body);
    const updated = await testimonialService.update(id, sanitizedData);
    if (!updated) {
      return ApiResponse.error(res, `Testimonial '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Testimonial updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await testimonialService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Testimonial '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Testimonial deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

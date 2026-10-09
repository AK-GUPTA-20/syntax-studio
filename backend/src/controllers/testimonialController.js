import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput } from '../utils/sanitize.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const testimonialService = new FirestoreService('testimonials');

// Allowed fields (BOPLA prevention)
const ALLOWED_TESTIMONIAL_FIELDS = ['clientName', 'company', 'role', 'quote', 'rating', 'avatar'];

function pickTestimonialData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_TESTIMONIAL_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, field === 'quote' ? 2000 : 200);
      } else if (field === 'rating') {
        picked[field] = Math.max(1, Math.min(5, parseInt(val, 10) || 5));
      } else {
        picked[field] = val;
      }
    }
  }
  return picked;
}

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
    const cleanData = pickTestimonialData(req.body);
    const created = await testimonialService.create(cleanData);

    await logAuditEvent({
      eventType: AuditEventType.SECURITY_VIOLATION, // informational
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'testimonial_created', id: created.id }
    });

    return ApiResponse.success(res, 'Testimonial created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanData = pickTestimonialData(req.body);
    const updated = await testimonialService.update(id, cleanData);
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

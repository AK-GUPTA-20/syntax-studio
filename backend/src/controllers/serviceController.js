import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput } from '../utils/sanitize.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const servicesService = new FirestoreService('services');

// Allowed fields for services (Mass Assignment prevention)
const ALLOWED_SERVICE_FIELDS = ['title', 'description', 'icon', 'features', 'order', 'enabled'];

function pickServiceData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_SERVICE_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, field === 'description' ? 3000 : 200);
      } else if (field === 'features' && Array.isArray(val)) {
        picked[field] = val.map(f => sanitizeInput(String(f), 200)).filter(Boolean);
      } else if (field === 'enabled') {
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

export const getAllServices = async (req, res, next) => {
  try {
    const services = await servicesService.getAll();
    services.sort((a, b) => (a.order || 0) - (b.order || 0));
    return ApiResponse.success(res, 'Services retrieved successfully', services);
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await servicesService.getById(id);
    if (!service) {
      return ApiResponse.error(res, `Service '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Service retrieved successfully', service);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const cleanData = pickServiceData(req.body);
    const created = await servicesService.create(cleanData);

    await logAuditEvent({
      eventType: AuditEventType.SERVICE_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'create', id: created.id, title: created.title }
    });

    return ApiResponse.success(res, 'Service created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanData = pickServiceData(req.body);
    const updated = await servicesService.update(id, cleanData);
    if (!updated) {
      return ApiResponse.error(res, `Service '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.SERVICE_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'update', id, title: updated.title }
    });

    return ApiResponse.success(res, 'Service updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await servicesService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Service '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.SERVICE_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'delete', id }
    });

    return ApiResponse.success(res, 'Service deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

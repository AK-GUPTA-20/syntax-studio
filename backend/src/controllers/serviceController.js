import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

const servicesService = new FirestoreService('services');

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
    const sanitizedData = sanitizeObject(req.body);
    const created = await servicesService.create(sanitizedData);
    return ApiResponse.success(res, 'Service created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeObject(req.body);
    const updated = await servicesService.update(id, sanitizedData);
    if (!updated) {
      return ApiResponse.error(res, `Service '${id}' not found`, null, 404);
    }
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
    return ApiResponse.success(res, 'Service deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

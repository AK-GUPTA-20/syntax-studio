import { sanitizeHeaderToken } from '../utils/security';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const authHeader = (token) => {
  const sanitized = sanitizeHeaderToken(token);
  return sanitized ? { Authorization: `Bearer ${sanitized}` } : {};
};

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('syntax-auth-expired', { detail: { status: response.status } }));
    }
    const rawError = data.message || data.error || `HTTP error ${response.status}`;
    // Strip HTML tags and limit length to prevent payload reflection
    const safeErrorMsg = typeof rawError === 'string'
      ? rawError.replace(/<[^>]*>?/gm, '').slice(0, 300)
      : `HTTP error ${response.status}`;
    const error = new Error(safeErrorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Client-side in-memory and sessionStorage cache
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const invalidateProjectsCache = () => {
  memoryCache.clear();
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('syntax_projects_')) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {}
};

// Public API endpoints
export const getProjects = async (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  const cacheKey = `syntax_projects_${query || 'all'}`;
  const forceRefresh = options.forceRefresh || false;

  if (!forceRefresh) {
    // 1. Check in-memory cache
    const memEntry = memoryCache.get(cacheKey);
    if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL_MS) {
      return memEntry.data;
    }

    // 2. Check sessionStorage
    try {
      const sessRaw = sessionStorage.getItem(cacheKey);
      if (sessRaw) {
        const sessEntry = JSON.parse(sessRaw);
        if (sessEntry && Date.now() - sessEntry.timestamp < CACHE_TTL_MS) {
          memoryCache.set(cacheKey, sessEntry);
          return sessEntry.data;
        }
      }
    } catch (e) {}
  }

  const endpoint = `/projects${query ? `?${query}` : ''}`;
  const res = await request(endpoint);
  const data = res.data;

  // Save to cache
  const cacheEntry = { data, timestamp: Date.now() };
  memoryCache.set(cacheKey, cacheEntry);
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (e) {}

  return data;
};

export const getProjectBySlug = async (slug) => {
  const res = await request(`/projects/${slug}`);
  return res.data;
};

export const getTeam = async () => {
  const res = await request('/team');
  return res.data;
};

export const getTeamMemberBySlug = async (slug) => {
  const res = await request(`/team/${slug}`);
  return res.data;
};

export const getServices = async () => {
  const res = await request('/services');
  return res.data;
};

export const getTestimonials = async () => {
  const res = await request('/testimonials');
  return res.data;
};

export const getBlogPosts = async () => {
  const res = await request('/blog');
  return res.data;
};

export const submitContact = async (formData) => {
  const res = await request('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  return res;
};

// Admin authentication & management endpoints
export const loginAdmin = async (password) => {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return res.data;
};

export const verifyAdminToken = async (token) => {
  const res = await request('/auth/verify', {
    headers: { ...authHeader(token) },
  });
  return res.data;
};

export const getInquiries = async (token) => {
  const res = await request('/contact', {
    headers: { ...authHeader(token) },
  });
  return res.data;
};

export const updateInquiry = async (id, payload, token) => {
  const res = await request(`/contact/${id}`, {
    method: 'PATCH',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const deleteInquiry = async (id, token) => {
  const res = await request(`/contact/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  return res.data;
};

export const createProjectApi = async (payload, token) => {
  const res = await request('/projects', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  invalidateProjectsCache();
  return res.data;
};

export const updateProjectApi = async (id, payload, token) => {
  const res = await request(`/projects/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  invalidateProjectsCache();
  return res.data;
};

export const deleteProjectApi = async (id, token) => {
  const res = await request(`/projects/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  invalidateProjectsCache();
  return res.data;
};

export const updateTeamMemberApi = async (id, payload, token) => {
  const res = await request(`/team/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const createServiceApi = async (payload, token) => {
  const res = await request('/services', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const updateServiceApi = async (id, payload, token) => {
  const res = await request(`/services/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const deleteServiceApi = async (id, token) => {
  const res = await request(`/services/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  return res.data;
};

// ImageKit upload API
export const uploadImageApi = async (fileData, fileName, folder = '/syntax-studio', token) => {
  const res = await request('/upload', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: JSON.stringify({ file: fileData, fileName, folder }),
  });
  return res.data;
};

// Studio settings API
export const getSettings = async () => {
  const res = await request('/settings');
  return res.data;
};

export const updateSettingsApi = async (payload, token) => {
  const res = await request('/settings', {
    method: 'PUT',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

// Team member CRUD
export const createTeamMemberApi = async (payload, token) => {
  const res = await request('/team', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const deleteTeamMemberApi = async (id, token) => {
  const res = await request(`/team/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  return res.data;
};

// Testimonials CRUD
export const createTestimonialApi = async (payload, token) => {
  const res = await request('/testimonials', {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const updateTestimonialApi = async (id, payload, token) => {
  const res = await request(`/testimonials/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
    body: JSON.stringify(payload),
  });
  return res.data;
};

export const deleteTestimonialApi = async (id, token) => {
  const res = await request(`/testimonials/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  });
  return res.data;
};


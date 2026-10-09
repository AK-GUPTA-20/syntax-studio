import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput, sanitizeSlug } from '../utils/sanitize.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

// Primary collection is 'teamMembers', with fallback to 'team'
const teamMembersService = new FirestoreService('teamMembers');
const legacyTeamService = new FirestoreService('team');

// Permitted fields (BOPLA prevention)
const ALLOWED_TEAM_FIELDS = [
  'name',
  'slug',
  'role',
  'bio',
  'shortBio',
  'avatar',
  'profileImage',
  'skills',
  'socials',
  'contact',
  'specialty',
  'education',
  'journey',
  'rolesTypewriter',
  'quote',
  'stats',
  'order'
];

function pickTeamData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_TEAM_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, ['bio', 'shortBio', 'quote'].includes(field) ? 3000 : 500);
      } else if (field === 'slug' && typeof val === 'string') {
        picked[field] = sanitizeSlug(val);
      } else if (field === 'rolesTypewriter' && Array.isArray(val)) {
        picked[field] = val.map(r => sanitizeInput(String(r), 100)).filter(Boolean);
      } else if (field === 'skills' && Array.isArray(val)) {
        picked[field] = val; // Can be categorized objects or strings
      } else if (['socials', 'contact', 'education'].includes(field) && typeof val === 'object' && val !== null) {
        picked[field] = val;
      } else if (['journey', 'stats'].includes(field) && Array.isArray(val)) {
        picked[field] = val;
      } else if (field === 'order') {
        picked[field] = parseInt(val, 10) || 0;
      } else {
        picked[field] = val;
      }
    }
  }
  return picked;
}

export const getAllTeamMembers = async (req, res, next) => {
  try {
    let team = await teamMembersService.getAll();
    if (!team || team.length === 0) {
      team = await legacyTeamService.getAll();
    }
    team.sort((a, b) => (a.order || 0) - (b.order || 0));
    return ApiResponse.success(res, 'Team members retrieved successfully', team);
  } catch (error) {
    next(error);
  }
};

export const getTeamMemberBySlug = async (req, res, next) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    let member = await teamMembersService.getByField('slug', slug);
    if (!member) {
      member = await legacyTeamService.getByField('slug', slug);
    }
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
    const cleanData = pickTeamData(req.body);
    const created = await teamMembersService.create(cleanData);

    await logAuditEvent({
      eventType: AuditEventType.TEAM_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'create', id: created.id, name: created.name }
    });

    return ApiResponse.success(res, 'Team member created successfully', created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanData = pickTeamData(req.body);
    let updated = await teamMembersService.update(id, cleanData);
    if (!updated) {
      updated = await legacyTeamService.update(id, cleanData);
    }
    if (!updated) {
      return ApiResponse.error(res, `Team member '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.TEAM_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'update', id, name: updated.name }
    });

    return ApiResponse.success(res, 'Team member updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deleted = await teamMembersService.delete(id);
    if (!deleted) {
      deleted = await legacyTeamService.delete(id);
    }
    if (!deleted) {
      return ApiResponse.error(res, `Team member '${id}' not found`, null, 404);
    }

    await logAuditEvent({
      eventType: AuditEventType.TEAM_MODIFIED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { action: 'delete', id }
    });

    return ApiResponse.success(res, 'Team member deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

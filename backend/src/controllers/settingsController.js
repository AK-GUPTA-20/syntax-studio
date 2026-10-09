import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeInput } from '../utils/sanitize.js';
import { config } from '../config/env.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const settingsService = new FirestoreService('settings');

// Permitted fields (BOPLA prevention)
const ALLOWED_SETTINGS_FIELDS = [
  'studioName',
  'contactEmail',
  'workingHours',
  'promoCode',
  'discountPercentage',
  'discountLabel',
  'promoActive',
  'termsAndConditions',
  'termsVersion',
  'termsLastUpdated'
];

function pickSettingsData(rawBody) {
  const picked = {};
  for (const field of ALLOWED_SETTINGS_FIELDS) {
    if (field in rawBody) {
      const val = rawBody[field];
      if (typeof val === 'string') {
        picked[field] = sanitizeInput(val, field === 'termsAndConditions' ? 50000 : 200);
      } else if (field === 'promoCode' && typeof val === 'string') {
        picked[field] = val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
      } else if (field === 'discountPercentage') {
        picked[field] = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
      } else if (field === 'promoActive') {
        picked[field] = Boolean(val);
      } else {
        picked[field] = val;
      }
    }
  }
  return picked;
}

export const getSettings = async (req, res, next) => {
  try {
    let settings = await settingsService.getById('general');
    if (!settings) {
      settings = await settingsService.create({
        id: 'general',
        studioName: 'Syntax Studio',
        contactEmail: 'contact@syntaxstudio.dev',
        workingHours: 'Mon - Fri: 9:00 AM - 7:00 PM IST',
        promoCode: config.promoCode || 'syntaxStudio',
        discountPercentage: config.discountPercentage || 10,
        discountLabel: '10% Special Studio Discount',
        promoActive: true,
      });
    }

    if (!settings.promoCode) {
      settings.promoCode = config.promoCode || 'syntaxStudio';
    }
    if (settings.discountPercentage === undefined) {
      settings.discountPercentage = config.discountPercentage || 10;
    }
    if (settings.discountLabel === undefined) {
      settings.discountLabel = '10% Special Studio Discount';
    }
    if (settings.promoActive === undefined) {
      settings.promoActive = true;
    }

    return ApiResponse.success(res, 'Studio settings retrieved', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const cleanData = pickSettingsData(req.body);
    const updated = await settingsService.update('general', cleanData);

    await logAuditEvent({
      eventType: AuditEventType.SETTINGS_UPDATED,
      actor: req.adminUser?.email || 'admin',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { updatedKeys: Object.keys(cleanData) }
    });

    return ApiResponse.success(res, 'Studio settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

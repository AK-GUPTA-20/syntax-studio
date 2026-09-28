import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

const settingsService = new FirestoreService('settings');

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
    // Ensure promo settings fallback if not yet stored in doc
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
    const updated = await settingsService.update('general', req.body);
    return ApiResponse.success(res, 'Studio settings updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

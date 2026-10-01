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
    if (!settings.termsAndConditions) {
      settings.termsAndConditions = `1. ENGAGEMENT AND SCOPE OF WORK
Syntax Studio provides custom software engineering, full-stack web development, and systems architecture services. All project timelines, deliverables, and technical specifications are defined in the mutually approved proposal or sprint milestone schedule.

2. FIXED-PRICE MILESTONES & PAYMENT TERMS
Every engagement is structured with transparent, milestone-based pricing. Work begins upon milestone agreement. Invoices are payable according to the agreed milestones. Zero hidden fees or unsolicited recurring retainers.

3. INTELLECTUAL PROPERTY & CODE OWNERSHIP
Upon full settlement of milestone payments, 100% of all intellectual property, proprietary source code, database architectures, and associated assets created for the client are irrevocably transferred to the client.

4. CONFIDENTIALITY & NON-DISCLOSURE (NDA)
Syntax Studio treats all client information, product specifications, trade secrets, and business logic with strict confidentiality under full mutual non-disclosure principles.

5. POST-LAUNCH WARRANTY & SUPPORT
All completed and deployed software modules include our standard 14-day post-launch warranty, covering bug fixes, deployment stability, and critical resolution of agreed deliverables.

6. LIMITATION OF LIABILITY
Syntax Studio strives for architectural resilience and 99.9% uptime compliance. Neither party shall be held liable for indirect, incidental, or consequential damages arising from third-party vendor outages (cloud hosts, payment gateways, external APIs).

7. GOVERNING LAW & JURISDICTION
These terms are governed in accordance with applicable laws. Any disputes shall be resolved through good-faith mediation prior to formal legal proceedings.`;
    }
    if (!settings.termsVersion) {
      settings.termsVersion = '1.0';
    }
    if (!settings.termsLastUpdated) {
      settings.termsLastUpdated = new Date().toISOString().split('T')[0];
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

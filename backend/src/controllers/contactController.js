import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { getAdminAuth } from '../firebase/firebaseAdmin.js';
import { config } from '../config/env.js';

const contactService = new FirestoreService('contactMessages');
const settingsService = new FirestoreService('settings');

export const submitContactForm = async (req, res, next) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      projectType,
      budget,
      timeline,
      message,
      firebaseToken,
      verificationMethod,
      code,
      promoCode
    } = req.body;

    const cleanedEmail = (email || '').trim().toLowerCase();

    // Normalize Indian phone number to E.164 (+91XXXXXXXXXX)
    let normalizedPhone = '';
    if (phone && phone.trim()) {
      const digits = phone.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91|0)/, '');
      if (/^[6-9]\d{9}$/.test(digits)) {
        normalizedPhone = `+91${digits}`;
      }
    }

    // Verify token with Firebase Authentication
    const auth = getAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(firebaseToken);
    } catch (authError) {
      console.error('Firebase token verification failed:', authError.message);
      return ApiResponse.error(
        res,
        'Authentication verification failed: Invalid or expired Firebase verification token. Please verify email or phone again.',
        null,
        401
      );
    }

    // Check whether email or phone or both are confirmed by Firebase
    const tokenEmail = (decodedToken.email || '').toLowerCase();
    const tokenPhone = decodedToken.phone_number || '';

    const isEmailVerified = Boolean(
      tokenEmail &&
      tokenEmail === cleanedEmail &&
      (decodedToken.email_verified || decodedToken.firebase?.sign_in_provider === 'passwordless' || decodedToken.firebase?.sign_in_provider === 'emailLink')
    );

    const isPhoneVerified = Boolean(
      tokenPhone &&
      normalizedPhone &&
      (tokenPhone === normalizedPhone || tokenPhone.endsWith(normalizedPhone.slice(-10)))
    );

    if (!isEmailVerified && !isPhoneVerified) {
      return ApiResponse.error(
        res,
        'Verification requirement not met: At least one contact method (Email or Indian Mobile Number) must be successfully verified with Firebase Authentication.',
        null,
        400
      );
    }

    const verifiedMethod = isEmailVerified && isPhoneVerified
      ? 'both'
      : (isPhoneVerified ? 'phone' : 'email');

    // Promo code validation & discount calculation
    const submittedCode = (code || promoCode || '').trim();
    let validatedCode = null;
    let discountApplied = null;

    if (submittedCode) {
      let currentSettings = null;
      try {
        currentSettings = await settingsService.getById('general');
      } catch (err) {
        console.warn('Could not read settings for promo validation:', err.message);
      }
      const activeCode = (currentSettings?.promoCode || config.promoCode || 'syntaxStudio').trim();
      const discountPercent = currentSettings?.discountPercentage ?? config.discountPercentage ?? 10;
      const isPromoActive = currentSettings?.promoActive !== false;

      if (isPromoActive && submittedCode.toLowerCase() === activeCode.toLowerCase()) {
        validatedCode = activeCode;
        discountApplied = `${discountPercent}% OFF`;
      } else {
        validatedCode = submittedCode;
      }
    }

    const messageDoc = {
      name: (name || '').trim(),
      email: cleanedEmail,
      phone: normalizedPhone || (phone ? phone.trim() : ''),
      company: (company || '').trim(),
      projectType: projectType || 'E-Commerce',
      budget: budget || '₹5,000 – ₹15,000',
      timeline: timeline || '1 – 2 Months',
      code: validatedCode,
      promoCode: validatedCode,
      discountApplied,
      message: (message || '').trim(),
      verificationStatus: 'verified',
      verificationMethod: verifiedMethod,
      isEmailVerified,
      isPhoneVerified,
      verifiedUid: decodedToken.uid,
      status: 'unread',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    const created = await contactService.create(messageDoc);
    return ApiResponse.success(
      res,
      'Thank you! Your verified inquiry has been received. Our founders will review it and respond within 24 hours.',
      { id: created.id, verificationMethod: verifiedMethod },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await contactService.getAll();
    // Sort descending by creation date
    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return ApiResponse.success(res, 'Inquiries retrieved successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await contactService.update(id, updateData);
    if (!updated) {
      return ApiResponse.error(res, `Inquiry with id '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Inquiry status updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await contactService.delete(id);
    if (!deleted) {
      return ApiResponse.error(res, `Inquiry with id '${id}' not found`, null, 404);
    }
    return ApiResponse.success(res, 'Inquiry deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

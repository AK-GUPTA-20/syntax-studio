import { FirestoreService } from '../services/firestoreService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getAdminAuth } from '../firebase/firebaseAdmin.js';
import { checkEmailVerification } from '../services/verificationService.js';
import { sendConfirmationEmail } from '../services/emailService.js';
import { config } from '../config/env.js';

const contactService = new FirestoreService('contactMessages');
const settingsService = new FirestoreService('settings');
const usersService = new FirestoreService('users');

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
      emailVerificationProof,
      verificationMethod,
      code,
      promoCode,
      termsAccepted
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

    // 1. Verify Phone via Firebase Phone Auth if phone token is provided
    let decodedToken = null;
    let isPhoneVerified = false;
    if (firebaseToken) {
      try {
        const auth = getAdminAuth();
        decodedToken = await auth.verifyIdToken(firebaseToken);
        const tokenPhone = decodedToken?.phone_number || '';
        if (tokenPhone && normalizedPhone && (tokenPhone === normalizedPhone || tokenPhone.endsWith(normalizedPhone.slice(-10)))) {
          isPhoneVerified = true;
        }
      } catch { /* non-fatal — phone verification optional */ }
    }

    // 2. Verify Email via Resend-based verification service
    const isEmailVerified = await checkEmailVerification(cleanedEmail, emailVerificationProof);

    // 3. Ensure at least one verification method succeeded
    if (!isEmailVerified && !isPhoneVerified) {
      return ApiResponse.error(
        res,
        'Verification requirement not met: At least one contact method (Work Email verified via Resend or Indian Mobile Number verified via Phone OTP) must be verified.',
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
      termsAccepted: Boolean(termsAccepted),
      message: (message || '').trim(),
      verificationStatus: 'verified',
      verificationMethod: verifiedMethod,
      isEmailVerified,
      isPhoneVerified,
      verifiedUid: decodedToken ? decodedToken.uid : null,
      status: 'unread',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    const created = await contactService.create(messageDoc);

    // Update user database record if email is verified
    if (isEmailVerified) {
      try {
        const existingUser = await usersService.getById(cleanedEmail);
        if (existingUser) {
          await usersService.update(cleanedEmail, {
            isEmailVerified: true,
            updatedAt: new Date().toISOString()
          });
        } else {
          await usersService.create({
            id: cleanedEmail,
            email: cleanedEmail,
            name: (name || '').trim(),
            company: (company || '').trim(),
            isEmailVerified: true,
            createdAt: new Date().toISOString()
          });
        }
      } catch { /* non-fatal */ }
    }

    // Send client confirmation email (non-fatal — never blocks submission)
    sendConfirmationEmail({
      to: cleanedEmail,
      name: (name || '').trim(),
      projectType: projectType || '',
      budget: budget || '',
      timeline: timeline || '',
      inquiryId: created.id
    }).catch(() => {});

    return ApiResponse.success(
      res,
      'Your inquiry has been received! We will get back to you within 24 hours. A confirmation email has been sent to your inbox.',
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

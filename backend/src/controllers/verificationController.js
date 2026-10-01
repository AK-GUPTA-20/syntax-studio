import {
  sendVerificationCode,
  verifyOtpCode,
  verifyEmailToken,
  checkEmailVerification
} from '../services/verificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

/**
 * POST /api/verification/send-code
 * Send verification email via Resend
 */
export const handleSendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return ApiResponse.error(res, 'A valid email address is required.', null, 400);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return ApiResponse.error(res, 'Please provide a valid email address format.', null, 400);
    }

    const result = await sendVerificationCode(email.trim());
    const message = result.devNotice
      ? `Verification code generated! (Dev mode: check server terminal)`
      : `Verification code sent to ${result.email}. Please check your inbox or spam folder.`;
    return ApiResponse.success(res, message, result);
  } catch (error) {
    if (error.status === 429) {
      return ApiResponse.error(
        res,
        error.message,
        { cooldownRemaining: error.cooldownRemaining },
        429
      );
    }
    return ApiResponse.error(
      res,
      error.message || 'Failed to dispatch verification email. Please try again.',
      null,
      error.status || 500
    );
  }
};

/**
 * POST /api/verification/verify-otp
 * Verify 6-digit OTP code entered by user
 */
export const handleVerifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return ApiResponse.error(res, 'Email and 6-digit OTP are required.', null, 400);
    }

    const result = await verifyOtpCode(email, otp);
    return ApiResponse.success(res, 'Email verified successfully!', result);
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Verification failed. Please check the code and try again.',
      { remainingAttempts: error.remainingAttempts, code: error.code },
      error.status || 400
    );
  }
};

/**
 * GET /api/verification/verify-email?token=...&email=...
 * Verification link clicked by user in email.
 * Redirects user back to frontend /contact with status.
 */
export const handleVerifyEmailLink = async (req, res) => {
  const { token, email } = req.query;
  const clientBase = config.clientUrl || 'http://localhost:5173';

  if (!token || !email) {
    const errorMsg = 'Invalid verification link: missing token or email.';
    return res.redirect(`${clientBase}/contact?emailError=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const result = await verifyEmailToken(email, token);
    const redirectUrl = `${clientBase}/contact?emailVerified=true&email=${encodeURIComponent(result.email)}&proof=${encodeURIComponent(result.verificationProof)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    const errorMsg = error.message || 'Verification link is invalid or expired. Please request a new code.';
    return res.redirect(`${clientBase}/contact?emailError=${encodeURIComponent(errorMsg)}&email=${encodeURIComponent(email)}`);
  }
};

/**
 * GET /api/verification/status?email=...&proof=...
 * Check verification status of an email
 */
export const handleCheckVerificationStatus = async (req, res) => {
  try {
    const { email, proof } = req.query;
    if (!email) {
      return ApiResponse.error(res, 'Email parameter is required.', null, 400);
    }

    const isVerified = await checkEmailVerification(email, proof);
    return ApiResponse.success(res, 'Verification status retrieved.', {
      email,
      isVerified
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, null, 500);
  }
};

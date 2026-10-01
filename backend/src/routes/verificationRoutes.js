import { Router } from 'express';
import {
  handleSendVerification,
  handleVerifyOtp,
  handleVerifyEmailLink,
  handleCheckVerificationStatus
} from '../controllers/verificationController.js';
import { verificationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Dispatch Resend verification email (OTP + Clickable link)
router.post('/send-code', verificationLimiter, handleSendVerification);

// Resend alias for requirement 8
router.post('/resend', verificationLimiter, handleSendVerification);

// Verify 6-digit OTP code entered from frontend
router.post('/verify-otp', verificationLimiter, handleVerifyOtp);

// Verify email when user clicks the link in their email
router.get('/verify-email', handleVerifyEmailLink);

// Check if an email is already verified
router.get('/status', handleCheckVerificationStatus);

export default router;

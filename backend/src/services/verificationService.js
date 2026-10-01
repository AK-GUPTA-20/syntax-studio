import crypto from 'crypto';
import { FirestoreService } from './firestoreService.js';
import { sendVerificationEmail } from './emailService.js';
import { config } from '../config/env.js';

const verificationDb = new FirestoreService('emailVerifications');
const usersDb = new FirestoreService('users');

const OTP_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

/**
 * Hash a sensitive value (token or OTP) using SHA-256
 */
export const hashSecret = (val) => {
  return crypto.createHash('sha256').update(String(val).trim()).digest('hex');
};

/**
 * Generate a cryptographically secure 6-digit OTP string
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Generate a cryptographically secure 32-byte hex token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate an HMAC-SHA256 verification proof token for verified sessions
 */
export const generateVerificationProof = (email, timestamp = Date.now()) => {
  const data = `${email.toLowerCase()}:${timestamp}`;
  const secret = config.adminSecretKey || 'syntax_studio_verification_secret';
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${Buffer.from(data).toString('base64url')}.${signature}`;
};

/**
 * Verify an HMAC-SHA256 verification proof token
 * Proof valid for 2 hours
 */
export const verifyVerificationProof = (proof, expectedEmail) => {
  if (!proof || typeof proof !== 'string') return false;
  const parts = proof.split('.');
  if (parts.length !== 2) return false;

  const [encodedData, signature] = parts;
  const secret = config.adminSecretKey || 'syntax_studio_verification_secret';

  try {
    const rawData = Buffer.from(encodedData, 'base64url').toString('utf8');
    const [email, timestampStr] = rawData.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (email.toLowerCase() !== expectedEmail.toLowerCase()) return false;
    // Check expiration (2 hours)
    if (Date.now() - timestamp > 2 * 60 * 60 * 1000) return false;

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawData).digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
    return isValid;
  } catch (err) {
    return false;
  }
};

/**
 * Initiate Email Verification:
 * 1. Checks rate limit cooldown (60s).
 * 2. Invalidates previous OTP/tokens.
 * 3. Hashes new OTP and token (never stores plaintext).
 * 4. Saves verification record to Firestore.
 * 5. Sends email via Resend SDK.
 */
export const sendVerificationCode = async (rawEmail) => {
  const email = (rawEmail || '').trim().toLowerCase();

  // Retrieve existing record to check cooldown
  const existing = await verificationDb.getById(email);
  if (existing && existing.lastSentAt) {
    const elapsedSeconds = Math.floor((Date.now() - new Date(existing.lastSentAt).getTime()) / 1000);
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const waitTime = COOLDOWN_SECONDS - elapsedSeconds;
      const error = new Error(`Please wait ${waitTime}s before requesting a new verification code.`);
      error.status = 429;
      error.cooldownRemaining = waitTime;
      throw error;
    }
  }

  // Generate credentials
  const otp = generateOtp();
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Create verification URL pointing to the backend verification endpoint
  const backendBase = config.backendUrl || 'http://localhost:5000';
  const verificationUrl = `${backendBase}/api/verification/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  // Store hashes only - satisfies Requirement 10
  const docPayload = {
    id: email,
    email,
    tokenHash: hashSecret(token),
    otpHash: hashSecret(otp),
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    isEmailVerified: false,
    lastSentAt: new Date().toISOString(),
    verifiedAt: null,
    verificationProof: null
  };

  // Upsert into emailVerifications collection (invalidating old tokens)
  await verificationDb.create(docPayload);

  // Send email via Resend
  const emailRes = await sendVerificationEmail({
    to: email,
    otp,
    verificationUrl,
    expiresInMinutes: OTP_EXPIRY_MINUTES
  });

  return {
    email,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    cooldownSeconds: COOLDOWN_SECONDS,
    devFallback: emailRes?.devFallback || false,
    devNotice: emailRes?.devNotice || null,
    devOtp: emailRes?.devFallback ? otp : undefined,
    devVerificationUrl: emailRes?.devFallback ? verificationUrl : undefined
  };
};

/**
 * Verify OTP entered by user:
 * 1. Checks expiration.
 * 2. Checks maximum attempts.
 * 3. Compares hashes with timing safety.
 * 4. On success: marks email as verified, invalidates token & OTP, updates user record.
 */
export const verifyOtpCode = async (rawEmail, rawOtp) => {
  const email = (rawEmail || '').trim().toLowerCase();
  const otp = (rawOtp || '').trim();

  if (!/^\d{6}$/.test(otp)) {
    const error = new Error('Please enter a valid 6-digit verification code.');
    error.status = 400;
    throw error;
  }

  const record = await verificationDb.getById(email);
  if (!record || !record.otpHash) {
    const error = new Error('No active verification request found for this email. Please request a code first.');
    error.status = 404;
    throw error;
  }

  // Check expiration
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    const error = new Error('Verification code has expired. Please request a new code.');
    error.status = 400;
    error.code = 'EXPIRED';
    throw error;
  }

  // Check attempt limits
  if ((record.attempts || 0) >= MAX_ATTEMPTS) {
    // Invalidate record due to brute-force detection
    await verificationDb.update(email, { otpHash: null, tokenHash: null });
    const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
    error.status = 429;
    error.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw error;
  }

  // Verify hash
  const inputHash = hashSecret(otp);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(inputHash, 'hex'),
    Buffer.from(record.otpHash, 'hex')
  );

  if (!isValid) {
    const newAttempts = (record.attempts || 0) + 1;
    await verificationDb.update(email, { attempts: newAttempts });
    const remaining = MAX_ATTEMPTS - newAttempts;
    const error = new Error(
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Incorrect code. Maximum verification attempts reached. Please request a new code.'
    );
    error.status = 400;
    error.remainingAttempts = remaining;
    throw error;
  }

  // Successful verification
  const now = new Date().toISOString();
  const proof = generateVerificationProof(email);

  // Invalidate OTP and token hashes, mark verified
  await verificationDb.update(email, {
    isEmailVerified: true,
    verifiedAt: now,
    otpHash: null,
    tokenHash: null,
    attempts: 0,
    verificationProof: proof
  });

  // Update or record user in users collection
  try {
    const existingUser = await usersDb.getById(email);
    if (existingUser) {
      await usersDb.update(email, { isEmailVerified: true, emailVerifiedAt: now });
    } else {
      await usersDb.create({
        id: email,
        email,
        isEmailVerified: true,
        emailVerifiedAt: now
      });
    }
  } catch { /* non-fatal */ }

  return {
    verified: true,
    email,
    verificationProof: proof,
    message: 'Email verified successfully with Resend.'
  };
};

/**
 * Verify verification link token (from email button click)
 */
export const verifyEmailToken = async (rawEmail, rawToken) => {
  const email = (rawEmail || '').trim().toLowerCase();
  const token = (rawToken || '').trim();

  if (!email || !token) {
    const error = new Error('Missing verification email or token.');
    error.status = 400;
    throw error;
  }

  const record = await verificationDb.getById(email);
  if (!record || !record.tokenHash) {
    const error = new Error('Invalid or already used verification link. Please request a new link.');
    error.status = 404;
    throw error;
  }

  // Check expiration
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    const error = new Error('Verification link has expired. Please request a new verification email.');
    error.status = 400;
    error.code = 'EXPIRED';
    throw error;
  }

  // Verify hash
  const inputHash = hashSecret(token);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(inputHash, 'hex'),
    Buffer.from(record.tokenHash, 'hex')
  );

  if (!isValid) {
    const error = new Error('Invalid verification link. Please request a fresh link.');
    error.status = 400;
    throw error;
  }

  // Successful verification
  const now = new Date().toISOString();
  const proof = generateVerificationProof(email);

  await verificationDb.update(email, {
    isEmailVerified: true,
    verifiedAt: now,
    otpHash: null,
    tokenHash: null,
    attempts: 0,
    verificationProof: proof
  });

  // Update or record user in users collection
  try {
    const existingUser = await usersDb.getById(email);
    if (existingUser) {
      await usersDb.update(email, { isEmailVerified: true, emailVerifiedAt: now });
    } else {
      await usersDb.create({
        id: email,
        email,
        isEmailVerified: true,
        emailVerifiedAt: now
      });
    }
  } catch { /* non-fatal */ }

  return {
    verified: true,
    email,
    verificationProof: proof,
    message: 'Email verified successfully.'
  };
};

/**
 * Check if an email is already verified and has an active verification proof
 */
export const checkEmailVerification = async (rawEmail, proof = null) => {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) return false;

  // If proof provided, check HMAC
  if (proof && verifyVerificationProof(proof, email)) {
    return true;
  }

  // Check database record
  const record = await verificationDb.getById(email);
  if (!record || !record.isEmailVerified) {
    return false;
  }

  // Check if verification was recent (within 24 hours)
  if (record.verifiedAt) {
    const ageMs = Date.now() - new Date(record.verifiedAt).getTime();
    if (ageMs < 24 * 60 * 60 * 1000) {
      return true;
    }
  }

  return false;
};

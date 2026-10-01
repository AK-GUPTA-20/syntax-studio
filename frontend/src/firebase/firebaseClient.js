import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB-yPIc4iriuzVryXqF1d-EFQHIaZOeSqc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'syntax-studio-addda.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'syntax-studio-addda',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'syntax-studio-addda.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '129283912191',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:129283912191:web:008716c9413d18d28737ca',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BTT0BT4VBZ'
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

/**
 * Strict validation and normalization for Indian mobile numbers
 * Rules:
 * - Exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Supports +91, 91, or 0 prefixes
 */
export function validateIndianPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      e164: '',
      display: '',
      error: 'Indian mobile number is required'
    };
  }

  // Remove non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      e164: '',
      display: '',
      error: 'Mobile number must contain digits only'
    };
  }

  if (cleaned.length < 10) {
    return {
      isValid: false,
      normalized: cleaned,
      e164: '',
      display: '',
      error: `Number is too short (${cleaned.length}/10 digits). Enter a 10-digit Indian mobile number.`
    };
  }

  if (cleaned.length > 10) {
    return {
      isValid: false,
      normalized: cleaned,
      e164: '',
      display: '',
      error: `Number is too long (${cleaned.length} digits). Indian mobile numbers must be exactly 10 digits.`
    };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      e164: '',
      display: '',
      error: 'Invalid Indian mobile number. Valid numbers must start with 6, 7, 8, or 9.'
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    e164: `+91${cleaned}`,
    display: `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
    error: null
  };
}

/**
 * Email validation
 */
export function validateEmail(rawEmail) {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { isValid: false, normalized: '', error: 'Email address is required' };
  }
  const normalized = rawEmail.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: 'Please enter a valid email address (e.g. name@company.com)'
    };
  }
  return { isValid: true, normalized, error: null };
}

/**
 * Reset / clear reCAPTCHA verifier and clean its container
 */
export function resetRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (typeof window !== 'undefined' && window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
    window.recaptchaVerifier = null;
  }
  const container = typeof document !== 'undefined' && document.getElementById(containerId);
  if (container) {
    container.replaceChildren();
  }
}

/**
 * Initialize or reuse reCAPTCHA verifier for Phone Auth.
 * Default size is 'normal' (visible checkbox) to ensure direct user activation,
 * eliminating browser 'requestStorageAccess: Permission denied' errors.
 */
export function initRecaptchaVerifier(containerId = 'recaptcha-container', options = {}) {
  if (typeof window === 'undefined') return null;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`reCAPTCHA container #${containerId} not found in DOM`);
    return null;
  }

  // If verifier already exists and container still has rendered widget, return existing verifier
  if (window.recaptchaVerifier && container.hasChildNodes()) {
    return window.recaptchaVerifier;
  }

  // Clean container before creating a new verifier to avoid duplicate widgets
  resetRecaptchaVerifier(containerId);

  const size = options.size || 'normal';
  const theme = options.theme || 'dark';

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size,
      theme,
      callback: (token) => {
        if (typeof options.onSuccess === 'function') {
          options.onSuccess(token);
        }
      },
      'expired-callback': () => {
        if (typeof options.onExpired === 'function') {
          options.onExpired();
        }
        resetRecaptchaVerifier(containerId);
      },
      'error-callback': (err) => {
        console.warn('reCAPTCHA verifier error:', err);
        if (typeof options.onError === 'function') {
          options.onError(err);
        }
      }
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('Failed to initialize RecaptchaVerifier:', err);
    throw err;
  }
}

/**
 * Render reCAPTCHA widget explicitly if needed
 */
export async function renderRecaptchaVerifier(containerId = 'recaptcha-container', options = {}) {
  const verifier = initRecaptchaVerifier(containerId, options);
  if (verifier && typeof verifier.render === 'function') {
    try {
      const widgetId = await verifier.render();
      return { verifier, widgetId };
    } catch (err) {
      console.warn('reCAPTCHA render warning:', err);
      return { verifier, widgetId: null };
    }
  }
  return { verifier: null, widgetId: null };
}

/**
 * Send Phone Authentication OTP via Firebase
 */
export async function sendPhoneOtp(e164Phone, verifier) {
  return await signInWithPhoneNumber(auth, e164Phone, verifier);
}

/**
 * Confirm Phone Authentication OTP with confirmationResult
 */
export async function confirmPhoneOtp(confirmationResult, otpCode) {
  const result = await confirmationResult.confirm(otpCode);
  const token = await result.user.getIdToken(true);
  return { user: result.user, token };
}

/**
 * Get current authenticated user ID Token
 */
export async function getCurrentUserIdToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken(true);
  }
  return null;
}

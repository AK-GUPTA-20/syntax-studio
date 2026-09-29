import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Send,
  Github,
  Clock,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Tag,
  Sparkles,
  Lock,
  GitBranch,
  Zap
} from 'lucide-react';
import { submitContact, getTeam, getServices, getSettings } from '../api/client';
import { sanitizeInput, sanitizePromoCode, SafeExternalLink } from '../utils/security';
import {
  auth,
  validateIndianPhone,
  validateEmail,
  initRecaptchaVerifier,
  resetRecaptchaVerifier,
  sendPhoneOtp,
  confirmPhoneOtp,
  sendEmailLinkVerification,
  checkIsEmailSignInLink,
  completeEmailSignInLink,
  getCurrentUserIdToken
} from '../firebase/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || '';
  const preselectedFounder = searchParams.get('founder') || '';
  const preselectedProject = searchParams.get('project') || searchParams.get('projectRef') || '';
  const preselectedBudget = searchParams.get('budget') || '';
  const preselectedTimeline = searchParams.get('timeline') || '';
  const preselectedCode = searchParams.get('code') || '';

  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form inputs (NO placeholders used)
  const initialMessage = preselectedProject
    ? `Hi Syntax Studio team, I am interested in building a solution similar to ${preselectedProject}. Here are some specifics about our requirements:`
    : preselectedFounder
    ? `Hi ${preselectedFounder}, I would like to discuss a project with you.`
    : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: preselectedService || '',
    budget: preselectedBudget || '',
    timeline: preselectedTimeline || '',
    code: preselectedCode || '',
    message: initialMessage,
  });

  // Promo code & discount state
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [codeFeedback, setCodeFeedback] = useState(null);

  // Touched states for inline validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false
  });

  // Validation results
  const phoneValidation = validateIndianPhone(formData.phone);
  const emailValidation = validateEmail(formData.email);

  // Verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneSendingOtp, setPhoneSendingOtp] = useState(false);
  const [phoneVerifyingOtp, setPhoneVerifyingOtp] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [phoneTimer, setPhoneTimer] = useState(0);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailTimer, setEmailTimer] = useState(0);
  const [showManualEmailPaste, setShowManualEmailPaste] = useState(false);
  const [manualEmailLink, setManualEmailLink] = useState('');

  // Firebase auth token
  const [firebaseToken, setFirebaseToken] = useState('');

  // Countdown timer for phone resend OTP
  useEffect(() => {
    let interval = null;
    if (phoneTimer > 0) {
      interval = setInterval(() => {
        setPhoneTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

  // Countdown timer for email resend
  useEffect(() => {
    let interval = null;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  // Load team, services, and studio settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [teamData, servicesData, settingsData] = await Promise.all([
          getTeam(),
          getServices(),
          getSettings().catch(() => null)
        ]);
        setTeam(teamData || []);
        setServices(servicesData || []);
        setSettings(settingsData || null);
      } catch (err) {
        console.error('Failed to load contact page data:', err);
      }
    }
    loadData();
    return () => {
      resetRecaptchaVerifier('recaptcha-container');
    };
  }, []);

  // Handle email sign-in link on page load if user clicked verification link in email
  useEffect(() => {
    async function checkEmailLink() {
      if (checkIsEmailSignInLink(window.location.href)) {
        setEmailVerifying(true);
        setEmailError(null);
        try {
          // Restore form draft if available
          const savedDraft = localStorage.getItem('syntax_contact_draft');
          let emailToUse = '';
          if (savedDraft) {
            try {
              const parsed = JSON.parse(savedDraft);
              setFormData((prev) => ({ ...prev, ...parsed }));
              emailToUse = parsed.email || '';
            } catch (e) {}
          }

          const { user, token } = await completeEmailSignInLink(emailToUse, window.location.href);
          setIsEmailVerified(true);
          setVerifiedEmail(user.email || emailToUse);
          setFirebaseToken(token);
          setSuccessMessage('Email verified successfully with Firebase Authentication! You can now submit your inquiry.');

          // Clean URL query parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          localStorage.removeItem('syntax_contact_draft');
        } catch (err) {
          console.error('Email sign-in link error:', err);
          setEmailError(err.message || 'Failed to verify email link. It may have expired or already been used.');
        } finally {
          setEmailVerifying(false);
        }
      }
    }
    checkEmailLink();
  }, []);

  // Listen to Firebase auth state changes to detect verified email or phone
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setFirebaseToken(token);

          // If user has verified phone matching form
          if (user.phoneNumber) {
            const check = validateIndianPhone(formData.phone);
            if (check.isValid && (user.phoneNumber === check.e164 || user.phoneNumber.endsWith(check.normalized))) {
              setIsPhoneVerified(true);
              setVerifiedPhone(user.phoneNumber);
            }
          }

          // If user has verified email matching form
          if (user.email && (user.emailVerified || !user.isAnonymous)) {
            if (user.email.toLowerCase() === formData.email.trim().toLowerCase()) {
              setIsEmailVerified(true);
              setVerifiedEmail(user.email);
            }
          }
        } catch (e) {
          console.warn('Error fetching ID token on auth change:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [formData.phone, formData.email]);

  // Dynamic Project Types, Budget & Timeline options from Firestore Settings
  const projectTypes = (settings?.projectTypes && settings.projectTypes.length > 0)
    ? settings.projectTypes
    : (services && services.length > 0 ? services.map(s => s.title) : []);

  const budgetRanges = (settings?.budgetRanges && settings.budgetRanges.length > 0)
    ? settings.budgetRanges
    : [];

  const timelineRanges = (settings?.timelineRanges && settings.timelineRanges.length > 0)
    ? settings.timelineRanges
    : [];

  // Sync URL parameters or default to first database options once loaded
  useEffect(() => {
    setFormData((prev) => {
      let updated = { ...prev };
      if (!updated.projectType) {
        if (preselectedService) {
          const match = projectTypes.find(
            (p) => p.toLowerCase() === preselectedService.toLowerCase() || preselectedService.toLowerCase().includes(p.toLowerCase())
          );
          updated.projectType = match || preselectedService;
        } else if (projectTypes.length > 0) {
          updated.projectType = projectTypes[0];
        }
      }
      if (!updated.budget) {
        if (preselectedBudget) {
          const matchB = budgetRanges.find(
            (b) => b.toLowerCase().includes(preselectedBudget.toLowerCase()) || preselectedBudget.toLowerCase().includes(b.toLowerCase())
          );
          updated.budget = matchB || preselectedBudget;
        } else if (budgetRanges.length > 0) {
          updated.budget = budgetRanges[0];
        }
      }
      if (!updated.timeline) {
        if (preselectedTimeline) {
          const matchT = timelineRanges.find(
            (t) => t.toLowerCase().includes(preselectedTimeline.toLowerCase()) || preselectedTimeline.toLowerCase().includes(t.toLowerCase())
          );
          updated.timeline = matchT || preselectedTimeline;
        } else if (timelineRanges.length > 0) {
          updated.timeline = timelineRanges[0];
        }
      }
      return updated;
    });
  }, [preselectedService, preselectedBudget, preselectedTimeline, settings, services]);

  // Auto-apply promo code if passed in URL query param and settings available
  useEffect(() => {
    if (preselectedCode && settings) {
      const activeCode = (settings?.promoCode || import.meta.env.VITE_DEFAULT_PROMO_CODE || 'syntaxStudio').trim();
      const discountPercent = settings?.discountPercentage ?? (parseInt(import.meta.env.VITE_DEFAULT_DISCOUNT_PERCENT, 10) || 10);
      const isPromoActive = settings?.promoActive !== false;

      if (isPromoActive && preselectedCode.toLowerCase() === activeCode.toLowerCase()) {
        setAppliedDiscount({
          code: activeCode,
          percent: discountPercent,
          label: settings?.discountLabel || `${discountPercent}% Special Studio Discount`
        });
        setCodeFeedback(`✓ Promo code "${activeCode}" automatically applied! ${discountPercent}% discount activated.`);
      }
    }
  }, [preselectedCode, settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset verification states if phone or email is modified after being verified
    if (name === 'phone' && isPhoneVerified) {
      const check = validateIndianPhone(value);
      if (!check.isValid || check.e164 !== verifiedPhone) {
        setIsPhoneVerified(false);
      }
    }
    if (name === 'email' && isEmailVerified) {
      if (value.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
        setIsEmailVerified(false);
      }
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // --- PROMO CODE HANDLERS ---
  const handleApplyCode = () => {
    const input = (formData.code || '').trim();
    if (!input) {
      setCodeFeedback('Please enter a promo code first.');
      setAppliedDiscount(null);
      return;
    }

    const activeCode = (settings?.promoCode || import.meta.env.VITE_DEFAULT_PROMO_CODE || 'syntaxStudio').trim();
    const discountPercent = settings?.discountPercentage ?? (parseInt(import.meta.env.VITE_DEFAULT_DISCOUNT_PERCENT, 10) || 10);
    const isPromoActive = settings?.promoActive !== false;

    if (!isPromoActive) {
      setCodeFeedback('This promo code is currently inactive.');
      setAppliedDiscount(null);
      return;
    }

    if (input.toLowerCase() === activeCode.toLowerCase()) {
      setAppliedDiscount({
        code: activeCode,
        percent: discountPercent,
        label: settings?.discountLabel || `${discountPercent}% Special Studio Discount`
      });
      setCodeFeedback(`✓ Promo code "${activeCode}" applied successfully! ${discountPercent}% discount activated.`);
    } else {
      setAppliedDiscount(null);
      setCodeFeedback('Invalid promo code. Please check the spelling and try again.');
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, code: val }));
    if (appliedDiscount || codeFeedback) {
      setAppliedDiscount(null);
      setCodeFeedback(null);
    }
  };

  // --- PHONE AUTH HANDLERS ---
  const handleSendPhoneOtp = async () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }

    setPhoneSendingOtp(true);
    setPhoneError(null);

    try {
      const verifier = initRecaptchaVerifier('recaptcha-container');
      const confirmationResult = await sendPhoneOtp(phoneValidation.e164, verifier);
      setPhoneConfirmationResult(confirmationResult);
      setPhoneOtpSent(true);
      setPhoneTimer(60);
      setPhoneError(null);
    } catch (err) {
      console.error('Send Phone OTP Error:', err);
      // Clean up reCAPTCHA verifier if in error state
      resetRecaptchaVerifier('recaptcha-container');

      const isBilling =
        err.code === 'auth/billing-not-enabled' ||
        (err.message && err.message.toLowerCase().includes('billing-not-enabled'));

      if (isBilling) {
        setPhoneError('SMS verification is currently unavailable. Please verify via your Work Email address above.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setPhoneError('Domain not authorized in Firebase. Please add syntax-studio-sigma.vercel.app to Firebase Console > Authentication > Settings > Authorized domains, or verify via Work Email.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setPhoneError('Phone sign-in is disabled in Firebase Console. Please enable the Phone provider, or verify via Work Email.');
      } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/app-not-authorized') {
        setPhoneError('reCAPTCHA verification check failed. Please refresh the page or verify instantly via Work Email.');
      } else if (err.code === 'auth/too-many-requests') {
        setPhoneError('Too many attempts. Please wait a few minutes before requesting another OTP, or verify via Work Email.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setPhoneError('Invalid phone number format. Please enter a 10-digit Indian mobile number.');
      } else if (err.code === 'auth/quota-exceeded') {
        setPhoneError('SMS daily quota reached. Please verify instantly via your Work Email address.');
      } else {
        setPhoneError(err.message || 'Failed to send OTP. Please verify your phone number or use Work Email verification.');
      }
    } finally {
      setPhoneSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneConfirmationResult) {
      setPhoneError('Please request an OTP first.');
      return;
    }
    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      setPhoneError('Please enter a valid 6-digit verification code.');
      return;
    }

    setPhoneVerifyingOtp(true);
    setPhoneError(null);

    try {
      const { user, token } = await confirmPhoneOtp(phoneConfirmationResult, phoneOtp.trim());
      setIsPhoneVerified(true);
      setVerifiedPhone(phoneValidation.e164);
      setFirebaseToken(token);
      setPhoneOtpSent(false);
      setPhoneOtp('');
      setPhoneError(null);
    } catch (err) {
      console.error('Verify Phone OTP Error:', err);
      let userMsg = 'Invalid verification code. Please check the code and try again.';
      if (err.code === 'auth/code-expired') {
        userMsg = 'Verification code has expired. Please request a new OTP.';
      } else if (err.code === 'auth/invalid-verification-code') {
        userMsg = 'Incorrect OTP entered. Please check and try again.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setPhoneError(userMsg);
    } finally {
      setPhoneVerifyingOtp(false);
    }
  };

  // --- EMAIL AUTH HANDLERS ---
  const handleSendEmailLink = async () => {
    setTouched((prev) => ({ ...prev, email: true }));
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }

    setEmailSending(true);
    setEmailError(null);

    try {
      // Save draft so client doesn't lose typed text when returning from email link
      localStorage.setItem('syntax_contact_draft', JSON.stringify(formData));
      await sendEmailLinkVerification(formData.email);
      setEmailLinkSent(true);
      setEmailTimer(60);
      setEmailError(null);
    } catch (err) {
      console.error('Send Email Link Error:', err);
      let userMsg = 'Failed to send verification email. Please try again.';
      if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many attempts. Please wait a few moments before requesting another link.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setEmailError(userMsg);
    } finally {
      setEmailSending(false);
    }
  };

  const handleManualEmailLinkVerify = async () => {
    if (!manualEmailLink || !manualEmailLink.trim()) {
      setEmailError('Please paste the complete verification link or confirmation URL from your email.');
      return;
    }

    setEmailVerifying(true);
    setEmailError(null);

    try {
      const { user, token } = await completeEmailSignInLink(formData.email, manualEmailLink.trim());
      setIsEmailVerified(true);
      setVerifiedEmail(user.email || formData.email);
      setFirebaseToken(token);
      setShowManualEmailPaste(false);
      setManualEmailLink('');
      setEmailLinkSent(false);
      setSuccessMessage('Email verified successfully with Firebase Authentication!');
    } catch (err) {
      console.error('Manual email link error:', err);
      setEmailError(err.message || 'Invalid or expired verification link. Please request a fresh link.');
    } finally {
      setEmailVerifying(false);
    }
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true
    });
    setSuccessMessage(null);
    setErrorMessage(null);

    // 1. Check Name
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    // 2. Check Email format
    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error);
      return;
    }

    // 3. Check Phone format if phone is entered
    if (formData.phone.trim() && !phoneValidation.isValid) {
      setErrorMessage(phoneValidation.error);
      return;
    }

    // 4. Check Message
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please provide project details (at least 10 characters).');
      return;
    }

    // 5. REQUIREMENT: At least ONE must be verified (Email OR Phone)
    if (!isEmailVerified && !isPhoneVerified) {
      setErrorMessage('Verification Required: Please verify either your Work Email or your Indian Mobile Number before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      // Get fresh Firebase ID Token
      const tokenToUse = (await getCurrentUserIdToken()) || firebaseToken;
      if (!tokenToUse) {
        throw new Error('Firebase session expired. Please re-verify your email or phone.');
      }

      // Determine verification method
      let verificationMethod = 'email';
      if (isEmailVerified && isPhoneVerified) {
        verificationMethod = 'both';
      } else if (isPhoneVerified) {
        verificationMethod = 'phone';
      }

      const payload = {
        name: sanitizeInput(formData.name, 100),
        email: formData.email.trim().toLowerCase(),
        company: sanitizeInput(formData.company, 120),
        phone: formData.phone.trim() ? phoneValidation.e164 : '',
        projectType: sanitizeInput(formData.projectType, 50),
        budget: sanitizeInput(formData.budget, 80),
        timeline: sanitizeInput(formData.timeline, 80),
        code: sanitizePromoCode(formData.code),
        promoCode: sanitizePromoCode(formData.code),
        discountApplied: appliedDiscount ? `${appliedDiscount.percent}% OFF` : null,
        message: sanitizeInput(formData.message, 3000),
        firebaseToken: tokenToUse,
        verificationMethod
      };

      const res = await submitContact(payload);
      setSuccessMessage(res.message || 'Your verified inquiry has been received! Our founders will review it and respond within 24 hours.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        projectType: projectTypes[0] || '',
        budget: budgetRanges[0] || '',
        timeline: timelineRanges[0] || '',
        code: '',
        message: '',
      });
      setAppliedDiscount(null);
      setCodeFeedback(null);
      setTouched({ name: false, email: false, phone: false, message: false });
      setIsEmailVerified(false);
      setIsPhoneVerified(false);
      setVerifiedEmail('');
      setVerifiedPhone('');
      setFirebaseToken('');
      localStorage.removeItem('syntax_contact_draft');
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAtLeastOneVerified = isEmailVerified || isPhoneVerified;

  return (
    <div className="relative pt-32 pb-24 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Ambient background glow */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="max-w-4xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-xs font-mono mb-4 text-cyan backdrop-blur-sm">
          <Sparkles size={13} className="text-cyan animate-pulse" />
          <span>{settings?.contactBadge || "// Start a Conversation"}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-text mb-4 tracking-tight">
          {settings?.contactTitle || "Let's Build Something Exceptional"}
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mb-8">
          {settings?.contactSubtitle || "Tell us about your project requirements, timeline, and goals. We review inquiries directly and respond with technical insights and an estimated scope within 24 hours."}
        </p>

        {/* 4 Trust & Guarantee Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <Lock size={16} className="text-amber shrink-0" />
            <div>
              <div className="font-bold text-text">100% NDA Safe</div>
              <div className="text-[10px] text-muted">Full Confidentiality</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <Clock size={16} className="text-cyan shrink-0" />
            <div>
              <div className="font-bold text-text">&lt;24h Response</div>
              <div className="text-[10px] text-muted">Direct Founder SLA</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <GitBranch size={16} className="text-green shrink-0" />
            <div>
              <div className="font-bold text-text">Day-1 Repo Transfer</div>
              <div className="text-[10px] text-muted">Full IP Ownership</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-sm flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-amber shrink-0" />
            <div>
              <div className="font-bold text-text">14-Day Warranty</div>
              <div className="text-[10px] text-muted">Post-Launch Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-7 sm:p-10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
              <h2 className="font-display text-2xl font-bold text-text">
                {settings?.contactFormTitle || "Project Inquiry Form"}
              </h2>
              <span className="text-[11px] font-mono text-cyan bg-cyan/10 border border-cyan/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                // Strict Firebase Verification
              </span>
            </div>

            {appliedDiscount && (
              <div className="p-3.5 rounded-xl border border-green/40 bg-green/10 text-green flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 font-semibold">
                  <Sparkles size={14} />
                  <span>Promo Code Active: {appliedDiscount.percent}% discount will be applied to your quotation!</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-green/20 text-green text-[10px] uppercase font-bold">
                  {appliedDiscount.code}
                </span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl border border-green/30 bg-green/10 text-green flex items-start gap-3 text-xs sm:text-sm font-mono">
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl border border-red/30 bg-red/10 text-red flex items-start gap-3 text-xs sm:text-sm font-mono">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-mono text-cyan mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-surface2 border text-sm text-text focus:border-amber transition-colors ${
                      touched.name && !formData.name.trim() ? 'border-red/60' : 'border-border'
                    }`}
                  />
                  {touched.name && !formData.name.trim() && (
                    <p className="mt-1 text-[11px] font-mono text-red">Full name is required</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-mono text-cyan mb-1.5">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email & Email Verification */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface2/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-cyan">
                    Work Email Address *
                  </label>
                  {isEmailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-green/15 border border-green/40 text-green">
                      <CheckCircle size={12} />
                      Verified with Firebase
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-muted bg-surface border border-border">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-surface border text-sm text-text focus:border-amber transition-colors ${
                        touched.email && !emailValidation.isValid ? 'border-red/60' : 'border-border'
                      }`}
                    />
                  </div>

                  {!isEmailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailLink}
                      disabled={emailSending || !formData.email || !emailValidation.isValid || emailTimer > 0}
                      className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/40 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {emailSending ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>sending_link()...</span>
                        </>
                      ) : emailTimer > 0 ? (
                        <span>Resend in {emailTimer}s</span>
                      ) : (
                        <>
                          <Mail size={13} />
                          <span>Verify Email</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {touched.email && !emailValidation.isValid && (
                  <p className="text-[11px] font-mono text-red">{emailValidation.error}</p>
                )}

                {/* Email Verification State Notice */}
                {emailLinkSent && !isEmailVerified && (
                  <div className="p-3 rounded-lg bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan space-y-2">
                    <div className="flex items-start gap-2">
                      <Mail size={15} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Firebase Verification Link Sent!</p>
                        <p className="text-[11px] text-muted pt-0.5">
                          We sent a sign-in verification link to <span className="text-text font-bold">{formData.email}</span>. Click the link in your email to confirm verification.
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setShowManualEmailPaste(!showManualEmailPaste)}
                        className="text-amber hover:underline flex items-center gap-1"
                      >
                        <KeyRound size={12} />
                        <span>{showManualEmailPaste ? 'Hide link paste field' : 'Opened email in another browser or tab? Paste link here'}</span>
                      </button>
                    </div>

                    {showManualEmailPaste && (
                      <div className="pt-2 space-y-2 border-t border-cyan/20">
                        <input
                          type="text"
                          value={manualEmailLink}
                          onChange={(e) => setManualEmailLink(e.target.value)}
                          className="w-full px-3 py-2 rounded bg-surface border border-border text-xs text-text focus:border-amber"
                        />
                        <button
                          type="button"
                          onClick={handleManualEmailLinkVerify}
                          disabled={emailVerifying || !manualEmailLink.trim()}
                          className="px-3 py-1.5 rounded text-xs font-mono bg-amber text-ink font-semibold hover:bg-amber/90 disabled:opacity-50 transition-all"
                        >
                          {emailVerifying ? 'verifying_token()...' : 'Confirm Pasted Link'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {emailError && (
                  <p className="text-[11px] font-mono text-red flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Row 3: Indian Phone & Phone Verification */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface2/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-cyan">
                    Phone Number (Indian Mobile Only) *
                  </label>
                  {isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-green/15 border border-green/40 text-green">
                      <CheckCircle size={12} />
                      Verified with Firebase (+91)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-muted bg-surface border border-border">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex rounded-lg border border-border bg-surface focus-within:border-amber overflow-hidden">
                    <span className="px-3.5 py-2.5 bg-surface2 border-r border-border font-mono text-sm text-cyan flex items-center shrink-0">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      maxLength={15}
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm text-text focus:outline-none"
                    />
                  </div>

                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={phoneSendingOtp || !formData.phone || !phoneValidation.isValid || phoneTimer > 0}
                      className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/40 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {phoneSendingOtp ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>sending_otp()...</span>
                        </>
                      ) : phoneTimer > 0 ? (
                        <span>Resend in {phoneTimer}s</span>
                      ) : (
                        <>
                          <Phone size={13} />
                          <span>Verify Phone (OTP)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {touched.phone && formData.phone && !phoneValidation.isValid && (
                  <p className="text-[11px] font-mono text-red flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    <span>{phoneValidation.error}</span>
                  </p>
                )}

                {/* OTP Input Card when OTP is dispatched */}
                {phoneOtpSent && !isPhoneVerified && (
                  <div className="p-3.5 rounded-lg bg-surface border border-amber/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-amber font-semibold">
                        Enter 6-Digit OTP sent to {phoneValidation.display} *
                      </label>
                      {phoneTimer > 0 ? (
                        <span className="text-[11px] font-mono text-muted">
                          Resend in {phoneTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneSendingOtp}
                          className="text-[11px] font-mono text-cyan hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3.5 py-2 rounded bg-surface2 border border-border font-mono text-sm tracking-widest text-text focus:border-amber"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneVerifyingOtp || phoneOtp.length !== 6}
                        className="px-5 py-2 rounded text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {phoneVerifyingOtp ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>verifying()...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={13} />
                            <span>Confirm OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {phoneError && (
                  <p className="text-[11px] font-mono text-red flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Row 4: Project Type, Budget (INR) & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Project Type */}
                <div>
                  <label className="block text-xs font-mono text-cyan mb-1.5">
                    Project Type *
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors"
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type} className="bg-surface2 text-text">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range (INR) */}
                <div>
                  <label className="block text-xs font-mono text-cyan mb-1.5">
                    Estimated Budget (INR ₹) *
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors"
                  >
                    {budgetRanges.map((b) => (
                      <option key={b} value={b} className="bg-surface2 text-text">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Timeline */}
                <div>
                  <label className="block text-xs font-mono text-cyan mb-1.5">
                    Target Timeline *
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors"
                  >
                    {timelineRanges.map((t) => (
                      <option key={t} value={t} className="bg-surface2 text-text">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Referral / Promo Code & Discount */}
              <div className="p-4 rounded-xl border border-border/80 bg-surface2/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-cyan">
                    Promo / Referral Code (Optional)
                  </label>
                  {appliedDiscount ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-green/15 border border-green/40 text-green">
                      <CheckCircle size={12} />
                      {appliedDiscount.percent}% Discount Applied!
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-muted">
                      Have a studio code?
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex rounded-lg border border-border bg-surface focus-within:border-amber overflow-hidden">
                    <span className="px-3.5 py-2.5 bg-surface2 border-r border-border font-mono text-sm text-amber flex items-center shrink-0">
                      <Tag size={14} />
                    </span>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleCodeChange}
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm text-text font-mono focus:outline-none uppercase tracking-wider"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCode}
                    disabled={!formData.code.trim()}
                    className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Sparkles size={13} />
                    <span>Apply Code</span>
                  </button>
                </div>

                {codeFeedback && (
                  <p className={`text-[11px] font-mono flex items-center gap-1.5 ${
                    appliedDiscount ? 'text-green' : 'text-red'
                  }`}>
                    {appliedDiscount ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    <span>{codeFeedback}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-mono text-cyan mb-1.5">
                  Project Details / Problem Statement *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={() => handleBlur('message')}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-surface2 border text-sm text-text focus:border-amber transition-colors resize-none ${
                    touched.message && (!formData.message.trim() || formData.message.trim().length < 10)
                      ? 'border-red/60'
                      : 'border-border'
                  }`}
                ></textarea>
                {touched.message && (!formData.message.trim() || formData.message.trim().length < 10) && (
                  <p className="mt-1 text-[11px] font-mono text-red">
                    Please provide project details (minimum 10 characters)
                  </p>
                )}
              </div>

              {/* Verification Requirement Guard Status */}
              <div className={`p-4 rounded-xl border font-mono text-xs transition-colors ${
                hasAtLeastOneVerified
                  ? 'border-green/40 bg-green/5 text-green'
                  : 'border-amber/40 bg-amber/5 text-amber'
              }`}>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-text">
                      Submission Requirement: At least ONE contact method must be verified
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        {isEmailVerified ? (
                          <CheckCircle size={14} className="text-green" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-muted inline-block" />
                        )}
                        <span className={isEmailVerified ? 'text-green font-semibold' : 'text-muted'}>
                          Email Verification {isEmailVerified && '✓'}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        {isPhoneVerified ? (
                          <CheckCircle size={14} className="text-green" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-muted inline-block" />
                        )}
                        <span className={isPhoneVerified ? 'text-green font-semibold' : 'text-muted'}>
                          Indian Phone OTP Verification {isPhoneVerified && '✓'}
                        </span>
                      </span>
                    </div>

                    {!hasAtLeastOneVerified && (
                      <p className="text-[11px] text-amber/90 pt-1">
                        Please verify either your Work Email or your Indian Phone Number above before transmitting.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !hasAtLeastOneVerified}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                {submitting ? (
                  <span>transmitting_inquiry()...</span>
                ) : (
                  <>
                    <span>Send Project Inquiry</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Info: Direct Founder Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Commitments (Dynamic from settings.commitments) */}
          {settings?.commitments && settings.commitments.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-surface space-y-3 font-mono text-xs">
              <p className="text-amber font-semibold uppercase tracking-wider">
                {settings?.commitmentsBadge || "// Our Commitment"}
              </p>
              <div className="space-y-2 text-muted">
                {settings.commitments.map((c, i) => {
                  const icons = [Clock, ShieldCheck, CheckCircle];
                  const colors = ['text-cyan', 'text-green', 'text-amber'];
                  const Icon = icons[i % icons.length];
                  const col = colors[i % colors.length];
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon size={14} className={col} />
                      <span>{typeof c === 'string' ? c : c.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Founder Contact Cards from Firestore */}
          {team.map((founder, idx) => (
            <div key={founder.id || idx} className="p-6 rounded-xl border border-border bg-surface space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-text text-base">{founder.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  idx % 2 === 0
                    ? 'bg-cyan/10 border border-cyan/30 text-cyan'
                    : 'bg-amber/10 border border-amber/30 text-amber'
                }`}>
                  {founder.role?.replace('Co-Founder & ', '') || 'Founder'}
                </span>
              </div>
              <p className="text-xs text-muted">
                {founder.education?.degree ? `${founder.education.institution} (${founder.education.score || ''})` : founder.specialty} • {founder.contact?.location || 'India'}
              </p>
              <div className="space-y-1.5 font-mono text-xs pt-1">
                {founder.contact?.phone && (
                  <div className="flex items-center gap-2 text-muted">
                    <Phone size={13} className="text-amber" />
                    <a href={`tel:${founder.contact.phone.replace(/\s+/g, '')}`} className="hover:text-text">{founder.contact.phone}</a>
                  </div>
                )}
                {founder.contact?.email && (
                  <div className="flex items-center gap-2 text-muted">
                    <Mail size={13} className="text-amber" />
                    <a href={`mailto:${founder.contact.email}`} className="hover:text-text">{founder.contact.email}</a>
                  </div>
                )}
                {founder.contact?.github && (
                  <div className="flex items-center gap-2 text-muted">
                    <Github size={13} className="text-amber" />
                    <SafeExternalLink href={founder.contact.github} className="hover:text-text">
                      {founder.contact.github.replace('https://', '')}
                    </SafeExternalLink>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

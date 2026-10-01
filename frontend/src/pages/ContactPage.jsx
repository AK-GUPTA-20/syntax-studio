import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Tag,
  Sparkles,
  Lock,
  GitBranch,
  Zap,
  ChevronRight,
  ChevronLeft,
  User,
  Building2,
  MessageSquare,
  Layers,
  Wallet,
  Calendar,
  Globe,
  Code2,
  Cpu,
  Database,
  Smartphone,
  Award,
  CheckCheck
} from 'lucide-react';
import {
  submitContact,
  getTeam,
  getServices,
  getSettings,
  sendVerificationEmailApi,
  verifyEmailOtpApi
} from '../api/client';
import { sanitizeInput, sanitizePromoCode, SafeExternalLink } from '../utils/security';
import {
  auth,
  validateIndianPhone,
  validateEmail,
  initRecaptchaVerifier,
  resetRecaptchaVerifier,
  sendPhoneOtp,
  confirmPhoneOtp,
  getCurrentUserIdToken
} from '../firebase/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'About You',    icon: User },
  { id: 2, label: 'Project',      icon: Layers },
  { id: 3, label: 'Verify',       icon: ShieldCheck },
  { id: 4, label: 'Submit',       icon: Send },
];

// ─── Static data ─────────────────────────────────────────────────────────────
const TECH_STACK = [
  { name: 'React', icon: Code2, color: 'text-cyan' },
  { name: 'Next.js', icon: Globe, color: 'text-text' },
  { name: 'Node.js', icon: Cpu, color: 'text-green' },
  { name: 'Firebase', icon: Database, color: 'text-amber' },
  { name: 'React Native', icon: Smartphone, color: 'text-purple' },
  { name: 'PostgreSQL', icon: Database, color: 'text-cyan' },
];

const STATS = [
  { value: '50+', label: 'Projects Delivered', icon: Award },
  { value: '24h', label: 'Response SLA', icon: Clock },
  { value: '100%', label: 'IP Ownership', icon: GitBranch },
  { value: '30d', label: 'Launch Warranty', icon: ShieldCheck },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Brief & Discovery', desc: 'We analyze your requirements and ask targeted technical questions.' },
  { num: '02', title: 'Scope & Estimate', desc: 'You receive a detailed scope document with timeline and pricing.' },
  { num: '03', title: 'Build & Iterate', desc: 'Development with weekly milestones and live preview deployments.' },
  { num: '04', title: 'Launch & Handoff', desc: 'Production deployment, code repo transfer, and 30-day warranty.' },
];

const FIREBASE_TEST_NUMBERS = ['+919876543210', '+919027278481', '+919999999999'];

// ─── Helper: Step Indicator ───────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-8 select-none max-w-full overflow-hidden px-1">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isDone = currentStep > step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isDone
                  ? 'bg-green/20 border-green text-green'
                  : isActive
                  ? 'bg-amber/20 border-amber text-amber shadow-glow-amber'
                  : 'bg-surface2 border-border text-muted'
              }`}>
                {isDone ? <CheckCheck size={14} className="sm:w-4 sm:h-4" /> : <Icon size={13} className="sm:w-4 sm:h-4" />}
              </div>
              <span className={`text-[10px] font-mono hidden sm:block ${
                isActive ? 'text-amber font-semibold' : isDone ? 'text-green' : 'text-muted'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-5 xs:w-8 sm:w-16 h-[2px] mx-0.5 sm:mx-1 mb-1 sm:mb-6 rounded transition-all duration-500 shrink ${
                currentStep > step.id ? 'bg-green/60' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Helper: Field wrapper ────────────────────────────────────────────────────
function Field({ label, required, badge, children, error, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-cyan">
          {label}{required && <span className="text-red ml-0.5">*</span>}
        </label>
        {badge}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] font-mono text-red">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] font-mono text-muted">{hint}</p>
      )}
    </div>
  );
}

// ─── Helper: Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ verified, label }) {
  return verified ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-green/15 border border-green/40 text-green">
      <CheckCircle size={11} /> {label || 'Verified'}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-muted bg-surface2 border border-border">
      Unverified
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const preselectedService  = searchParams.get('service')  || '';
  const preselectedFounder  = searchParams.get('founder')  || '';
  const preselectedProject  = searchParams.get('project')  || searchParams.get('projectRef') || '';
  const preselectedBudget   = searchParams.get('budget')   || '';
  const preselectedTimeline = searchParams.get('timeline') || '';
  const preselectedCode     = searchParams.get('code')     || '';

  // ── Data ──────────────────────────────────────────────────────────────────
  const [team, setTeam]         = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState(null); // { message, type: 'error'|'info' }
  const toastTimerRef = useRef(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const initialMessage = preselectedProject
    ? `Hi Syntax Studio team, I am interested in building a solution similar to ${preselectedProject}. Here are some specifics about our requirements:`
    : preselectedFounder
    ? `Hi ${preselectedFounder}, I would like to discuss a project with you.`
    : '';

  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '',
    projectType: preselectedService || '',
    budget: preselectedBudget || '',
    timeline: preselectedTimeline || '',
    code: preselectedCode || '',
    message: initialMessage,
  });

  // ── Promo ─────────────────────────────────────────────────────────────────
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [codeFeedback, setCodeFeedback]       = useState(null);
  const [termsAccepted, setTermsAccepted]     = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, message: false });
  const phoneValidation = validateIndianPhone(formData.phone);
  const emailValidation = validateEmail(formData.email);

  // ── Phone OTP ─────────────────────────────────────────────────────────────
  const [isPhoneVerified, setIsPhoneVerified]               = useState(false);
  const [verifiedPhone, setVerifiedPhone]                   = useState('');
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);
  const [phoneOtp, setPhoneOtp]                             = useState('');
  const [phoneOtpSent, setPhoneOtpSent]                     = useState(false);
  const [phoneSendingOtp, setPhoneSendingOtp]               = useState(false);
  const [phoneVerifyingOtp, setPhoneVerifyingOtp]           = useState(false);
  const [phoneError, setPhoneError]                         = useState(null);
  const [phoneTimer, setPhoneTimer]                         = useState(0);
  const [recaptchaSolved, setRecaptchaSolved]               = useState(false);
  const isFirebaseTestNumber = phoneValidation.isValid && FIREBASE_TEST_NUMBERS.includes(phoneValidation.e164);

  // ── Email OTP ─────────────────────────────────────────────────────────────
  const [isEmailVerified, setIsEmailVerified]         = useState(false);
  const [verifiedEmail, setVerifiedEmail]             = useState('');
  const [emailOtp, setEmailOtp]                       = useState('');
  const [emailOtpSent, setEmailOtpSent]               = useState(false);
  const [emailSendingOtp, setEmailSendingOtp]         = useState(false);
  const [emailVerifyingOtp, setEmailVerifyingOtp]     = useState(false);
  const [emailError, setEmailError]                   = useState(null);
  const [emailSuccess, setEmailSuccess]               = useState(null);
  const [emailTimer, setEmailTimer]                   = useState(0);
  const [emailVerificationProof, setEmailVerificationProof] = useState('');

  // ── Auth token ────────────────────────────────────────────────────────────
  const [firebaseToken, setFirebaseToken] = useState('');

  // ── Submission ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting]       = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage]   = useState(null);

  const hasAtLeastOneVerified = isEmailVerified || isPhoneVerified;

  // ─── Timers ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let t = null;
    if (phoneTimer > 0) t = setInterval(() => setPhoneTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [phoneTimer]);

  useEffect(() => {
    let t = null;
    if (emailTimer > 0) t = setInterval(() => setEmailTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [emailTimer]);

  // ─── Data loading ─────────────────────────────────────────────────────────
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
      } catch {
        // Fallback to static defaults
      }
    }
    loadData();
    return () => { resetRecaptchaVerifier('recaptcha-container'); };
  }, []);

  // ─── Email link redirect ──────────────────────────────────────────────────
  useEffect(() => {
    const verifiedParam = searchParams.get('emailVerified');
    const emailParam    = searchParams.get('email');
    const proofParam    = searchParams.get('proof');
    const errorParam    = searchParams.get('emailError');

    if (verifiedParam === 'true' && emailParam) {
      const decoded = decodeURIComponent(emailParam).trim().toLowerCase();
      setIsEmailVerified(true);
      setVerifiedEmail(decoded);
      if (proofParam) setEmailVerificationProof(decodeURIComponent(proofParam));
      setFormData(p => ({ ...p, email: decoded }));
      setEmailSuccess('Email verified successfully! You can now submit your inquiry.');
      setEmailError(null);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      setEmailError(decodeURIComponent(errorParam));
      if (emailParam) setFormData(p => ({ ...p, email: decodeURIComponent(emailParam) }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // ─── Firebase auth state ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setFirebaseToken(token);
          if (user.phoneNumber) {
            const check = validateIndianPhone(formData.phone);
            if (check.isValid && (user.phoneNumber === check.e164 || user.phoneNumber.endsWith(check.normalized))) {
              setIsPhoneVerified(true);
              setVerifiedPhone(user.phoneNumber);
            }
          }
        } catch { /* token unavailable */ }
      }
    });
    return () => unsub();
  }, [formData.phone]);

  // ─── Dynamic options ──────────────────────────────────────────────────────
  const projectTypes = (settings?.projectTypes?.length > 0) ? settings.projectTypes
    : (services?.length > 0 ? services.map(s => s.title) : []);
  const budgetRanges   = settings?.budgetRanges?.length   > 0 ? settings.budgetRanges   : [];
  const timelineRanges = settings?.timelineRanges?.length > 0 ? settings.timelineRanges : [];

  const projectTypeOptions = services.map(s => ({
    label: s.price ? `${s.title} — ₹${Number(s.price).toLocaleString('en-IN')}` : s.title,
    value: s.title
  })).filter(s => s.enabled !== false);

  useEffect(() => {
    setFormData(prev => {
      const u = { ...prev };
      if (!u.projectType) {
        if (preselectedService) {
          const m = projectTypes.find(p => p.toLowerCase() === preselectedService.toLowerCase() || preselectedService.toLowerCase().includes(p.toLowerCase()));
          u.projectType = m || preselectedService;
        } else if (projectTypes.length > 0) {
          u.projectType = projectTypes[0];
        }
      }
      if (!u.budget) {
        if (preselectedBudget) {
          const m = budgetRanges.find(b => b.toLowerCase().includes(preselectedBudget.toLowerCase()) || preselectedBudget.toLowerCase().includes(b.toLowerCase()));
          u.budget = m || preselectedBudget;
        } else if (budgetRanges.length > 0) u.budget = budgetRanges[0];
      }
      if (!u.timeline) {
        if (preselectedTimeline) {
          const m = timelineRanges.find(t => t.toLowerCase().includes(preselectedTimeline.toLowerCase()) || preselectedTimeline.toLowerCase().includes(t.toLowerCase()));
          u.timeline = m || preselectedTimeline;
        } else if (timelineRanges.length > 0) u.timeline = timelineRanges[0];
      }
      return u;
    });
  }, [preselectedService, preselectedBudget, preselectedTimeline, settings, services]);

  useEffect(() => {
    if (preselectedCode && settings) {
      const activeCode = (settings?.promoCode || import.meta.env.VITE_DEFAULT_PROMO_CODE || 'syntaxStudio').trim();
      const discountPercent = settings?.discountPercentage ?? (parseInt(import.meta.env.VITE_DEFAULT_DISCOUNT_PERCENT, 10) || 10);
      const isPromoActive = settings?.promoActive !== false;
      if (isPromoActive && preselectedCode.toLowerCase() === activeCode.toLowerCase()) {
        setAppliedDiscount({ code: activeCode, percent: discountPercent, label: settings?.discountLabel || `${discountPercent}% Special Studio Discount` });
        setCodeFeedback(`✓ Promo code "${activeCode}" automatically applied! ${discountPercent}% discount activated.`);
      }
    }
  }, [preselectedCode, settings]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === 'phone') {
      if (isPhoneVerified) {
        const check = validateIndianPhone(value);
        if (!check.isValid || check.e164 !== verifiedPhone) setIsPhoneVerified(false);
      }
      if (phoneOtpSent) { setPhoneOtpSent(false); setPhoneConfirmationResult(null); setPhoneOtp(''); }
      setRecaptchaSolved(false); setPhoneError(null);
    }
    if (name === 'email') {
      if (isEmailVerified && value.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
        setIsEmailVerified(false); setVerifiedEmail(''); setEmailVerificationProof(''); setEmailSuccess(null);
      }
      if (emailOtpSent) { setEmailOtpSent(false); setEmailOtp(''); }
      setEmailError(null);
    }
  };
  const handleBlur = (field) => setTouched(p => ({ ...p, [field]: true }));

  const handleApplyCode = () => {
    const input = (formData.code || '').trim();
    if (!input) { setCodeFeedback('Please enter a promo code first.'); setAppliedDiscount(null); return; }
    const activeCode = (settings?.promoCode || import.meta.env.VITE_DEFAULT_PROMO_CODE || 'syntaxStudio').trim();
    const discountPercent = settings?.discountPercentage ?? (parseInt(import.meta.env.VITE_DEFAULT_DISCOUNT_PERCENT, 10) || 10);
    const isPromoActive = settings?.promoActive !== false;
    if (!isPromoActive) { setCodeFeedback('This promo code is currently inactive.'); setAppliedDiscount(null); return; }
    if (input.toLowerCase() === activeCode.toLowerCase()) {
      setAppliedDiscount({ code: activeCode, percent: discountPercent, label: settings?.discountLabel || `${discountPercent}% Special Studio Discount` });
      setCodeFeedback(`✓ Promo code "${activeCode}" applied! ${discountPercent}% discount activated.`);
    } else {
      setAppliedDiscount(null); setCodeFeedback('Invalid promo code. Please check the spelling and try again.');
    }
  };

  const handleCodeChange = (e) => {
    setFormData(p => ({ ...p, code: e.target.value }));
    if (appliedDiscount || codeFeedback) { setAppliedDiscount(null); setCodeFeedback(null); }
  };

  // ─── reCAPTCHA ────────────────────────────────────────────────────────────
  const setupRecaptcha = useCallback(() => {
    try {
      const verifier = initRecaptchaVerifier('recaptcha-container', {
        size: 'normal', theme: 'dark',
        onSuccess: () => { setRecaptchaSolved(true); setPhoneError(null); },
        onExpired: () => setRecaptchaSolved(false),
        onError: () => setRecaptchaSolved(false)
      });
      if (verifier?.render) verifier.render().catch(() => {});
      return verifier;
    } catch { return null; }
  }, []);

  const handleResetRecaptcha = () => {
    resetRecaptchaVerifier('recaptcha-container');
    setRecaptchaSolved(false); setPhoneError(null);
    setTimeout(() => setupRecaptcha(), 100);
  };

  useEffect(() => {
    if (phoneValidation.isValid && !isPhoneVerified && !phoneOtpSent) {
      const t = setTimeout(() => setupRecaptcha(), 150);
      return () => clearTimeout(t);
    }
  }, [phoneValidation.isValid, isPhoneVerified, phoneOtpSent, setupRecaptcha]);

  // ─── Phone OTP handlers ───────────────────────────────────────────────────
  const handleSendPhoneOtp = async () => {
    setTouched(p => ({ ...p, phone: true }));
    if (!phoneValidation.isValid) { setPhoneError(phoneValidation.error); return; }
    let verifier = window.recaptchaVerifier;
    const container = document.getElementById('recaptcha-container');
    if (!verifier || !container?.hasChildNodes()) verifier = setupRecaptcha();
    if (!recaptchaSolved) { setPhoneError("Please check the 'I'm not a robot' security box first."); return; }
    setPhoneSendingOtp(true); setPhoneError(null);
    try {
      const result = await sendPhoneOtp(phoneValidation.e164, verifier);
      setPhoneConfirmationResult(result); setPhoneOtpSent(true); setPhoneTimer(60); setPhoneError(null);
    } catch (err) {
      resetRecaptchaVerifier('recaptcha-container'); setRecaptchaSolved(false);
      const isBilling = err.code === 'auth/billing-not-enabled' || (err.message?.toLowerCase().includes('billing-not-enabled'));
      if (isBilling) setPhoneError('SMS verification is currently unavailable. Please verify via Work Email above.');
      else if (err.code === 'auth/unauthorized-domain') setPhoneError('Domain not authorized in Firebase. Please use Work Email verification instead.');
      else if (err.code === 'auth/operation-not-allowed') setPhoneError('Phone sign-in is disabled in Firebase Console. Please use Work Email verification.');
      else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/app-not-authorized') setPhoneError('Security verification failed. Please check the box again or use Work Email.');
      else if (err.code === 'auth/too-many-requests') setPhoneError('Too many attempts. Please wait a few minutes or verify via Work Email.');
      else if (err.code === 'auth/invalid-phone-number') setPhoneError('Invalid phone number. Please enter a 10-digit Indian mobile number.');
      else if (err.code === 'auth/quota-exceeded') setPhoneError('SMS daily quota reached. Please verify via Work Email instead.');
      else setPhoneError(err.message || 'Failed to send OTP. Please try again or use Work Email verification.');
    } finally { setPhoneSendingOtp(false); }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneConfirmationResult) { setPhoneError('Please request an OTP first.'); return; }
    if (!phoneOtp || phoneOtp.trim().length !== 6) { setPhoneError('Please enter a valid 6-digit code.'); return; }
    setPhoneVerifyingOtp(true); setPhoneError(null);
    try {
      const { user, token } = await confirmPhoneOtp(phoneConfirmationResult, phoneOtp.trim());
      setIsPhoneVerified(true); setVerifiedPhone(phoneValidation.e164); setFirebaseToken(token);
      setPhoneOtpSent(false); setPhoneOtp(''); setPhoneError(null);
    } catch (err) {
      let msg = 'Invalid verification code. Please check and try again.';
      if (err.code === 'auth/code-expired') msg = 'Verification code has expired. Please request a new OTP.';
      else if (err.code === 'auth/invalid-verification-code') msg = 'Incorrect OTP. Please check and try again.';
      else if (err.message) msg = err.message;
      setPhoneError(msg);
    } finally { setPhoneVerifyingOtp(false); }
  };

  // ─── Email OTP handlers ───────────────────────────────────────────────────
  const handleSendEmailVerification = async () => {
    setTouched(p => ({ ...p, email: true }));
    if (!emailValidation.isValid) { setEmailError(emailValidation.error); return; }
    setEmailSendingOtp(true); setEmailError(null); setEmailSuccess(null);
    try {
      const res = await sendVerificationEmailApi(formData.email.trim());
      setEmailOtpSent(true);
      setEmailTimer(res.data?.cooldownSeconds || 60);
      if (res.data?.devFallback && res.data?.devOtp) {
        setEmailSuccess(`Dev Mode: Your OTP is [ ${res.data.devOtp} ] (Resend key suspended — update RESEND_API_KEY)`);
      } else {
        setEmailSuccess(res.data?.devNotice
          ? 'Code generated! Check backend terminal for OTP (dev mode).'
          : `Verification email sent to ${formData.email.trim()}. Enter the 6-digit code below.`
        );
        // Spam folder reminder toast — fires after short delay so success msg appears first
        setTimeout(() => {
          showToast("📬 Email sent! Can't find it? Check your spam or promotions folder.", 'info');
        }, 1800);
      }
    } catch (err) {
      setEmailError(err.message || 'Failed to send verification email. Please try again.');
    } finally { setEmailSendingOtp(false); }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.trim().length !== 6) { setEmailError('Please enter a valid 6-digit code.'); return; }
    setEmailVerifyingOtp(true); setEmailError(null);
    try {
      const res = await verifyEmailOtpApi(formData.email.trim(), emailOtp.trim());
      setIsEmailVerified(true); setVerifiedEmail(formData.email.trim());
      setEmailVerificationProof(res.data?.verificationProof || '');
      setEmailOtpSent(false); setEmailOtp('');
      setEmailSuccess('Email verified successfully! You can now proceed.');
    } catch (err) {
      let msg = err.message || 'Invalid verification code. Please check and try again.';
      if (err.data?.remainingAttempts !== undefined) msg = `Incorrect code. ${err.data.remainingAttempts} attempt(s) remaining.`;
      setEmailError(msg);
    } finally { setEmailVerifyingOtp(false); }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    setSuccessMessage(null); setErrorMessage(null);

    if (!termsAccepted) { setErrorMessage('Please accept the Terms & Conditions before submitting.'); return; }
    if (!formData.name.trim()) { setErrorMessage('Please enter your full name.'); return; }
    if (!emailValidation.isValid) { setErrorMessage(emailValidation.error); return; }
    if (formData.phone.trim() && !phoneValidation.isValid) { setErrorMessage(phoneValidation.error); return; }
    if (!formData.message.trim() || formData.message.trim().length < 10) { setErrorMessage('Please provide project details (at least 10 characters).'); return; }
    if (!isEmailVerified && !isPhoneVerified) { setErrorMessage('Verification required: Please verify your Work Email or Indian Mobile Number before submitting.'); return; }

    setSubmitting(true);
    try {
      let tokenToUse = null;
      if (isPhoneVerified) tokenToUse = (await getCurrentUserIdToken()) || firebaseToken;

      let verificationMethod = 'email';
      if (isEmailVerified && isPhoneVerified) verificationMethod = 'both';
      else if (isPhoneVerified) verificationMethod = 'phone';

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
        firebaseToken: tokenToUse || '',
        emailVerificationProof: emailVerificationProof || '',
        verificationMethod,
        termsAccepted: true
      };

      const res = await submitContact(payload);
      setSuccessMessage(res.message || 'Your verified inquiry has been received! Our founders will review it and respond within 24 hours.');

      // Reset
      setFormData({ name: '', email: '', company: '', phone: '', projectType: projectTypes[0] || '', budget: budgetRanges[0] || '', timeline: timelineRanges[0] || '', code: '', message: '' });
      setAppliedDiscount(null); setCodeFeedback(null); setTermsAccepted(false);
      setTouched({ name: false, email: false, phone: false, message: false });
      setIsEmailVerified(false); setIsPhoneVerified(false); setVerifiedEmail(''); setVerifiedPhone('');
      setEmailVerificationProof(''); setFirebaseToken(''); setEmailOtp(''); setEmailOtpSent(false); setEmailSuccess(null);
      setStep(1);
      localStorage.removeItem('syntax_contact_draft');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ─── Step validation helpers ──────────────────────────────────────────────
  const canProceedStep1 = formData.name.trim() && emailValidation.isValid;
  const canProceedStep2 = formData.message.trim().length >= 10;
  const canProceedStep3 = hasAtLeastOneVerified;

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen pt-28 pb-24 overflow-x-clip">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md text-sm font-mono font-semibold transition-all animate-fade-in max-w-[420px] w-[92vw] ${
            toast.type === 'error'
              ? 'bg-red/10 border-red/40 text-red'
              : toast.type === 'info'
              ? 'bg-cyan/10 border-cyan/30 text-cyan'
              : 'bg-amber/10 border-amber/40 text-amber'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={17} className="shrink-0" />
          ) : (
            <Mail size={17} className="shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-96 right-10 w-[400px] h-[400px] bg-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/5 text-[11px] font-mono mb-5 text-cyan backdrop-blur-sm">
            <Sparkles size={12} className="text-cyan animate-pulse" />
            <span>{settings?.contactBadge || '// Start a Conversation'}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-text mb-5 tracking-tight leading-[1.1]">
            {settings?.contactTitle || "Let's Build Something"}{' '}
            <span className="text-amber">{settings?.contactTitleHighlight || 'Exceptional'}</span>
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            {settings?.contactSubtitle || 'Tell us about your project. We review inquiries directly and respond with technical insights and an estimated scope within 24 hours.'}
          </p>
        </div>

        {/* ── Stats Strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 max-w-3xl mx-auto">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="p-4 rounded-2xl border border-border bg-surface/60 backdrop-blur-sm flex flex-col items-center text-center gap-1">
              <Icon size={18} className="text-amber mb-1" />
              <span className="font-display text-2xl font-bold text-text">{value}</span>
              <span className="text-[10px] font-mono text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Form + Sidebar ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Wizard Form Panel ────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-surface/95 backdrop-blur-md shadow-2xl overflow-hidden">

              {/* Form Header */}
              <div className="px-4 sm:px-8 pt-6 sm:pt-7 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text">
                    {STEPS[step - 1].label}
                  </h2>
                  <span className="text-[10px] font-mono text-muted bg-surface2 border border-border px-2.5 py-1 rounded-full self-start sm:self-auto">
                    Step {step} / {STEPS.length}
                  </span>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="px-3 sm:px-8 pt-4 sm:pt-5">
                <StepIndicator currentStep={step} />
              </div>

              {/* Promo Banner */}
              {appliedDiscount && (
                <div className="mx-4 sm:mx-8 mb-4 p-3 rounded-xl border border-green/40 bg-green/10 text-green flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 font-semibold">
                    <Sparkles size={13} />
                    {appliedDiscount.percent}% discount active on your quotation!
                  </span>
                  <span className="px-2 py-0.5 rounded bg-green/20 text-[10px] uppercase font-bold">{appliedDiscount.code}</span>
                </div>
              )}

              {/* Global alerts */}
              {successMessage && (
                <div className="mx-4 sm:mx-8 mb-4 p-4 rounded-xl border border-green/30 bg-green/10 text-green flex items-start gap-3 text-xs font-mono">
                  <CheckCircle size={17} className="shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="mx-4 sm:mx-8 mb-4 p-4 rounded-xl border border-red/30 bg-red/10 text-red flex items-start gap-3 text-xs font-mono">
                  <AlertCircle size={17} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ── Step Content ─────────────────────────────────────────── */}
              <form onSubmit={handleSubmit}>
                <div className="px-4 sm:px-8 pb-8 space-y-5 max-w-full overflow-hidden">

                  {/* ── STEP 1: About You ─────────────────────────────── */}
                  {step === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Name + Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Full Name" required
                          error={touched.name && !formData.name.trim() ? 'Full name is required' : null}
                        >
                          <div className="relative">
                            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <input
                              type="text" name="name" required
                              value={formData.name} onChange={handleChange} onBlur={() => handleBlur('name')}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface2 border text-sm text-text focus:border-amber transition-colors outline-none ${
                                touched.name && !formData.name.trim() ? 'border-red/60' : 'border-border'
                              }`}
                            />
                          </div>
                        </Field>

                        <Field label="Company / Organization">
                          <div className="relative">
                            <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <input
                              type="text" name="company"
                              value={formData.company} onChange={handleChange}
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors outline-none"
                            />
                          </div>
                        </Field>
                      </div>

                      {/* Email */}
                      <Field
                        label="Work Email Address" required
                        badge={<StatusBadge verified={isEmailVerified} label="Verified ✓" />}
                        error={touched.email && !emailValidation.isValid ? emailValidation.error : null}
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <input
                              type="email" name="email" required
                              value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface2 border text-sm text-text focus:border-amber transition-colors outline-none ${
                                touched.email && !emailValidation.isValid ? 'border-red/60' : 'border-border'
                              }`}
                            />
                          </div>
                          {!isEmailVerified && (
                            <button type="button" onClick={handleSendEmailVerification}
                              disabled={emailSendingOtp || !formData.email || !emailValidation.isValid || emailTimer > 0}
                              className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-cyan/15 text-cyan hover:bg-cyan/25 border border-cyan/40 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                            >
                              {emailSendingOtp ? <><RefreshCw size={12} className="animate-spin" /><span>Sending...</span></>
                                : emailTimer > 0 ? <span>Resend in {emailTimer}s</span>
                                : <><Mail size={12} /><span>Verify Email</span></>}
                            </button>
                          )}
                        </div>

                        {/* OTP Card */}
                        {emailOtpSent && !isEmailVerified && (
                          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-surface border border-cyan/30 space-y-3 max-w-full overflow-hidden box-border">
                            {/* Header row */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-mono text-cyan font-semibold flex items-center gap-1.5 shrink-0">
                                <KeyRound size={13} /> Enter 6-digit OTP
                              </span>
                              {emailTimer > 0 ? (
                                <span className="text-[11px] font-mono text-muted flex items-center gap-1 shrink-0">
                                  <Clock size={11} /> {emailTimer}s
                                </span>
                              ) : (
                                <button type="button" onClick={handleSendEmailVerification} disabled={emailSendingOtp}
                                  className="text-[11px] font-mono text-amber hover:text-amber/80 underline shrink-0">
                                  Resend Code
                                </button>
                              )}
                            </div>

                            {/* OTP digit display — always full-width with responsive letter spacing */}
                            <div className="w-full max-w-full overflow-hidden box-border">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="······"
                                className="w-full max-w-full block px-2 py-3 rounded-xl bg-surface2 border border-border font-mono text-xl sm:text-2xl font-bold text-text focus:border-amber outline-none text-center placeholder:text-muted/30 box-border"
                                style={{ letterSpacing: 'clamp(0.12em, 2vw, 0.28em)' }}
                              />
                            </div>

                            {/* Confirm button — full width */}
                            <button
                              type="button"
                              onClick={handleVerifyEmailOtp}
                              disabled={emailVerifyingOtp || emailOtp.length !== 6}
                              className="w-full py-3 rounded-xl text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                              {emailVerifyingOtp
                                ? <><RefreshCw size={14} className="animate-spin" /><span>Verifying...</span></>
                                : <><CheckCircle size={14} /><span>Confirm OTP</span></>}
                            </button>

                            <p className="text-[11px] font-mono text-muted flex items-start gap-1.5 leading-relaxed">
                              <Mail size={11} className="text-cyan shrink-0 mt-0.5" />
                              <span>Prefer a link? Click <strong>Verify Email</strong> in the email sent to your inbox.</span>
                            </p>
                          </div>
                        )}

                        {emailSuccess && (
                          <div className="mt-2 flex items-start gap-1.5 text-[11px] font-mono text-green max-w-full overflow-hidden">
                            <CheckCircle size={12} className="mt-0.5 shrink-0" />
                            <span className="break-words overflow-wrap-anywhere">{emailSuccess}</span>
                          </div>
                        )}
                        {emailError && (
                          <div className="mt-2 flex items-start gap-1.5 text-[11px] font-mono text-red max-w-full overflow-hidden">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            <span className="break-words overflow-wrap-anywhere">{emailError}</span>
                          </div>
                        )}
                      </Field>

                      {/* Phone */}
                      <Field
                        label="Indian Mobile Number"
                        badge={<StatusBadge verified={isPhoneVerified} label="Verified (+91)" />}
                        error={touched.phone && formData.phone && !phoneValidation.isValid ? phoneValidation.error : null}
                        hint={!isPhoneVerified && !formData.phone ? 'Optional but recommended. Supports +91 Indian numbers only.' : undefined}
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex flex-1 rounded-xl border border-border bg-surface2 focus-within:border-amber overflow-hidden transition-colors">
                            <span className="px-3.5 py-2.5 bg-surface3 border-r border-border font-mono text-sm text-cyan flex items-center shrink-0 gap-1.5">
                              🇮🇳 <span>+91</span>
                            </span>
                            <input
                              type="tel" name="phone"
                              value={formData.phone} onChange={handleChange} onBlur={() => handleBlur('phone')}
                              maxLength={15}
                              className="w-full px-3.5 py-2.5 bg-transparent text-sm text-text focus:outline-none"
                            />
                          </div>
                          {!isPhoneVerified && (
                            <button type="button" onClick={handleSendPhoneOtp}
                              disabled={phoneSendingOtp || !formData.phone || !phoneValidation.isValid || phoneTimer > 0}
                              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
                                recaptchaSolved
                                  ? 'bg-amber text-ink border-amber hover:bg-amber/90 shadow-glow-amber'
                                  : 'bg-surface2 text-muted border-border disabled:opacity-40 hover:border-amber/40'
                              }`}
                            >
                              {phoneSendingOtp ? <><RefreshCw size={12} className="animate-spin" /><span>Sending...</span></>
                                : phoneTimer > 0 ? <span>Resend in {phoneTimer}s</span>
                                : recaptchaSolved ? <><Send size={12} /><span>Send OTP</span></>
                                : <><Phone size={12} /><span>Verify Phone</span></>}
                            </button>
                          )}
                        </div>

                        {/* reCAPTCHA */}
                        {!isPhoneVerified && !phoneOtpSent && phoneValidation.isValid && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-muted flex items-center gap-1.5">
                                <ShieldCheck size={12} className={recaptchaSolved ? 'text-green' : 'text-amber'} />
                                {recaptchaSolved ? "Security passed — click 'Send OTP'" : 'Security check required:'}
                              </span>
                              {!recaptchaSolved && (
                                <button type="button" onClick={handleResetRecaptcha} className="text-cyan hover:underline text-[10px]">
                                  Reload
                                </button>
                              )}
                            </div>
                            {isFirebaseTestNumber && (
                              <div className="p-2 rounded-lg bg-amber/10 border border-amber/30 text-amber text-[11px] font-mono flex items-center gap-2">
                                <Sparkles size={12} className="shrink-0" />
                                Test number detected — use OTP <strong>123456</strong>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: !isPhoneVerified && !phoneOtpSent && phoneValidation.isValid ? 'block' : 'none' }}
                          className="overflow-x-auto py-1 max-w-full">
                          <div id="recaptcha-container" className="origin-left scale-[0.8] xs:scale-[0.88] sm:scale-100 min-h-[78px] max-w-full" />
                        </div>

                        {/* Phone OTP card */}
                        {phoneOtpSent && !isPhoneVerified && (
                          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-surface border border-amber/30 space-y-3 max-w-full overflow-hidden box-border">
                            {/* Header row */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-mono text-amber font-semibold flex items-center gap-1.5 min-w-0">
                                <KeyRound size={13} className="shrink-0" />
                                <span className="truncate">OTP &rarr; {phoneValidation.display}</span>
                              </span>
                              {phoneTimer > 0 ? (
                                <span className="text-[11px] font-mono text-muted shrink-0 flex items-center gap-1">
                                  <Clock size={11} />{phoneTimer}s
                                </span>
                              ) : (
                                <button type="button" onClick={handleSendPhoneOtp} disabled={phoneSendingOtp}
                                  className="text-[11px] font-mono text-cyan hover:underline shrink-0">Resend OTP</button>
                              )}
                            </div>

                            {isFirebaseTestNumber && (
                              <p className="text-[11px] font-mono text-amber flex items-center gap-1">
                                <Sparkles size={11} /> Test mode — use code <strong>123456</strong>
                              </p>
                            )}

                            {/* OTP input — always full width with responsive letter spacing */}
                            <div className="w-full max-w-full overflow-hidden box-border">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={phoneOtp}
                                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="······"
                                className="w-full max-w-full block px-2 py-3 rounded-xl bg-surface2 border border-border font-mono text-xl sm:text-2xl font-bold text-text focus:border-amber outline-none text-center placeholder:text-muted/30 box-border"
                                style={{ letterSpacing: 'clamp(0.12em, 2vw, 0.28em)' }}
                              />
                            </div>

                            {/* Confirm button — always full width */}
                            <button
                              type="button"
                              onClick={handleVerifyPhoneOtp}
                              disabled={phoneVerifyingOtp || phoneOtp.length !== 6}
                              className="w-full py-3 rounded-xl text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                              {phoneVerifyingOtp
                                ? <><RefreshCw size={14} className="animate-spin" /><span>Verifying...</span></>
                                : <><CheckCircle size={14} /><span>Confirm OTP</span></>}
                            </button>
                          </div>
                        )}

                        {phoneError && (
                          <div className="mt-2 space-y-0.5 max-w-full overflow-hidden">
                            <p className="flex items-start gap-1.5 text-[11px] font-mono text-red break-words">
                              <AlertCircle size={12} className="mt-0.5 shrink-0" />
                              <span className="break-words">{phoneError}</span>
                            </p>
                            <p className="text-[10px] font-mono text-muted pl-4">Tip: You can also verify instantly via Work Email above.</p>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}

                  {/* ── STEP 2: Project Details ───────────────────────── */}
                  {step === 2 && (
                    <div className="space-y-5 animate-fade-in">

                      {/* Project Type, Budget, Timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Project Type" required>
                          <div className="relative">
                            <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10" />
                            <select name="projectType" value={formData.projectType} onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors outline-none appearance-none">
                              {projectTypeOptions.length > 0
                                ? projectTypeOptions.map(o => <option key={o.value} value={o.value} className="bg-surface2">{o.label}</option>)
                                : projectTypes.map(t => <option key={t} value={t} className="bg-surface2">{t}</option>)}
                            </select>
                          </div>
                        </Field>

                        <Field label="Budget (INR ₹)" required>
                          <div className="relative">
                            <Wallet size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <select name="budget" value={formData.budget} onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors outline-none appearance-none">
                              {budgetRanges.map(b => <option key={b} value={b} className="bg-surface2">{b}</option>)}
                            </select>
                          </div>
                        </Field>

                        <Field label="Timeline" required>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                            <select name="timeline" value={formData.timeline} onChange={handleChange}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors outline-none appearance-none">
                              {timelineRanges.map(t => <option key={t} value={t} className="bg-surface2">{t}</option>)}
                            </select>
                          </div>
                        </Field>
                      </div>

                      {/* Promo Code */}
                      <Field
                        label="Promo / Referral Code"
                        badge={
                          appliedDiscount ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-green/15 border border-green/40 text-green">
                              <CheckCircle size={10} /> {appliedDiscount.percent}% Off
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-muted">Optional</span>
                          )
                        }
                      >
                        <div className="flex gap-2">
                          <div className="flex flex-1 rounded-xl border border-border bg-surface2 focus-within:border-amber overflow-hidden transition-colors">
                            <span className="px-3.5 py-2.5 bg-surface3 border-r border-border font-mono text-sm text-amber flex items-center shrink-0">
                              <Tag size={13} />
                            </span>
                            <input type="text" name="code" value={formData.code} onChange={handleCodeChange}
                              className="w-full px-3.5 py-2.5 bg-transparent text-sm text-text font-mono focus:outline-none uppercase tracking-widest" />
                          </div>
                          <button type="button" onClick={handleApplyCode} disabled={!formData.code.trim()}
                            className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0">
                            <Sparkles size={12} /><span>Apply</span>
                          </button>
                        </div>
                        {codeFeedback && (
                          <p className={`flex items-center gap-1.5 text-[11px] font-mono mt-1 ${appliedDiscount ? 'text-green' : 'text-red'}`}>
                            {appliedDiscount ? <CheckCircle size={12} /> : <AlertCircle size={12} />}{codeFeedback}
                          </p>
                        )}
                      </Field>

                      {/* Message */}
                      <Field
                        label="Project Details / Problem Statement" required
                        error={touched.message && (!formData.message.trim() || formData.message.trim().length < 10)
                          ? 'Please provide project details (minimum 10 characters)' : null}
                      >
                        <div className="relative">
                          <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-muted pointer-events-none" />
                          <textarea
                            name="message" required rows={5}
                            value={formData.message} onChange={handleChange} onBlur={() => handleBlur('message')}
                            className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface2 border text-sm text-text focus:border-amber transition-colors resize-none outline-none ${
                              touched.message && (!formData.message.trim() || formData.message.trim().length < 10) ? 'border-red/60' : 'border-border'
                            }`}
                          />
                        </div>
                        <p className="flex items-center justify-end text-[10px] font-mono text-muted">
                          {formData.message.trim().length} / 3000 chars
                        </p>
                      </Field>
                    </div>
                  )}

                  {/* ── STEP 3: Verify ───────────────────────────────── */}
                  {step === 3 && (
                    <div className="space-y-5 animate-fade-in">
                      <p className="text-sm text-muted font-mono">
                        To prevent spam, at least <strong className="text-text">one contact method</strong> must be verified before submission.
                      </p>

                      {/* Verification status cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email status */}
                        <div className={`p-5 rounded-2xl border ${isEmailVerified ? 'border-green/40 bg-green/5' : 'border-border bg-surface2'}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEmailVerified ? 'bg-green/20' : 'bg-surface3'}`}>
                              <Mail size={16} className={isEmailVerified ? 'text-green' : 'text-muted'} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text font-mono">Work Email</p>
                            </div>
                            <div className="ml-auto">
                              <StatusBadge verified={isEmailVerified} label="Verified" />
                            </div>
                          </div>
                          {isEmailVerified ? (
                            <p className="text-[11px] font-mono text-green flex items-center gap-1.5">
                              <CheckCheck size={13} />{verifiedEmail}
                            </p>
                          ) : (
                            <p className="text-[11px] font-mono text-muted">
                              Go back to Step 1 to verify your email address.
                            </p>
                          )}
                        </div>

                        {/* Phone status */}
                        <div className={`p-5 rounded-2xl border ${isPhoneVerified ? 'border-green/40 bg-green/5' : 'border-border bg-surface2'}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPhoneVerified ? 'bg-green/20' : 'bg-surface3'}`}>
                              <Phone size={16} className={isPhoneVerified ? 'text-green' : 'text-muted'} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text font-mono">Phone (India)</p>
                            </div>
                            <div className="ml-auto">
                              <StatusBadge verified={isPhoneVerified} label="Verified" />
                            </div>
                          </div>
                          {isPhoneVerified ? (
                            <p className="text-[11px] font-mono text-green flex items-center gap-1.5">
                              <CheckCheck size={13} />{verifiedPhone}
                            </p>
                          ) : (
                            <p className="text-[11px] font-mono text-muted">
                              Go back to Step 1 to verify your Indian mobile number.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Overall status */}
                      <div className={`p-4 rounded-xl border font-mono text-xs flex items-start gap-3 ${
                        hasAtLeastOneVerified ? 'border-green/40 bg-green/5 text-green' : 'border-amber/40 bg-amber/5 text-amber'
                      }`}>
                        <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                        <div>
                          {hasAtLeastOneVerified
                            ? <><strong>Ready to submit!</strong> Your identity has been verified. Click Next to review your details.</>
                            : <><strong>Verification required.</strong> Please go back and verify either your Work Email or Indian Mobile Number before proceeding.</>
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 4: Review & Submit ───────────────────────── */}
                  {step === 4 && (
                    <div className="space-y-5 animate-fade-in">
                      {/* Summary */}
                      <div className="p-5 rounded-2xl border border-border bg-surface2/60 space-y-3">
                        <p className="text-xs font-mono text-amber font-semibold uppercase tracking-wider mb-2">// Inquiry Summary</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-mono">
                          {[
                            { label: 'Name', value: formData.name, icon: User },
                            { label: 'Email', value: formData.email, icon: Mail },
                            { label: 'Company', value: formData.company || '—', icon: Building2 },
                            { label: 'Phone', value: formData.phone ? phoneValidation.display : '—', icon: Phone },
                            { label: 'Project Type', value: formData.projectType || '—', icon: Layers },
                            { label: 'Budget', value: formData.budget || '—', icon: Wallet },
                            { label: 'Timeline', value: formData.timeline || '—', icon: Calendar },
                            { label: 'Promo Code', value: appliedDiscount ? `${appliedDiscount.code} (${appliedDiscount.percent}% off)` : '—', icon: Tag },
                          ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-start gap-2">
                              <Icon size={12} className="text-muted shrink-0 mt-0.5" />
                              <div>
                                <span className="text-muted">{label}: </span>
                                <span className="text-text break-all">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-border/60">
                          <p className="text-[10px] font-mono text-muted mb-1 flex items-center gap-1.5">
                            <MessageSquare size={11} /> Project Details
                          </p>
                          <p className="text-xs text-muted line-clamp-3">{formData.message || '—'}</p>
                        </div>
                      </div>

                      {/* Verification status row */}
                      <div className="flex flex-wrap gap-3 font-mono text-xs">
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isEmailVerified ? 'border-green/40 bg-green/10 text-green' : 'border-border bg-surface2 text-muted'}`}>
                          <Mail size={12} /> Email {isEmailVerified ? '✓' : '—'}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isPhoneVerified ? 'border-green/40 bg-green/10 text-green' : 'border-border bg-surface2 text-muted'}`}>
                          <Phone size={12} /> Phone {isPhoneVerified ? '✓' : '—'}
                        </span>
                      </div>

                      {/* T&C */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-border bg-surface2 text-amber focus:ring-amber accent-amber"
                        />
                        <span className="text-xs text-muted font-mono leading-relaxed group-hover:text-text transition-colors">
                          I have read and agree to the{' '}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-amber underline">
                            Terms & Conditions
                          </a>{' '}
                          of Syntax Studio. *
                        </span>
                      </label>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={submitting || !hasAtLeastOneVerified || !termsAccepted}
                        className="w-full py-4 rounded-xl text-sm font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 shadow-glow-amber active:scale-[0.98]"
                      >
                        {submitting ? (
                          <><RefreshCw size={16} className="animate-spin" /><span>Transmitting inquiry...</span></>
                        ) : (
                          <><span>Send Project Inquiry</span><Send size={15} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ── Step Navigation ───────────────────────────────── */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setStep(s => Math.max(1, s - 1))}
                      disabled={step === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono text-muted hover:text-text border border-border hover:border-border/80 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>

                    {step < 4 && (
                      <button
                        type="button"
                        disabled={step === 3 && !canProceedStep3}
                        onClick={() => {
                          if (step === 1) {
                            setTouched(p => ({ ...p, name: true, email: true }));
                            if (!canProceedStep1) {
                              if (!formData.name.trim()) showToast('Please enter your full name to continue.');
                              else showToast('Please enter a valid email address to continue.');
                              return;
                            }
                          }
                          if (step === 2) {
                            setTouched(p => ({ ...p, message: true }));
                            if (!canProceedStep2) {
                              showToast('Please describe your project (at least 10 characters) to continue.');
                              return;
                            }
                          }
                          if (step === 3 && !canProceedStep3) {
                            showToast('Verification required — please verify your Work Email or Indian Mobile Number before proceeding.', 'error');
                            return;
                          }
                          setToast(null);
                          setStep(s => Math.min(4, s + 1));
                          setErrorMessage(null);
                        }}
                        className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                          step === 3 && !canProceedStep3
                            ? 'bg-surface2 text-muted border-border cursor-not-allowed opacity-50'
                            : 'bg-cyan/15 text-cyan hover:bg-cyan/25 border-cyan/40'
                        }`}
                      >
                        {step === 3 ? 'Review & Submit' : 'Continue'} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>

                </div>{/* /px-8 */}
              </form>
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Process steps */}
            <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
              <p className="text-[11px] font-mono text-amber font-semibold uppercase tracking-wider">// How We Work</p>
              <div className="space-y-4">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={s.num} className="flex gap-4">
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-surface2 border border-border flex items-center justify-center font-mono text-xs font-bold text-amber">
                      {s.num}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text mb-0.5">{s.title}</p>
                      <p className="text-[12px] text-muted leading-relaxed">{s.desc}</p>
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="absolute ml-4 mt-9 w-[1px] h-4 bg-border" style={{ marginLeft: '17px', marginTop: '36px', position: 'relative', alignSelf: 'stretch' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Studio commitments */}
            {settings?.commitments?.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
                <p className="text-[11px] font-mono text-amber font-semibold uppercase tracking-wider">
                  {settings?.commitmentsBadge || '// Our Commitment'}
                </p>
                <div className="space-y-2">
                  {settings.commitments.map((c, i) => {
                    const icons = [Clock, ShieldCheck, CheckCircle, Zap, Lock];
                    const colors = ['text-cyan', 'text-green', 'text-amber', 'text-purple', 'text-cyan'];
                    const Icon = icons[i % icons.length];
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-muted">
                        <Icon size={14} className={colors[i % colors.length]} />
                        <span>{typeof c === 'string' ? c : c.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lock,       color: 'text-amber', title: '100% NDA Safe',       sub: 'Strict Confidentiality' },
                { icon: Clock,      color: 'text-cyan',  title: '<24h Response',        sub: 'Direct Founder SLA' },
                { icon: GitBranch,  color: 'text-green', title: 'Day-1 Repo Transfer',  sub: 'Full IP Ownership' },
                { icon: ShieldCheck,color: 'text-amber', title: '30-Day Warranty',      sub: 'Post-Launch Support' },
              ].map(({ icon: Icon, color, title, sub }) => (
                <div key={title} className="p-3.5 rounded-xl border border-border bg-surface/60 flex items-center gap-2.5">
                  <Icon size={16} className={`${color} shrink-0`} />
                  <div>
                    <p className="text-[11px] font-mono font-bold text-text">{title}</p>
                    <p className="text-[10px] text-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>{/* /sidebar */}
        </div>{/* /grid */}
      </div>{/* /container */}
    </div>
  );
}

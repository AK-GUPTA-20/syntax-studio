import { Resend } from 'resend';
import { config } from '../config/env.js';

let resendInstance = null;

const getResend = () => {
  const key = (config.resend.apiKey || '').trim();
  if (!resendInstance || resendInstance._lastApiKey !== key) {
    resendInstance = new Resend(key || 're_placeholder');
    resendInstance._lastApiKey = key;
  }
  return resendInstance;
};

const FROM_SENDER  = () => (config.resend.fromEmail || 'Syntax Studio <noreply@support-studio.work.gd>').trim();
const TEAM_URL     = 'https://syntax-studio.vercel.app/team';
const WEBSITE_URL  = 'https://syntax-studio.vercel.app';
const CURRENT_YEAR = () => new Date().getFullYear();

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const BASE_STYLES = `
  body { margin:0; padding:0; background:#0b0f19; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; color:#e2e8f0; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; width:100% !important; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  .wrapper { width:100% !important; background:#0b0f19; padding:32px 12px; box-sizing:border-box; }
  .container { max-width:580px; width:100% !important; margin:0 auto; background:#111827; border:1px solid #1f293d; border-radius:16px; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.45); }
  .header { background:linear-gradient(135deg,#0e1526 0%,#0a1020 100%); border-bottom:1px solid #1f293d; padding:28px 24px; text-align:center; }
  .brand-badge { display:inline-block; font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace; font-size:11px; font-weight:600; color:#5fc8c8; background:rgba(95,200,200,.1); border:1px solid rgba(95,200,200,.3); padding:4px 12px; border-radius:9999px; margin-bottom:10px; letter-spacing:.6px; }
  .brand-title { font-size:22px; font-weight:800; color:#fff; margin:0; letter-spacing:-.5px; }
  .brand-sub { font-size:12px; color:#64748b; margin:4px 0 0; font-family:'SFMono-Regular',Consolas,monospace; }
  .content { padding:32px 24px; box-sizing:border-box; }
  .h2 { font-size:20px; font-weight:700; color:#f8fafc; margin:0 0 14px; }
  .p { font-size:14px; line-height:1.65; color:#94a3b8; margin:0 0 18px; }
  .p strong { color:#e2e8f0; }
  .btn-wrap { text-align:center; margin:28px 0; }
  .btn { background:#e8a33d; color:#0b0f19 !important; font-size:14px; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; display:inline-block; box-shadow:0 6px 20px rgba(232,163,61,.3); letter-spacing:.2px; max-width:100%; box-sizing:border-box; }
  .divider { border:0; border-top:1px solid #1f293d; margin:24px 0; }
  .otp-box { background:#070b14; border:1px solid #1e293b; border-radius:14px; padding:20px 16px; text-align:center; margin:20px 0; box-sizing:border-box; width:100%; }
  .otp-label { font-size:11px; font-family:'SFMono-Regular',Consolas,monospace; color:#5fc8c8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .otp-code { font-family:'SFMono-Regular',Consolas,monospace; font-size:28px; font-weight:800; color:#e8a33d; letter-spacing:6px; margin:8px auto; padding:10px 16px; background:rgba(232,163,61,.08); border:1px dashed rgba(232,163,61,.4); border-radius:10px; display:inline-block; max-width:96%; box-sizing:border-box; word-break:keep-all; }
  .otp-sub { font-size:11px; color:#475569; margin-top:6px; }
  .fallback { font-size:12px; color:#475569; line-height:1.5; word-break:break-all; overflow-wrap:anywhere; margin-top:16px; }
  .fallback a { color:#5fc8c8; text-decoration:underline; word-break:break-all; overflow-wrap:anywhere; }
  .security { background:rgba(100,116,139,.07); border-left:3px solid #334155; padding:12px 16px; font-size:11px; color:#64748b; margin-top:20px; border-radius:0 8px 8px 0; line-height:1.6; }
  .footer { background:#070b14; border-top:1px solid #1f293d; padding:20px 24px; text-align:center; font-size:11px; color:#334155; line-height:1.8; }
  .footer a { color:#475569; text-decoration:none; }
  .footer a:hover { color:#94a3b8; }
  .do-not-reply { font-size:11px; color:#334155; text-align:center; margin-top:12px; font-family:'SFMono-Regular',Consolas,monospace; }

  @media only screen and (max-width: 600px) {
    .wrapper { padding: 12px 6px !important; }
    .container { width: 100% !important; max-width: 100% !important; border-radius: 12px !important; }
    .header { padding: 20px 14px !important; }
    .brand-title { font-size: 20px !important; }
    .content { padding: 22px 14px !important; }
    .h2 { font-size: 18px !important; }
    .p { font-size: 13px !important; line-height: 1.55 !important; }
    .otp-box { padding: 16px 10px !important; margin: 16px 0 !important; }
    .otp-code { font-size: 22px !important; letter-spacing: 4px !important; padding: 8px 12px !important; max-width: 100% !important; }
    .btn { padding: 12px 20px !important; font-size: 13px !important; width: 100% !important; text-align: center !important; }
    .fallback { font-size: 11px !important; }
    .security { font-size: 10.5px !important; padding: 10px 12px !important; }
    .footer { padding: 16px 12px !important; }
  }

  @media only screen and (max-width: 360px) {
    .content { padding: 18px 10px !important; }
    .otp-code { font-size: 19px !important; letter-spacing: 3px !important; padding: 6px 10px !important; }
  }
`;

// ─── Template 1: OTP / Verification Email ─────────────────────────────────────
export const generateVerificationEmailHtml = ({ otp, verificationUrl, email, expiresInMinutes = 15 }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify Your Email — Syntax Studio</title>
  <style>${BASE_STYLES}</style>
</head>
<body style="margin:0;padding:0;background:#0b0f19;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0f19;width:100%;">
  <tr>
    <td align="center" style="padding:24px 10px;">
      <table class="container" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:#111827;border:1px solid #1f293d;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td class="header" align="center" style="background:linear-gradient(135deg,#0e1526 0%,#0a1020 100%);border-bottom:1px solid #1f293d;padding:26px 20px;">
            <div class="brand-badge" style="display:inline-block;font-family:'SFMono-Regular',Consolas,monospace;font-size:11px;font-weight:600;color:#5fc8c8;background:rgba(95,200,200,.1);border:1px solid rgba(95,200,200,.3);padding:4px 12px;border-radius:9999px;margin-bottom:8px;letter-spacing:.6px;">// SECURE VERIFICATION</div>
            <h1 class="brand-title" style="font-size:22px;font-weight:800;color:#fff;margin:0;letter-spacing:-.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Syntax Studio</h1>
            <p class="brand-sub" style="font-size:12px;color:#64748b;margin:4px 0 0;font-family:'SFMono-Regular',Consolas,monospace;">Full-Stack Software Agency</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="content" style="padding:30px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <h2 class="h2" style="font-size:20px;font-weight:700;color:#f8fafc;margin:0 0 14px;">Verify Your Email Address</h2>
            <p class="p" style="font-size:14px;line-height:1.65;color:#94a3b8;margin:0 0 18px;">
              We received a request to verify <strong>${email}</strong> for a project inquiry at Syntax Studio.<br>
              Use the button below or enter the 6-digit code directly in the contact form.
            </p>

            <!-- Action Button -->
            <div class="btn-wrap" style="text-align:center;margin:24px 0;">
              <a href="${verificationUrl}" class="btn" target="_blank" style="background:#e8a33d;color:#0b0f19 !important;font-size:14px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:10px;display:inline-block;box-shadow:0 6px 20px rgba(232,163,61,.3);box-sizing:border-box;">Verify My Email &rarr;</a>
            </div>

            <hr class="divider" style="border:0;border-top:1px solid #1f293d;margin:22px 0;">

            <!-- OTP Box — Fully responsive with inline fallback -->
            <div class="otp-box" style="background:#070b14;border:1px solid #1e293b;border-radius:14px;padding:18px 12px;text-align:center;margin:18px 0;box-sizing:border-box;max-width:100%;">
              <div class="otp-label" style="font-size:11px;font-family:'SFMono-Regular',Consolas,monospace;color:#5fc8c8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Or enter this one-time code</div>
              <div class="otp-code" style="font-family:'SFMono-Regular',Consolas,monospace;font-size:26px;font-weight:800;color:#e8a33d;letter-spacing:5px;margin:6px auto;padding:8px 14px;background:rgba(232,163,61,.08);border:1px dashed rgba(232,163,61,.4);border-radius:8px;display:inline-block;max-width:96%;box-sizing:border-box;word-break:keep-all;">${otp}</div>
              <div class="otp-sub" style="font-size:11px;color:#475569;margin-top:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Expires in <strong>${expiresInMinutes} minutes</strong> &bull; Single use only</div>
            </div>

            <!-- Fallback URL -->
            <p class="fallback" style="font-size:12px;color:#475569;line-height:1.5;word-break:break-all;overflow-wrap:anywhere;margin-top:16px;">
              Button not working? Paste this link into your browser:<br>
              <a href="${verificationUrl}" target="_blank" style="color:#5fc8c8;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${verificationUrl}</a>
            </p>

            <!-- Security Note -->
            <div class="security" style="background:rgba(100,116,139,.07);border-left:3px solid #334155;padding:12px 14px;font-size:11px;color:#64748b;margin-top:18px;border-radius:0 8px 8px 0;line-height:1.6;">
              <strong>Security notice:</strong> This email was sent because someone used this address on our contact form.
              If that wasn't you, ignore this email &mdash; no account will be created without your confirmation.
              Never share this code with anyone.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer" style="background:#070b14;border-top:1px solid #1f293d;padding:18px 20px;text-align:center;font-size:11px;color:#334155;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            &copy; ${CURRENT_YEAR()} Syntax Studio &bull; <a href="${WEBSITE_URL}" style="color:#475569;text-decoration:none;">${WEBSITE_URL.replace('https://', '')}</a><br>
            Questions? Visit <a href="${TEAM_URL}" style="color:#5fc8c8;text-decoration:none;">our team page</a> to contact us directly.
            <div class="do-not-reply" style="font-size:10.5px;color:#334155;text-align:center;margin-top:8px;font-family:'SFMono-Regular',Consolas,monospace;">&bull; This is an automated message &mdash; please do not reply to this email &bull;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`.trim();

// ─── Template 2: Client Confirmation Email (after form submission) ─────────────
export const generateConfirmationEmailHtml = ({ name, projectType, budget, timeline, inquiryId }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>We Received Your Inquiry — Syntax Studio</title>
  <style>
    ${BASE_STYLES}
    .hero { background:linear-gradient(135deg,#0d1a2e 0%,#0a1020 100%); padding:28px 20px; text-align:center; border-bottom:1px solid #1f293d; }
    .hero-icon { font-size:36px; margin-bottom:8px; }
    .hero-title { font-size:22px; font-weight:800; color:#fff; margin:0 0 6px; }
    .hero-sub { font-size:13px; color:#64748b; margin:0; }
    .card { background:#0a0f1d; border:1px solid #1e293b; border-radius:12px; padding:16px 18px; margin:20px 0; box-sizing:border-box; width:100%; }
    .card-row { display:flex; justify-content:space-between; align-items:flex-start; padding:8px 0; border-bottom:1px solid #131d2e; }
    .card-row:last-child { border-bottom:none; }
    .card-label { font-size:11px; font-family:'SFMono-Regular',Consolas,monospace; color:#475569; text-transform:uppercase; letter-spacing:.8px; min-width:90px; }
    .card-value { font-size:12.5px; color:#cbd5e1; font-weight:600; text-align:right; }
    .timeline-strip { background:rgba(95,200,200,.06); border:1px solid rgba(95,200,200,.2); border-radius:12px; padding:16px 20px; text-align:center; margin:20px 0; box-sizing:border-box; }
    .timeline-num { font-size:28px; font-weight:900; color:#5fc8c8; font-family:'SFMono-Regular',Consolas,monospace; }
    .timeline-label { font-size:11px; color:#64748b; margin-top:4px; }
    .team-btn { display:inline-block; padding:12px 24px; background:rgba(232,163,61,.12); border:1px solid rgba(232,163,61,.4); border-radius:10px; color:#e8a33d !important; font-size:13px; font-weight:700; text-decoration:none; letter-spacing:.2px; max-width:100%; box-sizing:border-box; }
    .tip-box { background:rgba(232,163,61,.05); border:1px solid rgba(232,163,61,.2); border-radius:10px; padding:14px 16px; margin-top:18px; font-size:11.5px; color:#94a3b8; line-height:1.65; box-sizing:border-box; }
    .tip-box strong { color:#e8a33d; }

    @media only screen and (max-width: 600px) {
      .hero { padding: 22px 14px !important; }
      .hero-title { font-size: 20px !important; }
      .card { padding: 12px 14px !important; margin: 16px 0 !important; }
      .card-label { font-size: 10px !important; min-width: 80px !important; }
      .card-value { font-size: 11.5px !important; }
      .timeline-strip { padding: 12px 14px !important; }
      .timeline-num { font-size: 24px !important; }
      .team-btn { width: 100% !important; text-align: center !important; }
      .tip-box { padding: 12px 14px !important; font-size: 11px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0b0f19;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0f19;width:100%;">
  <tr>
    <td align="center" style="padding:24px 10px;">
      <table class="container" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:#111827;border:1px solid #1f293d;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td class="header" align="center" style="background:linear-gradient(135deg,#0e1526 0%,#0a1020 100%);border-bottom:1px solid #1f293d;padding:26px 20px;">
            <div class="brand-badge" style="display:inline-block;font-family:'SFMono-Regular',Consolas,monospace;font-size:11px;font-weight:600;color:#5fc8c8;background:rgba(95,200,200,.1);border:1px solid rgba(95,200,200,.3);padding:4px 12px;border-radius:9999px;margin-bottom:8px;letter-spacing:.6px;">// PROJECT INQUIRY RECEIVED</div>
            <h1 class="brand-title" style="font-size:22px;font-weight:800;color:#fff;margin:0;letter-spacing:-.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Syntax Studio</h1>
            <p class="brand-sub" style="font-size:12px;color:#64748b;margin:4px 0 0;font-family:'SFMono-Regular',Consolas,monospace;">Full-Stack Software Agency</p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td class="hero" align="center" style="background:linear-gradient(135deg,#0d1a2e 0%,#0a1020 100%);padding:28px 20px;text-align:center;border-bottom:1px solid #1f293d;">
            <div class="hero-icon" style="font-size:36px;margin-bottom:8px;">✅</div>
            <h2 class="hero-title" style="font-size:22px;font-weight:800;color:#fff;margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Thank You, ${name}!</h2>
            <p class="hero-sub" style="font-size:13px;color:#64748b;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Your project inquiry has been successfully received.</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="content" style="padding:28px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <p class="p" style="font-size:14px;line-height:1.65;color:#94a3b8;margin:0 0 18px;">
              We've received your requirements and our founders &mdash; <strong>Akshat &amp; Vasu</strong> &mdash; will personally review them and reply with technical insights and an estimated scope within 24 hours.
            </p>

            <!-- Details Card -->
            <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0f1d;border:1px solid #1e293b;border-radius:12px;padding:14px 16px;margin:18px 0;width:100%;box-sizing:border-box;">
              <tr>
                <td style="padding:6px 0;font-size:11px;font-family:'SFMono-Regular',Consolas,monospace;color:#475569;text-transform:uppercase;letter-spacing:.8px;">Project Type</td>
                <td align="right" style="padding:6px 0;font-size:12.5px;color:#cbd5e1;font-weight:600;">${projectType || '—'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;border-top:1px solid #131d2e;font-size:11px;font-family:'SFMono-Regular',Consolas,monospace;color:#475569;text-transform:uppercase;letter-spacing:.8px;">Budget Range</td>
                <td align="right" style="padding:6px 0;border-top:1px solid #131d2e;font-size:12.5px;color:#cbd5e1;font-weight:600;">${budget || '—'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;border-top:1px solid #131d2e;font-size:11px;font-family:'SFMono-Regular',Consolas,monospace;color:#475569;text-transform:uppercase;letter-spacing:.8px;">Timeline</td>
                <td align="right" style="padding:6px 0;border-top:1px solid #131d2e;font-size:12.5px;color:#cbd5e1;font-weight:600;">${timeline || '—'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;border-top:1px solid #131d2e;font-size:11px;font-family:'SFMono-Regular',Consolas,monospace;color:#475569;text-transform:uppercase;letter-spacing:.8px;">Inquiry ID</td>
                <td align="right" style="padding:6px 0;border-top:1px solid #131d2e;font-size:11px;color:#64748b;font-family:'SFMono-Regular',Consolas,monospace;">${inquiryId || '—'}</td>
              </tr>
            </table>

            <!-- SLA Strip -->
            <div class="timeline-strip" style="background:rgba(95,200,200,.06);border:1px solid rgba(95,200,200,.2);border-radius:12px;padding:16px 20px;text-align:center;margin:18px 0;box-sizing:border-box;">
              <div class="timeline-num" style="font-size:28px;font-weight:900;color:#5fc8c8;font-family:'SFMono-Regular',Consolas,monospace;">&lt; 24h</div>
              <div class="timeline-label" style="font-size:11.5px;color:#64748b;margin-top:4px;">Direct response guarantee from our founders</div>
            </div>

            <p class="p" style="font-size:14px;line-height:1.65;color:#94a3b8;margin:0 0 18px;">
              While we prepare your scope, you can explore our portfolio or reach out directly to our team.
            </p>

            <div style="text-align:center;margin:22px 0;">
              <a href="${TEAM_URL}" class="team-btn" target="_blank" style="display:inline-block;padding:12px 24px;background:rgba(232,163,61,.12);border:1px solid rgba(232,163,61,.4);border-radius:10px;color:#e8a33d !important;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:.2px;box-sizing:border-box;">Meet Our Team &rarr;</a>
            </div>

            <!-- Tip Box -->
            <div class="tip-box" style="background:rgba(232,163,61,.05);border:1px solid rgba(232,163,61,.2);border-radius:10px;padding:14px 16px;margin-top:18px;font-size:11.5px;color:#94a3b8;line-height:1.65;box-sizing:border-box;">
              <strong>💡 Haven't received a reply in 24 hours?</strong><br>
              Check your spam or promotions folder first &mdash; sometimes agency replies land there.
              If you still haven't heard back, visit our 
              <a href="${TEAM_URL}" style="color:#5fc8c8;text-decoration:underline;">team page</a> to reach Akshat or Vasu directly via phone or personal email.
            </div>

            <div class="security" style="background:rgba(100,116,139,.07);border-left:3px solid #334155;padding:12px 14px;font-size:11px;color:#64748b;margin-top:18px;border-radius:0 8px 8px 0;line-height:1.6;">
              If you did not submit this inquiry, please disregard this confirmation.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer" style="background:#070b14;border-top:1px solid #1f293d;padding:18px 20px;text-align:center;font-size:11px;color:#334155;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            &copy; ${CURRENT_YEAR()} Syntax Studio &bull; <a href="${WEBSITE_URL}" style="color:#475569;text-decoration:none;">${WEBSITE_URL.replace('https://', '')}</a><br>
            <a href="${TEAM_URL}" style="color:#5fc8c8;text-decoration:none;">Meet the Team</a> &bull; <a href="${WEBSITE_URL}/projects" style="color:#475569;text-decoration:none;">Our Work</a> &bull; <a href="${WEBSITE_URL}/services" style="color:#475569;text-decoration:none;">Services</a>
            <div class="do-not-reply" style="font-size:10.5px;color:#334155;text-align:center;margin-top:8px;font-family:'SFMono-Regular',Consolas,monospace;">&bull; This is an automated confirmation &mdash; please do not reply to this email &bull;</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`.trim();

// ─── Send OTP / Verification Email ───────────────────────────────────────────
export const sendVerificationEmail = async ({ to, otp, verificationUrl, expiresInMinutes = 15 }) => {
  const resend  = getResend();
  const from    = FROM_SENDER();
  const html    = generateVerificationEmailHtml({ otp, verificationUrl, email: to, expiresInMinutes });

  try {
    const response = await resend.emails.send({
      from,
      to,
      reply_to: 'noreply@support-studio.work.gd',
      subject: `[${otp}] Verify Your Email — Syntax Studio`,
      html,
      text: `Your Syntax Studio verification code is: ${otp}\n\nExpires in ${expiresInMinutes} minutes.\n\nVerification link: ${verificationUrl}\n\nDo not reply to this email.`,
      headers: {
        'X-Entity-Ref-ID': `verify-${Date.now()}`,
        'List-Unsubscribe': `<mailto:noreply@support-studio.work.gd>`,
      },
    });

    if (response.error) {
      if (config.nodeEnv === 'development') {
        console.warn(`[Resend Dev] Key invalid/suspended. OTP: ${otp} | URL: ${verificationUrl}`);
        return { id: `dev_${Date.now()}`, devFallback: true, otp, devNotice: `Dev mode (${response.error.message}). Code: ${otp}` };
      }
      throw new Error(response.error.message || 'Failed to send verification email');
    }

    return response.data;
  } catch (err) {
    if (config.nodeEnv === 'development') {
      console.warn(`[Resend Dev] Exception: ${err.message}. OTP: ${otp}`);
      return { id: `dev_${Date.now()}`, devFallback: true, otp, devNotice: `Dev mode (${err.message}). Code: ${otp}` };
    }
    throw err;
  }
};

// ─── Send Client Confirmation Email ──────────────────────────────────────────
export const sendConfirmationEmail = async ({ to, name, projectType, budget, timeline, inquiryId }) => {
  const resend = getResend();
  const from   = FROM_SENDER();
  const html   = generateConfirmationEmailHtml({ name, projectType, budget, timeline, inquiryId });

  try {
    const response = await resend.emails.send({
      from,
      to,
      reply_to: 'noreply@support-studio.work.gd',
      subject: `We received your inquiry, ${name} — Syntax Studio`,
      html,
      text: `Hi ${name},\n\nThank you for reaching out to Syntax Studio! We've received your project inquiry and our founders will review it and respond within 24 hours.\n\nProject: ${projectType || '—'}\nBudget: ${budget || '—'}\nTimeline: ${timeline || '—'}\nInquiry ID: ${inquiryId || '—'}\n\nIf you don't hear back within 24 hours, please check your spam folder or visit our team page: ${TEAM_URL}\n\nDo not reply to this email. To contact us directly, visit: ${TEAM_URL}\n\n— Syntax Studio Team`,
      headers: {
        'X-Entity-Ref-ID': `confirm-${Date.now()}`,
        'List-Unsubscribe': `<mailto:noreply@support-studio.work.gd>`,
      },
    });

    if (response.error) {
      // Non-fatal: log but don't throw — form submission already succeeded
      console.warn(`[Resend] Confirmation email failed for ${to}: ${response.error.message}`);
      return null;
    }

    return response.data;
  } catch (err) {
    console.warn(`[Resend] Confirmation email exception for ${to}: ${err.message}`);
    return null;
  }
};

import { config } from './env.js';

/**
 * Returns an array of explicitly configured allowed origins.
 */
export function getAllowedOrigins() {
  const customOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const clientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(
    new Set([
      ...clientUrls,
      ...customOrigins,
      config.clientUrl,
      // Production & Staging Vercel deployments
      'https://syntax-studio-sigma.vercel.app',
      'https://syntax-studio.vercel.app',
      // Development environments
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
    ].filter(Boolean))
  );
}

/**
 * Determines whether a given Origin header is permitted.
 * Supports exact matches, configured environment variables, and Vercel preview domains.
 *
 * @param {string|undefined} origin - The Origin request header
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  // Allow non-browser requests (server-to-server, curl, Postman, health checks)
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const normalizedOrigin = originUrl.origin.toLowerCase();
    const allowedList = getAllowedOrigins();

    // 1. Check exact matches in the allowed origins list
    const isExplicitlyAllowed = allowedList.some((allowed) => {
      try {
        return new URL(allowed).origin.toLowerCase() === normalizedOrigin;
      } catch {
        return false;
      }
    });

    if (isExplicitlyAllowed) {
      return true;
    }

    // 2. Allow all official Syntax Studio Vercel domains (e.g. preview, git branch, production)
    // Matches:
    //   https://syntax-studio-sigma.vercel.app
    //   https://syntax-studio.vercel.app
    //   https://syntax-studio-*.vercel.app
    //   https://*-syntax-studio.vercel.app
    const isVercelSyntaxStudio =
      originUrl.protocol === 'https:' &&
      /^(?:[a-z0-9-]+-)?syntax-studio(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(originUrl.hostname);

    if (isVercelSyntaxStudio) {
      return true;
    }

    // 3. Allow localhost / 127.0.0.1 on any port in development
    const isLocalhost =
      originUrl.protocol === 'http:' &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(originUrl.host);

    if (isLocalhost) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

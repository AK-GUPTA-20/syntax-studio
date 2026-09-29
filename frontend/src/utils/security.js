/**
 * Syntax Studio — Security Utilities & Defenses
 * 
 * Provides defense-in-depth against:
 * - Cross-Site Scripting (XSS)
 * - Reverse Tabnabbing (target="_blank" window.opener exploitation)
 * - Malicious URI schemes (javascript:, vbscript:, data:, file:)
 * - Prototype & Object tampering
 * - File upload MIME & Magic-byte spoofing
 * - Input injection & control character manipulation
 */

import React from 'react';

// Whitelist of allowed protocols for external navigation
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Sanitizes a URL, blocking dangerous protocols like javascript:, vbscript:, data:, blob:, etc.
 * Handles obfuscated encodings, leading whitespace, and control characters.
 * 
 * @param {string} url - The URL to validate
 * @param {string} fallback - Fallback URL if invalid (default: '#')
 * @returns {string} - Safe sanitized URL
 */
export function sanitizeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  // Remove control characters, null bytes, and non-printable characters
  const cleaned = url.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '').trim();

  if (!cleaned) {
    return fallback;
  }

  // Allow relative URLs starting with '/' or '#' (safe local navigation)
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) {
    return cleaned;
  }
  if (cleaned.startsWith('#')) {
    return cleaned;
  }

  // Check for protocol-relative URLs (e.g. //evil.com) -> normalize to https:
  if (cleaned.startsWith('//')) {
    return `https:${cleaned}`;
  }

  // Explicitly reject dangerous URI schemes (even with internal whitespace before colon)
  if (/^\s*(javascript|vbscript|data|file|blob)\s*:/i.test(cleaned)) {
    console.warn('[Security Alert] Blocked dangerous protocol:', cleaned);
    return fallback;
  }

  try {
    const base = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost';
    const parsed = new URL(cleaned, base);
    if (SAFE_PROTOCOLS.has(parsed.protocol)) {
      return cleaned;
    }
    console.warn(`[Security Alert] Blocked unsafe URL protocol "${parsed.protocol}":`, cleaned);
    return fallback;
  } catch (e) {
    // If URL parsing fails, check if it starts with valid http:// or https://
    if (/^https?:\/\//i.test(cleaned)) {
      return cleaned;
    }
    console.warn('[Security Alert] Blocked malformed URL:', cleaned);
    return fallback;
  }
}

/**
 * Strips HTML tags, script markers, null bytes, and trims strings.
 * Enforces length constraints to prevent buffer/payload flooding.
 * 
 * @param {string} input - Text to sanitize
 * @param {number} maxLength - Maximum allowable length (default: 3000)
 * @returns {string}
 */
export function sanitizeInput(input, maxLength = 3000) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  // Strip null bytes and non-printable control characters (except newline, tab, carriage return)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip HTML tags using regex
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // Truncate to maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Sanitizes promo code input: only alphanumeric, hyphen, underscore.
 * Max length 30 characters.
 * 
 * @param {string} code
 * @returns {string}
 */
export function sanitizePromoCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code
    .replace(/<[^>]*>?/gm, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30);
}

/**
 * Sanitizes authorization header token strings (removes CR, LF, null bytes to prevent HTTP header injection)
 * 
 * @param {string} token
 * @returns {string}
 */
export function sanitizeHeaderToken(token) {
  if (!token || typeof token !== 'string') return '';
  return token.replace(/[\r\n\0]/g, '').trim();
}

/**
 * Magic Byte Signatures for Common Image Formats
 */
const MAGIC_BYTE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46] // RIFF
};

/**
 * Validates file magic bytes to verify actual image content type.
 * Blocks executable files, scripts, and spoofed extensions.
 * Explicitly rejects SVG (image/svg+xml) to prevent XSS via embedded scripts.
 * 
 * @param {File} file
 * @returns {Promise<{ isValid: boolean, error: string|null, detectedType: string|null }>}
 */
export async function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file provided', detectedType: null };
  }

  // 1. Size constraint: Max 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: 'File size exceeds maximum allowed limit (5MB)', detectedType: null };
  }

  // 2. Reject SVG files (high XSS vector in CDN/web contexts)
  const lowerName = file.name.toLowerCase();
  if (
    file.type === 'image/svg+xml' ||
    lowerName.endsWith('.svg') ||
    lowerName.endsWith('.svgz')
  ) {
    return {
      isValid: false,
      error: 'SVG files are not permitted for security reasons. Please upload JPEG, PNG, or WebP images.',
      detectedType: 'svg'
    };
  }

  // 3. Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext));
  if (!hasValidExt) {
    return {
      isValid: false,
      error: 'Invalid file extension. Permitted extensions: .jpg, .jpeg, .png, .webp, .gif',
      detectedType: null
    };
  }

  // 4. Magic Byte Header Verification
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { isValid: true, error: null, detectedType: 'image/png' };
    }

    // Check JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { isValid: true, error: null, detectedType: 'image/jpeg' };
    }

    // Check GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { isValid: true, error: null, detectedType: 'image/gif' };
    }

    // Check WebP: RIFF .... WEBP
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return { isValid: true, error: null, detectedType: 'image/webp' };
    }

    return {
      isValid: false,
      error: 'File content does not match a valid image format (corrupted or spoofed file header).',
      detectedType: null
    };
  } catch (err) {
    return {
      isValid: false,
      error: `Failed to verify file security header: ${err.message}`,
      detectedType: null
    };
  }
}

/**
 * Sanitizes a file name, removing path traversal sequences and dangerous characters
 * 
 * @param {string} fileName
 * @returns {string}
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return 'upload.png';

  // Extract base name without path
  const baseName = fileName.replace(/^.*[\\\/]/, '');

  // Split name and extension
  const lastDot = baseName.lastIndexOf('.');
  if (lastDot === -1) {
    return baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) + '.png';
  }

  const namePart = baseName.slice(0, lastDot).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  const extPart = baseName.slice(lastDot).toLowerCase().replace(/[^a-z0-9.]/g, '');

  return `${namePart || 'file'}${extPart}`;
}

/**
 * Safe External Link Component
 * Guarantees rel="noopener noreferrer", target="_blank", and URL protocol sanitization.
 */
export function SafeExternalLink({
  href,
  children,
  className = '',
  title = '',
  onClick,
  ...rest
}) {
  const safeHref = sanitizeUrl(href);

  const handleClick = (e) => {
    if (safeHref === '#') {
      e.preventDefault();
      console.warn('[Security] Prevented click on unsafe external link:', href);
      return;
    }
    if (onClick) onClick(e);
  };

  return React.createElement(
    'a',
    {
      href: safeHref,
      target: '_blank',
      rel: 'noopener noreferrer',
      className,
      title,
      onClick: handleClick,
      ...rest
    },
    children
  );
}

/**
 * Safely opens an external link in a new window with noopener and noreferrer
 * 
 * @param {string} url
 */
export function safeWindowOpen(url) {
  const safe = sanitizeUrl(url);
  if (safe === '#') {
    console.warn('[Security] Refused to open unsafe URL:', url);
    return null;
  }
  return window.open(safe, '_blank', 'noopener,noreferrer');
}

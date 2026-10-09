/**
 * Server-Side File Upload Security & Magic Byte Inspector
 * Prevents MIME-spoofing, shell uploads, SVG XSS, path traversal, and buffer overflow.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MAGIC_BYTE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46] // RIFF
};

/**
 * Validates a base64 encoded file string or raw buffer.
 * Performs deep magic-byte inspection, size bounds check, and extension verification.
 * 
 * @param {string|Buffer} fileInput - Base64 data URI / base64 string or Buffer
 * @param {string} fileName - Uploaded file name
 * @returns {{ isValid: boolean, error?: string, buffer?: Buffer, mimeType?: string, cleanFileName?: string }}
 */
export function validateUploadFile(fileInput, fileName = '') {
  if (!fileInput) {
    return { isValid: false, error: 'File content is empty or missing.' };
  }

  let buffer;
  let detectedMime = null;

  try {
    if (Buffer.isBuffer(fileInput)) {
      buffer = fileInput;
    } else if (typeof fileInput === 'string') {
      // Check if it's a data URI: data:image/png;base64,xxxx
      const match = fileInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1].toLowerCase();
        buffer = Buffer.from(match[2], 'base64');
      } else {
        // Plain base64 string
        buffer = Buffer.from(fileInput, 'base64');
      }
    } else {
      return { isValid: false, error: 'Unsupported file payload format.' };
    }
  } catch (err) {
    return { isValid: false, error: 'Failed to decode file buffer.' };
  }

  // 1. Size constraint check
  if (buffer.length === 0) {
    return { isValid: false, error: 'File buffer is empty (0 bytes).' };
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds allowed maximum of 5MB (size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`
    };
  }

  // 2. Reject SVG files (XSS vector via embedded scripts/event handlers)
  const lowerName = (fileName || '').toLowerCase();
  if (
    detectedMime === 'image/svg+xml' ||
    lowerName.endsWith('.svg') ||
    lowerName.endsWith('.svgz')
  ) {
    return {
      isValid: false,
      error: 'SVG uploads are blocked due to cross-site scripting risks. Please upload JPEG, PNG, or WebP.'
    };
  }

  // Check for XML/HTML tags in initial bytes (blocks polyglot SVG/HTML masquerading as binary)
  const headerUtf8 = buffer.slice(0, 100).toString('utf8').toLowerCase();
  if (headerUtf8.includes('<svg') || headerUtf8.includes('<?xml') || headerUtf8.includes('<script')) {
    return { isValid: false, error: 'Malicious markup detected in file header.' };
  }

  // 3. Magic Byte Inspection
  const isJpeg = buffer.length >= 3 &&
    buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  const isPng = buffer.length >= 4 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

  const isGif = buffer.length >= 4 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;

  const isWebp = buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

  let mimeType = null;
  let extension = null;

  if (isJpeg) {
    mimeType = 'image/jpeg';
    extension = '.jpg';
  } else if (isPng) {
    mimeType = 'image/png';
    extension = '.png';
  } else if (isWebp) {
    mimeType = 'image/webp';
    extension = '.webp';
  } else if (isGif) {
    mimeType = 'image/gif';
    extension = '.gif';
  } else {
    return {
      isValid: false,
      error: 'Invalid file format. File does not match permitted image binary signatures (JPEG, PNG, WebP, GIF).'
    };
  }

  // 4. Sanitize file name
  const cleanFileName = sanitizeFileName(fileName, extension);

  return {
    isValid: true,
    buffer,
    mimeType,
    cleanFileName
  };
}

/**
 * Sanitizes a file name, removing path traversal sequences and dangerous characters
 * @param {string} fileName
 * @param {string} defaultExtension
 * @returns {string}
 */
export function sanitizeFileName(fileName, defaultExtension = '.jpg') {
  if (!fileName || typeof fileName !== 'string') {
    return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${defaultExtension}`;
  }

  // Strip path traversal sequences: ../ or ..\
  const baseName = fileName.replace(/^.*[\\\/]/, '').trim();

  // Split name and extension
  const lastDot = baseName.lastIndexOf('.');
  if (lastDot === -1) {
    const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'upload';
    return `${safeBase}_${Date.now()}${defaultExtension}`;
  }

  const namePart = baseName.slice(0, lastDot).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'upload';
  const extPart = baseName.slice(lastDot).toLowerCase().replace(/[^a-z0-9.]/g, '');

  const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const safeExt = validExts.includes(extPart) ? extPart : defaultExtension;

  return `${namePart}_${Date.now()}${safeExt}`;
}

/**
 * Sanitizes folder paths to prevent directory traversal
 * @param {string} folder
 * @returns {string}
 */
export function sanitizeFolderPath(folder) {
  if (!folder || typeof folder !== 'string') return '/syntax-studio';
  const cleaned = folder
    .replace(/\.\./g, '') // remove traversal
    .replace(/[^\/a-zA-Z0-9_-]/g, '') // safe chars
    .replace(/\/+/g, '/'); // normalize slashes

  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

import crypto from 'crypto';

/**
 * Verifies HMAC-SHA256 webhook signatures using constant-time equality check.
 * 
 * @param {string|Buffer} rawBody - Raw request body
 * @param {string} signatureHeader - Signature from headers (e.g. 'sha256=abc...' or hex string)
 * @param {string} secret - Webhook signing secret
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  if (!rawBody || !signatureHeader || !secret) {
    return false;
  }

  try {
    // Strip prefix if present (e.g., 'sha256=' or 'v1=')
    let cleanSig = signatureHeader;
    if (cleanSig.includes('=')) {
      cleanSig = cleanSig.split('=')[1];
    }
    cleanSig = cleanSig.trim();

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
      .digest('hex');

    const sigBuf = Buffer.from(cleanSig, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch (err) {
    return false;
  }
}

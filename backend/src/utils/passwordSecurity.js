import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt with strong salt rounds (12)
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} - Bcrypt hash
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password provided for hashing');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext candidate password against a stored bcrypt hash.
 * Constant-time comparison prevents timing attacks.
 * @param {string} candidatePassword - Password to test
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(candidatePassword, hash) {
  if (!candidatePassword || !hash) return false;
  try {
    return await bcrypt.compare(candidatePassword, hash);
  } catch (err) {
    return false;
  }
}

/**
 * Determine if a string is a valid bcrypt hash format
 * @param {string} str
 * @returns {boolean}
 */
export function isBcryptHash(str) {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

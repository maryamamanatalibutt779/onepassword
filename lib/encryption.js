import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;

function getKey() {
  if (!SECRET_KEY) {
    throw new Error('ENCRYPTION_SECRET_KEY is not set in environment variables.');
  }
  // Derive a 32-byte key from the hex string
  return Buffer.from(SECRET_KEY, 'hex');
}

/**
 * Encrypt a plaintext password.
 * @param {string} plaintext
 * @returns {{ encryptedPassword: string, iv: string }}
 */
export function encryptPassword(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    encryptedPassword: encrypted.toString('hex'),
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypt a previously encrypted password.
 * @param {string} encryptedHex
 * @param {string} ivHex
 * @returns {string}
 */
export function decryptPassword(encryptedHex, ivHex) {
  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '[decryption error]';
  }
}

import crypto from 'crypto';
import { env } from './env';

const APP_NAME = 'hiring-assistant';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const TAG_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 600000; // Updated for 2025 standards
const VERSION = 1; // Add versioning for future algorithm changes

/**
 * Derives a key from the BETTER_AUTH_SECRET using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
  // Validate secret strength
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
  }

  return crypto.pbkdf2Sync(env.BETTER_AUTH_SECRET, salt, PBKDF2_ITERATIONS, 32, 'sha512');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns a base64 encoded string containing salt:iv:tag:encryptedData
 */
export function encrypt(text: string, context?: string): string {
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from secret and salt
  const key = deriveKey(salt);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Use context-specific AAD or default
  const aad = context ? `${APP_NAME}:${context}` : APP_NAME;
  cipher.setAAD(Buffer.from(aad));

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Add version byte for future compatibility
  const versionBuffer = Buffer.from([VERSION]);

  // Combine version, salt, iv, tag, and encrypted data
  const combined = Buffer.concat([versionBuffer, salt, iv, tag, encrypted]);

  // Return base64 encoded result
  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with the encrypt function
 * Expects a base64 encoded string containing salt:iv:tag:encryptedData
 */
export function decrypt(encryptedData: string, context?: string): string {
  if (!encryptedData) {
    throw new Error('Encrypted data cannot be empty');
  }

  try {
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');

    // Check minimum length
    const minLength = 1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;
    if (combined.length < minLength) {
      throw new Error('Invalid encrypted data format');
    }

    // Extract version
    const version = combined[0];
    if (version !== VERSION) {
      throw new Error(`Unsupported encryption version: ${version}`);
    }

    // Extract components
    const salt = combined.subarray(1, 1 + SALT_LENGTH);
    const iv = combined.subarray(1 + SALT_LENGTH, 1 + SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(1 + SALT_LENGTH + IV_LENGTH, 1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from secret and salt
    const key = deriveKey(salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Use same AAD as encryption
    const aad = context ? `${APP_NAME}:${context}` : APP_NAME;
    decipher.setAAD(Buffer.from(aad));
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    // Don't leak information about decryption failures
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Utility function to check if a string appears to be encrypted
 * Performs more thorough validation
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }

  try {
    // Try to decode and check structure
    const decoded = Buffer.from(data, 'base64');
    const minLength = 1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;

    // Check minimum length and version
    return decoded.length >= minLength && decoded[0] === VERSION;
  } catch {
    return false;
  }
}

/**
 * Safe encryption function that only encrypts if not already encrypted
 */
export function safeEncrypt(text: string): string {
  if (!text) {
    return text;
  }

  return isEncrypted(text) ? text : encrypt(text);
}

/**
 * Safe decryption function that only decrypts if the data appears encrypted
 */
export function safeDecrypt(encryptedData: string): string {
  if (!encryptedData) {
    return encryptedData;
  }

  return isEncrypted(encryptedData) ? decrypt(encryptedData) : encryptedData;
}
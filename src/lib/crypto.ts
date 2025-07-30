import crypto from 'crypto';
import { env } from './env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const TAG_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 32;

/**
 * Derives a key from the BETTER_AUTH_SECRET using PBKDF2
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(env.BETTER_AUTH_SECRET, salt, 100000, 32, 'sha512');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns a base64 encoded string containing salt:iv:tag:encryptedData
 */
export function encrypt(text: string): string {
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
  cipher.setAAD(Buffer.from('hiring-assistant')); // Additional authenticated data
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Get the authentication tag
  const tag = cipher.getAuthTag();
  
  // Combine salt, iv, tag, and encrypted data
  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  
  // Return base64 encoded result
  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with the encrypt function
 * Expects a base64 encoded string containing salt:iv:tag:encryptedData
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Encrypted data cannot be empty');
  }

  try {
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from secret and salt
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('hiring-assistant')); // Same AAD as encryption
    decipher.setAuthTag(tag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to check if a string appears to be encrypted
 * (basic check - looks for base64 pattern of expected length)
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }
  
  // Check if it's a valid base64 string of expected minimum length
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const minLength = Math.ceil((SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 16) / 3) * 4; // Base64 encoded length
  
  return base64Regex.test(data) && data.length >= minLength;
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
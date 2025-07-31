import { createHash } from 'crypto';

/**
 * Calculate SHA-256 hash of file buffer for deduplication
 * @param fileBuffer - The file buffer to hash
 * @returns SHA-256 hash as hexadecimal string
 */
export function calculateFileHash(fileBuffer: Buffer): string {
  return createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Generate a content-based unique identifier combining hash with metadata
 * @param fileBuffer - The file buffer to hash
 * @param userId - User ID for scoping
 * @param additionalContext - Optional additional context (e.g., applicant email)
 * @returns Combined hash for more specific deduplication
 */
export function calculateContentHash(
  fileBuffer: Buffer, 
  userId: string, 
  additionalContext?: string
): string {
  const fileHash = calculateFileHash(fileBuffer);
  const contextString = additionalContext ? `${userId}:${additionalContext}` : userId;
  return createHash('sha256').update(`${fileHash}:${contextString}`).digest('hex');
}

/**
 * Generate a simple hash combining file content and size for quick comparison
 * @param fileBuffer - The file buffer to hash
 * @param fileSize - File size in bytes
 * @returns Combined hash string
 */
export function calculateQuickHash(fileBuffer: Buffer, fileSize: number): string {
  const fileHash = calculateFileHash(fileBuffer);
  return createHash('sha256').update(`${fileHash}:${fileSize}`).digest('hex');
}
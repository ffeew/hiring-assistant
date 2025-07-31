import { db } from './db';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import type { ResultSet } from '@libsql/client';
import * as schema from './schema';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

type TransactionType = SQLiteTransaction<
  'async',
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Execute a function within a database transaction
 * @param fn Function to execute within the transaction
 * @returns Promise resolving to the function's return value
 */
export async function withTransaction<T>(
  fn: (tx: TransactionType) => Promise<T>
): Promise<T> {
  return await db.transaction(fn);
}

/**
 * Execute a function within a database transaction with retry logic
 * @param fn Function to execute within the transaction
 * @param maxRetries Maximum number of retries (default: 3)
 * @returns Promise resolving to the function's return value
 */
export async function withTransactionRetry<T>(
  fn: (tx: TransactionType) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.transaction(fn);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry for validation errors or user errors
      if (lastError.message.includes('UNIQUE constraint') ||
        lastError.message.includes('NOT NULL constraint') ||
        lastError.message.includes('CHECK constraint')) {
        throw lastError;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      console.warn(`Transaction attempt ${attempt} failed, retrying...`, lastError.message);

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 100));
    }
  }

  throw lastError!;
}

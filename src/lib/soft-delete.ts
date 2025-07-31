import { SQL, and, isNull, isNotNull } from 'drizzle-orm';
import { SQLiteColumn } from 'drizzle-orm/sqlite-core';

/**
 * Utility functions for soft delete operations with Drizzle ORM
 */

/**
 * Creates a condition to filter out soft-deleted records
 * @param deletedAtColumn - The deletedAt column from the table
 * @returns SQL condition that filters out deleted records
 */
export function notDeleted(deletedAtColumn: SQLiteColumn): SQL<unknown> {
  return isNull(deletedAtColumn);
}

/**
 * Creates a condition to include only soft-deleted records
 * @param deletedAtColumn - The deletedAt column from the table
 * @returns SQL condition that includes only deleted records
 */
export function onlyDeleted(deletedAtColumn: SQLiteColumn): SQL<unknown> {
  return isNotNull(deletedAtColumn);
}

/**
 * Combines multiple WHERE conditions with notDeleted filter
 * @param deletedAtColumn - The deletedAt column from the table
 * @param conditions - Additional WHERE conditions
 * @returns Combined SQL conditions
 */
export function withNotDeleted(
  deletedAtColumn: SQLiteColumn,
  ...conditions: SQL<unknown>[]
): SQL<unknown> {
  const allConditions = [notDeleted(deletedAtColumn), ...conditions];
  return and(...allConditions) as SQL<unknown>;
}

/**
 * Creates soft delete data object
 * @returns Object with deletedAt set to current timestamp
 */
export function softDeleteData() {
  return {
    deletedAt: new Date(),
  };
}

/**
 * Creates restore data object (undelete)
 * @returns Object with deletedAt set to null
 */
export function restoreData() {
  return {
    deletedAt: null,
  };
}

/**
 * Type guard to check if a record is soft deleted
 * @param record - Record with optional deletedAt field
 * @returns True if record is soft deleted
 */
export function isSoftDeleted(record: { deletedAt?: Date | null }): boolean {
  return record.deletedAt !== null && record.deletedAt !== undefined;
}

/**
 * Filters out soft-deleted records from an array
 * @param records - Array of records with deletedAt field
 * @returns Array of non-deleted records
 */
export function filterDeleted<T extends { deletedAt?: Date | null }>(records: T[]): T[] {
  return records.filter(record => !isSoftDeleted(record));
}

/**
 * Gets only soft-deleted records from an array
 * @param records - Array of records with deletedAt field
 * @returns Array of deleted records
 */
export function filterNotDeleted<T extends { deletedAt?: Date | null }>(records: T[]): T[] {
  return records.filter(record => isSoftDeleted(record));
}

/**
 * Counts non-deleted records in an array
 * @param records - Array of records with deletedAt field
 * @returns Count of non-deleted records
 */
export function countNotDeleted<T extends { deletedAt?: Date | null }>(records: T[]): number {
  return filterDeleted(records).length;
}

/**
 * Counts soft-deleted records in an array
 * @param records - Array of records with deletedAt field
 * @returns Count of deleted records
 */
export function countDeleted<T extends { deletedAt?: Date | null }>(records: T[]): number {
  return filterNotDeleted(records).length;
}
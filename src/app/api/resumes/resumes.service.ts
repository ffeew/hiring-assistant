import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { resumeFile as resumeFileTable, applicant as applicantTable } from '@/lib/db/schema';
import { r2Service } from '@/lib/r2';
import { randomUUID } from 'node:crypto';
import { SUPPORTED_FILE_TYPES } from '@/app/types';
import { eq } from 'drizzle-orm';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';
import type { GetResumeFilesQuery } from './resumes.validator';

export class ResumesService {
  static async uploadResumeFile(file: File, applicantId: string, userId: string) {
    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
      throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Use transaction to ensure atomicity of upload and database record creation
    const { newResumeFile, uploadResult } = await withTransaction(async (tx) => {
      // Upload to R2 first
      const uploadResult = await r2Service.uploadFile(
        fileBuffer,
        file.name,
        file.type,
        userId
      );

      // Save file record to database
      const resumeFileId = randomUUID();
      const [newResumeFile] = await tx
        .insert(resumeFileTable)
        .values({
          id: resumeFileId,
          applicantId,
          fileName: file.name,
          filePath: uploadResult.filePath,
          fileSize: file.size,
          mimeType: file.type,
          resumeContent: null, // Will be populated when content is extracted
          extractionStatus: 'pending',
          extractionError: null,
          createdAt: new Date(),
        })
        .returning();

      return { newResumeFile, uploadResult };
    });

    return {
      ...newResumeFile,
      url: uploadResult.url,
    };
  }

  static async getResumeFiles(query: GetResumeFilesQuery, userId?: string) {
    const { applicantId } = query;

    if (applicantId) {
      // Get resume files for specific applicant (excluding soft-deleted)
      const resumeFiles = await db
        .select()
        .from(resumeFileTable)
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(resumeFileTable.applicantId, applicantId)
          )
        );

      // Add public URLs to the response
      return resumeFiles.map(file => ({
        ...file,
        url: r2Service.getPublicUrl(file.filePath),
      }));
    } else if (userId) {
      // Get all resume files for the user (via applicant relationship)
      const resumeFiles = await db
        .select({
          id: resumeFileTable.id,
          applicantId: resumeFileTable.applicantId,
          fileName: resumeFileTable.fileName,
          filePath: resumeFileTable.filePath,
          fileSize: resumeFileTable.fileSize,
          mimeType: resumeFileTable.mimeType,
          fileHash: resumeFileTable.fileHash,
          resumeContent: resumeFileTable.resumeContent,
          extractionStatus: resumeFileTable.extractionStatus,
          extractionError: resumeFileTable.extractionError,
          createdAt: resumeFileTable.createdAt,
          deletedAt: resumeFileTable.deletedAt,
          applicantFirstName: applicantTable.firstName,
          applicantLastName: applicantTable.lastName,
          applicantEmail: applicantTable.email,
        })
        .from(resumeFileTable)
        .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(applicantTable.userId, userId)
          )
        );

      // Add public URLs to the response
      return resumeFiles.map(file => ({
        ...file,
        url: r2Service.getPublicUrl(file.filePath),
      }));
    } else {
      return [];
    }
  }

  static async getResumeFileById(resumeFileId: string) {
    const [resumeFile] = await db
      .select()
      .from(resumeFileTable)
      .where(
        withNotDeleted(
          resumeFileTable.deletedAt,
          eq(resumeFileTable.id, resumeFileId)
        )
      )
      .limit(1);

    if (!resumeFile) {
      return null;
    }

    return {
      ...resumeFile,
      url: r2Service.getPublicUrl(resumeFile.filePath),
    };
  }

  static async getResumeFileByIdWithUserCheck(resumeFileId: string, userId: string) {
    // Get resume file with applicant verification
    const [resumeFile] = await db
      .select({
        resumeFile: resumeFileTable,
        applicant: applicantTable,
      })
      .from(resumeFileTable)
      .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
      .where(
        withNotDeleted(
          resumeFileTable.deletedAt,
          eq(resumeFileTable.id, resumeFileId),
          eq(applicantTable.userId, userId)
        )
      )
      .limit(1);

    if (!resumeFile) {
      return null;
    }

    return {
      ...resumeFile.resumeFile,
      url: r2Service.getPublicUrl(resumeFile.resumeFile.filePath),
    };
  }

  static async updateResumeFile(resumeFileId: string, userId: string, updateData: {
    resumeContent?: string;
    extractionStatus?: string;
    extractionError?: string;
  }) {
    const updatedResumeFile = await withTransaction(async (tx) => {
      // Get resume file with applicant verification
      const [existingResumeFile] = await tx
        .select({
          resumeFile: resumeFileTable,
          applicant: applicantTable,
        })
        .from(resumeFileTable)
        .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(resumeFileTable.id, resumeFileId),
            eq(applicantTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingResumeFile) {
        throw new Error('Resume file not found');
      }

      // Update resume file record
      const updateFields: Record<string, unknown> = {};

      if (updateData.resumeContent !== undefined) {
        updateFields.resumeContent = updateData.resumeContent;
      }

      if (updateData.extractionStatus !== undefined) {
        updateFields.extractionStatus = updateData.extractionStatus;
      }

      if (updateData.extractionError !== undefined) {
        updateFields.extractionError = updateData.extractionError;
      }

      const [updated] = await tx
        .update(resumeFileTable)
        .set(updateFields)
        .where(eq(resumeFileTable.id, resumeFileId))
        .returning();

      return updated;
    });

    return {
      ...updatedResumeFile,
      url: r2Service.getPublicUrl(updatedResumeFile.filePath),
    };
  }

  static async deleteResumeFile(resumeFileId: string, userId: string) {
    const resumeFile = await withTransaction(async (tx) => {
      // Get resume file with applicant verification
      const [resumeFileRecord] = await tx
        .select({
          resumeFile: resumeFileTable,
          applicant: applicantTable,
        })
        .from(resumeFileTable)
        .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(resumeFileTable.id, resumeFileId),
            eq(applicantTable.userId, userId)
          )
        )
        .limit(1);

      if (!resumeFileRecord) {
        throw new Error('Resume file not found');
      }

      // Soft delete record from database first
      await tx
        .update(resumeFileTable)
        .set(softDeleteData())
        .where(eq(resumeFileTable.id, resumeFileId));

      // Delete file from R2 storage
      try {
        await r2Service.deleteFile(resumeFileRecord.resumeFile.filePath);
      } catch (error) {
        // Log the error but don't fail the operation
        console.warn('Failed to delete file from R2 storage:', error);
      }

      return resumeFileRecord.resumeFile;
    });

    return resumeFile;
  }
}
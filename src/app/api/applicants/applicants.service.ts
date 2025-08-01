import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { applicant as applicantTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';
import type { GetApplicantsQuery, CreateApplicantBody, UpdateApplicantBody } from './applicants.validator';
import type { APPLICANT_STATUS } from '@/app/types';

export class ApplicantsService {
  static async getApplicants(userId: string, query: GetApplicantsQuery) {
    const { jobPostId, status } = query;

    // Build where conditions (including soft delete filter)
    const baseConditions = [eq(applicantTable.userId, userId)];

    if (jobPostId) {
      baseConditions.push(eq(applicantTable.jobPostId, jobPostId));
    }

    if (status) {
      baseConditions.push(eq(applicantTable.status, status as typeof APPLICANT_STATUS[number]));
    }

    // Fetch applicants (excluding soft-deleted ones)
    const applicants = await db
      .select()
      .from(applicantTable)
      .where(withNotDeleted(applicantTable.deletedAt, ...baseConditions))
      .orderBy(desc(applicantTable.createdAt));

    // Parse metadata JSON strings
    return applicants.map(applicant => ({
      ...applicant,
      metadata: applicant.metadata ? JSON.parse(applicant.metadata) : null,
    }));
  }

  static async createApplicant(userId: string, data: CreateApplicantBody) {
    const {
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      metadata,
      notes,
      jobPostId,
      status = 'applied',
      source = 'manual'
    } = data;

    // Use transaction to ensure atomicity
    const newApplicant = await withTransaction(async (tx) => {
      // Check if applicant with same email already exists for this user (excluding soft-deleted)
      const existingApplicant = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.userId, userId),
            eq(applicantTable.email, email)
          )
        )
        .limit(1);

      if (existingApplicant.length > 0) {
        throw new Error('An applicant with this email already exists');
      }

      // Create new applicant
      const [createdApplicant] = await tx
        .insert(applicantTable)
        .values({
          id: randomUUID(),
          userId,
          jobPostId: jobPostId || null,
          firstName,
          lastName,
          email,
          phone: phone || null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          notes: notes || null,
          status,
          source,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return createdApplicant;
    });

    // Parse metadata for response
    return {
      ...newApplicant,
      metadata: newApplicant.metadata ? JSON.parse(newApplicant.metadata) : null,
    };
  }

  static async getApplicantById(userId: string, applicantId: string) {
    const [applicant] = await db
      .select()
      .from(applicantTable)
      .where(
        withNotDeleted(
          applicantTable.deletedAt,
          eq(applicantTable.id, applicantId),
          eq(applicantTable.userId, userId)
        )
      )
      .limit(1);

    if (!applicant) {
      return null;
    }

    // Parse metadata JSON string
    return {
      ...applicant,
      metadata: applicant.metadata ? JSON.parse(applicant.metadata) : null,
    };
  }

  static async updateApplicant(userId: string, applicantId: string, data: UpdateApplicantBody) {
    // Use transaction to ensure atomicity
    const updatedApplicant = await withTransaction(async (tx) => {
      // Check if applicant exists and belongs to user
      const [existingApplicant] = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, applicantId),
            eq(applicantTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingApplicant) {
        throw new Error('Applicant not found');
      }

      // Update applicant
      const updateData: Record<string, unknown> = {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updated] = await tx
        .update(applicantTable)
        .set(updateData)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, applicantId),
            eq(applicantTable.userId, userId)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Failed to update applicant');
      }

      return updated;
    });

    // Parse metadata for response
    return {
      ...updatedApplicant,
      metadata: updatedApplicant.metadata ? JSON.parse(updatedApplicant.metadata) : null,
    };
  }

  static async deleteApplicant(userId: string, applicantId: string) {
    // Use transaction to ensure atomicity of soft delete
    await withTransaction(async (tx) => {
      // Check if applicant exists and belongs to user
      const [existingApplicant] = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, applicantId),
            eq(applicantTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingApplicant) {
        throw new Error('Applicant not found');
      }

      // Soft delete applicant
      await tx
        .update(applicantTable)
        .set(softDeleteData())
        .where(eq(applicantTable.id, applicantId));
    });
  }
}
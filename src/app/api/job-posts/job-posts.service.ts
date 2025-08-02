import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { jobPost } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';
import { 
  safeParseJSON,
  requirementsSchema,
  responsibilitiesSchema,
  benefitsSchema
} from '@/lib/json-utils';
import type { GetJobPostsQuery, CreateJobPostBody, UpdateJobPostBody } from './job-posts.validator';

export class JobPostsService {
  static async getJobPosts(userId: string, query: GetJobPostsQuery) {
    const { active } = query;
    const activeOnly = active === 'true';

    const baseConditions = [eq(jobPost.userId, userId)];

    if (activeOnly) {
      baseConditions.push(eq(jobPost.isActive, true));
    }

    // Get job posts (excluding soft-deleted ones)
    const jobPosts = await db
      .select()
      .from(jobPost)
      .where(withNotDeleted(jobPost.deletedAt, ...baseConditions))
      .orderBy(desc(jobPost.createdAt));

    // Parse JSON fields
    return jobPosts.map(post => ({
      ...post,
      requirements: safeParseJSON(post.requirements, requirementsSchema, []),
      responsibilities: safeParseJSON(post.responsibilities, responsibilitiesSchema, []),
      benefits: safeParseJSON(post.benefits, benefitsSchema, []),
    }));
  }

  static async createJobPost(userId: string, data: CreateJobPostBody) {
    const newJobPost = {
      id: randomUUID(),
      userId,
      title: data.title,
      department: data.department || null,
      location: data.location || null,
      employmentType: data.employmentType || null,
      experienceLevel: data.experienceLevel || null,
      description: data.description,
      requirements: data.requirements ? JSON.stringify(data.requirements) : null,
      responsibilities: data.responsibilities ? JSON.stringify(data.responsibilities) : null,
      benefits: data.benefits ? JSON.stringify(data.benefits) : null,
      salaryRange: data.salaryRange || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdJobPost] = await db.insert(jobPost).values(newJobPost).returning();

    // Parse JSON fields for response
    return {
      ...createdJobPost,
      requirements: safeParseJSON(createdJobPost.requirements, requirementsSchema, []),
      responsibilities: safeParseJSON(createdJobPost.responsibilities, responsibilitiesSchema, []),
      benefits: safeParseJSON(createdJobPost.benefits, benefitsSchema, []),
    };
  }

  static async getJobPostById(userId: string, jobPostId: string) {
    const [jobPostRecord] = await db
      .select()
      .from(jobPost)
      .where(
        withNotDeleted(
          jobPost.deletedAt,
          eq(jobPost.id, jobPostId),
          eq(jobPost.userId, userId)
        )
      )
      .limit(1);

    if (!jobPostRecord) {
      return null;
    }

    // Parse JSON fields
    return {
      ...jobPostRecord,
      requirements: safeParseJSON(jobPostRecord.requirements, requirementsSchema, []),
      responsibilities: safeParseJSON(jobPostRecord.responsibilities, responsibilitiesSchema, []),
      benefits: safeParseJSON(jobPostRecord.benefits, benefitsSchema, []),
    };
  }

  static async updateJobPost(userId: string, jobPostId: string, data: UpdateJobPostBody) {
    const updatedJobPost = await withTransaction(async (tx) => {
      // Check if job post exists and belongs to user
      const [existingJobPost] = await tx
        .select()
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, jobPostId),
            eq(jobPost.userId, userId)
          )
        )
        .limit(1);

      if (!existingJobPost) {
        throw new Error('Job post not found');
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        ...data,
        requirements: data.requirements ? JSON.stringify(data.requirements) : undefined,
        responsibilities: data.responsibilities ? JSON.stringify(data.responsibilities) : undefined,
        benefits: data.benefits ? JSON.stringify(data.benefits) : undefined,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updated] = await tx
        .update(jobPost)
        .set(updateData)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, jobPostId),
            eq(jobPost.userId, userId)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Failed to update job post');
      }

      return updated;
    });

    // Parse JSON fields for response
    return {
      ...updatedJobPost,
      requirements: safeParseJSON(updatedJobPost.requirements, requirementsSchema, []),
      responsibilities: safeParseJSON(updatedJobPost.responsibilities, responsibilitiesSchema, []),
      benefits: safeParseJSON(updatedJobPost.benefits, benefitsSchema, []),
    };
  }

  static async deleteJobPost(userId: string, jobPostId: string) {
    await withTransaction(async (tx) => {
      // Check if job post exists and belongs to user
      const [existingJobPost] = await tx
        .select()
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, jobPostId),
            eq(jobPost.userId, userId)
          )
        )
        .limit(1);

      if (!existingJobPost) {
        throw new Error('Job post not found');
      }

      // Soft delete job post
      await tx
        .update(jobPost)
        .set(softDeleteData())
        .where(eq(jobPost.id, jobPostId));
    });
  }
}
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { jobPost } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';
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
      requirements: post.requirements ? JSON.parse(post.requirements) : [],
      responsibilities: post.responsibilities ? JSON.parse(post.responsibilities) : [],
      benefits: post.benefits ? JSON.parse(post.benefits) : [],
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
      requirements: createdJobPost.requirements ? JSON.parse(createdJobPost.requirements) : [],
      responsibilities: createdJobPost.responsibilities ? JSON.parse(createdJobPost.responsibilities) : [],
      benefits: createdJobPost.benefits ? JSON.parse(createdJobPost.benefits) : [],
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
      requirements: jobPostRecord.requirements ? JSON.parse(jobPostRecord.requirements) : [],
      responsibilities: jobPostRecord.responsibilities ? JSON.parse(jobPostRecord.responsibilities) : [],
      benefits: jobPostRecord.benefits ? JSON.parse(jobPostRecord.benefits) : [],
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
      requirements: updatedJobPost.requirements ? JSON.parse(updatedJobPost.requirements) : [],
      responsibilities: updatedJobPost.responsibilities ? JSON.parse(updatedJobPost.responsibilities) : [],
      benefits: updatedJobPost.benefits ? JSON.parse(updatedJobPost.benefits) : [],
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
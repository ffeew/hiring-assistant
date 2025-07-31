import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { jobPost } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateJobPostSchema } from '@/app/types';
import { z } from 'zod';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';

async function getJobPost(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {

  try {
    const resolvedParams = await params;
    const [post] = await db
      .select()
      .from(jobPost)
      .where(
        withNotDeleted(
          jobPost.deletedAt,
          eq(jobPost.id, resolvedParams.id),
          eq(jobPost.userId, request.user.id)
        )
      )
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedJobPost = {
      ...post,
      requirements: post.requirements ? JSON.parse(post.requirements) : [],
      responsibilities: post.responsibilities ? JSON.parse(post.responsibilities) : [],
      benefits: post.benefits ? JSON.parse(post.benefits) : [],
    };

    return NextResponse.json({
      success: true,
      jobPost: parsedJobPost,
    });
  } catch (error) {
    console.error('Error fetching job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateJobPost(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = updateJobPostSchema.parse(body);

    // Use transaction to ensure atomicity
    const updatedJobPost = await withTransaction(async (tx) => {
      // Check if job post exists and belongs to user
      const [existingPost] = await tx
        .select()
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, resolvedParams.id),
            eq(jobPost.userId, request.user.id)
          )
        )
        .limit(1);

      if (!existingPost) {
        throw new Error('Job post not found');
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (validatedData.title !== undefined) updateData.title = validatedData.title;
      if (validatedData.department !== undefined) updateData.department = validatedData.department;
      if (validatedData.location !== undefined) updateData.location = validatedData.location;
      if (validatedData.employmentType !== undefined) updateData.employmentType = validatedData.employmentType;
      if (validatedData.experienceLevel !== undefined) updateData.experienceLevel = validatedData.experienceLevel;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.requirements !== undefined) updateData.requirements = JSON.stringify(validatedData.requirements);
      if (validatedData.responsibilities !== undefined) updateData.responsibilities = JSON.stringify(validatedData.responsibilities);
      if (validatedData.benefits !== undefined) updateData.benefits = JSON.stringify(validatedData.benefits);
      if (validatedData.salaryRange !== undefined) updateData.salaryRange = validatedData.salaryRange;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

      const [updated] = await tx
        .update(jobPost)
        .set(updateData)
        .where(eq(jobPost.id, resolvedParams.id))
        .returning();

      return updated;
    });

    // Parse JSON fields for response
    const responseJobPost = {
      ...updatedJobPost,
      requirements: updatedJobPost.requirements ? JSON.parse(updatedJobPost.requirements) : [],
      responsibilities: updatedJobPost.responsibilities ? JSON.parse(updatedJobPost.responsibilities) : [],
      benefits: updatedJobPost.benefits ? JSON.parse(updatedJobPost.benefits) : [],
    };

    return NextResponse.json({
      success: true,
      jobPost: responseJobPost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle custom errors
    if (error instanceof Error && error.message === 'Job post not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error updating job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteJobPost(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const resolvedParams = await params;

    // Use transaction to ensure atomicity
    await withTransaction(async (tx) => {
      // Check if job post exists and belongs to user
      const [existingPost] = await tx
        .select()
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, resolvedParams.id),
            eq(jobPost.userId, request.user.id)
          )
        )
        .limit(1);

      if (!existingPost) {
        throw new Error('Job post not found');
      }

      // Soft delete the job post
      await tx
        .update(jobPost)
        .set(softDeleteData())
        .where(eq(jobPost.id, resolvedParams.id));
    });

    return NextResponse.json({
      success: true,
      message: 'Job post deleted successfully',
    });
  } catch (error) {
    // Handle custom errors
    if (error instanceof Error && error.message === 'Job post not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error deleting job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuthParams(getJobPost);
export const PUT = withAuthParams(updateJobPost);
export const DELETE = withAuthParams(deleteJobPost);
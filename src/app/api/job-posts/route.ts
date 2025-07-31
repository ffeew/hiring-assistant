import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { jobPost } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createJobPostSchema } from '@/app/types';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted } from '@/lib/soft-delete';
import { nanoid } from 'nanoid';

async function getJobPosts(request: AuthenticatedRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const baseConditions = [eq(jobPost.userId, request.user.id)];

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
    const parsedJobPosts = jobPosts.map(post => ({
      ...post,
      requirements: post.requirements ? JSON.parse(post.requirements) : [],
      responsibilities: post.responsibilities ? JSON.parse(post.responsibilities) : [],
      benefits: post.benefits ? JSON.parse(post.benefits) : [],
    }));

    return NextResponse.json({
      success: true,
      jobPosts: parsedJobPosts,
    });
  } catch (error) {
    console.error('Error fetching job posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createJobPost(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = createJobPostSchema.parse(body);

    const newJobPost = {
      id: nanoid(),
      userId: request.user.id,
      title: validatedData.title,
      department: validatedData.department || null,
      location: validatedData.location || null,
      employmentType: validatedData.employmentType || null,
      experienceLevel: validatedData.experienceLevel || null,
      description: validatedData.description,
      requirements: validatedData.requirements ? JSON.stringify(validatedData.requirements) : null,
      responsibilities: validatedData.responsibilities ? JSON.stringify(validatedData.responsibilities) : null,
      benefits: validatedData.benefits ? JSON.stringify(validatedData.benefits) : null,
      salaryRange: validatedData.salaryRange || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdJobPost] = await db.insert(jobPost).values(newJobPost).returning();


    // Parse JSON fields for response
    const responseJobPost = {
      ...createdJobPost,
      requirements: createdJobPost.requirements ? JSON.parse(createdJobPost.requirements) : [],
      responsibilities: createdJobPost.responsibilities ? JSON.parse(createdJobPost.responsibilities) : [],
      benefits: createdJobPost.benefits ? JSON.parse(createdJobPost.benefits) : [],
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

    console.error('Error creating job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuth(getJobPosts);
export const POST = withAuth(createJobPost);
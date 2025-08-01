import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { JobPostsService } from './job-posts.service';
import { getJobPostsQuerySchema, createJobPostBodySchema } from './job-posts.validator';

async function getJobPosts(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      active: searchParams.get('active') || undefined,
    };

    // Validate query parameters
    const validatedQuery = getJobPostsQuerySchema.parse(queryParams);

    // Get job posts using service
    const jobPosts = await JobPostsService.getJobPosts(request.user.id, validatedQuery);

    return NextResponse.json({
      success: true,
      jobPosts,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

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

    // Validate request body
    const validatedData = createJobPostBodySchema.parse(body);

    // Create job post using service
    const jobPost = await JobPostsService.createJobPost(request.user.id, validatedData);

    return NextResponse.json({
      success: true,
      jobPost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
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
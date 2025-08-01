import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { JobPostsService } from '../job-posts.service';
import { jobPostParamsSchema, updateJobPostBodySchema } from '../job-posts.validator';

async function getJobPost(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;

    // Validate params
    const validatedParams = jobPostParamsSchema.parse({ id });

    // Get job post using service
    const jobPost = await JobPostsService.getJobPostById(request.user.id, validatedParams.id);

    if (!jobPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

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
    const { id } = await params;
    const body = await request.json();

    // Validate params and body
    const validatedParams = jobPostParamsSchema.parse({ id });
    const validatedData = updateJobPostBodySchema.parse(body);

    // Update job post using service
    const jobPost = await JobPostsService.updateJobPost(request.user.id, validatedParams.id, validatedData);

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

    // Handle business logic errors
    if (error instanceof Error && (error.message === 'Job post not found' || error.message === 'Failed to update job post')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Job post not found' ? 404 : 500 }
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
    const { id } = await params;

    // Validate params
    const validatedParams = jobPostParamsSchema.parse({ id });

    // Delete job post using service
    await JobPostsService.deleteJobPost(request.user.id, validatedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Job post deleted successfully',
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

    // Handle business logic errors
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
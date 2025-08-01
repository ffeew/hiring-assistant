import { NextResponse } from 'next/server';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ResumesService } from '../resumes.service';
import { resumeFileParamsSchema, updateResumeFileBodySchema } from '../resumes.validator';
import { ZodError } from 'zod';

async function getResumeFile(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;

    // Validate params
    const validatedParams = resumeFileParamsSchema.parse({ id });

    // Get resume file using service
    const resumeFile = await ResumesService.getResumeFileByIdWithUserCheck(validatedParams.id, request.user.id);

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resumeFile,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error('Error fetching resume file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume file' },
      { status: 500 }
    );
  }
}

async function deleteResumeFile(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;

    // Validate params
    const validatedParams = resumeFileParamsSchema.parse({ id });

    // Delete resume file using service
    await ResumesService.deleteResumeFile(validatedParams.id, request.user.id);

    return NextResponse.json({
      success: true,
      message: 'Resume file deleted successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error && error.message === 'Resume file not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error deleting resume file:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume file' },
      { status: 500 }
    );
  }
}

async function updateResumeFile(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate params and body
    const validatedParams = resumeFileParamsSchema.parse({ id });
    const validatedData = updateResumeFileBodySchema.parse(body);

    // Update resume file using service
    const resumeFile = await ResumesService.updateResumeFile(validatedParams.id, request.user.id, validatedData);

    return NextResponse.json({
      success: true,
      resumeFile,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error && error.message === 'Resume file not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error updating resume file:', error);
    return NextResponse.json(
      { error: 'Failed to update resume file' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuthParams(getResumeFile);
export const DELETE = withAuthParams(deleteResumeFile);
export const PUT = withAuthParams(updateResumeFile);
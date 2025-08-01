import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ResumesService } from './resumes.service';
import { getResumeFilesQuerySchema } from './resumes.validator';
import { ZodError } from 'zod';

async function uploadResumeFile(request: AuthenticatedRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicantId = formData.get('applicantId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Applicant ID is required' },
        { status: 400 }
      );
    }

    // Upload resume file using service
    const resumeFile = await ResumesService.uploadResumeFile(file, applicantId, request.user.id);

    return NextResponse.json({
      success: true,
      resumeFile,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Error uploading resume file:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume file' },
      { status: 500 }
    );
  }
}

async function getResumeFiles(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      applicantId: searchParams.get('applicantId') || undefined,
    };

    // Validate query parameters
    const validatedQuery = getResumeFilesQuerySchema.parse(queryParams);

    // Get resume files using service
    const resumeFiles = await ResumesService.getResumeFiles(validatedQuery, request.user.id);

    return NextResponse.json({
      success: true,
      resumeFiles,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Resume files validation error:', error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error('Error fetching resume files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const POST = withAuth(uploadResumeFile);
export const GET = withAuth(getResumeFiles);
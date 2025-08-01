import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ApplicantsService } from './applicants.service';
import { getApplicantsQuerySchema, createApplicantBodySchema } from './applicants.validator';

async function getApplicants(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      jobPostId: searchParams.get('jobPostId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    // Validate query parameters
    const validatedQuery = getApplicantsQuerySchema.parse(queryParams);

    // Get applicants using service
    const applicants = await ApplicantsService.getApplicants(request.user.id, validatedQuery);

    return NextResponse.json({
      success: true,
      applicants,
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

    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createApplicant(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createApplicantBodySchema.parse(body);

    // Create applicant using service
    const applicant = await ApplicantsService.createApplicant(request.user.id, validatedData);

    return NextResponse.json({
      success: true,
      applicant,
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
    if (error instanceof Error && error.message.includes('An applicant with this email already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating applicant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuth(getApplicants);
export const POST = withAuth(createApplicant);
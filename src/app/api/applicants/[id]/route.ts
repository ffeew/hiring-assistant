import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ApplicantsService } from '../applicants.service';
import { applicantParamsSchema, updateApplicantBodySchema } from '../applicants.validator';

async function getApplicant(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;

    // Validate params
    const validatedParams = applicantParamsSchema.parse({ id });

    // Get applicant using service
    const applicant = await ApplicantsService.getApplicantById(request.user.id, validatedParams.id);

    if (!applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

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

    console.error('Error fetching applicant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateApplicant(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate params and body
    const validatedParams = applicantParamsSchema.parse({ id });
    const validatedData = updateApplicantBodySchema.parse(body);

    // Update applicant using service
    const applicant = await ApplicantsService.updateApplicant(request.user.id, validatedParams.id, validatedData);

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
    if (error instanceof Error && (
      error.message === 'Applicant not found' ||
      error.message === 'Failed to update applicant'
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Applicant not found' ? 404 : 500 }
      );
    }

    console.error('Error updating applicant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteApplicant(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;

    // Validate params
    const validatedParams = applicantParamsSchema.parse({ id });

    // Delete applicant using service
    await ApplicantsService.deleteApplicant(request.user.id, validatedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Applicant deleted successfully',
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
    if (error instanceof Error && error.message === 'Applicant not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error deleting applicant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const GET = withAuthParams(getApplicant);
export const PUT = withAuthParams(updateApplicant);
export const DELETE = withAuthParams(deleteApplicant);
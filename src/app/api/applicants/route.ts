import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { applicant as applicantTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { APPLICANT_STATUS, createApplicantSchema } from '@/app/types';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted } from '@/lib/soft-delete';

async function getApplicants(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostId = searchParams.get('jobPostId');
    const status = searchParams.get('status');

    // Build where conditions (including soft delete filter)
    const baseConditions = [eq(applicantTable.userId, request.user.id)];

    if (jobPostId) {
      baseConditions.push(eq(applicantTable.jobPostId, jobPostId));
    }

    if (status) {
      baseConditions.push(eq(applicantTable.status, status as typeof APPLICANT_STATUS[number]));
    }

    // Fetch applicants (excluding soft-deleted ones)
    const applicants = await db
      .select()
      .from(applicantTable)
      .where(withNotDeleted(applicantTable.deletedAt, ...baseConditions))
      .orderBy(desc(applicantTable.createdAt));

    // Parse metadata JSON strings
    const applicantsWithParsedMetadata = applicants.map(applicant => ({
      ...applicant,
      metadata: applicant.metadata ? JSON.parse(applicant.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      applicants: applicantsWithParsedMetadata,
    });
  } catch (error) {
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

    // Validate request body with Zod
    const validatedData = createApplicantSchema.parse(body);
    const {
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      metadata,
      notes,
      jobPostId,
      status = 'applied',
      source = 'manual'
    } = validatedData;

    // Use transaction to ensure atomicity
    const newApplicant = await withTransaction(async (tx) => {
      // Check if applicant with same email already exists for this user (excluding soft-deleted)
      const existingApplicant = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.userId, request.user.id),
            eq(applicantTable.email, email)
          )
        )
        .limit(1);

      if (existingApplicant.length > 0) {
        throw new Error('An applicant with this email already exists');
      }

      // Create new applicant
      const [createdApplicant] = await tx
        .insert(applicantTable)
        .values({
          id: randomUUID(),
          userId: request.user.id,
          jobPostId: jobPostId || null,
          firstName,
          lastName,
          email,
          phone: phone || null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          notes: notes || null,
          status,
          source,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return createdApplicant;
    });

    // Parse metadata for response
    const applicantResponse = {
      ...newApplicant,
      metadata: newApplicant.metadata ? JSON.parse(newApplicant.metadata) : null,
    };

    return NextResponse.json({
      success: true,
      applicant: applicantResponse,
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

    // Handle unique constraint errors
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
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { applicant as applicantTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateApplicantSchema } from '@/app/types';
import { ZodError } from 'zod';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';

async function getApplicant(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {

  try {
    const { id } = await params;

    const [applicant] = await db
      .select()
      .from(applicantTable)
      .where(
        withNotDeleted(
          applicantTable.deletedAt,
          eq(applicantTable.id, id),
          eq(applicantTable.userId, request.user.id)
        )
      )
      .limit(1);

    if (!applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Parse metadata JSON string
    const applicantResponse = {
      ...applicant,
      metadata: applicant.metadata ? JSON.parse(applicant.metadata) : null,
    };

    return NextResponse.json({
      success: true,
      applicant: applicantResponse,
    });
  } catch (error) {
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

    // Validate request body with Zod
    const validatedData = updateApplicantSchema.parse(body);

    // Use transaction to ensure atomicity
    const updatedApplicant = await withTransaction(async (tx) => {
      // Check if applicant exists and belongs to user
      const [existingApplicant] = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, id),
            eq(applicantTable.userId, request.user.id)
          )
        )
        .limit(1);

      if (!existingApplicant) {
        throw new Error('Applicant not found');
      }

      // Update applicant
      const updateData: Record<string, unknown> = {
        ...validatedData,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : undefined,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updated] = await tx
        .update(applicantTable)
        .set(updateData)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, id),
            eq(applicantTable.userId, request.user.id)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Failed to update applicant');
      }

      return updated;
    });

    // Parse metadata for response
    const applicantResponse = {
      ...updatedApplicant,
      metadata: updatedApplicant.metadata ? JSON.parse(updatedApplicant.metadata) : null,
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

    // Handle custom errors
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

    // Use transaction to ensure atomicity of soft delete
    await withTransaction(async (tx) => {
      // Check if applicant exists and belongs to user
      const [existingApplicant] = await tx
        .select()
        .from(applicantTable)
        .where(
          withNotDeleted(
            applicantTable.deletedAt,
            eq(applicantTable.id, id),
            eq(applicantTable.userId, request.user.id)
          )
        )
        .limit(1);

      if (!existingApplicant) {
        throw new Error('Applicant not found');
      }

      // Soft delete applicant
      await tx
        .update(applicantTable)
        .set(softDeleteData())
        .where(eq(applicantTable.id, id));
    });

    return NextResponse.json({
      success: true,
      message: 'Applicant deleted successfully',
    });
  } catch (error) {
    // Handle custom errors
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
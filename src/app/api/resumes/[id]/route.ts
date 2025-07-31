import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { resumeFile as resumeFileTable, applicant as applicantTable } from '@/lib/db/schema';
import { r2Service } from '@/lib/r2';
import { eq } from 'drizzle-orm';
import { withAuthParams, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';

async function getResumeFile(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {

  try {
    const { id } = await params;

    // Get resume file with applicant verification
    const [resumeFile] = await db
      .select({
        resumeFile: resumeFileTable,
        applicant: applicantTable,
      })
      .from(resumeFileTable)
      .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
      .where(
        withNotDeleted(
          resumeFileTable.deletedAt,
          eq(resumeFileTable.id, id),
          eq(applicantTable.userId, request.user.id)
        )
      )
      .limit(1);

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume file not found' },
        { status: 404 }
      );
    }

    // Add public URL to the response
    const resumeFileWithUrl = {
      ...resumeFile.resumeFile,
      url: r2Service.getPublicUrl(resumeFile.resumeFile.filePath),
    };

    return NextResponse.json({
      success: true,
      resumeFile: resumeFileWithUrl,
    });

  } catch (error) {
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

    // Use transaction to ensure atomicity of deletion
    const resumeFile = await withTransaction(async (tx) => {
      // Get resume file with applicant verification
      const [resumeFileRecord] = await tx
        .select({
          resumeFile: resumeFileTable,
          applicant: applicantTable,
        })
        .from(resumeFileTable)
        .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(resumeFileTable.id, id),
            eq(applicantTable.userId, request.user.id)
          )
        )
        .limit(1);

      if (!resumeFileRecord) {
        throw new Error('Resume file not found');
      }

      // Soft delete record from database first
      await tx
        .update(resumeFileTable)
        .set(softDeleteData())
        .where(eq(resumeFileTable.id, id));

      // Delete file from R2 storage
      await r2Service.deleteFile(resumeFile.filePath);

      return resumeFileRecord.resumeFile;
    });


    return NextResponse.json({
      success: true,
      message: 'Resume file deleted successfully',
    });

  } catch (error) {
    // Handle custom errors
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
    const { resumeContent, extractionStatus, extractionError } = body;

    // Use transaction to ensure atomicity
    const updatedResumeFile = await withTransaction(async (tx) => {
      // Get resume file with applicant verification
      const [existingResumeFile] = await tx
        .select({
          resumeFile: resumeFileTable,
          applicant: applicantTable,
        })
        .from(resumeFileTable)
        .innerJoin(applicantTable, eq(resumeFileTable.applicantId, applicantTable.id))
        .where(
          withNotDeleted(
            resumeFileTable.deletedAt,
            eq(resumeFileTable.id, id),
            eq(applicantTable.userId, request.user.id)
          )
        )
        .limit(1);

      if (!existingResumeFile) {
        throw new Error('Resume file not found');
      }

      // Update resume file record
      const updateData: Record<string, unknown> = {};

      if (resumeContent !== undefined) {
        updateData.resumeContent = resumeContent;
      }

      if (extractionStatus !== undefined) {
        updateData.extractionStatus = extractionStatus;
      }

      if (extractionError !== undefined) {
        updateData.extractionError = extractionError;
      }

      const [updated] = await tx
        .update(resumeFileTable)
        .set(updateData)
        .where(eq(resumeFileTable.id, id))
        .returning();

      return updated;
    });

    // Add public URL to the response
    const resumeFileWithUrl = {
      ...updatedResumeFile,
      url: r2Service.getPublicUrl(updatedResumeFile.filePath),
    };

    return NextResponse.json({
      success: true,
      resumeFile: resumeFileWithUrl,
    });

  } catch (error) {
    // Handle custom errors
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
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { withTransaction } from '@/lib/db/transaction';
import { resumeFile as resumeFileTable } from '@/lib/db/schema';
import { r2Service } from '@/lib/r2';
import { nanoid } from 'nanoid';
import { SUPPORTED_FILE_TYPES } from '@/app/types';
import { eq } from 'drizzle-orm';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted } from '@/lib/soft-delete';

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

    // Validate file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or DOCX files only.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Use transaction to ensure atomicity of upload and database record creation
    const { newResumeFile, uploadResult } = await withTransaction(async (tx) => {
      // Upload to R2 first
      const uploadResult = await r2Service.uploadFile(
        fileBuffer,
        file.name,
        file.type,
        request.user.id
      );

      // Save file record to database
      const resumeFileId = nanoid();
      const [newResumeFile] = await tx
        .insert(resumeFileTable)
        .values({
          id: resumeFileId,
          applicantId,
          fileName: file.name,
          filePath: uploadResult.filePath,
          fileSize: file.size,
          mimeType: file.type,
          resumeContent: null, // Will be populated when content is extracted
          extractionStatus: 'pending',
          extractionError: null,
          createdAt: new Date(),
        })
        .returning();

      return { newResumeFile, uploadResult };
    });

    return NextResponse.json({
      success: true,
      resumeFile: {
        ...newResumeFile,
        url: uploadResult.url,
      },
    });

  } catch (error) {
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
    const applicantId = searchParams.get('applicantId');

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Applicant ID is required' },
        { status: 400 }
      );
    }

    // Get resume files for the applicant (excluding soft-deleted)
    const resumeFiles = await db
      .select()
      .from(resumeFileTable)
      .where(
        withNotDeleted(
          resumeFileTable.deletedAt,
          eq(resumeFileTable.applicantId, applicantId)
        )
      );

    // Add public URLs to the response
    const resumeFilesWithUrls = resumeFiles.map(file => ({
      ...file,
      url: r2Service.getPublicUrl(file.filePath),
    }));

    return NextResponse.json({
      success: true,
      resumeFiles: resumeFilesWithUrls,
    });

  } catch (error) {
    console.error('Error fetching resume files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume files' },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const POST = withAuth(uploadResumeFile);
export const GET = withAuth(getResumeFiles);
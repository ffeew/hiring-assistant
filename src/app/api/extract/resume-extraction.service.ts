import { db } from '@/lib/db/db';
import { applicant, resumeFile } from '@/lib/db/schema';
import { eq, InferSelectModel } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { calculateFileHash } from '@/lib/hash';
import { withNotDeleted } from '@/lib/soft-delete';
import {
  type ResumeExtractionData
} from '@/app/types';

export async function findOrCreateApplicant(
  userId: string,
  extractedData: ResumeExtractionData
): Promise<string> {
  // Check if applicant exists by email
  const existingApplicant = await db
    .select()
    .from(applicant)
    .where(eq(applicant.email, extractedData.email))
    .limit(1);

  if (existingApplicant.length > 0) {
    return existingApplicant[0].id;
  }

  // Create new applicant using validated schema
  const applicantId = randomUUID();

  // Prepare metadata from extracted data
  const metadata = {
    skills: extractedData.skills,
    experience: extractedData.experience,
    education: extractedData.education,
  };

  await db.insert(applicant).values({
    id: applicantId,
    userId,
    firstName: extractedData.firstName,
    lastName: extractedData.lastName,
    email: extractedData.email,
    phone: extractedData.phone || undefined,
    linkedinUrl: extractedData.linkedinUrl || undefined,
    githubUrl: extractedData.githubUrl || undefined,
    portfolioUrl: extractedData.portfolioUrl || undefined,
    status: 'applied',
    source: 'bulk_upload',
    metadata: JSON.stringify(metadata),
  });

  return applicantId;
}

export async function createResumeRecord(
  applicantId: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  extractedText: string,
  fileHash: string
): Promise<string> {
  const resumeId = randomUUID();

  await db.insert(resumeFile).values({
    id: resumeId,
    applicantId,
    fileName,
    filePath,
    fileSize,
    mimeType,
    fileHash,
    resumeContent: extractedText,
    extractionStatus: 'success',
  });

  return resumeId;
}

export async function findExistingResumeByHash(
  userId: string,
  fileHash: string
): Promise<{ resumeId: string; applicantId: string; firstName: string; lastName: string; email: string; } | null> {
  // Check if a resume with this hash already exists for this user
  const existingResume = await db
    .select({
      resumeId: resumeFile.id,
      applicantId: resumeFile.applicantId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
    })
    .from(resumeFile)
    .innerJoin(applicant, eq(resumeFile.applicantId, applicant.id))
    .where(
      withNotDeleted(
        resumeFile.deletedAt,
        eq(resumeFile.fileHash, fileHash),
        eq(applicant.userId, userId)
      )
    )
    .limit(1);

  return existingResume.length > 0 ? existingResume[0] : null;
}

export async function checkForDuplicateResume(
  userId: string,
  fileBuffer: Buffer
): Promise<{
  isDuplicate: boolean;
  resumeId?: string;
  applicantId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  fileHash: string;
}> {
  // Calculate file hash
  const fileHash = calculateFileHash(fileBuffer);

  // Check if this hash already exists for this user
  const existing = await findExistingResumeByHash(userId, fileHash);

  if (existing) {
    return {
      isDuplicate: true,
      resumeId: existing.resumeId,
      applicantId: existing.applicantId,
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      fileHash,
    };
  }

  return {
    isDuplicate: false,
    fileHash,
  };
}

export async function updateResumeExtractionError(
  resumeId: string,
  error: string
): Promise<void> {
  await db
    .update(resumeFile)
    .set({
      extractionStatus: 'failed',
      extractionError: error,
    })
    .where(eq(resumeFile.id, resumeId));
}

export async function updateApplicantFields(
  applicantId: string,
  updates: { firstName?: string; lastName?: string; email?: string; }
): Promise<void> {
  if (Object.keys(updates).length === 0) {
    return;
  }

  await db
    .update(applicant)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(applicant.id, applicantId));
}

export async function updateResumeFields(
  resumeId: string,
  updates: Partial<InferSelectModel<typeof resumeFile>>
): Promise<void> {
  if (Object.keys(updates).length === 0) {
    return;
  }

  await db
    .update(resumeFile)
    .set({
      ...updates,
    })
    .where(eq(resumeFile.id, resumeId));
}
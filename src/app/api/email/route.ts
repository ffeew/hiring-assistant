import { NextResponse } from 'next/server';
import { EmailService, EmailData, UserEmailConfig } from './email.service';
import { safeDecrypt } from '@/lib/crypto';
import { withTransaction } from '@/lib/db/transaction';
import { applicant as applicantTable, resumeFile as resumeFileTable, emailCommunication as emailCommunicationTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { emailRequestSchema, SUPPORTED_FILE_TYPES } from '@/app/types';
import { ZodError } from 'zod';
import { r2Service } from '@/lib/r2';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { withNotDeleted } from '@/lib/soft-delete';

async function sendEmails(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = emailRequestSchema.parse(body);
    const { recipients, jobPostId, resumeData, resumeFiles } = validatedData;

    // Check if user has email configuration
    if (!request.user.gmailAddress || !request.user.gmailAppPassword || !request.user.name) {
      return NextResponse.json(
        { error: 'Email service not configured. Please configure your Gmail address, app password, and ensure your profile name is set.' },
        { status: 400 }
      );
    }

    // Decrypt the Gmail app password for use
    const decryptedPassword = request.user.gmailAppPassword ? safeDecrypt(request.user.gmailAppPassword) : '';

    const userConfig: UserEmailConfig = {
      gmailAddress: request.user.gmailAddress,
      gmailAppPassword: decryptedPassword,
      senderName: request.user.name,
      companyName: request.user.companyName || undefined,
      jobTitle: request.user.jobTitle || undefined,
    };

    const emailService = new EmailService(userConfig);

    // Test connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'Failed to connect to Gmail SMTP. Please check your credentials.' },
        { status: 500 }
      );
    }

    // Create applicants and save resume data before sending emails
    const applicantIds: string[] = [];
    const emailResults = { success: 0, failed: 0, errors: [] as string[] };

    for (const recipient of recipients) {
      try {
        // Process each recipient in a transaction to ensure data consistency
        const { applicantId } = await withTransaction(async (tx) => {
          // Check if applicant already exists (excluding soft-deleted)
          const existingApplicant = await tx
            .select()
            .from(applicantTable)
            .where(
              withNotDeleted(
                applicantTable.deletedAt,
                eq(applicantTable.userId, request.user.id),
                eq(applicantTable.email, recipient.email)
              )
            )
            .limit(1);

          let applicantId: string;

          if (existingApplicant.length > 0) {
            // Update existing applicant
            applicantId = existingApplicant[0].id;

            // Update job post association if provided
            if (jobPostId) {
              await tx
                .update(applicantTable)
                .set({
                  jobPostId,
                  updatedAt: new Date(),
                })
                .where(eq(applicantTable.id, applicantId));
            }
          } else {
            // Create new applicant
            applicantId = nanoid();
            await tx
              .insert(applicantTable)
              .values({
                id: applicantId,
                userId: request.user.id,
                jobPostId: jobPostId || null,
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                email: recipient.email,
                phone: null,
                linkedinUrl: null,
                githubUrl: null,
                portfolioUrl: null,
                metadata: null,
                notes: null,
                status: 'applied',
                source: 'bulk_upload',
                createdAt: new Date(),
                updatedAt: new Date(),
              });
          }

          // Handle resume file upload to R2 or save content directly
          const resumeFileData = resumeFiles?.[recipient.fileName];
          const resumeContent = resumeData?.[recipient.fileName];

          if (resumeFileData || resumeContent) {
            // Check if resume file already exists (excluding soft-deleted)
            const existingResume = await tx
              .select()
              .from(resumeFileTable)
              .where(
                withNotDeleted(
                  resumeFileTable.deletedAt,
                  eq(resumeFileTable.applicantId, applicantId),
                  eq(resumeFileTable.fileName, recipient.fileName)
                )
              )
              .limit(1);

            if (existingResume.length === 0) {
              let filePath: string | null = null;
              let fileSize: number | null = null;
              let mimeType: string | null = null;

              // If file data is provided, upload to R2
              if (resumeFileData) {
                try {
                  // Validate file type
                  if (!SUPPORTED_FILE_TYPES.includes(resumeFileData.mimeType as typeof SUPPORTED_FILE_TYPES[number])) {
                    throw new Error(`Unsupported file type: ${resumeFileData.mimeType}`);
                  }

                  // Validate file size (10MB limit)
                  const maxSize = 10 * 1024 * 1024; // 10MB
                  if (resumeFileData.fileSize > maxSize) {
                    throw new Error('File too large. Maximum size is 10MB.');
                  }

                  // Convert base64 to buffer
                  const fileBuffer = Buffer.from(resumeFileData.fileBuffer, 'base64');

                  // Upload to R2
                  const uploadResult = await r2Service.uploadFile(
                    fileBuffer,
                    recipient.fileName,
                    resumeFileData.mimeType,
                    request.user.id
                  );

                  console.log(`Uploaded resume for ${recipient.email}:`, uploadResult);

                  filePath = uploadResult.filePath;
                  fileSize = resumeFileData.fileSize;
                  mimeType = resumeFileData.mimeType;
                } catch (uploadError) {
                  console.error(`Failed to upload resume for ${recipient.email}:`, uploadError);
                  emailResults.errors.push(`Failed to upload resume for ${recipient.email}: ${uploadError}`);
                  // Continue with email sending even if file upload fails
                }
              }

              // Save resume file record to database
              await tx
                .insert(resumeFileTable)
                .values({
                  id: nanoid(),
                  applicantId,
                  fileName: recipient.fileName,
                  filePath: filePath || `legacy/${recipient.fileName}`, // Fallback path for content-only resumes
                  fileSize: fileSize,
                  mimeType: mimeType,
                  resumeContent: resumeContent || null, // Store content if provided
                  extractionStatus: resumeContent ? 'success' : (filePath ? 'pending' : 'failed'),
                  extractionError: filePath ? null : (resumeContent ? null : 'File upload failed'),
                  createdAt: new Date(),
                });
            }
          }

          // Return applicantId for external email sending
          return { applicantId };
        });

        // Send email after transaction is committed
        const emailSent = await emailService.sendEmail(recipient as EmailData);

        if (emailSent) {
          // Log successful email communication in a separate transaction
          await withTransaction(async (tx) => {
            const emailContent = emailService.generateEmailTemplate(recipient as EmailData);
            const companyName = userConfig.companyName || 'Our Company';
            const position = recipient.jobPosition || 'Software Engineer Intern';
            const emailType = recipient.template === 'screening' ? 'screening' : 'acknowledgment';
            const subject = emailType === 'screening'
              ? `Next Steps - ${position} Position at ${companyName}`
              : `Thank you for your interest in our position at ${companyName}`;

            await tx
              .insert(emailCommunicationTable)
              .values({
                id: nanoid(),
                userId: request.user.id,
                applicantId,
                jobPostId: jobPostId || null,
                emailType: emailType as 'acknowledgment' | 'screening',
                subject,
                content: emailContent,
                sentAt: new Date(),
                status: 'sent',
                errorMessage: null,
              });
          });

          emailResults.success++;
        } else {
          emailResults.failed++;
          emailResults.errors.push(`Failed to send email to ${recipient.email}`);
        }

        applicantIds.push(applicantId);

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        emailResults.failed++;
        emailResults.errors.push(`Error processing ${recipient.email}: ${error}`);
        console.error(`Error processing recipient ${recipient.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        totalSent: emailResults.success,
        totalFailed: emailResults.failed,
        errors: emailResults.errors,
        applicantsCreated: applicantIds.length,
      },
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

    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEmailInfo() {
  return NextResponse.json(
    { message: 'Email API endpoint. Use POST to send emails.' },
    { status: 200 }
  );
}

// Export authenticated route handlers
export const POST = withAuth(sendEmails);
export const GET = getEmailInfo; // This endpoint doesn't need auth
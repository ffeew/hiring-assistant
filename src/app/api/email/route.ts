import { NextResponse } from 'next/server';
import { EmailService, EmailData, UserEmailConfig } from './email.service';
import { safeDecrypt } from '@/lib/crypto';
import { withTransaction } from '@/lib/db/transaction';
import { applicant as applicantTable, emailCommunication as emailCommunicationTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { sendEmailsBodySchema } from './email.validator';
import { ZodError } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { updateApplicantFields } from '../extract/resume-extraction.service';

async function sendEmails(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = sendEmailsBodySchema.parse(body);
    const { recipients, jobPostId } = validatedData;

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

    // Send emails to pre-extracted applicants
    const emailResults = { success: 0, failed: 0, errors: [] as string[] };

    for (const recipient of recipients) {
      try {
        // Update applicant fields with corrected data from frontend
        await updateApplicantFields(recipient.applicantId, {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
        });


        // Update job post association if provided
        if (jobPostId) {
          await withTransaction(async (tx) => {
            await tx
              .update(applicantTable)
              .set({
                jobPostId,
                updatedAt: new Date(),
              })
              .where(eq(applicantTable.id, recipient.applicantId));
          });
        }

        // Send email
        const emailSent = await emailService.sendEmail(recipient as EmailData);

        if (emailSent) {
          // Log successful email communication
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
                id: randomUUID(),
                userId: request.user.id,
                applicantId: recipient.applicantId,
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
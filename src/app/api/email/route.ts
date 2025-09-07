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
import { ApplicantsService } from '../applicants/applicants.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

async function sendEmails(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = sendEmailsBodySchema.parse(body);
    const { recipients, jobPostId } = validatedData;

    // Check if user has email configuration using the new validation method
    if (!EmailService.hasCompleteConfiguration(request.user)) {
      const missingFields = [];
      if (!request.user.gmailAddress) missingFields.push('Gmail address');
      if (!request.user.gmailAppPassword) missingFields.push('Gmail app password');
      if (!request.user.name) missingFields.push('profile name');

      return NextResponse.json(
        { 
          error: 'Email service not configured',
          details: [{
            field: 'email_configuration',
            message: `Please configure the following in your profile settings: ${missingFields.join(', ')}. Go to Profile Settings to set up email functionality.`
          }]
        },
        { status: 400 }
      );
    }

    // Decrypt the Gmail app password for use
    const decryptedPassword = request.user.gmailAppPassword ? safeDecrypt(request.user.gmailAppPassword) : '';

    const userConfig: UserEmailConfig = {
      gmailAddress: request.user.gmailAddress || '',
      gmailAppPassword: decryptedPassword,
      senderName: request.user.name || '',
      companyName: request.user.companyName || undefined,
      jobTitle: request.user.jobTitle || undefined,
    };

    const emailService = new EmailService(userConfig, request.user.id);

    // Test connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { 
          error: 'Gmail connection failed',
          details: [{ 
            field: 'gmail_credentials', 
            message: 'Failed to connect to Gmail SMTP. Please verify your Gmail address and app password are correct. Make sure 2-factor authentication is enabled and you\'re using an app password (not your regular password).'
          }]
        },
        { status: 400 }
      );
    }

    // Send emails to pre-extracted applicants
    const emailResults = { success: 0, failed: 0, errors: [] as string[] };

    for (const recipient of recipients) {
      try {
        // Update applicant fields with corrected data from frontend
        await ApplicantsService.updateApplicantBasicFields(recipient.applicantId, {
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
            const emailContent = await emailService.generateEmailTemplate(recipient as EmailData);
            const companyName = userConfig.companyName || 'Our Company';
            
            // Get template info and rendered subject for logging
            let emailType: 'acknowledgment' | 'screening' | 'interview' | 'offer' | 'rejection' | 'follow_up' = 'acknowledgment';
            let subject = `Email from ${companyName}`;
            
            try {
              const template = await EmailTemplatesService.getTemplate(request.user.id, recipient.templateId);
              emailType = template.category as typeof emailType;
              // Get the actual rendered subject from the email content
              const { subject: renderedSubject } = await emailService.getEmailContent(recipient as EmailData);
              subject = renderedSubject;
            } catch (error) {
              console.error('Error getting template for logging:', error);
              // Use generic subject if template lookup fails
              subject = `Email from ${companyName}`;
              emailType = 'acknowledgment'; // Default fallback
            }

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
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to send emails' }]
      },
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
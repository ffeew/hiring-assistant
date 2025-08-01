import { NextResponse } from 'next/server';
import { EmailService, EmailData, EmailTemplate, UserEmailConfig } from '../email.service';
import { safeDecrypt } from '@/lib/crypto';
import { emailPreviewBodySchema } from '../email.validator';
import { ZodError } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function generateEmailPreviews(request: AuthenticatedRequest) {

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = emailPreviewBodySchema.parse(body);
    const { recipients } = validatedData;

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

    const emailService: EmailService = new EmailService(userConfig);

    // Generate previews for each recipient
    const previews = recipients.map((recipient) => {
      const template = (recipient.template === 'screening' ? EmailTemplate.SCREENING : EmailTemplate.ACKNOWLEDGMENT);
      const companyName = userConfig.companyName || 'Our Company';
      const position = userConfig.jobTitle || 'Software Engineer Intern';
      const subject = template === EmailTemplate.SCREENING
        ? `Next Steps - ${position} Position at ${companyName}`
        : `Thank you for your interest in our position at ${companyName}`;

      return {
        html: emailService.generateEmailTemplate(recipient as EmailData),
        subject,
        recipient,
        template
      };
    });

    return NextResponse.json({
      success: true,
      previews
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

    console.error('Error generating email previews:', error);
    return NextResponse.json(
      { error: 'Failed to generate email previews' },
      { status: 500 }
    );
  }
}

// Export authenticated route handler
export const POST = withAuth(generateEmailPreviews);

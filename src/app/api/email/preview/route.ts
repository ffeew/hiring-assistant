import { NextResponse } from 'next/server';
import { EmailService, EmailData, UserEmailConfig } from '../email.service';
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

    const emailService: EmailService = new EmailService(userConfig, request.user.id);

    // Generate previews for each recipient
    const previews = await Promise.all(recipients.map(async (recipient) => {
      const { subject, html } = await emailService.getEmailContent(recipient as EmailData);

      return {
        html,
        subject,
        recipient,
        template: 'dynamic' // All templates are now dynamic
      };
    }));

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

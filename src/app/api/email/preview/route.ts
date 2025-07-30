import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailData, EmailTemplate, UserEmailConfig } from '../email.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { safeDecrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { recipients } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check if user has email configuration
    if (!session.user.gmailAddress || !session.user.gmailAppPassword || !session.user.name) {
      return NextResponse.json(
        { error: 'Email service not configured. Please configure your Gmail address, app password, and ensure your profile name is set.' },
        { status: 400 }
      );
    }

    // Decrypt the Gmail app password for use
    const decryptedPassword = session.user.gmailAppPassword ? safeDecrypt(session.user.gmailAppPassword) : '';

    const userConfig: UserEmailConfig = {
      gmailAddress: session.user.gmailAddress,
      gmailAppPassword: decryptedPassword,
      senderName: session.user.name,
      companyName: session.user.companyName || undefined,
      jobTitle: session.user.jobTitle || undefined,
    };

    const emailService: EmailService = new EmailService(userConfig);

    // Generate previews for each recipient
    const previews = recipients.map((recipient: EmailData) => {
      const template = recipient.template || EmailTemplate.ACKNOWLEDGMENT;
      const companyName = userConfig.companyName || 'Our Company';
      const position = userConfig.jobTitle || 'Software Engineer Intern';
      const subject = template === EmailTemplate.SCREENING
        ? `Next Steps - ${position} Position at ${companyName}`
        : `Thank you for your interest in our position at ${companyName}`;

      return {
        html: emailService.generateEmailTemplate(recipient),
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
    console.error('Error generating email previews:', error);
    return NextResponse.json(
      { error: 'Failed to generate email previews' },
      { status: 500 }
    );
  }
}

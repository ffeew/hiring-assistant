import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailData, UserEmailConfig } from './email.service';
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
    const body = await request.json();
    const { recipients } = body;

    if (!recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
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

    const emailService = new EmailService(userConfig);

    // Test connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { error: 'Failed to connect to Gmail SMTP. Please check your credentials.' },
        { status: 500 }
      );
    }

    // Send emails
    const results = await emailService.sendBulkEmails(recipients as EmailData[]);

    return NextResponse.json({
      success: true,
      results: {
        totalSent: results.success,
        totalFailed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Email API endpoint. Use POST to send emails.' },
    { status: 200 }
  );
}
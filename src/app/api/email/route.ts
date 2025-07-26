import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailData } from './email.service';
import { isEmailConfigured } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients } = body;

    if (!recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set GMAIL_USER, GMAIL_APP_PASSWORD, and SENDER_NAME environment variables.' },
        { status: 500 }
      );
    }

    const emailService = new EmailService();

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
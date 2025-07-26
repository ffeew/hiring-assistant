import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailData, EmailTemplate } from '../email.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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

    const emailService: EmailService = new EmailService();

    // Generate previews for each recipient
    const previews = recipients.map((recipient: EmailData) => {
      const template = recipient.template || EmailTemplate.ACKNOWLEDGMENT;
      const subject = template === EmailTemplate.SCREENING
        ? 'Next Steps - Software Engineer Intern Position at Pints AI'
        : 'Thank you for your interest in our position';

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

import { EmailData } from '../email.service';
import { env, isCompanyTemplateConfigured } from '@/lib/env';

export function generateAcknowledgmentTemplate(recipient: EmailData): string {
  const companyName = isCompanyTemplateConfigured() ? env.COMPANY_NAME! : 'Our Company';
  const senderName = env.SENDER_NAME || 'The Hiring Team';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Application</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .highlight {
          background: #e3f2fd;
          padding: 15px;
          border-left: 4px solid #2196f3;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Thank You for Your Interest!</h1>
      </div>
      <div class="content">
        <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
        
        <p>Thank you for submitting your resume (<strong>${recipient.fileName}</strong>) for consideration. We have received your application and our hiring team is currently reviewing it.</p>
        
        <div class="highlight">
          <strong>What happens next?</strong>
          <ul>
            <li>Our team will review your qualifications within the next 3-5 business days</li>
            <li>If your background matches our requirements, we'll reach out to schedule an interview</li>
            <li>We'll keep you updated on the status of your application</li>
          </ul>
        </div>
        
        <p>We appreciate the time you took to apply and look forward to potentially working together.</p>
        
        <p>Best regards,<br>
        <strong>${senderName}</strong></p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

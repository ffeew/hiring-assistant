import nodemailer from 'nodemailer';
import { generateAcknowledgmentTemplate, generateScreeningTemplate } from './templates';

export enum EmailTemplate {
  ACKNOWLEDGMENT = 'acknowledgment',
  SCREENING = 'screening'
}

export interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  fileName: string;
  template?: EmailTemplate;
  jobPosition?: string;
}

export interface UserEmailConfig {
  gmailAddress: string;
  gmailAppPassword: string;
  senderName: string;
  companyName?: string;
  jobTitle?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private userConfig: UserEmailConfig;

  constructor(userConfig: UserEmailConfig) {
    if (!userConfig.gmailAddress || !userConfig.gmailAppPassword || !userConfig.senderName) {
      throw new Error('Email configuration is incomplete. User must have gmailAddress, gmailAppPassword, and senderName configured.');
    }

    this.userConfig = userConfig;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: userConfig.gmailAddress,
        pass: userConfig.gmailAppPassword,
      },
    });
  }

  async sendEmail(recipient: EmailData): Promise<boolean> {
    try {
      const template = recipient.template || EmailTemplate.ACKNOWLEDGMENT;
      const { subject, html } = this.getEmailContent(recipient, template);

      const mailOptions = {
        from: `"${this.userConfig.senderName}" <${this.userConfig.gmailAddress}>`,
        to: recipient.email,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendBulkEmails(recipients: EmailData[]): Promise<{ success: number; failed: number; errors: string[]; }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const recipient of recipients) {
      try {
        const success = await this.sendEmail(recipient);
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send email to ${recipient.email}`);
        }
        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        results.errors.push(`Error sending to ${recipient.email}: ${error}`);
      }
    }

    return results;
  }

  public generateEmailTemplate(recipient: EmailData): string {
    // Maintain backward compatibility - use acknowledgment template by default
    const template = recipient.template || EmailTemplate.ACKNOWLEDGMENT;
    return this.getEmailContent(recipient, template).html;
  }

  private getEmailContent(recipient: EmailData, template: EmailTemplate): { subject: string; html: string; } {
    const companyName = this.userConfig.companyName || 'Our Company';
    const position = recipient.jobPosition || 'Software Engineer Intern';

    switch (template) {
      case EmailTemplate.SCREENING:
        return {
          subject: `Next Steps - ${position} Position at ${companyName}`,
          html: generateScreeningTemplate(recipient, this.userConfig)
        };
      case EmailTemplate.ACKNOWLEDGMENT:
      default:
        return {
          subject: `Thank you for your interest in our position at ${companyName}`,
          html: generateAcknowledgmentTemplate(recipient, this.userConfig)
        };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

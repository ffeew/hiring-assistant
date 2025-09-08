import nodemailer from 'nodemailer';
import { TemplateEngine, TemplateContext } from '@/lib/template-engine';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

export interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  templateId: string; // Required dynamic template selection
  jobPosition?: string;
  // Enhanced candidate data from Mistral OCR
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  }>;
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
  private userId: string;

  static validateConfiguration(config: UserEmailConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.gmailAddress || config.gmailAddress.trim() === '') {
      errors.push('Gmail address is required');
    }
    
    if (!config.gmailAppPassword || config.gmailAppPassword.trim() === '') {
      errors.push('Gmail app password is required');
    }
    
    if (!config.senderName || config.senderName.trim() === '') {
      errors.push('Sender name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static hasCompleteConfiguration(user: { gmailAddress?: string | null; gmailAppPassword?: string | null; name?: string | null }): boolean {
    return !!(user.gmailAddress && user.gmailAppPassword && user.name);
  }

  constructor(userConfig: UserEmailConfig, userId: string) {
    const validationResult = EmailService.validateConfiguration(userConfig);
    if (!validationResult.isValid) {
      throw new Error(`Email configuration is incomplete: ${validationResult.errors.join(', ')}`);
    }

    this.userConfig = userConfig;
    this.userId = userId;
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
      const { subject, html } = await this.getEmailContent(recipient);

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

  public async generateEmailTemplate(recipient: EmailData): Promise<string> {
    const { html } = await this.getEmailContent(recipient);
    return html;
  }

  public async getEmailContent(recipient: EmailData): Promise<{ subject: string; html: string; }> {
    const companyName = this.userConfig.companyName || 'Our Company';
    const position = recipient.jobPosition || 'Software Engineer Position';

    try {
      const template = await EmailTemplatesService.getTemplate(this.userId, recipient.templateId);
      
      // Enhanced template context with all candidate data
      const context: TemplateContext = {
        // Basic info
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        fullName: `${recipient.firstName} ${recipient.lastName}`,
        email: recipient.email,
        phone: recipient.phone,
        jobPosition: position,
        companyName,
        senderName: this.userConfig.senderName,
        senderTitle: this.userConfig.jobTitle || 'Hiring Manager',
        currentDate: new Date(),

        // Professional links
        linkedinUrl: recipient.linkedinUrl,
        githubUrl: recipient.githubUrl,
        portfolioUrl: recipient.portfolioUrl,
        
        // Enhanced candidate data
        skills: recipient.skills?.join(', ') || '',
        topSkills: recipient.skills?.slice(0, 5).join(', ') || '',
        experienceYears: this.calculateExperienceYears(recipient.experience),
        latestCompany: recipient.experience?.[0]?.company || '',
        latestPosition: recipient.experience?.[0]?.position || '',
        education: this.formatEducation(recipient.education),
        linkedinProfile: recipient.linkedinUrl,
        portfolioLink: recipient.portfolioUrl || recipient.githubUrl,
      };

      // Render template with enhanced context
      const renderedSubject = TemplateEngine.render(template.subject, context);
      const renderedContent = TemplateEngine.render(template.content, context);

      // Increment usage count
      await EmailTemplatesService.incrementUsage(this.userId, recipient.templateId);

      return {
        subject: renderedSubject,
        html: renderedContent
      };
    } catch (error) {
      console.error('Error loading template:', error);
      throw new Error(`Failed to load email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateExperienceYears(experience?: EmailData['experience']): string {
    if (!experience || experience.length === 0) return '0';
    
    // Simple heuristic: count unique companies and assume average 2 years per position
    const uniqueCompanies = new Set(experience.map(exp => exp.company.toLowerCase())).size;
    const estimatedYears = Math.max(1, uniqueCompanies * 1.5);
    
    return Math.floor(estimatedYears).toString();
  }

  private formatEducation(education?: EmailData['education']): string {
    if (!education || education.length === 0) return '';
    
    const latest = education[0];
    const degree = latest.degree || '';
    const field = latest.fieldOfStudy || '';
    const institution = latest.institution || '';
    
    if (degree && field) {
      return `${degree} in ${field} from ${institution}`;
    } else if (degree) {
      return `${degree} from ${institution}`;
    } else if (field) {
      return `${field} from ${institution}`;
    }
    return institution;
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

import { z } from 'zod';

export const sendEmailsBodySchema = z.object({
  recipients: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    templateId: z.string().min(1, 'Template ID is required'), // Required dynamic template selection
    jobPosition: z.string().optional(),
    applicantId: z.string().min(1, 'Applicant ID is required'), // Required for updating applicant
    resumeId: z.string().min(1, 'Resume ID is required'), // Required for updating resume fields
    // Enhanced candidate data from Mistral OCR
    phone: z.string().optional(),
    linkedinUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      duration: z.string().optional(),
      description: z.string().optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      graduationYear: z.string().optional(),
    })).optional(),
  })).min(1, 'At least one recipient is required'),
  jobPostId: z.string().optional(),
});

export const emailPreviewBodySchema = z.object({
  recipients: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    templateId: z.string().min(1, 'Template ID is required'), // Required dynamic template selection
    jobPosition: z.string().optional(),
    // Enhanced candidate data for preview
    phone: z.string().optional(),
    linkedinUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      duration: z.string().optional(),
      description: z.string().optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      graduationYear: z.string().optional(),
    })).optional(),
  })).min(1, 'At least one recipient is required'),
});

export type SendEmailsBody = z.infer<typeof sendEmailsBodySchema>;
export type EmailPreviewBody = z.infer<typeof emailPreviewBodySchema>;
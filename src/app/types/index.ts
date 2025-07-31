import { z } from 'zod';

export type ExtractedData = {
  fileName: string;
  firstName: string;
  lastName: string;
  email: string;
  template?: EmailTemplate;
  jobPosition?: string;
  error?: string; // For failed extractions
};

export enum EmailTemplate {
  ACKNOWLEDGMENT = 'acknowledgment',
  SCREENING = 'screening'
}

export const APPLICANT_STATUS = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'] as const;

// Base Zod schemas
export const applicantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobPostId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  notes: z.string().nullable(),
  status: z.enum(APPLICANT_STATUS),
  source: z.enum(['manual', 'bulk_upload', 'api']),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createApplicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  metadata: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  jobPostId: z.string().optional(),
  status: z.enum(APPLICANT_STATUS).optional(),
  source: z.enum(['manual', 'bulk_upload', 'api']).optional(),
});

export const updateApplicantSchema = createApplicantSchema.partial();

export const EXTRACTION_STATUS = ['pending', 'success', 'failed'] as const;

export const resumeFileSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().nullable(),
  mimeType: z.string().nullable(),
  resumeContent: z.string().nullable(),
  extractionStatus: z.enum(EXTRACTION_STATUS),
  extractionError: z.string().nullable(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createResumeFileSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  filePath: z.string().min(1, 'File path is required'),
  fileSize: z.number().positive().optional(),
  mimeType: z.string().optional(),
  resumeContent: z.string().optional(),
  extractionStatus: z.enum(EXTRACTION_STATUS).optional(),
  extractionError: z.string().optional(),
});

export const uploadResumeFileSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  file: z.any(), // File will be validated separately
});

export const EMAIL_TYPE = ['acknowledgment', 'screening', 'interview', 'offer', 'rejection'] as const;
export const EMAIL_STATUS = ['sent', 'failed', 'bounced'] as const;

export const emailCommunicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applicantId: z.string(),
  jobPostId: z.string().nullable(),
  emailType: z.enum(EMAIL_TYPE),
  subject: z.string(),
  content: z.string(),
  sentAt: z.date(),
  status: z.enum(EMAIL_STATUS),
  errorMessage: z.string().nullable(),
  deletedAt: z.date().nullable(),
});

export const createEmailCommunicationSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  jobPostId: z.string().optional(),
  emailType: z.enum(EMAIL_TYPE),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(EMAIL_STATUS).optional(),
  errorMessage: z.string().optional(),
});

export const emailRequestSchema = z.object({
  recipients: z.array(z.object({
    fileName: z.string().min(1, 'File name is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.string().optional(),
    jobPosition: z.string().optional(),
  })).min(1, 'At least one recipient is required'),
  jobPostId: z.string().optional(),
  resumeData: z.record(z.string()).optional(), // fileName -> resumeContent mapping (for backward compatibility)
  resumeFiles: z.record(z.object({
    fileBuffer: z.string(), // Base64 encoded file buffer
    mimeType: z.string(),
    fileSize: z.number(),
  })).optional(), // fileName -> file data mapping (for R2 upload)
});

export const emailPreviewRequestSchema = z.object({
  recipients: z.array(z.object({
    fileName: z.string().min(1, 'File name is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.enum(['acknowledgment', 'screening']).optional(),
    jobPosition: z.string().optional(),
  })).min(1, 'At least one recipient is required'),
});


export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;

// Inferred types from Zod schemas
export type Applicant = z.infer<typeof applicantSchema>;
export type CreateApplicantData = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantData = z.infer<typeof updateApplicantSchema>;

export type ResumeFile = z.infer<typeof resumeFileSchema>;
export type CreateResumeFileData = z.infer<typeof createResumeFileSchema>;
export type UploadResumeFileData = z.infer<typeof uploadResumeFileSchema>;

export type EmailCommunication = z.infer<typeof emailCommunicationSchema>;
export type CreateEmailCommunicationData = z.infer<typeof createEmailCommunicationSchema>;

export type EmailRequestData = z.infer<typeof emailRequestSchema>;
export type EmailPreviewRequestData = z.infer<typeof emailPreviewRequestSchema>;

export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior'] as const;

// JobPost Zod schema
export const jobPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.enum(EMPLOYMENT_TYPES).nullable(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).nullable(),
  description: z.string(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  salaryRange: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createJobPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
});

export const updateJobPostSchema = createJobPostSchema.extend({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  isActive: z.boolean().optional(),
}).partial();

// Inferred types from Zod schemas
export type JobPost = z.infer<typeof jobPostSchema>;
export type CreateJobPostData = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostData = z.infer<typeof updateJobPostSchema>;

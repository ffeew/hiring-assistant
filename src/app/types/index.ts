import { z } from 'zod';

export type ExtractedData = {
  fileName: string;
  firstName: string;
  lastName: string;
  email: string;
  template?: EmailTemplate;
  jobPosition?: string;
  resumeId?: string; // ID of the resume record in database
  applicantId?: string; // ID of the applicant record in database
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
  fileHash: z.string().nullable(),
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
  fileHash: z.string().optional(),
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
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.string().optional(),
    jobPosition: z.string().optional(),
    applicantId: z.string().min(1, 'Applicant ID is required'), // Required for updating applicant
    resumeId: z.string().min(1, 'Resume ID is required'), // Required for updating resume fields
  })).min(1, 'At least one recipient is required'),
  jobPostId: z.string().optional(),
});

export const emailPreviewRequestSchema = z.object({
  recipients: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.enum(['acknowledgment', 'screening']).optional(),
    jobPosition: z.string().optional(),
  })).min(1, 'At least one recipient is required'),
});


export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;

// Mistral-compatible extraction schema (without format validations that cause API errors)
export const mistralExtractionSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().describe("The email address of the candidate."),
  phone: z.string().optional().describe("The phone number of the candidate."),
  linkedinUrl: z.string().optional().describe("The LinkedIn profile URL of the candidate."),
  githubUrl: z.string().optional().describe("The GitHub profile URL of the candidate."),
  portfolioUrl: z.string().optional().describe("The portfolio website URL of the candidate."),
  extractedText: z.string().describe("The full text content extracted from the resume."),
  skills: z.array(z.string()).optional().describe("List of skills mentioned in the resume."),
  experience: z.array(z.object({
    company: z.string().describe("The company or organization name where the candidate worked."),
    position: z.string().describe("The job title or role held at this company."),
    duration: z.string().optional().describe("The time period of employment (e.g., 'Jan 2020 - Dec 2022', '2 years', 'Present'). Extract as written in the resume."),
    description: z.string().optional().describe("Brief description of responsibilities, achievements, or key points mentioned for this role.")
  })).optional().describe("Work experience from the resume."),
  education: z.array(z.object({
    institution: z.string().describe("The name of the educational institution, university, college, or school."),
    degree: z.string().optional().describe("The degree type or qualification obtained (e.g., 'Bachelor of Science', 'Master's', 'PhD', 'Certificate')."),
    fieldOfStudy: z.string().optional().describe("The major, field of study, or subject area (e.g., 'Computer Science', 'Business Administration', 'Engineering')."),
    graduationYear: z.string().optional().describe("The year of graduation or completion. Extract as a 4-digit year if available.")
  })).optional().describe("Extract educational background including degrees, institutions, graduation dates, and fields of study. Include relevant certifications and academic achievements.")
});

// Full extraction schema with validation (for internal use after Mistral response)
export const resumeExtractionSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().email().describe("The email address of the candidate."),
  phone: z.string().optional().describe("The phone number of the candidate."),
  linkedinUrl: z.string().url().optional().describe("The LinkedIn profile URL of the candidate."),
  githubUrl: z.string().url().optional().describe("The GitHub profile URL of the candidate."),
  portfolioUrl: z.string().url().optional().describe("The portfolio website URL of the candidate."),
  skills: z.array(z.string()).optional().describe("List of skills mentioned in the resume."),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string().optional(),
    description: z.string().optional()
  })).optional().describe("Work experience from the resume."),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationYear: z.string().optional()
  })).optional().describe("Educational background from the resume.")
});

// Response schema for the extraction API
export const extractionResponseSchema = z.object({
  fileName: z.string(),
  resumeId: z.string().optional(), // Will be present on successful extraction
  applicantId: z.string().optional(), // Will be present on successful extraction
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  template: z.enum(['acknowledgment', 'screening']).optional(),
  jobPosition: z.string().optional(),
  error: z.string().optional(), // Will be present on failed extraction
});

// Inferred types from Zod schemas
export type Applicant = z.infer<typeof applicantSchema>;
export type CreateApplicantData = z.infer<typeof createApplicantSchema>;
export type ResumeExtractionData = z.infer<typeof resumeExtractionSchema>;
export type ExtractionResponseData = z.infer<typeof extractionResponseSchema>;
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

// Profile schemas
export const profileUpdateSchema = z.object({
  gmailAddress: z.string().email('Valid Gmail address is required'),
  gmailAppPassword: z.string().min(1, 'Gmail app password is required'),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const profileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  gmailAddress: z.string().nullable(),
  gmailAppPassword: z.string().nullable(), // Will be masked as "****"
  companyName: z.string().nullable(),
  jobTitle: z.string().nullable(),
  emailVerified: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Inferred profile types
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ProfileResponseData = z.infer<typeof profileResponseSchema>;

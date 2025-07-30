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

export default ExtractedData;

export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;

export type JobPost = {
  id: string;
  userId: string;
  title: string;
  department: string | null;
  location: string | null;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | null;
  experienceLevel: 'entry' | 'mid' | 'senior' | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateJobPostData = {
  title: string;
  department?: string;
  location?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel?: 'entry' | 'mid' | 'senior';
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  salaryRange?: string;
};

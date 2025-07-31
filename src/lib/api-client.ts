import { 
  emailRequestSchema, 
  emailPreviewRequestSchema,
  extractionResponseSchema,
  createJobPostSchema,
  updateJobPostSchema,
  profileUpdateSchema,
  type EmailRequestData,
  type EmailPreviewRequestData,
  type ExtractionResponseData,
  type JobPost,
  type CreateJobPostData,
  type UpdateJobPostData,
  type ProfileUpdateData,
  type ProfileResponseData
} from '@/app/types';
import { z } from 'zod';

// Infer the recipient type from the schema
type EmailPreviewRecipient = z.infer<typeof emailPreviewRequestSchema>['recipients'][0];

// API Response types
export interface EmailSendResponse {
  success: boolean;
  results: {
    totalSent: number;
    totalFailed: number;
    errors: string[];
  };
}

export interface EmailPreviewResponse {
  success: boolean;
  previews: Array<{
    html: string;
    subject: string;
    recipient: EmailPreviewRecipient;
    template: string;
  }>;
}

export interface JobPostsResponse {
  success: boolean;
  jobPosts: JobPost[];
}

export interface JobPostResponse {
  success: boolean;
  jobPost: JobPost;
}

export interface ProfileResponse {
  success: boolean;
  user: ProfileResponseData;
}

// Type-safe API client functions
export const apiClient = {
  // Resume extraction
  async extractResumes(files: File[]): Promise<ExtractionResponseData[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to extract data: ${error}`);
    }

    const data = await response.json();
    
    // Validate each response item against the schema
    return data.map((item: unknown) => extractionResponseSchema.parse(item));
  },

  // Email sending
  async sendEmails(payload: EmailRequestData): Promise<EmailSendResponse> {
    // Validate input data
    const validatedPayload = emailRequestSchema.parse(payload);

    const response = await fetch("/api/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send emails");
    }

    return response.json();
  },

  // Email preview
  async previewEmails(payload: EmailPreviewRequestData): Promise<EmailPreviewResponse> {
    // Validate input data
    const validatedPayload = emailPreviewRequestSchema.parse(payload);

    const response = await fetch("/api/email/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate email previews: ${error}`);
    }

    return response.json();
  },

  // Job Posts
  async getJobPosts(activeOnly = false): Promise<JobPost[]> {
    const url = activeOnly ? '/api/job-posts?active=true' : '/api/job-posts';
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch job posts: ${error}`);
    }
    
    const data: JobPostsResponse = await response.json();
    return data.jobPosts;
  },

  async getJobPost(id: string): Promise<JobPost> {
    const response = await fetch(`/api/job-posts/${id}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch job post: ${error}`);
    }
    
    const data: JobPostResponse = await response.json();
    return data.jobPost;
  },

  async createJobPost(payload: CreateJobPostData): Promise<JobPost> {
    // Validate input data
    const validatedPayload = createJobPostSchema.parse(payload);

    const response = await fetch('/api/job-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create job post');
    }

    const data: JobPostResponse = await response.json();
    return data.jobPost;
  },

  async updateJobPost(id: string, payload: UpdateJobPostData): Promise<JobPost> {
    // Validate input data
    const validatedPayload = updateJobPostSchema.parse(payload);

    const response = await fetch(`/api/job-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job post');
    }

    const data: JobPostResponse = await response.json();
    return data.jobPost;
  },

  async deleteJobPost(id: string): Promise<void> {
    const response = await fetch(`/api/job-posts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete job post');
    }
  },

  async toggleJobPostStatus(id: string, isActive: boolean): Promise<JobPost> {
    const response = await fetch(`/api/job-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle job post status');
    }

    const data: JobPostResponse = await response.json();
    return data.jobPost;
  },

  // Profile management
  async getProfile(): Promise<ProfileResponseData> {
    const response = await fetch('/api/profile');
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch profile: ${error}`);
    }
    
    const data: ProfileResponse = await response.json();
    return data.user;
  },

  async updateProfile(payload: ProfileUpdateData): Promise<ProfileResponseData> {
    // Validate input data
    const validatedPayload = profileUpdateSchema.parse(payload);

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const data: ProfileResponse = await response.json();
    return data.user;
  },
};
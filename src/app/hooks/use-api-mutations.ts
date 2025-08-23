import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { EmailRequestData, EmailPreviewRequestData, CreateJobPostData, UpdateJobPostData, ProfileUpdateData } from '@/app/types';

// Query keys for consistent caching
const QUERY_KEYS = {
  jobPosts: (activeOnly?: boolean) => ['job-posts', { activeOnly }] as const,
  jobPost: (id: string) => ['job-post', id] as const,
  profile: () => ['profile'] as const,
} as const;

// Resume extraction mutation
export function useExtractResumesMutation() {
  return useMutation({
    mutationFn: ({ files, jobPostId }: { files: File[]; jobPostId: string }) => 
      apiClient.extractResumes(files, jobPostId),
    mutationKey: ['extract-resumes'],
  });
}

// Email sending mutation
export function useSendEmailsMutation() {
  return useMutation({
    mutationFn: (payload: EmailRequestData) => apiClient.sendEmails(payload),
    mutationKey: ['send-emails'],
  });
}

// Email preview mutation
export function useEmailPreviewMutation() {
  return useMutation({
    mutationFn: (payload: EmailPreviewRequestData) => apiClient.previewEmails(payload),
    mutationKey: ['email-preview'],
  });
}

// Job Posts queries and mutations
export function useJobPostsQuery(activeOnly = false) {
  return useQuery({
    queryKey: QUERY_KEYS.jobPosts(activeOnly),
    queryFn: () => apiClient.getJobPosts(activeOnly),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useJobPostQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.jobPost(id),
    queryFn: () => apiClient.getJobPost(id),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateJobPostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateJobPostData) => apiClient.createJobPost(payload),
    mutationKey: ['create-job-post'],
    onSuccess: () => {
      // Invalidate all job posts queries
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

export function useUpdateJobPostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPostData }) => apiClient.updateJobPost(id, data),
    mutationKey: ['update-job-post'],
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(QUERY_KEYS.jobPost(updatedJobPost.id), updatedJobPost);
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

export function useDeleteJobPostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteJobPost(id),
    mutationKey: ['delete-job-post'],
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.jobPost(deletedId) });
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

export function useToggleJobPostStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.toggleJobPostStatus(id, isActive),
    mutationKey: ['toggle-job-post-status'],
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(QUERY_KEYS.jobPost(updatedJobPost.id), updatedJobPost);
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

// Profile queries and mutations
export function useProfileQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.profile(),
    queryFn: () => apiClient.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: ProfileUpdateData) => apiClient.updateProfile(payload),
    mutationKey: ['update-profile'],
    onSuccess: (updatedProfile) => {
      // Update profile in cache
      queryClient.setQueryData(QUERY_KEYS.profile(), updatedProfile);
    },
  });
}
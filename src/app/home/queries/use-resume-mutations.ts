import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { EmailRequestData, EmailPreviewRequestData } from '@/app/types';

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

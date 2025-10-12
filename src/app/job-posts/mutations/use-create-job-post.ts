import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CreateJobPostData } from '@/app/types';

export function useCreateJobPost() {
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

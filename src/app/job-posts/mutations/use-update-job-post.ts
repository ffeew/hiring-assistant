import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { UpdateJobPostData } from '@/app/types';

export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPostData }) => apiClient.updateJobPost(id, data),
    mutationKey: ['update-job-post'],
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(['job-post', updatedJobPost.id], updatedJobPost);
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

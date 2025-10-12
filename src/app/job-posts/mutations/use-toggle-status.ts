import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useToggleJobPostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.toggleJobPostStatus(id, isActive),
    mutationKey: ['toggle-job-post-status'],
    onSuccess: (updatedJobPost) => {
      // Update specific job post in cache
      queryClient.setQueryData(['job-post', updatedJobPost.id], updatedJobPost);
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

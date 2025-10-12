import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useDeleteJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteJobPost(id),
    mutationKey: ['delete-job-post'],
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['job-post', deletedId] });
      // Invalidate job posts list
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
}

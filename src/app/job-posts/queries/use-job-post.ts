import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query key for consistent caching
const QUERY_KEY = {
  jobPost: (id: string) => ['job-post', id] as const,
};

export function useJobPost(id: string) {
  return useQuery({
    queryKey: QUERY_KEY.jobPost(id),
    queryFn: () => apiClient.getJobPost(id),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Invalidation utility
export function useInvalidateJobPost() {
  const queryClient = useQueryClient();
  return (id: string) => queryClient.invalidateQueries({ queryKey: ['job-post', id] });
}

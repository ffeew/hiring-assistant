import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query key for consistent caching
const QUERY_KEY = {
  jobPosts: (activeOnly?: boolean) => ['job-posts', { activeOnly }] as const,
};

export function useJobPosts(activeOnly = false) {
  return useQuery({
    queryKey: QUERY_KEY.jobPosts(activeOnly),
    queryFn: () => apiClient.getJobPosts(activeOnly),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Invalidation utility
export function useInvalidateJobPosts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['job-posts'] });
}

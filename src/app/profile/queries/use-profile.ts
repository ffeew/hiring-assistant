import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query key for consistent caching
const QUERY_KEY = {
  profile: () => ['profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEY.profile(),
    queryFn: () => apiClient.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Invalidation utility
export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['profile'] });
}

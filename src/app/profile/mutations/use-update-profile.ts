import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ProfileUpdateData } from '@/app/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdateData) => apiClient.updateProfile(payload),
    mutationKey: ['update-profile'],
    onSuccess: (updatedProfile) => {
      // Update profile in cache
      queryClient.setQueryData(['profile'], updatedProfile);
    },
  });
}

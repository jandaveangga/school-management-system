import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { ApiError } from '@/lib/api-error';

import { authService } from '../services/auth.service';

interface UseLogoutOptions {
  redirectTo?: string;
}

export const useLogout = (
  options: UseLogoutOptions = {},
): UseMutationResult<void, ApiError, void> => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const redirectTo = options.redirectTo ?? '/login';

  return useMutation({
    mutationFn: authService.logout,
    onSettled: async () => {
      // Drop all cached queries — the next user (or anonymous viewer)
      // shouldn't see anything that was scoped to the logged-out user.
      queryClient.clear();

      await navigate(redirectTo, { replace: true });
    },
  });
};
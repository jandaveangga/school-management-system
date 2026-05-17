import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import type { LoginFormValues, TokenPair } from '../schemas';
import { authService } from '../services/auth.service';

export const useLogin = (): UseMutationResult<
  TokenPair,
  ApiError,
  LoginFormValues
> => {
  return useMutation({
    mutationFn: authService.login,
  });
};
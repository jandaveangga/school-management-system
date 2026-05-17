import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import type {
  RegisterBody,
  RegisterFormValues,
  TokenPair,
} from '../schemas';
import { authService } from '../services/auth.service';

// Mutation accepts the form values (which include confirmPassword)
// and strips confirmPassword before hitting the API.
// Caller passes form output directly.
export const useRegister = (): UseMutationResult<
  TokenPair,
  ApiError,
  RegisterFormValues
> => {
  return useMutation({
    mutationFn: (form) => {
      const body: RegisterBody = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.phone !== undefined &&
          form.phone !== '' && {
            phone: form.phone,
          }),
      };

      return authService.register(body);
    },
  });
};
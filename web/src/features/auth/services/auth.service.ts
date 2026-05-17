import { z } from 'zod';

import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import { useAuthStore } from '@/store/auth-store';

import {
  type LoginFormValues,
  publicUserSchema,
  type PublicUser,
  type RegisterBody,
  tokenPairSchema,
  type TokenPair,
} from '../schemas';

// Wraps backend /api/v1/auth endpoints.
// Each function returns Zod-validated data;
// errors are ApiError instances thrown by the api-client.

const persistSession = (pair: TokenPair): void => {
  authStorage.setRefreshToken(pair.refreshToken);

  useAuthStore
    .getState()
    .setSession(pair.user, pair.accessToken);
};

export const authService = {
  login: async (
    input: LoginFormValues,
  ): Promise<TokenPair> => {
    const pair = await apiClient({
      path: '/auth/login',
      method: 'POST',
      body: input,
      schema: tokenPairSchema,
      skipAuth: true,
    });

    persistSession(pair);

    return pair;
  },

  // Public self-signup.
  // Backend assigns the STUDENT role automatically.
  register: async (
    input: RegisterBody,
  ): Promise<TokenPair> => {
    const pair = await apiClient({
      path: '/auth/register',
      method: 'POST',
      body: input,
      schema: tokenPairSchema,
      skipAuth: true,
    });

    persistSession(pair);

    return pair;
  },

  logout: async (): Promise<void> => {
    const refreshToken = authStorage.getRefreshToken();

    try {
      if (refreshToken !== null) {
        await apiClient({
          path: '/auth/logout',
          method: 'POST',
          body: { refreshToken },
          schema: z.void(),
          skipAuth: true,
        });
      }
    } finally {
      // Always clear local state even if the server call fails
      // — the user intent is to be logged out.
      authStorage.clearRefreshToken();

      useAuthStore.getState().clearSession();
    }
  },

  me: async (): Promise<PublicUser> => {
    return apiClient({
      path: '/auth/me',
      method: 'GET',
      schema: publicUserSchema,
    });
  },
};
import { useAuthStore, type AuthStatus } from '@/store/auth-store';
import type { TokenUser } from '../schemas';

interface UseAuthReturn {
  user: TokenUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

/**
 * Read-only auth hook for components.
 * Mutation actions (login/logout/refresh) are handled in dedicated hooks.
 */
export const useAuth = (): UseAuthReturn => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  return {
    user,
    status,
    accessToken,

    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
};
import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { authStorage } from '@/lib/auth-storage';
import { refreshAccessToken } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Spinner } from '@/components/Spinner';

interface Props {
  children: ReactNode;
}

// Top-level wrapper.
// On mount:
//   - If a refresh token exists, attempt to exchange it for a fresh access token.
//   - If none exists, immediately clear session.
//
// Renders a spinner while resolving so the router never sees a "loading" state.
export const AuthBootstrap = ({ children }: Props): ReactElement => {
  const status = useAuthStore((s) => s.status);
  const [didRun, setDidRun] = useState(false);

  useEffect(() => {
    if (didRun) return;

    setDidRun(true);

    const run = async (): Promise<void> => {
      const refreshToken = authStorage.getRefreshToken();

      if (refreshToken === null) {
        useAuthStore.getState().clearSession();
        return;
      }

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken === null) {
        useAuthStore.getState().clearSession();
      }
    };

    void run();
  }, [didRun]);

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner label="Loading session" />
      </div>
    );
  }

  return <>{children}</>;
};
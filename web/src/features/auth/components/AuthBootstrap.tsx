import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export const AuthBootstrap = () => {
  const { setStatus } = useAuthStore();

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, [setStatus]);

  return null; // This is a bootstrap component, it doesn't render anything
};

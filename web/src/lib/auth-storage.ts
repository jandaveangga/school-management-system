 // localStorage persistence for refresh token only.
 // Access token is kept in memory (Zustand) so it is cleared on tab close.
 // Refresh token survives reloads to maintain session continuity.

 // ⚠️ Security note:
 // localStorage is vulnerable to XSS attacks.
 // Best practice is httpOnly cookies (backend change required, tracked for Phase 5).

const REFRESH_TOKEN_KEY = 'school-mngt:refresh-token';

const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined';

export const authStorage = {
  getRefreshToken: (): string | null => {
    if (!isBrowser) return null;

    try {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string): void => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // Storage disabled or quota exceeded — fail silently
    }
  },

  clearRefreshToken: (): void => {
    if (!isBrowser) return;

    try {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
  },
};

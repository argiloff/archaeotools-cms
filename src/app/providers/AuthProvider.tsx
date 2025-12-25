import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { authStore, type SessionUser } from '../../state/auth.store';

type AuthContextValue = {
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (params: {
    user: SessionUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => Promise<void>;
  clear: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(() => authStore.getState());

  useEffect(() => {
    const unsub = authStore.subscribe((next) => {
      setState(next);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      setSession: ({ user, accessToken, refreshToken }) => {
        authStore.getState().setTokens({ accessToken, refreshToken });
        authStore.getState().setUser(user);
        setState(authStore.getState());
      },
      logout: async () => {
        const refreshToken = authStore.getState().refreshToken;
        if (refreshToken) {
          try {
            const { logout } = await import('../../api/auth.service');
            await logout(refreshToken);
          } catch {
            // best-effort logout; bei Fehler trotzdem local clear
          }
        }
        authStore.getState().clear();
        setState(authStore.getState());
      },
      clear: () => {
        authStore.getState().clear();
        setState(authStore.getState());
      },
    }),
    [state.accessToken, state.refreshToken, state.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

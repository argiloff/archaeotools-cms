import { create } from 'zustand';

export type RoleName = 'USER' | 'ADMIN' | 'SUPERADMIN';

export type SessionUser = {
  id: string;
  email: string;
  roles: RoleName[];
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
  setUser: (user: SessionUser | null) => void;
};

export const authStore = create<AuthState>((set) => ({
  accessToken: sessionStorage.getItem('acc') || null,
  refreshToken: sessionStorage.getItem('ref') || null,
  user: (() => {
    const raw = sessionStorage.getItem('usr');
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  })(),
  setTokens: ({ accessToken, refreshToken }) =>
    set(() => {
      sessionStorage.setItem('acc', accessToken);
      sessionStorage.setItem('ref', refreshToken);
      return { accessToken, refreshToken };
    }),
  clear: () =>
    set(() => {
      sessionStorage.removeItem('acc');
      sessionStorage.removeItem('ref');
      sessionStorage.removeItem('usr');
      return { accessToken: null, refreshToken: null, user: null };
    }),
  setUser: (user) =>
    set(() => {
      if (user) {
        sessionStorage.setItem('usr', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('usr');
      }
      return { user };
    }),
}));

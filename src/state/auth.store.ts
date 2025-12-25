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
  accessToken: null,
  refreshToken: null,
  user: null,
  setTokens: ({ accessToken, refreshToken }) =>
    set(() => ({ accessToken, refreshToken })),
  clear: () => set(() => ({ accessToken: null, refreshToken: null, user: null })),
  setUser: (user) => set(() => ({ user })),
}));

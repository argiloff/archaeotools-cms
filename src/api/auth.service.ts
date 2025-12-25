import { httpClient } from './httpClient';
import type { AuthTokens } from './types';
import type { SessionUser } from '../state/auth.store';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post<AuthTokens>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await httpClient.post<AuthTokens>('/auth/register', payload);
  return data;
}

export async function refresh(refreshToken: string) {
  const { data } = await httpClient.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string) {
  await httpClient.post('/auth/logout', { refreshToken });
}

export async function me(): Promise<SessionUser> {
  const { data } = await httpClient.get<SessionUser>('/users/me');
  return data;
}

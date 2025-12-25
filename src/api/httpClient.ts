import axios, { AxiosHeaders } from 'axios';
import { authStore } from '../state/auth.store';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL,
});

httpClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { refreshToken, setTokens, clear } = authStore.getState();
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshed = await httpClient.post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', { refreshToken });
        setTokens(refreshed.data);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshed.data.accessToken}`,
        };
        return httpClient(originalRequest);
      } catch {
        clear();
      }
    }
    return Promise.reject(error);
  },
);

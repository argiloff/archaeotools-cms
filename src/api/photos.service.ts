import { httpClient } from './httpClient';
import type { Photo, PresignedUpload } from './types';

export async function listPhotos(projectId: string) {
  const { data } = await httpClient.get<Photo[]>(`/projects/${projectId}/photos`);
  return data;
}

export async function createPhoto(projectId: string, payload: Partial<Photo>) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('createPhoto payload →', payload);
  }
  const { data } = await httpClient.post<Photo>(
    `/projects/${projectId}/photos`,
    payload,
  );
  return data;
}

const storageBaseUrl =
  import.meta.env.VITE_STORAGE_PUBLIC_URL?.replace(/\/$/, '') || null;

const getBaseUrl = () =>
  storageBaseUrl ||
  (typeof window !== 'undefined' ? window.location.origin : null);

export function buildPhotoPublicUrlFromKey(key?: string | null) {
  if (!key) return null;
  const base = getBaseUrl();
  if (!base) return null;
  const encoded = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${base.replace(/\/$/, '')}/${encoded}`;
}

export function ensureAbsoluteUrl(url?: string | null, key?: string | null) {
  let candidate = url ?? buildPhotoPublicUrlFromKey(key);
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.hostname === 'localhost') parsed.hostname = '127.0.0.1';
    const decodedPath = parsed.pathname
      .split('/')
      .map((segment) => decodeURIComponent(segment))
      .join('/');
    parsed.pathname = decodedPath;
    return parsed.toString();
  } catch {
    try {
      const parsed = new URL(candidate, getBaseUrl() ?? undefined);
      if (parsed.hostname === 'localhost') parsed.hostname = '127.0.0.1';
      const decodedPath = parsed.pathname
        .split('/')
        .map((segment) => decodeURIComponent(segment))
        .join('/');
      parsed.pathname = decodedPath;
      return parsed.toString();
    } catch {
      try {
        const parsed = new URL(decodeURIComponent(candidate));
        if (parsed.hostname === 'localhost') parsed.hostname = '127.0.0.1';
        const decodedPath = parsed.pathname
          .split('/')
          .map((segment) => decodeURIComponent(segment))
          .join('/');
        parsed.pathname = decodedPath;
        return parsed.toString();
      } catch {
        return buildPhotoPublicUrlFromKey(key);
      }
    }
  }
}

export function resolvePhotoUrl(photo: Photo) {
  const normalized = ensureAbsoluteUrl(photo.url, photo.storageKey);
  if (normalized) return normalized;
  if (photo.url.startsWith('http')) return photo.url;
  return photo.url;
}

export async function createUploadUrl(
  projectId: string,
  payload: { filename: string; contentType: string; contentLength: number },
) {
  const { data } = await httpClient.post<PresignedUpload>(
    `/projects/${projectId}/photos/upload-url`,
    payload,
  );
  return data;
}

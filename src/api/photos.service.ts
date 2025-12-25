import { httpClient } from './httpClient';
import type { Photo } from './types';

export async function listPhotos(projectId: string) {
  const { data } = await httpClient.get<Photo[]>(`/projects/${projectId}/photos`);
  return data;
}

export async function createPhoto(projectId: string, payload: Partial<Photo>) {
  const { data } = await httpClient.post<Photo>(
    `/projects/${projectId}/photos`,
    payload,
  );
  return data;
}

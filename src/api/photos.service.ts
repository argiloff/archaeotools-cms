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

export async function uploadPhoto(
  projectId: string,
  payload: {
    file: File;
    description?: string;
    placeId?: string | null;
    tags?: string[];
    notes?: string;
  },
) {
  const form = new FormData();
  form.append('file', payload.file);
  if (payload.description) form.append('description', payload.description);
  if (payload.placeId) form.append('placeId', payload.placeId);
  if (payload.tags?.length) form.append('tags', JSON.stringify(payload.tags));
  if (payload.notes) form.append('notes', payload.notes);

  const { data } = await httpClient.post<Photo>(
    `/projects/${projectId}/photos`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

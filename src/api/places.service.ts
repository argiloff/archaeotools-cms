import { httpClient } from './httpClient';
import type { Place } from './types';

export async function listPlaces(projectId: string) {
  const { data } = await httpClient.get<Place[]>(`/projects/${projectId}/places`);
  return data;
}

export async function createPlace(projectId: string, payload: Partial<Place>) {
  const { data } = await httpClient.post<Place>(
    `/projects/${projectId}/places`,
    payload,
  );
  return data;
}

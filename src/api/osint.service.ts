import { httpClient } from './httpClient';
import type { OsintItem } from './types';

export async function listOsint(projectId: string) {
  const { data } = await httpClient.get<OsintItem[]>(`/projects/${projectId}/osint`);
  return data;
}

export async function createOsint(projectId: string, payload: Partial<OsintItem>) {
  const { data } = await httpClient.post<OsintItem>(
    `/projects/${projectId}/osint`,
    payload,
  );
  return data;
}

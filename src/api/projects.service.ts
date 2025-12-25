import { httpClient } from './httpClient';
import type { Project } from './types';

export async function listProjects() {
  const { data } = await httpClient.get<Project[]>('/projects');
  return data;
}

export async function getProject(id: string) {
  const { data } = await httpClient.get<Project>(`/projects/${id}`);
  return data;
}

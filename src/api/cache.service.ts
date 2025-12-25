import { httpClient } from './httpClient';

export type CacheMetrics = {
  hitRate?: number;
  lastInvalidations?: { projectId: string; at: string }[];
};

export async function getCacheMetrics() {
  const { data } = await httpClient.get<CacheMetrics>('/cache/metrics');
  return data;
}

export async function invalidateProjectCache(projectId: string) {
  await httpClient.post(`/cache/projects/${projectId}/invalidate`);
}

export async function recomputeProjectSummary(projectId: string) {
  await httpClient.post(`/cache/projects/${projectId}/recompute-summary`);
}

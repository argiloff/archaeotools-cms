import { httpClient } from './httpClient';
import type { Place } from './types';

export interface PlaceImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ place: string; error: string }>;
  places: Place[];
}

export interface PlacesFilter {
  projectId?: string | null;
  country?: string;
  city?: string;
  unassignedOnly?: boolean;
}

// Legacy: Project-scoped places
export async function listPlaces(projectId: string): Promise<Place[]> {
  const { data } = await httpClient.get<Place[]>(`/projects/${projectId}/places`);
  return data;
}

// New: Global places with filtering
export async function listAllPlaces(filter?: PlacesFilter): Promise<Place[]> {
  const params = new URLSearchParams();
  if (filter?.projectId !== undefined) {
    params.append('projectId', filter.projectId || 'null');
  }
  if (filter?.country) params.append('country', filter.country);
  if (filter?.city) params.append('city', filter.city);
  if (filter?.unassignedOnly) params.append('projectId', 'null');
  
  const { data } = await httpClient.get<Place[]>(`/places?${params.toString()}`);
  return data;
}

// Get single place (global)
export async function getPlace(placeId: string): Promise<Place> {
  const { data } = await httpClient.get<Place>(`/places/${placeId}`);
  return data;
}

// Create global place (no project)
export async function createGlobalPlace(place: Partial<Place>): Promise<Place> {
  const { data } = await httpClient.post<Place>('/places', place);
  return data;
}

// Update place
export async function updatePlace(placeId: string, updates: Partial<Place>): Promise<Place> {
  const { data } = await httpClient.patch<Place>(`/places/${placeId}`, updates);
  return data;
}

// Delete place
export async function deletePlace(placeId: string): Promise<void> {
  await httpClient.delete(`/places/${placeId}`);
}

// Assign place to project
export async function assignPlaceToProject(placeId: string, projectId: string): Promise<Place> {
  const { data } = await httpClient.post<Place>(`/places/${placeId}/assign`, { projectId });
  return data;
}

// Unassign place from project
export async function unassignPlaceFromProject(placeId: string): Promise<Place> {
  const { data } = await httpClient.post<Place>(`/places/${placeId}/unassign`);
  return data;
}

// Bulk assign places
export async function bulkAssignPlaces(placeIds: string[], projectId: string): Promise<void> {
  await httpClient.post('/places/bulk-assign', { placeIds, projectId });
}

// Import places from JSON
export async function importPlacesFromJson(
  file: File,
  assignToProject?: string
): Promise<PlaceImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (assignToProject) {
    formData.append('assignToProject', assignToProject);
  }
  
  const { data } = await httpClient.post<PlaceImportResult>('/places/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Legacy: Project-scoped place operations
export async function createPlace(projectId: string, payload: Partial<Place>) {
  const { data } = await httpClient.post<Place>(
    `/projects/${projectId}/places`,
    payload,
  );
  return data;
}

export async function updateProjectPlace(projectId: string, placeId: string, payload: Partial<Place>) {
  const { data } = await httpClient.patch<Place>(
    `/projects/${projectId}/places/${placeId}`,
    payload,
  );
  return data;
}

export async function deleteProjectPlace(projectId: string, placeId: string) {
  await httpClient.delete(`/projects/${projectId}/places/${placeId}`);
}

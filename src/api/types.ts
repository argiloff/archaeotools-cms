// Shared DTO types aligned with backend Swagger (docs/api.md, auth.md).

export type Visibility = 'PUBLIC' | 'PRIVATE';

export type Project = {
  id: string;
  name: string;
  type?: string;
  visibility?: Visibility;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Place = {
  id: string;
  projectId: string;
  name?: string;
  type?: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Photo = {
  id: string;
  projectId: string;
  url: string;
  description?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  capturedAt?: string;
  lat?: number;
  lng?: number;
  placeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OsintStatus = 'IDEA' | 'IN_PROGRESS' | 'DONE';

export type OsintItem = {
  id: string;
  projectId: string;
  title: string;
  url?: string;
  source?: string;
  summary?: string;
  tags?: string[];
  status: OsintStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

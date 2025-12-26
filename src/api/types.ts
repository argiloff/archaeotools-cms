// Shared DTO types aligned with backend Swagger (docs/api.md, auth.md).

export type Visibility = 'PUBLIC' | 'PRIVATE';

export type ProjectType = 'MUSEUM_GUIDE' | 'ARCHAEOLOGY' | 'OSINT';

export type Project = {
  id: string;
  name: string;
  type?: ProjectType;
  visibility?: Visibility;
  description?: string;
  locationName?: string;
  country?: string;
  city?: string;
  visitedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PlaceType = 
  | 'SITE'                    // Backward Compatibility
  | 'MUSEUM'
  | 'POI'
  | 'ARCHAEOLOGICAL_SITE'     // Ausgrabungsstätte
  | 'HISTORICAL_SITE'         // Historischer Ort
  | 'MONUMENT'                // Denkmal
  | 'ARCHIVE'                 // Archiv
  | 'RELIGIOUS_SITE'          // Kirche, Tempel
  | 'FORTIFICATION'           // Burg, Festung
  | 'SETTLEMENT'              // Siedlung
  | 'BURIAL_SITE'             // Grabstätte
  | 'INDUSTRIAL_HERITAGE'     // Industriedenkmal
  | 'CULTURAL_LANDSCAPE'      // Kulturlandschaft
  | 'RESEARCH_LOCATION'       // Forschungsstandort
  | 'WITNESS_LOCATION'        // Zeitzeugen-Ort
  | 'OTHER';

export type Place = {
  id: string;
  userId: string;
  projectId?: string | null; // Optional - kann null sein für globale Places
  title?: string;
  description?: string;
  type?: PlaceType;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  visited?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importSource?: string;
  importedAt?: string;
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
  storageKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PresignedUpload = {
  uploadUrl: string;
  key: string;
  fileUrl?: string;
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

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listPhotos,
  createPhoto,
  createUploadUrl,
  resolvePhotoUrl,
  ensureAbsoluteUrl,
  buildPhotoPublicUrlFromKey,
  updatePhoto,
  deletePhoto,
} from '../../api/photos.service';
import { listPlaces, createPlace, updateProjectPlace, deleteProjectPlace } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import { MapPreview } from '../../components/map/MapPreview';
import type { MapPoint } from '../../components/map/MapPreview';
import { Modal } from '../../components/ui/Modal';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import type { Photo } from '../../api/types';
import './mediaManager.css';

export function MediaManagerPage() {
  const navigate = useNavigate();
  const { projectId, project } = useCurrentProject();
  const qc = useQueryClient();
  const [placeFilter, setPlaceFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [mapMode, setMapMode] = useState<'places' | 'heat'>('places');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [placeModalMode, setPlaceModalMode] = useState<'create' | 'edit'>('create');
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [placeTitle, setPlaceTitle] = useState('');
  const [placeType, setPlaceType] = useState<'SITE' | 'MUSEUM' | 'POI'>('SITE');
  const [placeDescription, setPlaceDescription] = useState<any>(null);
  const [placeLat, setPlaceLat] = useState('');
  const [placeLng, setPlaceLng] = useState('');
  const [placeRadius, setPlaceRadius] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeCity, setPlaceCity] = useState('');
  const [placeCountry, setPlaceCountry] = useState('');
  const [placeVisited, setPlaceVisited] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoNotes, setPhotoNotes] = useState<any>(null);
  const [photoTags, setPhotoTags] = useState('');
  const [photoPlaceId, setPhotoPlaceId] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [galleryPlaceId, setGalleryPlaceId] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [photoModalMode, setPhotoModalMode] = useState<'create' | 'edit'>('create');
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [visibleCount, setVisibleCount] = useState(60);

  const deferredPlaceFilter = useDeferredValue(placeFilter);
  const deferredTagFilter = useDeferredValue(tagFilter);
  const deferredSearch = useDeferredValue(search);
  const deferredStartDate = useDeferredValue(startDate);
  const deferredEndDate = useDeferredValue(endDate);

  useEffect(() => {
    setVisibleCount(60);
  }, [deferredPlaceFilter, deferredTagFilter, deferredSearch, deferredStartDate, deferredEndDate]);

  const photosQuery = useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => listPhotos(projectId!),
    enabled: !!projectId,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => deletePhoto(projectId!, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos', projectId] });
      setStatusMessage('Foto gelöscht.');
    },
    onError: () => setStatusMessage('Löschen fehlgeschlagen.'),
  });
  const placesQuery = useQuery({
    queryKey: ['places', projectId],
    queryFn: () => listPlaces(projectId!),
    enabled: !!projectId,
  });

  const resetPlaceForm = () => {
    setPlaceTitle('');
    setPlaceType('SITE');
    setPlaceDescription(null);
    setPlaceLat('');
    setPlaceLng('');
    setPlaceRadius('');
    setPlaceAddress('');
    setPlaceCity('');
    setPlaceCountry('');
    setPlaceVisited(false);
    setEditingPlaceId(null);
    setPlaceModalMode('create');
  };

  const savePlaceMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createPlace>[1]) =>
      editingPlaceId
        ? updateProjectPlace(projectId!, editingPlaceId, payload)
        : createPlace(projectId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['places', projectId] });
      setShowPlaceModal(false);
      resetPlaceForm();
      setPlaceError(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Speichern fehlgeschlagen.';
      setPlaceError(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: (placeId: string) => deleteProjectPlace(projectId!, placeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['places', projectId] });
      setStatusMessage('Place gelöscht.');
    },
    onError: () => setStatusMessage('Löschen fehlgeschlagen.'),
  });

  const resetPhotoForm = () => {
    setPhotoFile(null);
    setPhotoDesc('');
    setPhotoNotes(null);
    setPhotoTags('');
    setPhotoPlaceId('');
    setEditingPhoto(null);
    setPhotoModalMode('create');
  };

  const savePhotoMutation = useMutation({
    mutationFn: async (payload: {
      file?: File | null;
      photoId?: string;
      description?: string;
      placeId?: string | null;
      tags?: string[];
      notes?: string;
    }) => {
      let publicUrl: string | undefined;
      let storageKey: string | undefined;

      if (payload.file) {
        const presigned = await createUploadUrl(projectId!, {
          filename: payload.file.name,
          contentType: payload.file.type || 'image/jpeg',
          contentLength: payload.file.size,
        });
        await fetch(presigned.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': payload.file.type || 'image/jpeg',
          },
          body: payload.file,
        });
        publicUrl =
          ensureAbsoluteUrl(presigned.fileUrl, presigned.key) ??
          ensureAbsoluteUrl(presigned.uploadUrl, presigned.key) ??
          buildPhotoPublicUrlFromKey(presigned.key) ??
          presigned.key;
        storageKey = presigned.key;
      }

      if (payload.photoId) {
        return updatePhoto(projectId!, payload.photoId, {
          ...(publicUrl ? { url: publicUrl } : {}),
          ...(storageKey ? { storageKey } : {}),
          description: payload.description,
          placeId: payload.placeId || undefined,
          tags: payload.tags,
          notes: payload.notes,
        });
      }

      if (!publicUrl || !storageKey) {
        throw new Error('Für neue Fotos muss eine Datei ausgewählt werden.');
      }

      return createPhoto(projectId!, {
        url: publicUrl,
        storageKey,
        description: payload.description,
        placeId: payload.placeId || undefined,
        tags: payload.tags,
        notes: payload.notes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos', projectId] });
      setShowPhotoModal(false);
      resetPhotoForm();
      setPhotoError(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Upload fehlgeschlagen.';
      setPhotoError(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const photos = photosQuery.data ?? [];
  const places = placesQuery.data ?? [];

  const filtered = useMemo(() => {
    const placeTerm = deferredPlaceFilter;
    const tagTerm = deferredTagFilter.trim().toLowerCase();
    const searchTerm = deferredSearch.trim().toLowerCase();
    const start = deferredStartDate;
    const end = deferredEndDate;
    return photos.filter((p) => {
      const matchPlace = placeTerm ? p.placeId === placeTerm : true;
      const matchTag = tagTerm
        ? (p.tags ?? []).some((t) => t.toLowerCase().includes(tagTerm))
        : true;
      const matchSearch = searchTerm
        ? (p.description ?? '').toLowerCase().includes(searchTerm) ||
          (p.notes ?? '').toLowerCase().includes(searchTerm)
        : true;
      const matchStart = start ? (p.capturedAt ? p.capturedAt >= start : false) : true;
      const matchEnd = end ? (p.capturedAt ? p.capturedAt <= end : false) : true;
      return matchPlace && matchTag && matchSearch && matchStart && matchEnd;
    });
  }, [photos, deferredPlaceFilter, deferredTagFilter, deferredSearch, deferredStartDate, deferredEndDate]);

  const placePoints = useMemo<MapPoint[]>(
    () =>
      places
        .filter((pl) => pl.latitude != null && pl.longitude != null)
        .map((pl) => ({
          id: pl.id,
          lat: pl.latitude!,
          lng: pl.longitude!,
          label: pl.title ?? pl.type ?? 'Place',
          meta: { placeId: pl.id },
        })),
    [places],
  );

  const heatPoints = useMemo<MapPoint[]>(() => {
    const buckets = new Map<string, { lat: number; lng: number; count: number }>();
    filtered.forEach((photo) => {
      if (photo.lat == null || photo.lng == null) return;
      const key = `${photo.lat.toFixed(4)}-${photo.lng.toFixed(4)}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count += 1;
      } else {
        buckets.set(key, { lat: photo.lat, lng: photo.lng, count: 1 });
      }
    });
    return Array.from(buckets.values()).map((b, idx) => ({
      id: `heat-${idx}`,
      lat: b.lat,
      lng: b.lng,
      intensity: b.count,
      label: `${b.count} Foto${b.count > 1 ? 's' : ''}`,
    }));
  }, [filtered]);

  const visiblePhotos = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMorePhotos = filtered.length > visibleCount;
  const galleryPhotos =
    galleryPlaceId && photosQuery.data
      ? photosQuery.data.filter((p) => p.placeId === galleryPlaceId)
      : [];

  const geoPhotos = useMemo(() => photos.filter((p) => p.lat != null && p.lng != null).length, [photos]);
  const taggedPhotos = useMemo(
    () => photos.filter((p) => (p.tags ?? []).length > 0).length,
    [photos],
  );
  const tagUniverseSize = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      (p.tags ?? []).forEach((t) => set.add(t));
    });
    return set.size;
  }, [photos]);
  const visitedPlaces = useMemo(() => places.filter((pl) => pl.visited).length, [places]);

  const heroStats = useMemo(
    () => [
      { label: 'Fotos', value: photos.length, hint: `${filtered.length} aktiv gefiltert` },
      { label: 'Places', value: places.length, hint: `${visitedPlaces} besucht` },
      { label: 'Geo-Fotos', value: geoPhotos, hint: 'Mit GPS-Koordinaten' },
      { label: 'Tags', value: tagUniverseSize, hint: `${taggedPhotos} Fotos getaggt` },
    ],
    [photos, filtered.length, places, visitedPlaces, geoPhotos, tagUniverseSize, taggedPhotos],
  );

  const photoStatusText = photosQuery.isLoading
    ? 'Lade Fotos …'
    : photosQuery.isError
      ? 'Fehler beim Laden der Fotos'
      : `${filtered.length} von ${photos.length} Fotos`;

  const anyFilterActive = Boolean(placeFilter || tagFilter || search || startDate || endDate);
  const resetFilters = () => {
    setPlaceFilter('');
    setTagFilter('');
    setSearch('');
    setStartDate('');
    setEndDate('');
  };
  const filterSummary = anyFilterActive ? `${filtered.length} Treffer` : `${photos.length} Fotos gesamt`;

  return (
    <div className="page media-page">
      <div className="media-hero">
        <div className="media-hero__left">
          <span className="media-eyebrow">{project?.name ?? 'Projekt'}</span>
          <h1>Spatial Media Manager</h1>
          <p>Verwalte Orte, Fotos und Geodaten mit modernen Filtern und Kartenansichten.</p>
          <div className="media-hero__actions">
            <button className="ghost-btn" onClick={() => setShowPlaceModal(true)}>
              Place anlegen
            </button>
            <button
              className="btn"
              onClick={() => {
                resetPhotoForm();
                setShowPhotoModal(true);
              }}
            >
              Foto hochladen
            </button>
          </div>
        </div>
        <div className="media-hero__stats">
          {heroStats.map((stat) => (
            <div key={stat.label} className="media-stat-card">
              <div className="label">{stat.label}</div>
              <div className="value">{stat.value}</div>
              <div className="hint">{stat.hint}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="media-section">
        <div className="media-section__header">
          <div>
            <h2>Filter & Suche</h2>
            <p>{filterSummary}</p>
          </div>
          <div className="media-section__header-actions">
            {anyFilterActive && (
              <button className="ghost-link-btn" onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>
        <div className="media-filter-grid">
          <FilterBlock label="Ort">
            <select
              className="input select-like"
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
            >
              <option value="">Alle Orte</option>
              {places.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title ?? pl.type ?? 'Place'}
                </option>
              ))}
            </select>
          </FilterBlock>
          <FilterBlock label="Tag">
            <input
              className="input"
              placeholder="Tag enthält…"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
          </FilterBlock>
          <FilterBlock label="Suche">
            <input
              className="input"
              placeholder="Beschreibung/Notizen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FilterBlock>
          <FilterBlock label="Von">
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FilterBlock>
          <FilterBlock label="Bis">
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FilterBlock>
        </div>
      </section>

      {statusMessage && <div className="media-status">{statusMessage}</div>}

      <div className="media-grid">
        <div className="media-card">
          <div className="media-card__head">
            <div>
              <h3>Places Übersicht</h3>
              <p>
                {places.length
                  ? `${places.length} Orte · ${visitedPlaces} besucht`
                  : 'Noch keine Orte vorhanden'}
              </p>
            </div>
          </div>
          <div className="media-places-list">
            {places.map((pl) => (
              <div key={pl.id} className="media-place-row">
                <div>
                  <div className="title">{pl.title ?? pl.type ?? 'Place'}</div>
                  <div className="meta">{[pl.city, pl.country].filter(Boolean).join(', ') || '–'}</div>
                </div>
                <div className="place-actions">
                  <button
                    className="icon-btn"
                    aria-label="Bearbeiten"
                    onClick={() => {
                      setPlaceModalMode('edit');
                      setEditingPlaceId(pl.id);
                      setPlaceTitle(pl.title ?? '');
                      setPlaceType((pl.type as 'SITE' | 'MUSEUM' | 'POI') ?? 'SITE');
                      setPlaceDescription(pl.description ? JSON.parse(pl.description) : null);
                      setPlaceLat(pl.latitude?.toString() ?? '');
                      setPlaceLng(pl.longitude?.toString() ?? '');
                      setPlaceRadius(pl.radiusMeters?.toString() ?? '');
                      setPlaceAddress(pl.address ?? '');
                      setPlaceCity(pl.city ?? '');
                      setPlaceCountry(pl.country ?? '');
                      setPlaceVisited(pl.visited ?? false);
                      setShowPlaceModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn danger"
                    aria-label="Löschen"
                    onClick={() => {
                      if (!projectId || deletePlaceMutation.isPending) return;
                      if (window.confirm('Place wirklich löschen?')) {
                        deletePlaceMutation.mutate(pl.id);
                      }
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {places.length === 0 && <div className="empty-line">Keine Places vorhanden</div>}
          </div>
        </div>
        <div className="media-card">
          <div className="media-card__head">
            <div>
              <h3>Map (OpenStreetMap)</h3>
              <p>{mapMode === 'places' ? 'Placemarker' : 'Foto-Heatmap'}</p>
            </div>
            <div className="media-card__actions">
              <button
                className={`pill-btn ${mapMode === 'places' ? 'active' : ''}`}
                onClick={() => setMapMode('places')}
              >
                Orte
              </button>
              <button className={`pill-btn ${mapMode === 'heat' ? 'active' : ''}`} onClick={() => setMapMode('heat')}>
                Heatmap
              </button>
            </div>
          </div>
          {mapMode === 'places' ? (
            placePoints.length ? (
              <MapPreview
                points={placePoints}
                height={320}
                onMarkerClick={(p) => setGalleryPlaceId(p.meta?.placeId as string)}
              />
            ) : (
              <div className="empty-line">Keine Places mit Geodaten.</div>
            )
          ) : heatPoints.length ? (
            <MapPreview points={heatPoints} height={320} heat />
          ) : (
            <div className="empty-line">Keine Fotos mit Geodaten für aktuelle Filter.</div>
          )}
        </div>
      </div>

      <div className="media-card">
        <div className="media-card__head">
          <div>
            <h3>Foto-Galerie</h3>
            <p>{photoStatusText}</p>
          </div>
          {hasMorePhotos && (
            <div className="media-card__actions">
              <button className="ghost-btn" onClick={() => setVisibleCount((prev) => prev + 60)}>
                Mehr laden
              </button>
            </div>
          )}
        </div>
        <div className="photo-grid">
          {!photosQuery.isLoading &&
            !photosQuery.isError &&
            visiblePhotos.map((p) => (
              <div key={p.id} className="photo-card">
                <div
                  className="photo-thumb-wrapper"
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewPhoto(p)}
                  onKeyDown={(evt) => {
                    if (evt.key === 'Enter' || evt.key === ' ') {
                      evt.preventDefault();
                      setPreviewPhoto(p);
                    }
                  }}
                >
                  {p.url ? (
                    <img className="photo-thumb" src={resolvePhotoUrl(p)} alt={p.description ?? 'Foto'} />
                  ) : (
                    <div className="photo-thumb-placeholder">Kein Bild</div>
                  )}
                  <div className="photo-actions-overlay">
                    <button
                      className="icon-btn"
                      aria-label="Foto bearbeiten"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoModalMode('edit');
                        setEditingPhoto(p);
                        setPhotoFile(null);
                        setPhotoDesc(p.description ?? '');
                        setPhotoTags((p.tags ?? []).join(', '));
                        setPhotoPlaceId(p.placeId ?? '');
                        try {
                          setPhotoNotes(p.notes ? JSON.parse(p.notes) : null);
                        } catch {
                          setPhotoNotes(p.notes ?? null);
                        }
                        setShowPhotoModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      aria-label="Photo Studio öffnen"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/media/studio/${p.id}`);
                      }}
                    >
                      🛠
                    </button>
                    <button
                      className="icon-btn danger"
                      aria-label="Foto löschen"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (deletePhotoMutation.isPending) return;
                        if (window.confirm('Foto wirklich löschen?')) {
                          deletePhotoMutation.mutate(p.id);
                        }
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="photo-meta">
                  <div className="photo-meta-title">{p.description ?? 'Foto'}</div>
                  <div className="photo-meta-subline">
                    <span>{p.capturedAt ? new Date(p.capturedAt).toLocaleDateString() : 'Ohne Datum'}</span>
                    {p.placeId && (
                      <span>• {places.find((pl) => pl.id === p.placeId)?.title ?? 'Place'}</span>
                    )}
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="photo-tags">
                      {p.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}
                  {p.notes && <div className="photo-notes-preview">{p.notes}</div>}
                </div>
              </div>
            ))}
          {photosQuery.isLoading && <div style={{ color: '#8fa0bf' }}>Lade …</div>}
          {photosQuery.isError && <div style={{ color: '#f78c6c' }}>Fehler beim Laden</div>}
          {!photosQuery.isLoading && !photosQuery.isError && filtered.length === 0 && (
            <div style={{ color: '#8fa0bf' }}>Keine Fotos mit diesen Filtern.</div>
          )}
        </div>
      </div>

      <Modal
        title={placeModalMode === 'create' ? 'Neuen Place anlegen' : 'Place bearbeiten'}
        open={showPlaceModal}
        onClose={() => {
          if (!savePlaceMutation.isPending) {
            setShowPlaceModal(false);
            resetPlaceForm();
          }
        }}
      >
        <label className="project-selector">
          <span>Titel</span>
          <input className="input" value={placeTitle} onChange={(e) => setPlaceTitle(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Typ</span>
          <select
            className="input select-like"
            value={placeType}
            onChange={(e) => setPlaceType(e.target.value as 'SITE' | 'MUSEUM' | 'POI')}
          >
            <option value="SITE">SITE</option>
            <option value="MUSEUM">MUSEUM</option>
            <option value="POI">POI</option>
          </select>
        </label>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <label className="project-selector">
            <span>Latitude</span>
            <input className="input" value={placeLat} onChange={(e) => setPlaceLat(e.target.value)} />
          </label>
          <label className="project-selector">
            <span>Longitude</span>
            <input className="input" value={placeLng} onChange={(e) => setPlaceLng(e.target.value)} />
          </label>
          <label className="project-selector">
            <span>Radius (m)</span>
            <input className="input" value={placeRadius} onChange={(e) => setPlaceRadius(e.target.value)} />
          </label>
        </div>
        <label className="project-selector">
          <span>Adresse</span>
          <input className="input" value={placeAddress} onChange={(e) => setPlaceAddress(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Land</span>
          <input className="input" value={placeCountry} onChange={(e) => setPlaceCountry(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Stadt</span>
          <input className="input" value={placeCity} onChange={(e) => setPlaceCity(e.target.value)} />
        </label>
        <label className="project-selector" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={placeVisited}
            onChange={(e) => setPlaceVisited(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          <span>Besucht</span>
        </label>
        <div>
          <span style={{ fontSize: 12, color: '#8fa0bf' }}>Notizen</span>
          <RichTextEditor value={placeDescription} onChange={setPlaceDescription} placeholder="Notizen zum Place" />
        </div>
        {placeError && <div style={{ color: '#f78c6c', fontSize: 13 }}>{placeError}</div>}
        <button
          className="btn"
          onClick={() =>
            savePlaceMutation.mutate({
              title: placeTitle,
              type: placeType,
              description: placeDescription ? JSON.stringify(placeDescription) : undefined,
              latitude: placeLat ? Number(placeLat) : undefined,
              longitude: placeLng ? Number(placeLng) : undefined,
              radiusMeters: placeRadius ? Number(placeRadius) : undefined,
              address: placeAddress || undefined,
              city: placeCity || undefined,
              country: placeCountry || undefined,
              visited: placeVisited,
            })
          }
          disabled={!placeTitle || savePlaceMutation.isPending}
        >
          {savePlaceMutation.isPending
            ? 'Speichere…'
            : placeModalMode === 'create'
              ? 'Speichern'
              : 'Änderungen speichern'}
        </button>
      </Modal>

      <Modal
        title={photoModalMode === 'create' ? 'Foto hochladen' : 'Foto bearbeiten'}
        open={showPhotoModal}
        onClose={() => {
          if (!savePhotoMutation.isPending) {
            setShowPhotoModal(false);
            resetPhotoForm();
          }
        }}
      >
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) setPhotoFile(file);
          }}
          style={{
            border: '1px dashed rgba(255,255,255,0.3)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            {photoModalMode === 'create'
              ? 'Bild hierher ziehen oder auswählen'
              : 'Optional neues Bild auswählen (leer lassen, um das bestehende zu behalten)'}
          </div>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          {photoFile && <div style={{ marginTop: 8, fontSize: 13 }}>{photoFile.name}</div>}
        </div>
        <label className="project-selector">
          <span>Beschreibung</span>
          <input className="input" value={photoDesc} onChange={(e) => setPhotoDesc(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Tags (comma)</span>
          <input className="input" value={photoTags} onChange={(e) => setPhotoTags(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Place</span>
          <select className="input select-like" value={photoPlaceId} onChange={(e) => setPhotoPlaceId(e.target.value)}>
            <option value="">Alle Orte</option>
            {places.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.title ?? pl.type ?? 'Place'}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span style={{ fontSize: 12, color: '#8fa0bf' }}>Notizen</span>
          <RichTextEditor value={photoNotes} onChange={setPhotoNotes} placeholder="Notizen zum Foto" />
        </div>
        {photoError && <div style={{ color: '#f78c6c', fontSize: 13 }}>{photoError}</div>}
        <button
          className="btn"
          onClick={() =>
            savePhotoMutation.mutate({
              file: photoFile ?? undefined,
              photoId: photoModalMode === 'edit' ? editingPhoto?.id : undefined,
              description: photoDesc,
              placeId: photoPlaceId || undefined,
              tags: photoTags ? photoTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
              notes: photoNotes ? JSON.stringify(photoNotes) : undefined,
            })
          }
          disabled={
            photoModalMode === 'create'
              ? !photoFile || savePhotoMutation.isPending
              : savePhotoMutation.isPending
          }
        >
          {savePhotoMutation.isPending ? 'Speichere…' : photoModalMode === 'create' ? 'Upload' : 'Änderungen speichern'}
        </button>
      </Modal>

      <Modal
        title={previewPhoto?.description ?? 'Foto'}
        open={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      >
        {previewPhoto ? (
          <div className="photo-preview">
            {previewPhoto.url ? (
              <img
                className="photo-preview-img"
                src={resolvePhotoUrl(previewPhoto)}
                alt={previewPhoto.description ?? 'Foto'}
              />
            ) : (
              <div className="photo-thumb-placeholder">Kein Bild verfügbar</div>
            )}
            <div className="photo-preview-meta">
              <div className="photo-meta-title">{previewPhoto.description ?? 'Foto'}</div>
              <div className="photo-meta-subline">
                <span>
                  {previewPhoto.capturedAt
                    ? new Date(previewPhoto.capturedAt).toLocaleString()
                    : 'Ohne Datum'}
                </span>
                {previewPhoto.placeId && (
                  <span>
                    • {places.find((pl) => pl.id === previewPhoto.placeId)?.title ?? 'Place'}
                  </span>
                )}
              </div>
              {previewPhoto.tags && previewPhoto.tags.length > 0 && (
                <div className="photo-tags">
                  {previewPhoto.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              )}
              {previewPhoto.notes && (
                <div className="photo-notes-preview">
                  {(() => {
                    try {
                      const parsed = JSON.parse(previewPhoto.notes);
                      if (typeof parsed === 'string') return parsed;
                      if (Array.isArray(parsed)) {
                        return parsed.map((block: any) => block.text).join('\n');
                      }
                      return previewPhoto.notes;
                    } catch {
                      return previewPhoto.notes;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Galerie"
        open={galleryPlaceId !== null}
        onClose={() => setGalleryPlaceId(null)}
      >
        {galleryPhotos.length === 0 ? (
          <div style={{ color: '#8fa0bf' }}>Keine Fotos</div>
        ) : (
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {galleryPhotos.map((p) => (
              <div key={p.id} style={{ display: 'grid', gap: 6 }}>
                <img
                  src={p.url}
                  alt={p.description ?? 'Foto'}
                  style={{ width: '100%', borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <div style={{ fontSize: 13, color: '#c5d1e0' }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 6,
        padding: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}
    >
      <span style={{ fontSize: 12, color: '#8fa0bf' }}>{label}</span>
      {children}
    </div>
  );
}

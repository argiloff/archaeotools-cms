import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPhotos, uploadPhoto } from '../../api/photos.service';
import { listPlaces, createPlace } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';
import { MapPreview } from '../../components/map/MapPreview';
import { Modal } from '../../components/ui/Modal';
import { RichTextEditor } from '../../components/editor/RichTextEditor';

export function MediaManagerPage() {
  const { projectId, project } = useCurrentProject();
  const qc = useQueryClient();
  const [placeFilter, setPlaceFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceType, setNewPlaceType] = useState('');
  const [newPlaceNotes, setNewPlaceNotes] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoNotes, setPhotoNotes] = useState<any>(null);
  const [photoTags, setPhotoTags] = useState('');
  const [photoPlaceId, setPhotoPlaceId] = useState<string>('');
  const [galleryPlaceId, setGalleryPlaceId] = useState<string | null>(null);

  const photosQuery = useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => listPhotos(projectId!),
    enabled: !!projectId,
  });
  const placesQuery = useQuery({
    queryKey: ['places', projectId],
    queryFn: () => listPlaces(projectId!),
    enabled: !!projectId,
  });

  const createPlaceMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createPlace>[1]) =>
      createPlace(projectId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['places', projectId] });
      setShowPlaceModal(false);
      setNewPlaceName('');
      setNewPlaceType('');
      setNewPlaceNotes(null);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (payload: {
      file: File;
      description?: string;
      placeId?: string | null;
      tags?: string[];
      notes?: string;
    }) => uploadPhoto(projectId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos', projectId] });
      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoDesc('');
      setPhotoNotes(null);
      setPhotoTags('');
      setPhotoPlaceId('');
    },
  });

  if (!projectId) {
    return (
      <div className="page">
        <h1>Spatial Media Manager</h1>
        <p>Bitte wähle ein Projekt aus.</p>
      </div>
    );
  }

  const photos = photosQuery.data ?? [];
  const places = placesQuery.data ?? [];

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      const matchPlace = placeFilter ? p.placeId === placeFilter : true;
      const matchTag = tagFilter
        ? (p.tags ?? []).some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()))
        : true;
      const matchSearch = search
        ? (p.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (p.notes ?? '').toLowerCase().includes(search.toLowerCase())
        : true;
      return matchPlace && matchTag && matchSearch;
    });
  }, [photos, placeFilter, tagFilter, search]);

  const mapPoints = filtered
    .filter((p) => p.lat != null && p.lng != null && p.placeId)
    .map((p) => ({
      id: p.placeId!,
      lat: p.lat!,
      lng: p.lng!,
      label: places.find((pl) => pl.id === p.placeId)?.name ?? p.description ?? 'Foto',
      meta: { placeId: p.placeId },
    }));

  const galleryPhotos =
    galleryPlaceId && photosQuery.data
      ? photosQuery.data.filter((p) => p.placeId === galleryPlaceId)
      : [];

  return (
    <div className="page">
      <h1>Spatial Media Manager</h1>
      <p>{project?.name ?? 'Projekt'} — Medien mit Filtern.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 16 }}>
        <FilterBlock label="Ort">
          <select
            className="input select-like"
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
          >
            <option value="">Alle Orte</option>
            {places.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name ?? pl.type ?? 'Place'}
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
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => setShowPlaceModal(true)}>
          Place anlegen
        </button>
        <button className="btn" onClick={() => setShowPhotoModal(true)}>
          Foto hochladen
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Map (OpenStreetMap)</div>
        {mapPoints.length ? (
          <MapPreview
            points={mapPoints}
            height={320}
            onMarkerClick={(p) => setGalleryPlaceId(p.meta?.placeId as string)}
          />
        ) : (
          <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine Geodaten für aktuelle Filter.</div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, color: '#8fa0bf', marginBottom: 8 }}>
          {photosQuery.isLoading
            ? 'Lade Fotos …'
            : photosQuery.isError
              ? 'Fehler beim Laden der Fotos'
              : `${filtered.length} von ${photos.length} Fotos`}
        </div>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          {!photosQuery.isLoading &&
            !photosQuery.isError &&
            filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.description ?? 'Foto'}</div>
                <div style={{ fontSize: 12, color: '#8fa0bf' }}>
                  {p.capturedAt ?? 'Ohne Datum'}
                  {p.placeId && (
                    <span style={{ marginLeft: 8, color: '#6de3c4' }}>
                      • {places.find((pl) => pl.id === p.placeId)?.name ?? 'Place'}
                    </span>
                  )}
                </div>
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                {p.notes && (
                  <div style={{ fontSize: 13, color: '#c5d1e0' }}>{p.notes}</div>
                )}
              </div>
            ))}
          {photosQuery.isLoading && <div style={{ color: '#8fa0bf' }}>Lade …</div>}
          {photosQuery.isError && <div style={{ color: '#f78c6c' }}>Fehler beim Laden</div>}
          {!photosQuery.isLoading && !photosQuery.isError && filtered.length === 0 && (
            <div style={{ color: '#8fa0bf' }}>Keine Fotos mit diesen Filtern.</div>
          )}
        </div>
      </div>

      <Modal title="Neuen Place anlegen" open={showPlaceModal} onClose={() => setShowPlaceModal(false)}>
        <label className="project-selector">
          <span>Name</span>
          <input className="input" value={newPlaceName} onChange={(e) => setNewPlaceName(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Typ</span>
          <input className="input" value={newPlaceType} onChange={(e) => setNewPlaceType(e.target.value)} />
        </label>
        <div>
          <span style={{ fontSize: 12, color: '#8fa0bf' }}>Notizen</span>
          <RichTextEditor value={newPlaceNotes} onChange={setNewPlaceNotes} placeholder="Notizen zum Place" />
        </div>
        <button
          className="btn"
          onClick={() =>
            createPlaceMutation.mutate({
              name: newPlaceName,
              type: newPlaceType,
              notes: newPlaceNotes ? JSON.stringify(newPlaceNotes) : undefined,
            })
          }
          disabled={!newPlaceName || createPlaceMutation.isPending}
        >
          {createPlaceMutation.isPending ? 'Speichere…' : 'Speichern'}
        </button>
      </Modal>

      <Modal title="Foto hochladen" open={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
        <label className="project-selector">
          <span>Datei</span>
          <input className="input" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
        </label>
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
          <select
            className="input select-like"
            value={photoPlaceId}
            onChange={(e) => setPhotoPlaceId(e.target.value)}
          >
            <option value="">Kein Place</option>
            {places.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name ?? pl.type ?? 'Place'}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span style={{ fontSize: 12, color: '#8fa0bf' }}>Notizen</span>
          <RichTextEditor value={photoNotes} onChange={setPhotoNotes} placeholder="Notizen zum Foto" />
        </div>
        <button
          className="btn"
          onClick={() =>
            photoFile &&
            uploadPhotoMutation.mutate({
              file: photoFile,
              description: photoDesc,
              placeId: photoPlaceId || undefined,
              tags: photoTags ? photoTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
              notes: photoNotes ? JSON.stringify(photoNotes) : undefined,
            })
          }
          disabled={!photoFile || uploadPhotoMutation.isPending}
        >
          {uploadPhotoMutation.isPending ? 'Lädt…' : 'Upload'}
        </button>
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

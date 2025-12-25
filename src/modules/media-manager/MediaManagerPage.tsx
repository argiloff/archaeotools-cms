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
      setPlaceError(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Speichern fehlgeschlagen.';
      setPlaceError(Array.isArray(msg) ? msg.join(', ') : msg);
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
      label: places.find((pl) => pl.id === p.placeId)?.title ?? p.description ?? 'Foto',
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
                      • {places.find((pl) => pl.id === p.placeId)?.title ?? 'Place'}
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
            createPlaceMutation.mutate({
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
          disabled={!placeTitle || createPlaceMutation.isPending}
        >
          {createPlaceMutation.isPending ? 'Speichere…' : 'Speichern'}
        </button>
      </Modal>

      <Modal title="Foto hochladen" open={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
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
          <div style={{ marginBottom: 8 }}>Bild hierher ziehen oder auswählen</div>
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
          <select
            className="input select-like"
            value={photoPlaceId}
            onChange={(e) => setPhotoPlaceId(e.target.value)}
          >
            <option value="">Kein Place</option>
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

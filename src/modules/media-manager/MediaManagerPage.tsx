import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPhotos } from '../../api/photos.service';
import { listPlaces } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';
import { MapPreview } from '../../components/map/MapPreview';

export function MediaManagerPage() {
  const { projectId, project } = useCurrentProject();
  const [placeFilter, setPlaceFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

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
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      lat: p.lat!,
      lng: p.lng!,
      label: p.description ?? 'Foto',
    }))
    .slice(0, 200); // einfache Limitierung

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

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Map (OpenStreetMap)</div>
        {mapPoints.length ? (
          <MapPreview points={mapPoints} height={320} />
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

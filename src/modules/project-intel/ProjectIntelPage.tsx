import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listPhotos } from '../../api/photos.service';
import { listOsint } from '../../api/osint.service';
import { listPlaces } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';
import { MapPreview } from '../../components/map/MapPreview';

export function ProjectIntelPage() {
  const navigate = useNavigate();
  const { projectId, project } = useCurrentProject();

  const photosQuery = useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => listPhotos(projectId!),
    enabled: !!projectId,
  });
  const osintQuery = useQuery({
    queryKey: ['osint', projectId],
    queryFn: () => listOsint(projectId!),
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
        <h1>Project Intelligence View</h1>
        <p>Bitte wähle ein Projekt aus.</p>
      </div>
    );
  }

  const photos = photosQuery.data ?? [];
  const osint = osintQuery.data ?? [];
  const places = placesQuery.data ?? [];

  const photosWithGeo = photos.filter((p) => p.lat != null && p.lng != null);
  const placesWithGeo = places.filter((pl) => pl.latitude != null && pl.longitude != null);
  const visitedPlaces = places.filter((pl) => pl.visited).length;
  const osintByStatus = osint.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const gpsCoverage = photos.length ? Math.round((photosWithGeo.length / photos.length) * 100) : null;
  const visitedShare = places.length ? Math.round((visitedPlaces / places.length) * 100) : null;
  const osintDoneShare = osint.length
    ? Math.round(((osintByStatus.DONE ?? 0) / osint.length) * 100)
    : null;

  const cards = [
    { label: 'Fotos', value: photos.length, foot: gpsCoverage != null ? `${gpsCoverage}% mit GPS` : '—' },
    { label: 'Places', value: places.length, foot: visitedShare != null ? `${visitedShare}% besucht` : '—' },
    {
      label: 'OSINT Items',
      value: osint.length,
      foot: osintDoneShare != null ? `${osintDoneShare}% DONE` : '—',
    },
  ];

  const timelineItems = [
    ...photos
      .filter((p) => p.capturedAt)
      .map((p) => ({ at: p.capturedAt!, title: p.description ?? 'Foto', type: 'photo' as const })),
    ...osint
      .filter((o) => o.createdAt)
      .map((o) => ({
        at: o.createdAt!,
        title: `${o.title} (${o.status})`,
        type: 'osint' as const,
      })),
    ...places
      .filter((pl) => pl.createdAt)
      .map((pl) => ({
        at: pl.createdAt!,
        title: pl.title ?? 'Place erstellt',
        type: 'place' as const,
      })),
  ]
    .sort((a, b) => (a.at > b.at ? -1 : 1))
    .slice(0, 8);

  const geoPoints = [
    ...photosWithGeo.map((p) => ({
      id: p.id,
      lat: p.lat!,
      lng: p.lng!,
      label: p.description ?? 'Foto',
    })),
    ...placesWithGeo.map((pl) => ({
      id: pl.id,
      lat: pl.latitude!,
      lng: pl.longitude!,
      label: pl.title ?? 'Place',
    })),
  ];

  const topPlaces = places.slice(0, 8);

  const dataQualityAlerts = [
    gpsCoverage != null && gpsCoverage < 60
      ? `Nur ${gpsCoverage}% Fotos haben GPS-Koordinaten`
      : null,
    visitedShare != null && visitedShare < 50
      ? `Nur ${visitedShare}% der Places sind als besucht markiert`
      : null,
    photos.some((p) => !p.description) ? 'Es gibt Fotos ohne Beschreibung' : null,
    osint.length === 0 ? 'Noch keine OSINT Items angelegt' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="page">
      <h1>Project Intelligence View</h1>
      <p>{project?.name ?? 'Projekt'} — Überblick (Fotos/Places/OSINT).</p>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: '2fr 1fr',
          marginTop: 18,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(79,107,255,0.18), rgba(109,227,196,0.05))',
            padding: 18,
            display: 'grid',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700 }}>{project?.name ?? 'Projekt'}</div>
          <div style={{ fontSize: 13, color: '#8fa0bf', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {project?.type && <span>{project.type}</span>}
            {project?.visibility && <span>• {project.visibility}</span>}
            {project?.city && (
              <span>
                • {project.city}
                {project?.country ? `, ${project.country}` : ''}
              </span>
            )}
            {!project?.city && project?.country && <span>• {project.country}</span>}
          </div>
          {project?.locationName && (
            <div style={{ fontSize: 14, color: '#c5d5ff' }}>{project.locationName}</div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="project-action-btn" title="Media Manager" onClick={() => navigate('/media')}>
              🖼
            </button>
            <button className="project-action-btn" title="OSINT" onClick={() => navigate('/osint')}>
              🛰
            </button>
            <button className="project-action-btn" title="Data Quality" onClick={() => navigate('/data-quality')}>
              ✅
            </button>
          </div>
        </div>
        <Panel title="Hinweise" actions={null}>
          {dataQualityAlerts.length === 0 ? (
            <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine offenen Hinweise</div>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {dataQualityAlerts.map((alert, idx) => (
                <li
                  key={alert + idx}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 13,
                  }}
                >
                  {alert}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 18 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, color: '#8fa0bf' }}>{c.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#6de3c4' }}>{c.foot}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16, marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Panel title="Fotos (chronologisch)" loading={photosQuery.isLoading} error={photosQuery.isError}>
          <MiniList items={photos.map((p) => `${p.description ?? 'Foto'} — ${p.capturedAt ?? 'ohne Datum'}`)} empty="Keine Fotos" />
        </Panel>
        <Panel title="OSINT Status" loading={osintQuery.isLoading} error={osintQuery.isError}>
          <MiniList
            items={osint.map((o) => `${o.title} (${o.status})`)}
            empty="Keine OSINT Items"
          />
        </Panel>
        <Panel title="Places (Top 8)" loading={placesQuery.isLoading} error={placesQuery.isError}>
          <div style={{ display: 'grid', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
            {topPlaces.length === 0 ? (
              <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine Places</div>
            ) : (
              topPlaces.map((pl, idx) => (
                <div
                  key={`${pl.id}-${idx}`}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 13,
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{pl.title ?? pl.type ?? 'Place'}</div>
                  <div style={{ color: '#8fa0bf' }}>
                    {[pl.city, pl.country].filter(Boolean).join(', ') || 'Ort unbekannt'}
                  </div>
                </div>
              ))
            )}
          </div>
          {places.length > topPlaces.length && (
            <button
              className="btn"
              style={{ marginTop: 10, padding: '8px 12px', fontSize: 13 }}
              onClick={() => navigate('/media')}
            >
              Alle Places öffnen
            </button>
          )}
        </Panel>
        <Panel title="Timeline (neueste zuerst)">
          <Timeline items={timelineItems} empty="Keine zeitlichen Einträge" />
        </Panel>
        <Panel title="Geo (Map)">
          {geoPoints.length ? (
            <MapPreview
              points={geoPoints}
              height={260}
            />
          ) : (
            <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine Geodaten</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

type PanelProps = {
  title: string;
  loading?: boolean;
  error?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

function Panel({ title, loading, error, actions, children }: PanelProps) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        minHeight: 180,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actions}
          {loading && <span style={{ fontSize: 12, color: '#8fa0bf' }}>Lade…</span>}
          {error && <span style={{ fontSize: 12, color: '#f78c6c' }}>Fehler</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function MiniList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) {
    return <div style={{ color: '#8fa0bf', fontSize: 13 }}>{empty}</div>;
  }
  return (
    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {items.map((t, i) => (
        <li
          key={`${t}-${i}`}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 10,
            fontSize: 13,
          }}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Timeline({
  items,
  empty,
}: {
  items: { at: string; title: string; type: 'photo' | 'osint' | 'place' }[];
  empty: string;
}) {
  if (!items.length) {
    return <div style={{ color: '#8fa0bf', fontSize: 13 }}>{empty}</div>;
  }
  return (
    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
      {items.map((t, i) => (
        <li
          key={`${t.title}-${t.at}-${i}`}
          style={{
            padding: 10,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              t.type === 'photo'
                ? 'linear-gradient(120deg, rgba(79,107,255,0.18), rgba(109,227,196,0.05))'
                : t.type === 'osint'
                  ? 'linear-gradient(120deg, rgba(255,200,120,0.18), rgba(109,227,196,0.05))'
                  : 'linear-gradient(120deg, rgba(120,255,205,0.18), rgba(109,227,196,0.05))',
          }}
        >
          <div style={{ fontSize: 12, color: '#8fa0bf' }}>{new Date(t.at).toLocaleString()}</div>
          <div style={{ fontWeight: 700 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: '#c5d1e0' }}>{t.type.toUpperCase()}</div>
        </li>
      ))}
    </ul>
  );
}

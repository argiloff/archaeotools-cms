import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listPhotos } from '../../api/photos.service';
import { listOsint } from '../../api/osint.service';
import { listPlaces } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';
import './projectIntel.css';
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
    <div className="page intel-page">
      <div className="intel-hero">
        <div className="intel-hero__left">
          <div className="intel-chip-row">
            {project?.type && <span className="intel-chip">{project.type}</span>}
            {project?.visibility && <span className="intel-chip subtle">{project.visibility}</span>}
            {(project?.city || project?.country) && (
              <span className="intel-chip ghost">
                {project?.city}
                {project?.city && project?.country ? ', ' : ''}
                {project?.country}
              </span>
            )}
          </div>
          <h1>{project?.name ?? 'Projekt'}</h1>
          {project?.locationName && <p className="intel-hero__location">{project.locationName}</p>}
          <div className="intel-hero__actions">
            <button onClick={() => navigate('/media')} title="Media Manager">
              🖼
              <span>Media</span>
            </button>
            <button onClick={() => navigate('/osint')} title="OSINT Control">
              🛰
              <span>OSINT</span>
            </button>
            <button onClick={() => navigate('/data-quality')} title="Data Quality">
              ✅
              <span>Quality</span>
            </button>
          </div>
        </div>
        <div className="intel-hero__metrics">
          {cards.map((c) => (
            <div key={c.label} className="intel-stat-card">
              <div className="label">{c.label}</div>
              <div className="value">{c.value}</div>
              <div className="muted">{c.foot}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="intel-section">
        <div className="intel-section__header">
          <div>
            <h2>Insights & Alerts</h2>
            <p>Automatische Hinweise zu Datenqualität und Aktivität.</p>
          </div>
          <button className="ghost-link" onClick={() => navigate('/data-quality')}>
            Zum Quality Dashboard →
          </button>
        </div>
        <div className="intel-alerts">
          {dataQualityAlerts.length === 0 ? (
            <div className="intel-alerts__empty">Keine offenen Hinweise</div>
          ) : (
            dataQualityAlerts.map((alert, idx) => (
              <div key={alert + idx} className="intel-alert">
                <span>⚠</span>
                <div>{alert}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="intel-panel-grid">
        <Panel title="Timeline (neueste zuerst)">
          <Timeline items={timelineItems} empty="Keine zeitlichen Einträge" />
        </Panel>
        <Panel title="Geo Footprint">
          {geoPoints.length ? (
            <MapPreview
              points={geoPoints}
              height={260}
            />
          ) : (
            <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine Geodaten</div>
          )}
        </Panel>
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
          <div className="intel-places-list">
            {topPlaces.length === 0 ? (
              <div style={{ color: '#8fa0bf', fontSize: 13 }}>Keine Places</div>
            ) : (
              topPlaces.map((pl, idx) => (
                <div key={`${pl.id}-${idx}`} className="intel-place-card">
                  <div className="title">{pl.title ?? pl.type ?? 'Place'}</div>
                  <div className="meta">
                    {[pl.city, pl.country].filter(Boolean).join(', ') || 'Ort unbekannt'}
                  </div>
                </div>
              ))
            )}
          </div>
          {places.length > topPlaces.length && (
            <button
              className="ghost-link"
              onClick={() => navigate('/media')}
              style={{ marginTop: 10 }}
            >
              Alle Places öffnen →
            </button>
          )}
        </Panel>
      </section>
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
    <ul
      style={{
        padding: 0,
        margin: 0,
        listStyle: 'none',
        display: 'grid',
        gap: 10,
        maxHeight: 280,
        overflowY: 'auto',
        paddingRight: 6,
      }}
    >
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

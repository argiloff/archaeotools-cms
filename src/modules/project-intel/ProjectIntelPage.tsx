import { useQuery } from '@tanstack/react-query';
import { listPhotos } from '../../api/photos.service';
import { listOsint } from '../../api/osint.service';
import { listPlaces } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';
import { MapPreview } from '../../components/map/MapPreview';

export function ProjectIntelPage() {
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

  const cards = [
    { label: 'Fotos', value: photos.length },
    { label: 'Places', value: places.length },
    { label: 'OSINT', value: osint.length },
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
  ]
    .sort((a, b) => (a.at > b.at ? -1 : 1))
    .slice(0, 8);

  const geoSamples = photos.filter((p) => p.lat != null && p.lng != null);

  return (
    <div className="page">
      <h1>Project Intelligence View</h1>
      <p>{project?.name ?? 'Projekt'} — Überblick (Fotos/Places/OSINT).</p>

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
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16, marginTop: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Panel title="Fotos (chronologisch)" loading={photosQuery.isLoading} error={photosQuery.isError}>
          <MiniList items={photos.map((p) => `${p.description ?? 'Foto'} — ${p.capturedAt ?? 'ohne Datum'}`)} empty="Keine Fotos" />
        </Panel>
        <Panel title="OSINT Status" loading={osintQuery.isLoading} error={osintQuery.isError}>
          <MiniList items={osint.map((o) => `${o.title} (${o.status})`)} empty="Keine OSINT Items" />
        </Panel>
        <Panel title="Places" loading={placesQuery.isLoading} error={placesQuery.isError}>
          <MiniList items={places.map((pl) => pl.title ?? pl.type ?? 'Place')} empty="Keine Places" />
        </Panel>
        <Panel title="Timeline (neueste zuerst)">
          <Timeline items={timelineItems} empty="Keine zeitlichen Einträge" />
        </Panel>
        <Panel title="Geo (Map)">
          {geoSamples.length ? (
            <MapPreview
              points={geoSamples.map((p) => ({
                id: p.id,
                lat: p.lat!,
                lng: p.lng!,
                label: p.description ?? 'Foto',
              }))}
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
  children: React.ReactNode;
};

function Panel({ title, loading, error, children }: PanelProps) {
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
        {loading && <span style={{ fontSize: 12, color: '#8fa0bf' }}>Lade…</span>}
        {error && <span style={{ fontSize: 12, color: '#f78c6c' }}>Fehler</span>}
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
  items: { at: string; title: string; type: 'photo' | 'osint' }[];
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
                : 'linear-gradient(120deg, rgba(255,200,120,0.18), rgba(109,227,196,0.05))',
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

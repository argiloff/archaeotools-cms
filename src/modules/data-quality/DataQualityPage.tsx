import { useQuery } from '@tanstack/react-query';
import { listPhotos } from '../../api/photos.service';
import { listPlaces } from '../../api/places.service';
import { listOsint } from '../../api/osint.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';

export function DataQualityPage() {
  const { projectId, project } = useCurrentProject();

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
  const osintQuery = useQuery({
    queryKey: ['osint', projectId],
    queryFn: () => listOsint(projectId!),
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <div className="page">
        <h1>Data Quality & Integrity</h1>
        <p>Bitte wähle ein Projekt aus.</p>
      </div>
    );
  }

  const photos = photosQuery.data ?? [];
  const places = placesQuery.data ?? [];
  const osint = osintQuery.data ?? [];

  const pct = (num: number, den: number) =>
    den === 0 ? 0 : Math.round((num / den) * 100);

  const photosWithGps = photos.filter((p) => p.lat != null && p.lng != null).length;
  const placesWithNotes = places.filter((pl) => !!pl.notes?.trim()).length;
  const osintWithSource = osint.filter((o) => !!o.source?.trim()).length;

  const metrics = [
    { label: '% Fotos mit GPS', value: `${pct(photosWithGps, photos.length)}%` },
    { label: '% Places mit Notizen', value: `${pct(placesWithNotes, places.length)}%` },
    { label: '% OSINT mit Quelle', value: `${pct(osintWithSource, osint.length)}%` },
  ];

  const toImprove: string[] = [];
  if (photos.length && photosWithGps < photos.length) {
    toImprove.push(`${photos.length - photosWithGps} Fotos ohne GPS.`);
  }
  if (places.length && placesWithNotes < places.length) {
    toImprove.push(`${places.length - placesWithNotes} Orte ohne Notizen.`);
  }
  if (osint.length && osintWithSource < osint.length) {
    toImprove.push(`${osint.length - osintWithSource} OSINT-Einträge ohne Quelle.`);
  }

  return (
    <div className="page">
      <h1>Data Quality & Integrity</h1>
      <p>{project?.name ?? 'Projekt'} — Qualitätsindikatoren.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 18 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, color: '#8fa0bf' }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: '10px 0 8px' }}>To Improve</h3>
        {photosQuery.isLoading || placesQuery.isLoading || osintQuery.isLoading ? (
          <div style={{ color: '#8fa0bf' }}>Lade Daten …</div>
        ) : toImprove.length === 0 ? (
          <div style={{ color: '#6de3c4' }}>Alles sieht gut aus.</div>
        ) : (
          <ul style={{ paddingLeft: 16, color: '#c5d1e0' }}>
            {toImprove.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

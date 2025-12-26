import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listPhotos } from '../../api/photos.service';
import { listOsint } from '../../api/osint.service';
import { listPlaces } from '../../api/places.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import { StatCard, Card, CardHeader, CardBody, EmptyState, LoadingSpinner } from '../../components/ui';
import { MapPreview } from '../../components/map/MapPreview';
import { ProjectHero } from './components/ProjectHero';
import { TimelinePanel } from './components/TimelinePanel';
import { InsightsPanel } from './components/InsightsPanel';
import './projectIntel.css';

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

  if (!projectId || !project) {
    return (
      <div className="page">
        <EmptyState
          icon="📁"
          title="Kein Projekt ausgewählt"
          description="Bitte wähle ein Projekt aus der Seitenleiste aus."
        />
      </div>
    );
  }

  const photos = photosQuery.data ?? [];
  const osint = osintQuery.data ?? [];
  const places = placesQuery.data ?? [];

  const isLoading = photosQuery.isLoading || osintQuery.isLoading || placesQuery.isLoading;

  const photosWithGeo = photos.filter((p) => p.lat != null && p.lng != null);
  const placesWithGeo = places.filter((pl) => pl.latitude != null && pl.longitude != null);
  const visitedPlaces = places.filter((pl) => pl.visited).length;
  const osintByStatus = osint.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const gpsCoverage = photos.length ? Math.round((photosWithGeo.length / photos.length) * 100) : 0;
  const visitedShare = places.length ? Math.round((visitedPlaces / places.length) * 100) : 0;
  const osintDoneShare = osint.length
    ? Math.round(((osintByStatus.DONE ?? 0) / osint.length) * 100)
    : 0;

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
    .slice(0, 12);

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

  const dataQualityAlerts = [
    gpsCoverage < 60 ? `Nur ${gpsCoverage}% Fotos haben GPS-Koordinaten` : null,
    visitedShare < 50 ? `Nur ${visitedShare}% der Places sind als besucht markiert` : null,
    photos.some((p) => !p.description) ? 'Es gibt Fotos ohne Beschreibung' : null,
    osint.length === 0 ? 'Noch keine OSINT Items angelegt' : null,
  ].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="page">
        <LoadingSpinner size="lg" text="Lade Projektdaten..." />
      </div>
    );
  }

  return (
    <div className="page project-intel-page">
      <ProjectHero project={project} onNavigate={navigate} />

      <div className="project-stats-grid">
        <StatCard
          label="Fotos"
          value={photos.length}
          subtitle={`${gpsCoverage}% mit GPS`}
          icon="📷"
          variant={gpsCoverage >= 80 ? 'success' : gpsCoverage >= 60 ? 'warning' : 'default'}
        />
        <StatCard
          label="Orte"
          value={places.length}
          subtitle={`${visitedShare}% besucht`}
          icon="📍"
          variant={visitedShare >= 50 ? 'success' : 'warning'}
        />
        <StatCard
          label="OSINT Items"
          value={osint.length}
          subtitle={`${osintDoneShare}% erledigt`}
          icon="🛰"
          variant={osintDoneShare >= 50 ? 'success' : 'warning'}
        />
      </div>

      <InsightsPanel alerts={dataQualityAlerts} onNavigateToQuality={() => navigate('/data-quality')} />

      <div className="project-panels-grid">
        <TimelinePanel items={timelineItems} loading={isLoading} />

        <Card variant="elevated" padding="md">
          <CardHeader title="Geo Footprint" subtitle="Räumliche Verteilung" />
          <CardBody>
            {geoPoints.length ? (
              <MapPreview points={geoPoints} height={320} />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#8fa0bf' }}>
                Keine Geodaten vorhanden
              </div>
            )}
          </CardBody>
        </Card>

        <Card variant="elevated" padding="md">
          <CardHeader
            title="Places"
            subtitle={`${places.length} ${places.length === 1 ? 'Ort' : 'Orte'}`}
            actions={
              places.length > 0 && (
                <button
                  onClick={() => navigate('/media')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8fb0ff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Alle anzeigen →
                </button>
              )
            }
          />
          <CardBody>
            {places.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#8fa0bf' }}>
                Noch keine Orte angelegt
              </div>
            ) : (
              <div className="places-list">
                {places.slice(0, 6).map((pl) => (
                  <div key={pl.id} className="place-card">
                    <div className="place-card__title">{pl.title ?? pl.type ?? 'Place'}</div>
                    <div className="place-card__meta">
                      {[pl.city, pl.country].filter(Boolean).join(', ') || 'Ort unbekannt'}
                    </div>
                    {pl.visited && <div className="place-card__badge">✓ Besucht</div>}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

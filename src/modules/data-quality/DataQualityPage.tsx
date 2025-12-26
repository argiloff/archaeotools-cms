import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listPhotos } from '../../api/photos.service';
import { listPlaces } from '../../api/places.service';
import { listOsint } from '../../api/osint.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import { Card, StatCard, Alert, EmptyState, LoadingSpinner } from '../../components/ui';
import { QualityMetricCard } from './components/QualityMetricCard';
import { IssuesList } from './components/IssuesList';
import { QualityScore } from './components/QualityScore';
import type { DataIssue } from './components/IssuesList';
import './dataQuality.css';

export function DataQualityPage() {
  const { projectId, project } = useCurrentProject();
  const navigate = useNavigate();

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

  const qualityData = useMemo(() => {
    if (!photosQuery.data || !placesQuery.data || !osintQuery.data) {
      return null;
    }

    const photos = photosQuery.data;
    const places = placesQuery.data;
    const osint = osintQuery.data;

    const photosWithGps = photos.filter((p) => p.lat != null && p.lng != null);
    const photosWithDescription = photos.filter((p) => p.description?.trim());
    const photosWithTags = photos.filter((p) => p.tags && p.tags.length > 0);
    
    const placesWithDescription = places.filter((pl) => pl.description?.trim());
    const placesVisited = places.filter((pl) => pl.visited);
    const placesWithCoordinates = places.filter((pl) => pl.latitude != null && pl.longitude != null);
    
    const osintWithSource = osint.filter((o) => o.source?.trim());
    const osintDone = osint.filter((o) => o.status === 'DONE');
    const osintWithSummary = osint.filter((o) => o.summary?.trim());

    const issues: DataIssue[] = [];

    if (photos.length > 0 && photosWithGps.length < photos.length) {
      issues.push({
        id: 'photos-no-gps',
        type: 'photo',
        severity: photosWithGps.length / photos.length < 0.5 ? 'high' : 'medium',
        title: 'Fotos ohne GPS-Koordinaten',
        description: 'Einige Fotos haben keine Geo-Lokalisierung',
        count: photos.length - photosWithGps.length,
        action: {
          label: 'Fotos anzeigen',
          onClick: () => navigate('/media'),
        },
      });
    }

    if (photos.length > 0 && photosWithDescription.length < photos.length) {
      issues.push({
        id: 'photos-no-description',
        type: 'photo',
        severity: 'low',
        title: 'Fotos ohne Beschreibung',
        description: 'Beschreibungen helfen bei der Suche und Dokumentation',
        count: photos.length - photosWithDescription.length,
        action: {
          label: 'Fotos anzeigen',
          onClick: () => navigate('/media'),
        },
      });
    }

    if (places.length > 0 && placesWithDescription.length < places.length) {
      issues.push({
        id: 'places-no-description',
        type: 'place',
        severity: placesWithDescription.length / places.length < 0.3 ? 'high' : 'medium',
        title: 'Orte ohne Beschreibung',
        description: 'Detaillierte Beschreibungen verbessern die Dokumentation',
        count: places.length - placesWithDescription.length,
        action: {
          label: 'Orte anzeigen',
          onClick: () => navigate('/media'),
        },
      });
    }

    if (places.length > 0 && placesVisited.length < places.length * 0.5) {
      issues.push({
        id: 'places-not-visited',
        type: 'place',
        severity: 'medium',
        title: 'Viele Orte nicht besucht',
        description: 'Weniger als 50% der Orte sind als besucht markiert',
        count: places.length - placesVisited.length,
      });
    }

    if (osint.length > 0 && osintWithSource.length < osint.length) {
      issues.push({
        id: 'osint-no-source',
        type: 'osint',
        severity: 'high',
        title: 'OSINT ohne Quellenangabe',
        description: 'Quellenangaben sind für die Nachvollziehbarkeit essentiell',
        count: osint.length - osintWithSource.length,
        action: {
          label: 'OSINT anzeigen',
          onClick: () => navigate('/osint'),
        },
      });
    }

    if (osint.length === 0) {
      issues.push({
        id: 'no-osint',
        type: 'osint',
        severity: 'low',
        title: 'Keine OSINT Items',
        description: 'OSINT-Recherche kann wertvolle Zusatzinformationen liefern',
        action: {
          label: 'OSINT erstellen',
          onClick: () => navigate('/osint'),
        },
      });
    }

    const totalMetrics = 9;
    let achievedMetrics = 0;

    if (photos.length === 0 || photosWithGps.length / photos.length >= 0.8) achievedMetrics++;
    if (photos.length === 0 || photosWithDescription.length / photos.length >= 0.7) achievedMetrics++;
    if (photos.length === 0 || photosWithTags.length / photos.length >= 0.5) achievedMetrics++;
    if (places.length === 0 || placesWithDescription.length / places.length >= 0.6) achievedMetrics++;
    if (places.length === 0 || placesVisited.length / places.length >= 0.5) achievedMetrics++;
    if (places.length === 0 || placesWithCoordinates.length === places.length) achievedMetrics++;
    if (osint.length === 0 || osintWithSource.length / osint.length >= 0.9) achievedMetrics++;
    if (osint.length === 0 || osintDone.length / osint.length >= 0.5) achievedMetrics++;
    if (osint.length === 0 || osintWithSummary.length / osint.length >= 0.7) achievedMetrics++;

    const qualityScore = (achievedMetrics / totalMetrics) * 100;

    return {
      photos: {
        total: photos.length,
        withGps: photosWithGps.length,
        withDescription: photosWithDescription.length,
        withTags: photosWithTags.length,
      },
      places: {
        total: places.length,
        withDescription: placesWithDescription.length,
        visited: placesVisited.length,
        withCoordinates: placesWithCoordinates.length,
      },
      osint: {
        total: osint.length,
        withSource: osintWithSource.length,
        done: osintDone.length,
        withSummary: osintWithSummary.length,
      },
      issues,
      qualityScore,
    };
  }, [photosQuery.data, placesQuery.data, osintQuery.data, navigate]);

  if (!projectId) {
    return (
      <div className="page">
        <EmptyState
          icon="📊"
          title="Kein Projekt ausgewählt"
          description="Bitte wähle ein Projekt aus, um die Datenqualität zu analysieren."
        />
      </div>
    );
  }

  const isLoading = photosQuery.isLoading || placesQuery.isLoading || osintQuery.isLoading;
  const hasError = photosQuery.isError || placesQuery.isError || osintQuery.isError;

  if (isLoading) {
    return (
      <div className="page">
        <LoadingSpinner size="lg" text="Lade Datenqualität..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="page">
        <Alert variant="error" title="Fehler beim Laden">
          Die Datenqualität konnte nicht geladen werden. Bitte versuche es erneut.
        </Alert>
      </div>
    );
  }

  if (!qualityData) {
    return null;
  }

  return (
    <div className="page data-quality-page">
      <div className="data-quality-header">
        <div>
          <h1>Data Quality & Integrity</h1>
          <p className="data-quality-subtitle">
            {project?.name ?? 'Projekt'} — Qualitätsanalyse & Verbesserungsvorschläge
          </p>
        </div>
      </div>

      <div className="data-quality-grid">
        <Card variant="elevated" padding="lg" className="quality-score-card">
          <QualityScore score={qualityData.qualityScore} />
        </Card>

        <div className="quality-stats-grid">
          <StatCard
            label="Fotos"
            value={qualityData.photos.total}
            subtitle={`${qualityData.photos.total > 0 ? Math.round((qualityData.photos.withGps / qualityData.photos.total) * 100) : 0}% mit GPS`}
            icon="📷"
            variant={qualityData.photos.total === 0 || qualityData.photos.withGps / qualityData.photos.total >= 0.8 ? 'success' : 'warning'}
          />
          <StatCard
            label="Orte"
            value={qualityData.places.total}
            subtitle={`${qualityData.places.total > 0 ? Math.round((qualityData.places.visited / qualityData.places.total) * 100) : 0}% besucht`}
            icon="📍"
            variant={qualityData.places.total === 0 || qualityData.places.visited / qualityData.places.total >= 0.5 ? 'success' : 'warning'}
          />
          <StatCard
            label="OSINT"
            value={qualityData.osint.total}
            subtitle={`${qualityData.osint.total > 0 ? Math.round((qualityData.osint.done / qualityData.osint.total) * 100) : 0}% erledigt`}
            icon="🛰"
            variant={qualityData.osint.total === 0 || qualityData.osint.done / qualityData.osint.total >= 0.5 ? 'success' : 'warning'}
          />
        </div>
      </div>

      <div className="quality-metrics-section">
        <h2 className="section-title">Detaillierte Metriken</h2>
        <div className="quality-metrics-grid">
          <QualityMetricCard
            label="Fotos mit GPS"
            current={qualityData.photos.withGps}
            total={qualityData.photos.total}
            threshold={80}
            description="GPS-Koordinaten ermöglichen räumliche Analyse"
          />
          <QualityMetricCard
            label="Fotos mit Beschreibung"
            current={qualityData.photos.withDescription}
            total={qualityData.photos.total}
            threshold={70}
            description="Beschreibungen verbessern Durchsuchbarkeit"
          />
          <QualityMetricCard
            label="Fotos mit Tags"
            current={qualityData.photos.withTags}
            total={qualityData.photos.total}
            threshold={50}
            description="Tags helfen bei der Kategorisierung"
          />
          <QualityMetricCard
            label="Orte mit Beschreibung"
            current={qualityData.places.withDescription}
            total={qualityData.places.total}
            threshold={60}
            description="Detaillierte Beschreibungen für bessere Dokumentation"
          />
          <QualityMetricCard
            label="Besuchte Orte"
            current={qualityData.places.visited}
            total={qualityData.places.total}
            threshold={50}
            description="Markierung besuchter Orte für Feldarbeit"
          />
          <QualityMetricCard
            label="OSINT mit Quelle"
            current={qualityData.osint.withSource}
            total={qualityData.osint.total}
            threshold={90}
            description="Quellenangaben für Nachvollziehbarkeit"
          />
        </div>
      </div>

      <IssuesList issues={qualityData.issues} />
    </div>
  );
}

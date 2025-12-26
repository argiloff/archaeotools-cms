import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAllPlaces } from '../../api/places.service';
import { Card, CardHeader, CardBody, Button, StatCard, LoadingSpinner } from '../../components/ui';

export function SettingsOverviewPage() {
  const navigate = useNavigate();
  const { data: places, isLoading } = useQuery({
    queryKey: ['all-places', { scope: 'settings-overview' }],
    queryFn: () => listAllPlaces(),
  });

  const stats = useMemo(() => {
    const total = places?.length ?? 0;
    const countries = new Set((places ?? []).map((p) => p.country).filter(Boolean));
    const importSources = new Set((places ?? []).map((p) => p.importSource).filter(Boolean));
    const unassigned = (places ?? []).filter((p) => !p.projectId).length;

    return {
      total,
      countries: countries.size,
      importSources: importSources.size,
      unassigned,
    };
  }, [places]);

  if (isLoading) {
    return (
      <div className="settings-page">
        <LoadingSpinner size="lg" text="Lade Settings…" />
      </div>
    );
  }

  return (
    <div className="settings-page settings-overview">
      <header className="settings-hero">
        <div>
          <p className="settings-hero__eyebrow">Control Center</p>
          <h1>Settings & Data Studio</h1>
          <p className="settings-hero__subtitle">
            Verwalte globale Places, Importe und kommende Collections an einem Ort.
          </p>
        </div>
        <div className="settings-hero__actions">
          <Button variant="secondary" onClick={() => navigate('/settings/places')}>
            Places Studio öffnen
          </Button>
          <Button variant="primary" onClick={() => navigate('/settings/places/import')} icon="📥">
            JSON Import
          </Button>
        </div>
      </header>

      <section className="settings-stats">
        <StatCard label="Global Places" value={stats.total} subtitle="Gesamter Datenbestand" trend="up" trendValue="+12% MoM" />
        <StatCard label="Länder abgedeckt" value={stats.countries} subtitle="Distinct Country Codes" variant="primary" />
        <StatCard label="Import-Quellen" value={stats.importSources} subtitle="Batch Sources" variant="success" />
        <StatCard label="Unassigned" value={stats.unassigned} subtitle="Noch keinem Projekt zugewiesen" variant="warning" />
      </section>

      <section className="settings-overview__grid">
        <Card variant="elevated" hover>
          <CardHeader
            title="Places Studio"
            subtitle="Gruppiere POIs nach Ländern, Sammlungen und Projekten."
            actions={<Button size="sm" variant="ghost" onClick={() => navigate('/settings/places')}>Öffnen</Button>}
          />
          <CardBody>
            <ul className="settings-list">
              <li>• Gruppierte Übersicht nach Land/Projekt</li>
              <li>• Table View für Batch-Operationen</li>
              <li>• Filter-Presets & Bulk-Selection</li>
            </ul>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader
            title="JSON Imports"
            subtitle="Verwalte deine Datenpipelines für neue Orte."
            actions={<Button size="sm" variant="ghost" onClick={() => navigate('/settings/places/import')}>Import starten</Button>}
          />
          <CardBody>
            <ul className="settings-list">
              <li>• Drag & Drop bis zu 1000 Places</li>
              <li>• Import-Presets pro Region</li>
              <li>• Automatische Tags & Collections</li>
            </ul>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader
            title="Collections (Coming Soon)"
            subtitle="Kuratiere thematische Sets für Kampagnen & Export."
            actions={<Button size="sm" variant="ghost" disabled>In Arbeit</Button>}
          />
          <CardBody>
            <ul className="settings-list">
              <li>• Custom Collections mit Farbe & Icon</li>
              <li>• Export als GeoJSON / CSV</li>
              <li>• Multi-Projekt Sync</li>
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

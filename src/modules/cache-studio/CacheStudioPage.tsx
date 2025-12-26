import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import {
  getCacheMetrics,
  invalidateProjectCache,
  recomputeProjectSummary,
} from '../../api/cache.service';
import { Card, CardHeader, CardBody, Button, Alert, EmptyState, LoadingSpinner, StatCard } from '../../components/ui';
import { MetricCard } from './components/MetricCard';
import './cacheStudio.css';

export function CacheStudioPage() {
  const { projectId, project } = useCurrentProject();
  const qc = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['cache-metrics'],
    queryFn: getCacheMetrics,
  });

  const invalidateMutation = useMutation({
    mutationFn: (pid: string) => invalidateProjectCache(pid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cache-metrics'] });
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: (pid: string) => recomputeProjectSummary(pid),
  });

  if (!projectId) {
    return (
      <div className="page">
        <EmptyState
          icon="⚙️"
          title="Kein Projekt ausgewählt"
          description="Bitte wähle ein Projekt aus, um Cache-Operationen durchzuführen."
        />
      </div>
    );
  }

  const hitRate = metricsQuery.data?.hitRate ?? 0;
  const lastInvalidations = metricsQuery.data?.lastInvalidations ?? [];

  return (
    <div className="page cache-studio-page">
      <div className="cache-header">
        <div>
          <h1>System & Cache Studio</h1>
          <p className="cache-subtitle">
            {project?.name ?? 'Projekt'} — Cache-Management & Performance
          </p>
        </div>
      </div>

      <Alert variant="warning" title="Vorsicht">
        Cache-Operationen können die Performance beeinflussen. Verwende diese Funktionen nur bei Bedarf.
      </Alert>

      <div className="cache-metrics-grid">
        <MetricCard
          title="Cache Hit Rate"
          value={Math.round(hitRate * 100)}
          unit="%"
          loading={metricsQuery.isLoading}
          error={metricsQuery.isError}
        />
        <StatCard
          label="Letzte Invalidations"
          value={lastInvalidations.length}
          icon="🔄"
          variant="default"
        />
      </div>

      <div className="cache-actions-grid">
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Projekt-Cache invalidieren"
            subtitle="Setzt den Cache für das aktuelle Projekt zurück"
          />
          <CardBody>
            <div className="cache-action-content">
              <p className="cache-action-description">
                Diese Aktion löscht alle gecachten Daten für das Projekt. Verwende dies, wenn du
                veraltete Daten vermutest oder nach größeren Änderungen.
              </p>
              <Button
                onClick={() => invalidateMutation.mutate(projectId)}
                disabled={invalidateMutation.isPending}
                loading={invalidateMutation.isPending}
                variant="secondary"
              >
                Cache invalidieren
              </Button>
              {invalidateMutation.isSuccess && (
                <Alert variant="success">Cache erfolgreich invalidiert</Alert>
              )}
              {invalidateMutation.isError && (
                <Alert variant="error">Fehler beim Invalidieren</Alert>
              )}
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Project Summary neu berechnen"
            subtitle="Berechnet Projekt-Statistiken neu"
          />
          <CardBody>
            <div className="cache-action-content">
              <p className="cache-action-description">
                Diese Aktion berechnet alle Projekt-Zusammenfassungen und Statistiken neu.
                Nützlich nach Datenimporten oder größeren Änderungen.
              </p>
              <Button
                onClick={() => recomputeMutation.mutate(projectId)}
                disabled={recomputeMutation.isPending}
                loading={recomputeMutation.isPending}
                variant="secondary"
              >
                Summary neu berechnen
              </Button>
              {recomputeMutation.isSuccess && (
                <Alert variant="success">Summary erfolgreich neu berechnet</Alert>
              )}
              {recomputeMutation.isError && (
                <Alert variant="error">Fehler beim Neuberechnen</Alert>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {lastInvalidations.length > 0 && (
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Invalidation History"
            subtitle="Letzte Cache-Invalidierungen"
          />
          <CardBody>
            {metricsQuery.isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="invalidation-list">
                {lastInvalidations.map((inv, idx) => (
                  <div key={`${inv.projectId}-${inv.at}-${idx}`} className="invalidation-item">
                    <div className="invalidation-item__project">
                      Projekt: <span>{inv.projectId}</span>
                    </div>
                    <div className="invalidation-item__time">{inv.at}</div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

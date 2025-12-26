import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import {
  getCacheMetrics,
  invalidateProjectCache,
  recomputeProjectSummary,
} from '../../api/cache.service';
import '../../app/ui/layout.css';

export function CacheStudioPage() {
  const { projectId, project } = useCurrentProject();
  const qc = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['cache-metrics'],
    queryFn: getCacheMetrics,
  });

  const invalidateMutation = useMutation({
    mutationFn: (pid: string) => invalidateProjectCache(pid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cache-metrics'] }),
  });

  const recomputeMutation = useMutation({
    mutationFn: (pid: string) => recomputeProjectSummary(pid),
  });

  return (
    <div className="page">
      <h1>System & Cache Studio</h1>
      <p>Cache-Hit-Rates, Invalidation, Summary-Recompute.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 16 }}>
        <Panel title="Cache Hit Rate">
          {metricsQuery.isLoading ? (
            <div style={{ color: '#8fa0bf' }}>Lade …</div>
          ) : metricsQuery.isError ? (
            <div style={{ color: '#f78c6c' }}>Fehler beim Laden</div>
          ) : (
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {Math.round((metricsQuery.data?.hitRate ?? 0) * 100)}%
            </div>
          )}
        </Panel>
        <Panel title="Letzte Invalidations">
          {metricsQuery.isLoading ? (
            <div style={{ color: '#8fa0bf' }}>Lade …</div>
          ) : metricsQuery.isError ? (
            <div style={{ color: '#f78c6c' }}>Fehler beim Laden</div>
          ) : (
            <MiniList
              items={(metricsQuery.data?.lastInvalidations ?? []).map(
                (i) => `${i.projectId} — ${i.at}`,
              )}
              empty="Keine Einträge"
            />
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 18 }}>
        <ActionCard
          title="Projekt-Cache invalidieren"
          desc="Setzt Cache für aktuelles Projekt zurück."
          disabled={!projectId || invalidateMutation.isPending}
          onClick={() => invalidateMutation.mutate(projectId!)}
          status={invalidateMutation.isPending ? 'Läuft …' : undefined}
        />
        <ActionCard
          title="Project Summary neu berechnen"
          desc="Recompute Summary für aktuelles Projekt."
          disabled={!projectId || recomputeMutation.isPending}
          onClick={() => recomputeMutation.mutate(projectId!)}
          status={recomputeMutation.isPending ? 'Läuft …' : undefined}
        />
      </div>

      <div style={{ color: '#8fa0bf', fontSize: 12, marginTop: 12 }}>
        Projekt: {project?.name ?? projectId ?? 'nicht gewählt'}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        minHeight: 160,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
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

function ActionCard({
  title,
  desc,
  disabled,
  onClick,
  status,
}: {
  title: string;
  desc: string;
  disabled?: boolean;
  onClick: () => void;
  status?: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        display: 'grid',
        gap: 10,
        minHeight: 160,
      }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ color: '#c5d1e0', fontSize: 13 }}>{desc}</div>
      <button className="btn" onClick={onClick} disabled={disabled}>
        {status ?? 'Ausführen'}
      </button>
    </div>
  );
}

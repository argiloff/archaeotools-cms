import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listOsint } from '../../api/osint.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import { Input, Button, EmptyState, LoadingSpinner, StatCard } from '../../components/ui';
import { OsintKanbanColumn } from './components/OsintKanbanColumn';
import type { OsintItem } from '../../api/types';
import './osint.css';

const STATUS_ORDER: Array<'IDEA' | 'IN_PROGRESS' | 'DONE'> = ['IDEA', 'IN_PROGRESS', 'DONE'];

export function OsintPage() {
  const { projectId, project } = useCurrentProject();
  const [search, setSearch] = useState<string>('');
  const [, setSelectedItem] = useState<OsintItem | null>(null);

  const osintQuery = useQuery({
    queryKey: ['osint', projectId],
    queryFn: () => listOsint(projectId!),
    enabled: !!projectId,
  });

  const osintItems = osintQuery.data ?? [];

  const filteredByStatus = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    const filtered = search
      ? osintItems.filter((o) => {
          const text = `${o.title ?? ''} ${o.summary ?? ''} ${o.source ?? ''}`.toLowerCase();
          return text.includes(searchLower);
        })
      : osintItems;

    return STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = filtered.filter((o) => o.status === status);
        return acc;
      },
      {} as Record<string, OsintItem[]>
    );
  }, [osintItems, search]);

  const recentItems = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return osintItems.filter((item) => {
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt).getTime();
      return !Number.isNaN(created) && created >= sevenDaysAgo;
    });
  }, [osintItems]);

  if (!projectId) {
    return (
      <div className="page">
        <EmptyState
          icon="🛰"
          title="Kein Projekt ausgewählt"
          description="Bitte wähle ein Projekt aus, um OSINT Items zu verwalten."
        />
      </div>
    );
  }

  if (osintQuery.isLoading) {
    return (
      <div className="page">
        <LoadingSpinner size="lg" text="Lade OSINT Items..." />
      </div>
    );
  }

  const totalItems = osintItems.length;
  const doneItems = filteredByStatus.DONE?.length ?? 0;
  const inProgressItems = filteredByStatus.IN_PROGRESS?.length ?? 0;
  const ideaItems = filteredByStatus.IDEA?.length ?? 0;

  return (
    <div className="page osint-page">
      <div className="osint-header">
        <div>
          <h1>OSINT Control & Audit</h1>
          <p className="osint-subtitle">
            {project?.name ?? 'Projekt'} — Open Source Intelligence Management
          </p>
        </div>
        <Button onClick={() => console.log('Create OSINT')} icon="➕">
          Neues OSINT Item
        </Button>
      </div>

      <div className="osint-stats-grid">
        <StatCard
          label="Gesamt"
          value={totalItems}
          icon="🛰"
          variant="default"
        />
        <StatCard
          label="Neue Hinweise"
          value={recentItems.length}
          subtitle="Letzte 7 Tage"
          variant="primary"
        />
        <StatCard
          label="Ideen"
          value={ideaItems}
          icon="💡"
          variant="default"
        />
        <StatCard
          label="In Arbeit"
          value={inProgressItems}
          icon="⚙️"
          variant="warning"
        />
        <StatCard
          label="Erledigt"
          value={doneItems}
          subtitle={totalItems > 0 ? `${Math.round((doneItems / totalItems) * 100)}%` : '0%'}
          icon="✓"
          variant="success"
        />
      </div>

      <div className="osint-filters">
        <Input
          placeholder="Suche nach Titel, Quelle oder Notizen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon="🔍"
        />
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
            Zurücksetzen
          </Button>
        )}
      </div>

      {totalItems === 0 ? (
        <EmptyState
          icon="🛰"
          title="Noch keine OSINT Items"
          description="Erstelle dein erstes OSINT Item, um mit der Recherche zu beginnen."
          action={
            <Button onClick={() => console.log('Create OSINT')}>
              Erstes Item erstellen
            </Button>
          }
        />
      ) : (
        <div className="osint-kanban">
          {STATUS_ORDER.map((status) => (
            <OsintKanbanColumn
              key={status}
              status={status}
              items={filteredByStatus[status] ?? []}
              onItemClick={setSelectedItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

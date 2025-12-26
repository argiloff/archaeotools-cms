import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listOsint } from '../../api/osint.service';
import { useCurrentProject } from '../../app/hooks/useCurrentProject';
import '../../app/ui/layout.css';

const STATUS: Array<'IDEA' | 'IN_PROGRESS' | 'DONE'> = ['IDEA', 'IN_PROGRESS', 'DONE'];

export function OsintPage() {
  const { projectId, project } = useCurrentProject();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const osintQuery = useQuery({
    queryKey: ['osint', projectId],
    queryFn: () => listOsint(projectId!),
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <div className="page">
        <h1>OSINT Control & Audit</h1>
        <p>Bitte wähle ein Projekt aus.</p>
      </div>
    );
  }

  const osint = osintQuery.data ?? [];

  const filtered = useMemo(() => {
    return osint.filter((o) => {
      const matchStatus = statusFilter ? o.status === statusFilter : true;
      const text = `${o.title ?? ''} ${o.summary ?? ''} ${o.source ?? ''}`.toLowerCase();
      const matchSearch = search ? text.includes(search.toLowerCase()) : true;
      return matchStatus && matchSearch;
    });
  }, [osint, search, statusFilter]);

  return (
    <div className="page">
      <h1>OSINT Control & Audit</h1>
      <p>{project?.name ?? 'Projekt'} — OSINT Items nach Status.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 16 }}>
        <FilterBlock label="Status">
          <select
            className="input select-like"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Alle</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FilterBlock>
        <FilterBlock label="Suche">
          <input
            className="input"
            placeholder="Titel/Quelle/Notiz…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterBlock>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 16 }}>
        {STATUS.map((status) => (
          <Panel key={status} title={status}>
            <MiniList
              items={filtered.filter((o) => o.status === status).map((o) => ({
                title: o.title,
                source: o.source,
                summary: o.summary,
              }))}
              empty="Keine Items"
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 6,
        padding: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}
    >
      <span style={{ fontSize: 12, color: '#8fa0bf' }}>{label}</span>
      {children}
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
        minHeight: 200,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function MiniList({
  items,
  empty,
}: {
  items: { title?: string; source?: string; summary?: string }[];
  empty: string;
}) {
  if (!items.length) {
    return <div style={{ color: '#8fa0bf', fontSize: 13 }}>{empty}</div>;
  }
  return (
    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {items.map((o, i) => (
        <li
          key={`${o.title}-${i}`}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 10,
            display: 'grid',
            gap: 4,
          }}
        >
          <div style={{ fontWeight: 600 }}>{o.title ?? 'OSINT Item'}</div>
          {o.source && (
            <div style={{ fontSize: 12, color: '#8fa0bf' }}>
              Quelle: <span style={{ color: '#6de3c4' }}>{o.source}</span>
            </div>
          )}
          {o.summary && <div style={{ fontSize: 13, color: '#c5d1e0' }}>{o.summary}</div>}
        </li>
      ))}
    </ul>
  );
}

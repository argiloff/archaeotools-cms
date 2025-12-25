import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import './layout.css';
import { listProjects } from '../../api/projects.service';
import { projectStore } from '../../state/project.store';
import { listPhotos } from '../../api/photos.service';
import { listPlaces } from '../../api/places.service';
import { listOsint } from '../../api/osint.service';

export function ProjectSelector() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const { projects, currentProjectId, setProjects, setCurrentProject } = projectStore();

  useEffect(() => {
    if (data) {
      setProjects(data);
      if (!currentProjectId && data.length > 0) {
        setCurrentProject(data[0].id);
      }
      // Prefetch häufig genutzte Daten für das erste Projekt
      const pid = currentProjectId ?? data[0]?.id;
      if (pid) {
        qc.prefetchQuery({ queryKey: ['photos', pid], queryFn: () => listPhotos(pid) });
        qc.prefetchQuery({ queryKey: ['places', pid], queryFn: () => listPlaces(pid) });
        qc.prefetchQuery({ queryKey: ['osint', pid], queryFn: () => listOsint(pid) });
      }
    }
  }, [currentProjectId, data, qc, setCurrentProject, setProjects]);

  return (
    <label className="project-selector">
      <span>Projekt</span>
      <div className="select-shell">
        <select
          className="input select-like"
          value={currentProjectId ?? ''}
          onChange={(e) => setCurrentProject(e.target.value)}
          disabled={isLoading || projects.length === 0}
        >
          {isLoading && <option value="">Lade Projekte…</option>}
          {isError && <option value="">Laden fehlgeschlagen</option>}
          {!isLoading && !isError && projects.length === 0 && (
            <option value="">Kein Projekt</option>
          )}
          {!isLoading &&
            !isError &&
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        <div className="chevron" aria-hidden="true">
          ⌄
        </div>
      </div>
      <small className="selector-hint">
        {isLoading
          ? 'Lade Projekte …'
          : isError
            ? 'Konnte Projekte nicht laden'
            : projects.length > 0
              ? `${projects.length} Projekt(e)`
              : 'Noch keine Projekte'}
      </small>
    </label>
  );
}

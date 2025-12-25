import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import './layout.css';
import { listProjects } from '../../api/projects.service';
import { projectStore } from '../../state/project.store';

export function ProjectSelector() {
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
    }
  }, [currentProjectId, data, setCurrentProject, setProjects]);

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

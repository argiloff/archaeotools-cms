import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import './layout.css';
import { listProjects } from '../../api/projects.service';
import { projectStore } from '../../state/project.store';

export function ProjectSelector() {
  const { data, isLoading } = useQuery({
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
      <select
        value={currentProjectId ?? ''}
        onChange={(e) => setCurrentProject(e.target.value)}
        disabled={isLoading}
      >
        {!isLoading && projects.length === 0 && <option value="">Kein Projekt</option>}
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}

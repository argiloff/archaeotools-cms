import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import './layout.css';
import { createProject, listProjects } from '../../api/projects.service';
import { projectStore } from '../../state/project.store';
import { listPhotos } from '../../api/photos.service';
import { listPlaces } from '../../api/places.service';
import { listOsint } from '../../api/osint.service';
import { Modal } from '../../components/ui/Modal';

export function ProjectSelector() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [projName, setProjName] = useState('');
  const [projType, setProjType] = useState('');
  const [projLocation, setProjLocation] = useState('');

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

  const createMutation = useMutation({
    mutationFn: () =>
      createProject({
        name: projName,
        type: projType,
        location: projLocation,
      }),
    onSuccess: (newProject) => {
      setShowCreate(false);
      setProjName('');
      setProjType('');
      setProjLocation('');
      // refresh list + select new
      qc.invalidateQueries({ queryKey: ['projects'] });
      setCurrentProject(newProject.id);
    },
  });

  return (
    <>
      <label className="project-selector">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Projekt</span>
          <button className="btn" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setShowCreate(true)}>
            Neu
          </button>
        </div>
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

      <Modal title="Neues Projekt" open={showCreate} onClose={() => setShowCreate(false)}>
        <label className="project-selector">
          <span>Name</span>
          <input className="input" value={projName} onChange={(e) => setProjName(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Typ</span>
          <input className="input" value={projType} onChange={(e) => setProjType(e.target.value)} />
        </label>
        <label className="project-selector">
          <span>Ort</span>
          <input className="input" value={projLocation} onChange={(e) => setProjLocation(e.target.value)} />
        </label>
        <button
          className="btn"
          onClick={() => createMutation.mutate()}
          disabled={!projName || createMutation.isPending}
        >
          {createMutation.isPending ? 'Speichere…' : 'Speichern'}
        </button>
      </Modal>
    </>
  );
}

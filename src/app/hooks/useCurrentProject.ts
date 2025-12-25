import { projectStore } from '../../state/project.store';

export function useCurrentProject() {
  const { currentProjectId, projects } = projectStore();
  const project = projects.find((p) => p.id === currentProjectId) ?? null;
  return { projectId: currentProjectId, project };
}

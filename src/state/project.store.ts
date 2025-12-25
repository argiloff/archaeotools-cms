import { create } from 'zustand';
import type { Project } from '../api/types';

type ProjectState = {
  projects: Project[];
  currentProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (id: string | null) => void;
};

export const projectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProjectId: null,
  setProjects: (projects) => set(() => ({ projects })),
  setCurrentProject: (id) => set(() => ({ currentProjectId: id })),
}));

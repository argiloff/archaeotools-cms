import { Badge, Button } from '../../../components/ui';
import type { Project } from '../../../api/types';
import './ProjectHero.css';

interface ProjectHeroProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const ProjectHero = ({ project, onNavigate }: ProjectHeroProps) => {
  return (
    <div className="project-hero">
      <div className="project-hero__content">
        <div className="project-hero__badges">
          {project.type && <Badge variant="primary">{project.type}</Badge>}
          {project.visibility && (
            <Badge variant={project.visibility === 'PUBLIC' ? 'success' : 'default'}>
              {project.visibility}
            </Badge>
          )}
          {(project.city || project.country) && (
            <Badge variant="info">
              {[project.city, project.country].filter(Boolean).join(', ')}
            </Badge>
          )}
        </div>
        <h1 className="project-hero__title">{project.name}</h1>
        {project.locationName && (
          <p className="project-hero__location">{project.locationName}</p>
        )}
        {project.description && (
          <p className="project-hero__description">{project.description}</p>
        )}
        <div className="project-hero__actions">
          <Button onClick={() => onNavigate('/media')} icon="🖼">
            Media Manager
          </Button>
          <Button onClick={() => onNavigate('/osint')} variant="secondary" icon="🛰">
            OSINT
          </Button>
          <Button onClick={() => onNavigate('/data-quality')} variant="secondary" icon="✅">
            Quality
          </Button>
        </div>
      </div>
    </div>
  );
};

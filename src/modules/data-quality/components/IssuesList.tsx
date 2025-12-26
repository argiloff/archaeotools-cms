import { useState } from 'react';
import { Badge, Button, Card, CardHeader, CardBody } from '../../../components/ui';

export interface DataIssue {
  id: string;
  type: 'photo' | 'place' | 'osint';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface IssuesListProps {
  issues: DataIssue[];
  onResolve?: (issueId: string) => void;
}

export const IssuesList = ({ issues, onResolve }: IssuesListProps) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredIssues = issues.filter((issue) =>
    filter === 'all' ? true : issue.severity === filter
  );

  const severityColors = {
    high: 'error' as const,
    medium: 'warning' as const,
    low: 'info' as const,
  };

  const typeIcons = {
    photo: '📷',
    place: '📍',
    osint: '🛰',
  };

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader
        title="Datenqualität Probleme"
        subtitle={`${filteredIssues.length} offene ${filteredIssues.length === 1 ? 'Problem' : 'Probleme'}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Alle
            </Button>
            <Button
              variant={filter === 'high' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('high')}
            >
              Hoch
            </Button>
            <Button
              variant={filter === 'medium' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('medium')}
            >
              Mittel
            </Button>
            <Button
              variant={filter === 'low' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('low')}
            >
              Niedrig
            </Button>
          </div>
        }
      />
      <CardBody>
        {filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#8fa0bf' }}>
            {filter === 'all'
              ? '✓ Keine Probleme gefunden'
              : `Keine Probleme mit Priorität "${filter}"`}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="issue-item">
                <div className="issue-item__icon">{typeIcons[issue.type]}</div>
                <div className="issue-item__content">
                  <div className="issue-item__header">
                    <h4 className="issue-item__title">{issue.title}</h4>
                    <Badge variant={severityColors[issue.severity]} size="sm">
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="issue-item__description">{issue.description}</p>
                  {issue.count && (
                    <span className="issue-item__count">
                      {issue.count} {issue.count === 1 ? 'Eintrag' : 'Einträge'} betroffen
                    </span>
                  )}
                </div>
                <div className="issue-item__actions">
                  {issue.action && (
                    <Button size="sm" variant="secondary" onClick={issue.action.onClick}>
                      {issue.action.label}
                    </Button>
                  )}
                  {onResolve && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onResolve(issue.id)}
                    >
                      ✓
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

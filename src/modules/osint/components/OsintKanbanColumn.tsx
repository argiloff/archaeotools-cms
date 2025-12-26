import { Badge, Card, CardBody } from '../../../components/ui';
import type { OsintItem } from '../../../api/types';
import './OsintKanbanColumn.css';

interface OsintKanbanColumnProps {
  status: 'IDEA' | 'IN_PROGRESS' | 'DONE';
  items: OsintItem[];
  onItemClick?: (item: OsintItem) => void;
}

const statusConfig = {
  IDEA: { label: 'Ideen', color: 'info' as const, icon: '💡' },
  IN_PROGRESS: { label: 'In Arbeit', color: 'warning' as const, icon: '⚙️' },
  DONE: { label: 'Erledigt', color: 'success' as const, icon: '✓' },
};

export const OsintKanbanColumn = ({ status, items, onItemClick }: OsintKanbanColumnProps) => {
  const config = statusConfig[status];

  return (
    <Card variant="elevated" padding="none" className="osint-column">
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{config.icon}</span>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{config.label}</span>
          <Badge variant={config.color} size="sm">
            {items.length}
          </Badge>
        </div>
      </div>
      <CardBody>
        <div className="osint-column__items">
          {items.length === 0 ? (
            <div className="osint-column__empty">Keine Items</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="osint-item-card"
                onClick={() => onItemClick?.(item)}
              >
                <h4 className="osint-item-card__title">{item.title}</h4>
                {item.summary && (
                  <p className="osint-item-card__summary">{item.summary}</p>
                )}
                {item.source && (
                  <div className="osint-item-card__source">
                    <span className="osint-item-card__source-label">Quelle:</span>
                    <span className="osint-item-card__source-value">{item.source}</span>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="osint-item-card__tags">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="default" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="osint-item-card__link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Link öffnen →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

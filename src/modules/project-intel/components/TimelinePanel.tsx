import { Card, CardHeader, CardBody } from '../../../components/ui';
import './TimelinePanel.css';

interface TimelineItem {
  at: string;
  title: string;
  type: 'photo' | 'osint' | 'place';
}

interface TimelinePanelProps {
  items: TimelineItem[];
  loading?: boolean;
}

export const TimelinePanel = ({ items, loading }: TimelinePanelProps) => {
  const typeColors = {
    photo: 'linear-gradient(120deg, rgba(79,107,255,0.18), rgba(109,227,196,0.05))',
    osint: 'linear-gradient(120deg, rgba(255,200,120,0.18), rgba(109,227,196,0.05))',
    place: 'linear-gradient(120deg, rgba(120,255,205,0.18), rgba(109,227,196,0.05))',
  };

  const typeIcons = {
    photo: '📷',
    osint: '🛰',
    place: '📍',
  };

  return (
    <Card variant="elevated" padding="md">
      <CardHeader title="Timeline" subtitle="Neueste Aktivitäten" />
      <CardBody>
        {loading ? (
          <div className="timeline-loading">Lade...</div>
        ) : items.length === 0 ? (
          <div className="timeline-empty">Keine Einträge</div>
        ) : (
          <div className="timeline-list">
            {items.map((item, i) => (
              <div
                key={`${item.title}-${item.at}-${i}`}
                className="timeline-item"
                style={{ background: typeColors[item.type] }}
              >
                <div className="timeline-item__icon">{typeIcons[item.type]}</div>
                <div className="timeline-item__content">
                  <div className="timeline-item__date">
                    {new Date(item.at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="timeline-item__title">{item.title}</div>
                  <div className="timeline-item__type">{item.type.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

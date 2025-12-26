import { Alert, Card, CardHeader, CardBody, Button } from '../../../components/ui';

interface InsightsPanelProps {
  alerts: string[];
  onNavigateToQuality: () => void;
}

export const InsightsPanel = ({ alerts, onNavigateToQuality }: InsightsPanelProps) => {
  return (
    <Card variant="elevated" padding="md">
      <CardHeader
        title="Insights & Alerts"
        subtitle="Automatische Qualitätshinweise"
        actions={
          <Button variant="ghost" size="sm" onClick={onNavigateToQuality}>
            Details →
          </Button>
        }
      />
      <CardBody>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#6de3c4' }}>
            ✓ Keine offenen Hinweise
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map((alert, idx) => (
              <Alert key={`${alert}-${idx}`} variant="warning">
                {alert}
              </Alert>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

import { Card, CardHeader, CardBody } from '../../../components/ui';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  error?: boolean;
}

export const MetricCard = ({ title, value, unit, trend, loading, error }: MetricCardProps) => {
  return (
    <Card variant="elevated" padding="md" className="metric-card">
      <CardHeader title={title} />
      <CardBody>
        {loading ? (
          <div className="metric-card__loading">Lade...</div>
        ) : error ? (
          <div className="metric-card__error">Fehler</div>
        ) : (
          <div className="metric-card__content">
            <div className="metric-card__value">
              {value}
              {unit && <span className="metric-card__unit">{unit}</span>}
            </div>
            {trend && (
              <div className={`metric-card__trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

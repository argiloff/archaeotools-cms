import { ProgressBar } from '../../../components/ui';

export interface QualityMetricCardProps {
  label: string;
  current: number;
  total: number;
  threshold?: number;
  description?: string;
}

export const QualityMetricCard = ({
  label,
  current,
  total,
  threshold = 80,
  description,
}: QualityMetricCardProps) => {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  const isGood = percentage >= threshold;
  const isWarning = percentage >= threshold - 20 && percentage < threshold;
  const isCritical = percentage < threshold - 20;

  const color = isGood ? 'success' : isWarning ? 'warning' : 'error';

  return (
    <div className="quality-metric-card">
      <div className="quality-metric-card__header">
        <h3 className="quality-metric-card__label">{label}</h3>
        <div className="quality-metric-card__stats">
          <span className="quality-metric-card__value">
            {current} / {total}
          </span>
        </div>
      </div>
      <ProgressBar value={percentage} color={color} size="lg" showValue />
      {description && (
        <p className="quality-metric-card__description">{description}</p>
      )}
      {isCritical && (
        <div className="quality-metric-card__warning">
          ⚠ Unter kritischem Schwellenwert ({threshold}%)
        </div>
      )}
    </div>
  );
};

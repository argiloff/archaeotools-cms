import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './StatCard.css';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      subtitle,
      trend,
      trendValue,
      icon,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`stat-card stat-card--${variant} ${className}`}
        {...props}
      >
        <div className="stat-card__header">
          <span className="stat-card__label">{label}</span>
          {icon && <span className="stat-card__icon">{icon}</span>}
        </div>
        <div className="stat-card__value">{value}</div>
        {(subtitle || trend) && (
          <div className="stat-card__footer">
            {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
            {trend && trendValue && (
              <span className={`stat-card__trend stat-card__trend--${trend}`}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

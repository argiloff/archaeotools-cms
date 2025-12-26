import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      label,
      showValue = true,
      color = 'primary',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={`progress-bar-wrapper ${className}`} {...props}>
        {(label || showValue) && (
          <div className="progress-bar-header">
            {label && <span className="progress-bar-label">{label}</span>}
            {showValue && (
              <span className="progress-bar-value">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className={`progress-bar progress-bar--${size}`}>
          <div
            className={`progress-bar-fill progress-bar-fill--${color}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

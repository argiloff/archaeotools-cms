import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Alert.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      onClose,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
    };

    return (
      <div
        ref={ref}
        className={`alert alert--${variant} ${className}`}
        role="alert"
        {...props}
      >
        <div className="alert__icon">{icons[variant]}</div>
        <div className="alert__content">
          {title && <div className="alert__title">{title}</div>}
          {children && <div className="alert__message">{children}</div>}
        </div>
        {onClose && (
          <button
            className="alert__close"
            onClick={onClose}
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

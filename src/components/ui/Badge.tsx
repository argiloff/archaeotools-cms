import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Badge.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'badge-modern',
      `badge-modern--${variant}`,
      `badge-modern--${size}`,
      dot && 'badge-modern--dot',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={classes} {...props}>
        {dot && <span className="badge-modern__dot" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

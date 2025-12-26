import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './LoadingSpinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = 'md',
      text,
      fullScreen = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const Spinner = (
      <div className={`loading-spinner loading-spinner--${size} ${className}`} {...props}>
        <div className="loading-spinner__circle" />
        {text && <p className="loading-spinner__text">{text}</p>}
      </div>
    );

    if (fullScreen) {
      return (
        <div ref={ref} className="loading-spinner-overlay">
          {Spinner}
        </div>
      );
    }

    return <div ref={ref}>{Spinner}</div>;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`skeleton ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="input-modern-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-modern-label">
            {label}
          </label>
        )}
        <div className="input-modern-container">
          {leftIcon && <span className="input-modern-icon input-modern-icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input-modern ${hasError ? 'input-modern--error' : ''} ${leftIcon ? 'input-modern--with-left-icon' : ''} ${rightIcon ? 'input-modern--with-right-icon' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <span className="input-modern-icon input-modern-icon--right">{rightIcon}</span>}
        </div>
        {error && <span className="input-modern-error">{error}</span>}
        {helperText && !error && <span className="input-modern-helper">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="input-modern-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-modern-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`input-modern input-modern--textarea ${hasError ? 'input-modern--error' : ''} ${className}`}
          {...(props as any)}
        />
        {error && <span className="input-modern-error">{error}</span>}
        {helperText && !error && <span className="input-modern-helper">{helperText}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

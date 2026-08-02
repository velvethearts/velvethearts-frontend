import React from 'react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`vh-btn vh-btn-${variant} ${loading ? 'vh-btn-loading' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-content-loading">
          <svg className="btn-spinner" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';

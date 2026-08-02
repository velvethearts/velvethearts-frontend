import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`vh-input-group ${error ? 'vh-input-has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="vh-input-label font-ui">
          {label} {required && <span className="input-required-star" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className="vh-input-field font-ui"
        {...props}
      />
      {error && (
        <span id={errorId} className="vh-input-error font-ui" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className="vh-input-helper font-ui">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  maxLength,
  value = '',
  className = '',
  required = false,
  onEnterSubmit,
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        if (onEnterSubmit) {
          e.preventDefault();
          onEnterSubmit();
        }
      }
    }
  };

  return (
    <div className={`vh-input-group ${error ? 'vh-input-has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="vh-input-label font-ui">
          {label} {required && <span className="input-required-star" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="vh-textarea-wrapper">
        <textarea
          ref={ref}
          id={id}
          required={required}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onKeyDown={handleKeyDown}
          className="vh-textarea-field font-body"
          {...props}
        />
        {maxLength && (
          <span className="vh-textarea-counter font-ui" aria-live="polite">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
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

Textarea.displayName = 'Textarea';

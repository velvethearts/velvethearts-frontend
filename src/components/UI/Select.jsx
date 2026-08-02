import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  id,
  options = [],
  className = '',
  required = false,
  ...props
}, ref) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`vh-input-group ${error ? 'vh-input-has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="vh-input-label font-ui">
          {label} {required && <span className="input-required-star" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="vh-select-wrapper">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className="vh-select-field font-ui"
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      </div>
      {error && (
        <span id={errorId} className="vh-input-error font-ui" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

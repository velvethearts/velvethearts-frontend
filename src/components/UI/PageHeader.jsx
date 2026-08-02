import React from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

export const PageHeader = ({
  title,
  subtitle,
  onBack,
  actions,
  className = ''
}) => {
  return (
    <header className={`vh-page-header ${className}`}>
      <div className="vh-header-top-row">
        {onBack && (
          <button 
            onClick={onBack} 
            className="vh-header-back-btn font-ui" 
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}
        {actions && <div className="vh-header-actions-wrap">{actions}</div>}
      </div>
      {(title || subtitle) && (
        <div className="vh-header-title-block">
          {title && <h1 className="vh-page-title font-display">{title}</h1>}
          {subtitle && <p className="vh-page-subtitle font-body">{subtitle}</p>}
        </div>
      )}
    </header>
  );
};

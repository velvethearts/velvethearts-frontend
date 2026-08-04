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
      {onBack && (
        <div className="vh-header-top-row">
          <button 
            onClick={onBack} 
            className="vh-header-back-btn font-ui" 
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      )}
      {(title || subtitle || actions) && (
        <div className="vh-header-title-block">
          <div className="vh-header-title-row">
            {title && <h1 className="vh-page-title font-display">{title}</h1>}
            {actions && <div className="vh-header-actions-wrap">{actions}</div>}
          </div>
          {subtitle && <p className="vh-page-subtitle font-body">{subtitle}</p>}
        </div>
      )}

      <style>{`
        .vh-header-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: var(--space-4);
        }
        .vh-header-actions-wrap {
          margin-left: auto;
          display: flex;
          align-items: center;
        }
      `}</style>
    </header>
  );
};

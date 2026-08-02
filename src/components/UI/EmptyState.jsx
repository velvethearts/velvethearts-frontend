import React from 'react';

export const EmptyState = ({
  title,
  desc,
  actionLabel,
  onActionClick,
  icon: IconNode,
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`vh-empty-state font-ui ${className}`} 
      style={style}
      role="status"
    >
      {IconNode && <div className="vh-empty-icon-wrap">{IconNode}</div>}
      <h3 className="vh-empty-title font-display">{title}</h3>
      {desc && <p className="vh-empty-desc font-body">{desc}</p>}
      {actionLabel && onActionClick && (
        <button onClick={onActionClick} className="vh-btn vh-btn-primary vh-empty-action font-ui">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

import React from 'react';

export const EmptyState = ({
  title,
  desc,
  description,
  actionLabel,
  onActionClick,
  icon: IconNode,
  className = '',
  style = {}
}) => {
  const displayDesc = desc || description;

  const renderIcon = () => {
    if (!IconNode) return null;
    if (React.isValidElement(IconNode)) return IconNode;
    if (typeof IconNode === 'function' || (typeof IconNode === 'object' && IconNode?.$$typeof)) {
      const IconComponent = IconNode;
      return <IconComponent size={44} weight="regular" />;
    }
    return IconNode;
  };

  return (
    <div 
      className={`vh-empty-state font-ui ${className}`} 
      style={style}
      role="status"
    >
      {IconNode && <div className="vh-empty-icon-wrap">{renderIcon()}</div>}
      <h3 className="vh-empty-title font-display">{title}</h3>
      {displayDesc && <p className="vh-empty-desc font-body">{displayDesc}</p>}
      {actionLabel && onActionClick && (
        <button onClick={onActionClick} className="vh-btn vh-btn-primary vh-empty-action font-ui">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

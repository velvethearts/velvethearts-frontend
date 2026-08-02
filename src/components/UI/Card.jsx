import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`vh-card ${hoverable ? 'vh-card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

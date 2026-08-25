import React, { useState } from 'react';
import { ShieldCheck, CheckCircle } from '@phosphor-icons/react';

/**
 * VerifiedBadge
 * Clean, native verification badge for Velvet Hearts.
 * Uses sharp SVG iconography, clean typography, and in-app color tokens (no tacky glowing AI seals).
 *
 * @param {string} variant - 'pill' | 'icon' | 'compact'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} interactive - whether tapping displays the verification info tooltip
 * @param {string} className - extra CSS classes
 */
export const VerifiedBadge = ({
  variant = 'pill',
  size = 'md',
  interactive = true,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    setShowTooltip((prev) => !prev);
  };

  const handleBlur = () => {
    setShowTooltip(false);
  };

  if (variant === 'icon') {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    return (
      <span
        className={`vh-verified-icon-wrap vh-verified-size-${size} ${className}`}
        onClick={handleClick}
        onBlur={handleBlur}
        tabIndex={interactive ? 0 : undefined}
        title="Photo Verified by Velvet Hearts"
        aria-label="Verified Profile"
      >
        <CheckCircle size={iconSize} weight="fill" className="vh-verified-svg-icon" />
        {showTooltip && (
          <div className="vh-verified-tooltip font-ui" role="tooltip">
            <div className="vh-verified-tooltip-header">
              <ShieldCheck size={14} weight="fill" color="#B8436A" />
              <span>Photo Verified</span>
            </div>
            <p className="vh-verified-tooltip-text">
              Live pose selfie was confirmed authentic by Velvet Hearts.
            </p>
          </div>
        )}
      </span>
    );
  }

  return (
    <span
      className={`vh-verified-badge vh-verified-size-${size} ${interactive ? 'interactive' : ''} ${className} font-ui`}
      onClick={handleClick}
      onBlur={handleBlur}
      tabIndex={interactive ? 0 : undefined}
      title="Photo Verified by Velvet Hearts"
      aria-label="Verified Profile"
    >
      <CheckCircle size={size === 'sm' ? 11 : 13} weight="fill" className="vh-verified-svg-icon" />
      <span className="vh-verified-text">Verified</span>

      {showTooltip && (
        <div className="vh-verified-tooltip font-ui" role="tooltip">
          <div className="vh-verified-tooltip-header">
            <ShieldCheck size={14} weight="fill" color="#B8436A" />
            <span>Photo Verified</span>
          </div>
          <p className="vh-verified-tooltip-text">
            Live pose selfie was confirmed authentic by Velvet Hearts.
          </p>
        </div>
      )}
    </span>
  );
};

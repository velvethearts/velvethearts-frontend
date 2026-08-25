import React, { useState } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';

/**
 * VerifiedBadgeIcon
 * The authentic 8-point scalloped starburst rosette verified badge emblem.
 */
export const VerifiedBadgeIcon = ({ size = 18, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`vh-verified-rosette-svg ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* 8-pointed scalloped starburst badge */}
    <path
      d="M10.29 2.308a2.23 2.23 0 0 1 3.42 0l.66.762a2.23 2.23 0 0 0 1.8.745l1.005-.09a2.23 2.23 0 0 1 2.42 2.42l-.09 1.005a2.23 2.23 0 0 0 .745 1.8l.762.66a2.23 2.23 0 0 1 0 3.42l-.762.66a2.23 2.23 0 0 0-.745 1.8l.09 1.005a2.23 2.23 0 0 1-2.42 2.42l-1.005-.09a2.23 2.23 0 0 0-1.8.745l-.66.762a2.23 2.23 0 0 1-3.42 0l-.66-.762a2.23 2.23 0 0 0-1.8-.745l-1.005.09a2.23 2.23 0 0 1-2.42-2.42l.09-1.005a2.23 2.23 0 0 0-.745-1.8l-.762-.66a2.23 2.23 0 0 1 0-3.42l.762-.66a2.23 2.23 0 0 0 .745-1.8l-.09-1.005a2.23 2.23 0 0 1 2.42-2.42l1.005.09a2.23 2.23 0 0 0 1.8-.745l.66-.762Z"
      fill="currentColor"
    />
    <path
      d="m8.75 12 2.25 2.25 4.5-4.5"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * VerifiedBadge
 * Clean, native verification badge for Velvet Hearts.
 * Uses authentic rosette SVG iconography, clean typography, and in-app color tokens.
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
    const iconSize = size === 'sm' ? 19 : size === 'lg' ? 26 : 22;
    return (
      <span
        className={`vh-verified-icon-wrap vh-verified-size-${size} ${className}`}
        onClick={handleClick}
        onBlur={handleBlur}
        tabIndex={interactive ? 0 : undefined}
        title="Photo Verified by Velvet Hearts"
        aria-label="Verified Profile"
      >
        <VerifiedBadgeIcon size={iconSize} />
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
      <VerifiedBadgeIcon size={size === 'sm' ? 15 : 17} />
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

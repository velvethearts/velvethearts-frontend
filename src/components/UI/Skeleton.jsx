import React from 'react';
import './Skeleton.css';

/**
 * Base generic shimmer skeleton block
 */
export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  style = {},
  ...rest
}) => {
  return (
    <div
      className={`vh-skeleton-block ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
      {...rest}
    />
  );
};

/**
 * StoryDeck luxury magazine card skeleton
 * Mirrors the exact visual structure and aspect-ratio of StoryDeck
 */
export const StoryDeckSkeleton = () => {
  return (
    <div className="story-deck-skeleton-wrap" aria-label="Loading profile..." aria-busy="true">
      <div className="story-deck-skeleton-card">
        {/* Full-bleed hero photo container */}
        <div className="story-deck-skeleton-hero">
          <Skeleton width="100%" height="100%" borderRadius="0" className="story-deck-skeleton-photo" />

          {/* Simulated Story Bars */}
          <div className="story-deck-skeleton-indicators">
            <div className="story-deck-skeleton-bar" />
            <div className="story-deck-skeleton-bar" />
            <div className="story-deck-skeleton-bar" />
            <div className="story-deck-skeleton-bar" />
          </div>

          {/* Top Badges */}
          <div className="story-deck-skeleton-top-badges">
            <Skeleton width="76px" height="26px" borderRadius="13px" />
            <Skeleton width="94px" height="26px" borderRadius="13px" />
          </div>

          {/* Bottom Overlaid Details */}
          <div className="story-deck-skeleton-bottom-overlay">
            {/* Headline Row: Name + Age + Circular Arrow */}
            <div className="story-deck-skeleton-name-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton width="130px" height="28px" borderRadius="8px" />
                <Skeleton width="22px" height="22px" borderRadius="50%" />
                <Skeleton width="60px" height="20px" borderRadius="10px" />
              </div>
              <Skeleton width="40px" height="40px" borderRadius="50%" />
            </div>

            {/* Meta Tags Row */}
            <div className="story-deck-skeleton-tags">
              <Skeleton width="70px" height="22px" borderRadius="11px" />
              <Skeleton width="90px" height="22px" borderRadius="11px" />
              <Skeleton width="60px" height="22px" borderRadius="11px" />
            </div>

            {/* Story Quote Shimmer */}
            <Skeleton width="100%" height="52px" borderRadius="14px" className="story-deck-skeleton-quote-box" />
          </div>
        </div>
      </div>

      {/* Floating 5-Button Circular Console Shimmer */}
      <div className="story-deck-skeleton-console">
        <Skeleton width="44px" height="44px" borderRadius="50%" />
        <Skeleton width="58px" height="58px" borderRadius="50%" />
        <Skeleton width="44px" height="44px" borderRadius="50%" />
        <Skeleton width="58px" height="58px" borderRadius="50%" />
        <Skeleton width="44px" height="44px" borderRadius="50%" />
      </div>
    </div>
  );
};

/**
 * Grid Card skeleton for gallery / wall view
 */
export const GridCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="gallery-wall-skeleton-grid" aria-label="Loading profiles..." aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="grid-card-skeleton" aria-hidden="true">
          <Skeleton width="100%" height="280px" borderRadius="0" className="grid-card-skeleton-photo" />
          <div className="grid-card-skeleton-details">
            <Skeleton width="65%" height="22px" borderRadius="6px" />
            <Skeleton width="40%" height="16px" borderRadius="4px" />
            <div className="grid-card-skeleton-chips">
              <Skeleton width="70px" height="24px" borderRadius="12px" />
              <Skeleton width="80px" height="24px" borderRadius="12px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Matches & Chat List Skeleton
 */
export const MatchesListSkeleton = ({ count = 3 }) => {
  return (
    <div className="matches-list-skeleton-wrap" aria-label="Loading connections..." aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="matches-item-skeleton" aria-hidden="true">
          <Skeleton width="52px" height="52px" borderRadius="50%" className="matches-avatar-skeleton" />
          <div className="matches-content-skeleton">
            <Skeleton width="45%" height="18px" borderRadius="4px" />
            <Skeleton width="70%" height="14px" borderRadius="4px" />
          </div>
        </div>
      ))}
    </div>
  );
};

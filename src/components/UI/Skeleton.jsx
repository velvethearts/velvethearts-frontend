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
        {/* Hero Photo Aspect Ratio */}
        <div className="story-deck-skeleton-hero">
          <Skeleton width="100%" height="100%" borderRadius="0" className="story-deck-skeleton-photo" />

          {/* Simulated Photo Indicators */}
          <div className="story-deck-skeleton-indicators">
            <div className="story-deck-skeleton-bar" />
            <div className="story-deck-skeleton-bar" />
            <div className="story-deck-skeleton-bar" />
          </div>

          {/* Simulated Vibe Match Pill */}
          <Skeleton
            width="82px"
            height="28px"
            borderRadius="14px"
            className="story-deck-skeleton-vibe-pill"
          />

          {/* Hero Bottom Overlay */}
          <div className="story-deck-skeleton-hero-overlay">
            <Skeleton width="58%" height="28px" borderRadius="6px" />
            <Skeleton width="38%" height="16px" borderRadius="4px" />
          </div>
        </div>

        {/* Card Body */}
        <div className="story-deck-skeleton-body">
          {/* Story Quote Shimmer */}
          <Skeleton width="100%" height="74px" borderRadius="14px" className="story-deck-skeleton-quote-box" />

          {/* Interest Chips Shimmer */}
          <div className="story-deck-skeleton-chips">
            <Skeleton width="86px" height="30px" borderRadius="15px" />
            <Skeleton width="104px" height="30px" borderRadius="15px" />
            <Skeleton width="72px" height="30px" borderRadius="15px" />
          </div>

          {/* Action Button Circles Shimmer */}
          <div className="story-deck-skeleton-actions">
            <Skeleton width="54px" height="54px" borderRadius="50%" className="story-deck-skeleton-action-btn secondary" />
            <Skeleton width="68px" height="68px" borderRadius="50%" className="story-deck-skeleton-action-btn primary" />
            <Skeleton width="54px" height="54px" borderRadius="50%" className="story-deck-skeleton-action-btn secondary" />
          </div>
        </div>
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

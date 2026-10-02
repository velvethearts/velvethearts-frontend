import React from 'react';
import './LandingSkeletonScreen.css';

export const LandingSkeletonScreen = () => {
  return (
    <div className="vh-landing-skeleton-root" aria-busy="true" aria-label="Loading Velvet Hearts">
      {/* Top Navbar Skeleton */}
      <header className="vh-sk-nav">
        <div className="vh-sk-brand">
          <div className="vh-sk-box vh-sk-logo" />
          <div className="vh-sk-box vh-sk-brand-text" />
        </div>
        <div className="vh-sk-links">
          <div className="vh-sk-box vh-sk-link" />
          <div className="vh-sk-box vh-sk-link" />
          <div className="vh-sk-box vh-sk-link" />
        </div>
        <div className="vh-sk-actions">
          <div className="vh-sk-box vh-sk-btn-sm" />
          <div className="vh-sk-box vh-sk-btn-primary" />
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <main className="vh-sk-hero">
        <div className="vh-sk-hero-content">
          <div className="vh-sk-box vh-sk-badge" />
          <div className="vh-sk-box vh-sk-headline-line1" />
          <div className="vh-sk-box vh-sk-headline-line2" />
          <div className="vh-sk-box vh-sk-sub-line1" />
          <div className="vh-sk-box vh-sk-sub-line2" />
          <div className="vh-sk-hero-btns">
            <div className="vh-sk-box vh-sk-btn-hero" />
            <div className="vh-sk-box vh-sk-btn-hero-outline" />
          </div>
        </div>

        <div className="vh-sk-hero-card">
          <div className="vh-sk-box vh-sk-arch-portal" />
        </div>
      </main>

      {/* Feature Cards Skeleton Strip */}
      <div className="vh-sk-cards-strip">
        <div className="vh-sk-box vh-sk-feature-card" />
        <div className="vh-sk-box vh-sk-feature-card" />
        <div className="vh-sk-box vh-sk-feature-card" />
      </div>
    </div>
  );
};

export default LandingSkeletonScreen;

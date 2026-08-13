import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, MagnifyingGlass, X, HeartBreak, Cards, SquaresFour } from '@phosphor-icons/react';
import { DiscoverPreferences } from './DiscoverPreferences';
import { ProfileCard } from '../../components/UI/ProfileCard';
import { StoryDeck } from '../../components/UI/StoryDeck';
import { EmptyState } from '../../components/UI/EmptyState';
import { PageHeader } from '../../components/UI/PageHeader';

export const DiscoverFeed = ({ onSelectProfile }) => {
  const {
    profiles,
    loadingProfiles,
    interestsSent,
    interestStatuses = {},
    connections = [],
    sendInterest,
    unsendInterest,
    savedProfiles,
    toggleSaveProfile,
    blockUser,
    reportUser,
    filters,
    setFilters,
    userProfile,
    passedProfileIds,
    setPassedProfileIds,
    passProfile,
    unpassProfile
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [showPreferences, setShowPreferences] = useState(false);
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid'

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Perform search and filter locally
  const filteredProfiles = profiles.filter(profile => {
    // 0. Exclude own profile
    if (userProfile && (profile.id === userProfile.id || profile.userId === userProfile.userId || profile.id === userProfile.userId || profile.userId === userProfile.id)) return false;

    // Always exclude mutual matches and passed profiles
    const isMatchedOrPassed =
      connections.some(c => c.id === profile.id || c.userId === profile.id || c.partnerId === profile.id) ||
      passedProfileIds.includes(profile.id);
    if (isMatchedOrPassed) return false;

    // In Deck View ('deck'), exclude sent interests so candidate deck advances smoothly
    // In Grid View ('grid'), KEEP sent interests visible so the user sees 'Invite Sent ✓' on the card
    if (viewMode === 'deck') {
      const isSentOrMatched =
        interestsSent.includes(profile.id) ||
        (profile.userId && interestsSent.includes(profile.userId)) ||
        Boolean(interestStatuses[profile.id]) ||
        (profile.userId && Boolean(interestStatuses[profile.userId]));
      if (isSentOrMatched) return false;
    }

    // 1. Search term match
    const searchString = searchTerm.trim().toLowerCase();
    if (searchString) {
      const matchesSearch =
        profile.name.toLowerCase().includes(searchString) ||
        profile.city.toLowerCase().includes(searchString) ||
        profile.interests.some(i => i.toLowerCase().includes(searchString)) ||
        profile.story.toLowerCase().includes(searchString);

      if (!matchesSearch) return false;
    }

    // 2. Quick Filters
    if (activeQuickFilter === 'Near Me' && profile.city !== 'Mumbai') return false; // Mumbai is 'Near Me'
    if (activeQuickFilter === 'New' && !profile.verified) return false; // Verified acts as new

    // 3. Panel Filters
    const normalizeGender = (g) => {
      if (!g) return '';
      const str = g.toLowerCase();
      if (str === 'woman' || str === 'female' || str === 'women') return 'woman';
      if (str === 'man' || str === 'male' || str === 'men') return 'man';
      return str;
    };

    if (filters.gender && filters.gender !== 'All') {
      const targetG = normalizeGender(filters.gender);
      const profG = normalizeGender(profile.gender);
      if (targetG && profG !== targetG) return false;
    }

    if (filters.relationshipIntent && filters.relationshipIntent !== 'All') {
      if (!profile.relationshipIntent) return false;
      const fIntent = filters.relationshipIntent.toLowerCase();
      const pIntent = profile.relationshipIntent.toLowerCase();
      if (!pIntent.includes(fIntent) && !fIntent.includes(pIntent)) return false;
    }

    if (filters.city && filters.city.trim()) {
      if (!profile.city?.toLowerCase().includes(filters.city.trim().toLowerCase())) return false;
    }

    // Enforce Age filter bounds
    if (typeof profile.age === 'number') {
      if (profile.age < (filters.ageMin ?? 18) || profile.age > (filters.ageMax ?? 60)) return false;
    }

    // Enforce Distance filter bounds
    if (filters.distanceMax && profile.distance) {
      const distNum = parseFloat(profile.distance);
      if (!isNaN(distNum) && distNum > filters.distanceMax) return false;
    }

    return true;
  });

  // Preload top candidate photos in background for instant card renders
  React.useEffect(() => {
    if (filteredProfiles.length > 0) {
      filteredProfiles.slice(0, 5).forEach(p => {
        if (Array.isArray(p.photos) && p.photos[0]) {
          const img = new Image();
          img.src = p.photos[0];
        }
      });
    }
  }, [filteredProfiles]);

  // Apply sorting to filtered profiles
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    const currentSort = filters.sortBy || 'default';
    if (currentSort === 'newest') {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    }
    if (currentSort === 'profileCompletion') {
      return (b.profileCompletion || 0) - (a.profileCompletion || 0);
    }
    if (currentSort === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    // Default: Vibe match & profile completion
    return (b.profileCompletion || 80) - (a.profileCompletion || 80);
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveQuickFilter('All');
    setPassedProfileIds([]);
    setFilters({
      gender: 'All',
      relationshipIntent: 'All',
      city: '',
      ageMin: 18,
      ageMax: 60,
      distanceMax: 50,
      sortBy: 'default'
    });
  };

  const hasActiveFilters =
    (filters.gender && filters.gender !== 'All') ||
    (filters.relationshipIntent && filters.relationshipIntent !== 'All') ||
    Boolean(filters.city) ||
    (filters.ageMin && filters.ageMin > 18) ||
    (filters.ageMax && filters.ageMax < 60) ||
    (filters.distanceMax && filters.distanceMax < 50) ||
    (filters.sortBy && filters.sortBy !== 'default');

  return (
    <div className="discover-feed-page page-enter">
      {/* Dynamic Header */}
      <PageHeader
        title="Discover"
        subtitle="Find someone who sees you."
        actions={
          <div className="discover-header-actions">
            {/* View Mode Toggle Switch */}
            <button
              type="button"
              className="view-mode-toggle-switch font-ui"
              onClick={() => setViewMode(viewMode === 'deck' ? 'grid' : 'deck')}
              aria-label={`Switch to ${viewMode === 'deck' ? 'Grid' : 'Deck'} view`}
              title={`Current: ${viewMode === 'deck' ? 'Story Deck' : 'Gallery Grid'} (Click to switch)`}
            >
              <Cards
                size={18}
                weight={viewMode === 'deck' ? 'fill' : 'regular'}
                className={`toggle-icon ${viewMode === 'deck' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('deck');
                }}
              />
              <div className="toggle-track">
                <div className={`toggle-thumb ${viewMode === 'grid' ? 'grid-active' : 'deck-active'}`} />
              </div>
              <SquaresFour
                size={18}
                weight={viewMode === 'grid' ? 'fill' : 'regular'}
                className={`toggle-icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('grid');
                }}
              />
            </button>

            {/* Preferences icon-only button */}
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className={`filters-toggle-btn icon-only font-ui ${hasActiveFilters ? 'has-active' : ''}`}
              aria-label="Filter preferences drawer"
              title="Preferences & Filters"
            >
              <Sliders size={20} />
              {hasActiveFilters && <span className="active-filters-indicator" />}
            </button>
          </div>
        }
      />

      {/* Search Input Container */}
      <div className="search-bar-wrap">
        <div className="search-input-group">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, interest, city..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input font-ui"
            aria-label="Search profiles"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="search-clear-btn" aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters Horizontal Row */}
      <div className="quick-filters-row" role="tablist" aria-label="Quick discovery filters">
        {['All', 'Near Me', 'New'].map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={activeQuickFilter === f}
            onClick={() => setActiveQuickFilter(f)}
            className={`quick-filter-pill font-ui ${activeQuickFilter === f ? 'active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid Loaders or Content Cards */}
      {loadingProfiles ? (
        <div className="gallery-wall-grid">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="skeleton-card" aria-hidden="true">
              <div className="skeleton-image skeleton-pulse" />
              <div className="skeleton-text skeleton-pulse" />
              <div className="skeleton-text-short skeleton-pulse" />
            </div>
          ))}
        </div>
      ) : sortedProfiles.length > 0 ? (
        viewMode === 'deck' ? (
          <StoryDeck
            profiles={sortedProfiles}
            interestsSent={interestsSent}
            savedProfiles={savedProfiles}
            userProfile={userProfile}
            onSendInterest={sendInterest}
            onUnsendInterest={unsendInterest}
            onPassProfile={passProfile}
            onUnpassProfile={unpassProfile}
            onSaveProfile={(id) => {
              const p = profiles.find(item => item.id === id);
              if (p) toggleSaveProfile(id, p);
            }}
            onSelectProfile={onSelectProfile}
          />
        ) : (
          <div className="gallery-wall-grid">
            {sortedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isInterestSent={
                  interestsSent.includes(profile.id) ||
                  (profile.userId && interestsSent.includes(profile.userId)) ||
                  Boolean(interestStatuses[profile.id]) ||
                  (profile.userId && Boolean(interestStatuses[profile.userId]))
                }
                isSaved={savedProfiles.includes(profile.id)}
                onSendInterest={sendInterest}
                onUnsendInterest={unsendInterest}
                onSave={(id) => toggleSaveProfile(id, profile)}
                onBlock={blockUser}
                onReport={(id) => {
                  const reason = window.prompt(`Report ${profile.name} - Enter reason:`);
                  if (reason) reportUser(id, 'Reported from Card', reason);
                }}
                onClick={() => onSelectProfile(profile)}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No profiles found"
          desc="Try widening your search terms or adjusting preferences."
          actionLabel="Reset Filters"
          onActionClick={handleResetFilters}
          icon={<HeartBreak size={40} />}
        />
      )}

      {/* Preferences modal drawer */}
      {showPreferences && (
        <DiscoverPreferences onClose={() => setShowPreferences(false)} />
      )}

      <style>{`
        .discover-feed-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .discover-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        /* View Mode Toggle Switch (SlayDate style) */
        .view-mode-toggle-switch {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-surface-warm);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 4px 10px;
          cursor: pointer;
          transition: all var(--duration-fast);
          color: var(--text-tertiary);
        }

        .view-mode-toggle-switch:hover {
          border-color: var(--border-default);
          background: var(--bg-surface);
        }

        .view-mode-toggle-switch .toggle-icon {
          color: var(--text-tertiary);
          transition: color var(--duration-fast), transform var(--duration-fast);
        }

        .view-mode-toggle-switch .toggle-icon.active {
          color: var(--burgundy-400);
          transform: scale(1.1);
        }

        .view-mode-toggle-switch .toggle-track {
          position: relative;
          width: 34px;
          height: 20px;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: 10px;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: all var(--duration-fast);
        }

        .view-mode-toggle-switch .toggle-thumb {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--burgundy-400), var(--burgundy-500));
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .view-mode-toggle-switch .toggle-thumb.grid-active {
          transform: translateX(14px);
        }

        .view-mode-toggle-switch .toggle-thumb.deck-active {
          transform: translateX(0px);
        }

        /* Preferences Icon-only Button */
        .filters-toggle-btn.icon-only {
          width: 38px;
          height: 38px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1.5px solid var(--border-subtle);
          background: var(--bg-surface-warm);
          color: var(--text-secondary);
          transition: all var(--duration-fast);
          position: relative;
        }

        .filters-toggle-btn.icon-only:hover {
          background: var(--bg-surface);
          border-color: var(--burgundy-400);
          color: var(--text-accent);
          transform: translateY(-1px);
        }

        .filters-toggle-btn.icon-only.has-active {
          border-color: var(--burgundy-400);
          background: var(--bg-accent-subtle);
          color: var(--text-accent);
        }

        .filters-toggle-btn.icon-only .active-filters-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--burgundy-500);
          position: absolute;
          top: -2px;
          right: -2px;
          border: 2px solid var(--bg-surface);
          box-shadow: 0 0 6px rgba(184, 67, 106, 0.6);
        }

        /* Search input */
        .search-bar-wrap {
          margin-bottom: var(--space-6);
        }

        .search-input-group {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          background-color: var(--bg-input);
          padding: 0 var(--space-4);
          transition: all var(--duration-fast);
        }

        .search-input-group:focus-within {
          border-color: var(--border-focus);
          background-color: var(--bg-surface);
          box-shadow: 0 0 0 3px var(--burgundy-100);
        }

        .search-icon {
          color: var(--charcoal-500);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: var(--space-3) var(--space-2);
          outline: none;
          color: var(--text-primary);
        }
          
        .search-input:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
        }

        .search-clear-btn {
          color: var(--charcoal-500);
          display: flex;
          align-items: center;
        }

        /* Quick Filters Row */
        .quick-filters-row {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: var(--space-4);
          margin-bottom: var(--space-8);
          scrollbar-width: none;
        }

        .quick-filters-row::-webkit-scrollbar {
          display: none;
        }

        .quick-filter-pill {
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          padding: var(--space-2) var(--space-5);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
          white-space: nowrap;
          transition: all var(--duration-fast);
        }

        .quick-filter-pill:hover {
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        .quick-filter-pill.active {
          background-color: var(--bg-accent-subtle);
          border-color: var(--burgundy-300);
          color: var(--text-accent);
        }

        /* Responsive Grid Wall Layout */
        .gallery-wall-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-6);
        }

        /* Skeletons */
        .skeleton-card {
          background-color: var(--bg-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          height: 400px;
        }

        .skeleton-image {
          width: 100%;
          flex: 1;
          background-color: var(--charcoal-200);
          border-radius: var(--radius-md);
        }

        .skeleton-text {
          height: 20px;
          background-color: var(--charcoal-200);
          border-radius: 4px;
          width: 70%;
        }

        .skeleton-text-short {
          height: 15px;
          background-color: var(--charcoal-200);
          border-radius: 4px;
          width: 40%;
        }
      `}</style>
    </div>
  );
};

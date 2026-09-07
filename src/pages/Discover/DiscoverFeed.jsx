import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, MagnifyingGlass, X, HeartBreak, Cards, SquaresFour, Lightning, Sparkle } from '@phosphor-icons/react';
import { DiscoverPreferences } from './DiscoverPreferences';
import { ProfileCard } from '../../components/UI/ProfileCard';
import { StoryDeck } from '../../components/UI/StoryDeck';
import { EmptyState } from '../../components/UI/EmptyState';
import { PageHeader } from '../../components/UI/PageHeader';
import { StoryDeckSkeleton, GridCardSkeleton } from '../../components/UI/Skeleton';
import { calculateStateDistance } from '../../constants/indiaLocations';
import { triggerHaptic } from '../../utils/haptics';

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
    unpassProfile,
    showAlert
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [feedMode, setFeedMode] = useState('for_you'); // 'for_you' | 'near_me' | 'new_faces'
  const [boostActive, setBoostActive] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
    if (activeQuickFilter === 'Near Me') {
      const userCity = userProfile?.city;
      if (userCity) {
        const distInfo = profile.distanceKm != null
          ? { distanceKm: profile.distanceKm }
          : calculateStateDistance(userCity, profile.city);
        if (distInfo.distanceKm > 450 && profile.city?.toLowerCase() !== userCity.toLowerCase()) {
          return false;
        }
      }
    }

    if (activeQuickFilter === 'New') {
      if (profile.createdAt) {
        const daysOld = (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld > 60) return false;
      }
    }

    const normalizeGender = (g) => {
      if (!g) return '';
      const str = g.toLowerCase().trim();
      if (str === 'woman' || str === 'female' || str === 'women') return 'woman';
      if (str === 'man' || str === 'male' || str === 'men') return 'man';
      return str;
    };

    if (activeQuickFilter === 'Verified Only') {
      if (!profile.verified) return false;
    }

    // 3. Panel Filters
    if (filters.gender && filters.gender !== 'All') {
      const targetG = normalizeGender(filters.gender);
      const profG = normalizeGender(profile.gender);
      if (targetG === 'woman' || targetG === 'man') {
        if (profG !== targetG) return false;
      } else {
        if (!profG.includes(targetG) && !targetG.includes(profG)) return false;
      }
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
    if (filters.distanceMax && filters.distanceMax < 2500) {
      const distInfo = profile.distanceKm != null
        ? { distanceKm: profile.distanceKm }
        : calculateStateDistance(userProfile?.city, profile.city);
      if (distInfo.distanceKm > filters.distanceMax) return false;
    }

    // Enforce Verified Only filter
    if (filters.verifiedOnly && !profile.verified) return false;

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
    const currentSort = activeQuickFilter === 'New' ? 'newest' : (filters.sortBy || 'default');
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

  // Apply Feed Mode Filtering (For You, Near Me, New Faces)
  let feedProfiles = sortedProfiles;
  if (feedMode === 'near_me') {
    const userCity = userProfile?.city;
    if (userCity) {
      const nearList = sortedProfiles.filter(p => {
        const distInfo = p.distanceKm != null
          ? { distanceKm: p.distanceKm }
          : calculateStateDistance(userCity, p.city);
        return distInfo.distanceKm <= 450 || p.city?.toLowerCase() === userCity.toLowerCase();
      });
      feedProfiles = nearList.length > 0 ? nearList : sortedProfiles;
    }
  } else if (feedMode === 'new_faces') {
    const newList = sortedProfiles.filter(p => {
      if (!p.createdAt) return true; // keep if no date
      const daysOld = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld <= 60;
    }).sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    feedProfiles = newList.length > 0 ? newList : sortedProfiles;
  }

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveQuickFilter('All');
    setFeedMode('for_you');
    setPassedProfileIds([]);
    setFilters({
      gender: 'All',
      relationshipIntent: 'All',
      city: '',
      ageMin: 18,
      ageMax: 60,
      distanceMax: 2500,
      sortBy: 'default',
      verifiedOnly: false
    });
  };

  const hasActiveFilters =
    (filters.gender && filters.gender !== 'All') ||
    (filters.relationshipIntent && filters.relationshipIntent !== 'All') ||
    Boolean(filters.city) ||
    (filters.ageMin && filters.ageMin > 18) ||
    (filters.ageMax && filters.ageMax < 60) ||
    (filters.distanceMax && filters.distanceMax < 2500) ||
    Boolean(filters.verifiedOnly) ||
    (filters.sortBy && filters.sortBy !== 'default');

  return (
    <div className={`discover-feed-page page-enter ${viewMode === 'deck' ? 'is-deck-view' : ''}`}>
      {/* Modern Reference Header Navigation Rail */}
      <div className="discover-top-nav-bar font-ui">
        {/* Left: Preferences Button */}
        <button
          type="button"
          onClick={() => setShowPreferences(true)}
          className={`discover-nav-icon-btn ${hasActiveFilters ? 'has-active' : ''}`}
          aria-label="Filter preferences"
          title="Filter Preferences"
        >
          <Sliders size={22} weight="bold" />
          {hasActiveFilters && <span className="active-filter-dot" />}
        </button>

        {/* Center: Curated Feed Pills (For You | Near Me | New Faces) */}
        <div className="discover-mode-pills" role="tablist" aria-label="Discover Modes">
          {[
            { id: 'for_you', label: 'For You' },
            { id: 'near_me', label: 'Near Me' },
            { id: 'new_faces', label: 'New Faces' },
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={feedMode === tab.id}
              onClick={() => {
                setFeedMode(tab.id);
                triggerHaptic?.('light');
              }}
              className={`discover-mode-pill ${feedMode === tab.id ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right: View Mode Toggle + Spotlight Boost Button */}
        <div className="discover-top-right-actions">
          <button
            type="button"
            className="discover-nav-icon-btn mode-switch-btn"
            onClick={() => setViewMode(viewMode === 'deck' ? 'grid' : 'deck')}
            aria-label={`Switch to ${viewMode === 'deck' ? 'Grid' : 'Deck'} view`}
            title={`Switch to ${viewMode === 'deck' ? 'Grid' : 'Deck'} view`}
          >
            {viewMode === 'deck' ? <SquaresFour size={19} weight="bold" /> : <Cards size={19} weight="bold" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setBoostActive(true);
              triggerHaptic?.('medium');
              showAlert?.('⚡ Spotlight Boost Activated! Your profile is prioritized to 5x more members in your city for the next 30 minutes.', 'success');
            }}
            className={`discover-nav-icon-btn boost-btn ${boostActive ? 'is-boosted' : ''}`}
            aria-label="Spotlight Boost"
            title="Spotlight Boost — 5x more visibility"
          >
            <Lightning size={22} weight="fill" />
          </button>
        </div>
      </div>

      {/* Collapsible Search Input Container */}
      {(showSearch || searchTerm) && (
        <div className="search-bar-wrap page-enter">
          <div className="search-input-group">
            <MagnifyingGlass size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, interest, city, campus..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input font-ui"
              aria-label="Search profiles"
              autoFocus={showSearch && !searchTerm}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn" aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Luxury Shimmer Skeletons based on View Mode */}
      {loadingProfiles ? (
        viewMode === 'deck' ? (
          <StoryDeckSkeleton />
        ) : (
          <GridCardSkeleton count={3} />
        )
      ) : feedProfiles.length > 0 ? (
        viewMode === 'deck' ? (
          <StoryDeck
            profiles={feedProfiles}
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
          padding: var(--space-4) var(--space-3);
        }

        .discover-feed-page.is-deck-view {
          max-width: 440px;
          padding-top: var(--space-2);
          padding-bottom: 0;
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

        @media (max-width: 640px) {
          .gallery-wall-grid {
            grid-template-columns: 1fr;
            max-width: 440px;
            margin: 0 auto;
            gap: var(--space-4);
            padding-bottom: var(--space-2);
          }
        }

        /* Modern Reference Header Navigation Rail */
        .discover-top-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: var(--space-3);
          padding: 4px 0;
          flex-wrap: nowrap;
          width: 100%;
        }

        .discover-nav-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all var(--duration-fast);
          flex-shrink: 0;
        }

        .discover-nav-icon-btn:hover {
          color: #FFFFFF;
          transform: scale(1.08);
        }

        .discover-nav-icon-btn.has-active {
          color: var(--burgundy-400);
        }

        .discover-nav-icon-btn .active-filter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--burgundy-500);
          position: absolute;
          top: 6px;
          right: 6px;
          box-shadow: 0 0 6px var(--burgundy-400);
        }

        .discover-mode-pills {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .discover-mode-pill {
          padding: 5px 13px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.65);
          font-family: var(--font-ui);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .discover-mode-pill:hover {
          color: #FFFFFF;
        }

        .discover-mode-pill.active {
          background: #FFFFFF;
          color: #11141A !important;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .discover-top-right-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .discover-nav-icon-btn.mode-switch-btn {
          color: rgba(255, 255, 255, 0.55);
        }

        .discover-nav-icon-btn.mode-switch-btn:hover {
          color: #FFFFFF;
        }

        .discover-nav-icon-btn.boost-btn {
          color: #C084FC;
        }

        .discover-nav-icon-btn.boost-btn:hover {
          color: #D8B4FE;
          transform: scale(1.12);
        }

        .discover-nav-icon-btn.boost-btn.is-boosted {
          background: linear-gradient(135deg, #A855F7, #C084FC);
          color: #FFFFFF;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};

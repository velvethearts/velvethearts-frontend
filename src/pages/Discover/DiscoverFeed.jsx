import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, MagnifyingGlass, X, HeartBreak, Cards, SquaresFour, Lightning, Sparkle, Clock, NavigationArrow } from '@phosphor-icons/react';
import { DiscoverPreferences } from './DiscoverPreferences';
import { ProfileCard } from '../../components/UI/ProfileCard';
import { StoryDeck } from '../../components/UI/StoryDeck';
import { SpotlightBoostModal } from '../../components/UI/SpotlightBoostModal';
import { EmptyState } from '../../components/UI/EmptyState';
import { PageHeader } from '../../components/UI/PageHeader';
import { StoryDeckSkeleton, GridCardSkeleton } from '../../components/UI/Skeleton';
import { calculateStateDistance, calculateGpsDistance } from '../../constants/indiaLocations';
import { triggerHaptic } from '../../utils/haptics';

const BOOST_STORAGE_KEY = 'vh_profile_boost_state';
const BOOST_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const BOOST_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days (48 hours)

const formatBoostTime = (sec) => {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const formatCooldownTime = (sec) => {
  const days = Math.floor(Math.max(0, sec) / 86400);
  const hours = Math.floor((Math.max(0, sec) % 86400) / 3600);
  const minutes = Math.floor((Math.max(0, sec) % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

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
    showAlert,
    userLocation,
    requestUserLocation,
    isLocationLoading
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [feedMode, setFeedMode] = useState('for_you'); // 'for_you' | 'near_me' | 'new_faces'
  const [showSearch, setShowSearch] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid'
  const searchContainerRef = React.useRef(null);

  // Close search when clicking outside
  React.useEffect(() => {
    if (!showSearch && !searchTerm) return;

    const handleClickOutsideSearch = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !e.target.closest('.search-toggle-btn')
      ) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSearch);
    document.addEventListener('touchstart', handleClickOutsideSearch);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
      document.removeEventListener('touchstart', handleClickOutsideSearch);
    };
  }, [showSearch, searchTerm]);

  // Boost Profile State with 30-min timer and 2-day cooldown
  const [boostState, setBoostState] = useState(() => {
    try {
      const saved = localStorage.getItem(BOOST_STORAGE_KEY);
      if (saved) {
        const { boostExpiresAt, cooldownExpiresAt } = JSON.parse(saved);
        const now = Date.now();
        if (now < boostExpiresAt) {
          return {
            isBoosting: true,
            isOnCooldown: false,
            boostSecondsLeft: Math.max(0, Math.floor((boostExpiresAt - now) / 1000)),
            cooldownSecondsLeft: Math.max(0, Math.floor((cooldownExpiresAt - now) / 1000)),
            boostExpiresAt,
            cooldownExpiresAt
          };
        } else if (now < cooldownExpiresAt) {
          return {
            isBoosting: false,
            isOnCooldown: true,
            boostSecondsLeft: 0,
            cooldownSecondsLeft: Math.max(0, Math.floor((cooldownExpiresAt - now) / 1000)),
            boostExpiresAt,
            cooldownExpiresAt
          };
        }
      }
    } catch (_) {}
    return {
      isBoosting: false,
      isOnCooldown: false,
      boostSecondsLeft: 0,
      cooldownSecondsLeft: 0,
      boostExpiresAt: null,
      cooldownExpiresAt: null
    };
  });

  // Background interval timer ticking every second
  useEffect(() => {
    const checkBoostTimer = () => {
      try {
        const saved = localStorage.getItem(BOOST_STORAGE_KEY);
        if (!saved) return;
        const { boostExpiresAt, cooldownExpiresAt } = JSON.parse(saved);
        const now = Date.now();

        if (now < boostExpiresAt) {
          setBoostState({
            isBoosting: true,
            isOnCooldown: false,
            boostSecondsLeft: Math.max(0, Math.floor((boostExpiresAt - now) / 1000)),
            cooldownSecondsLeft: Math.max(0, Math.floor((cooldownExpiresAt - now) / 1000)),
            boostExpiresAt,
            cooldownExpiresAt
          });
        } else if (now < cooldownExpiresAt) {
          setBoostState({
            isBoosting: false,
            isOnCooldown: true,
            boostSecondsLeft: 0,
            cooldownSecondsLeft: Math.max(0, Math.floor((cooldownExpiresAt - now) / 1000)),
            boostExpiresAt,
            cooldownExpiresAt
          });
        } else {
          setBoostState({
            isBoosting: false,
            isOnCooldown: false,
            boostSecondsLeft: 0,
            cooldownSecondsLeft: 0,
            boostExpiresAt: null,
            cooldownExpiresAt: null
          });
        }
      } catch (_) {}
    };

    checkBoostTimer();
    const interval = setInterval(checkBoostTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivateBoost = () => {
    const now = Date.now();
    const boostExpiresAt = now + BOOST_DURATION_MS;
    const cooldownExpiresAt = now + BOOST_COOLDOWN_MS;
    const newState = {
      isBoosting: true,
      isOnCooldown: false,
      boostSecondsLeft: 30 * 60,
      cooldownSecondsLeft: Math.floor(BOOST_COOLDOWN_MS / 1000),
      boostExpiresAt,
      cooldownExpiresAt,
      expiredNotified: false,
      cooldownNotified: false
    };

    try {
      localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(newState));
    } catch (_) {}

    // Request browser notification permission if not yet requested
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    setBoostState(newState);
    triggerHaptic?.('medium');
    showAlert?.('⚡ Spotlight Boost Activated! Your profile is prioritized to 5x more members in your area for the next 30 minutes.', 'success');
    setShowBoostModal(false);
  };

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

  // Apply Live GPS & Feed Mode Filtering (For You, Near Me, New Faces)
  const userCity = userProfile?.city || '';
  const userGps = userLocation?.coords || null;

  // Enrich all profiles with real proximity data (using Live GPS or City Geodesic)
  const profilesWithDistance = sortedProfiles.map(p => {
    const isExactCity = Boolean(userCity && p.city && p.city.trim().toLowerCase() === userCity.trim().toLowerCase());
    let distKm = p.distanceKm;
    let distText = p.distance;

    // 1. High-precision live GPS calculation if device coordinates are available
    if (userGps) {
      const gpsCalc = calculateGpsDistance(userGps, p);
      if (gpsCalc) {
        distKm = gpsCalc.distanceKm;
        distText = gpsCalc.formatted;
      }
    }

    // 2. City-to-City geodesic fallback if live GPS is not available or candidate is remote
    if (distKm == null) {
      if (userCity && p.city) {
        const calc = calculateStateDistance(userCity, p.city);
        distKm = calc.distanceKm;
        distText = calc.formatted;
      } else {
        distKm = isExactCity ? 0 : 50;
        distText = isExactCity ? 'Same City' : 'Nearby';
      }
    }

    return {
      ...p,
      _isExactCity: isExactCity,
      _computedDistanceKm: distKm,
      _computedDistanceText: distText || (isExactCity ? `Same City • ${p.city}` : `${distKm} km away`)
    };
  });

  let feedProfiles = [...profilesWithDistance];

  if (feedMode === 'near_me') {
    feedProfiles = [...profilesWithDistance].sort((a, b) => {
      // 1. If Live GPS is active, sort strictly by physical proximity (closest km first)
      if (userGps) {
        if (a._computedDistanceKm !== b._computedDistanceKm) {
          return a._computedDistanceKm - b._computedDistanceKm;
        }
      } else {
        // Fallback: Same City matches first, then ascending distance
        if (a._isExactCity && !b._isExactCity) return -1;
        if (!a._isExactCity && b._isExactCity) return 1;
        if (a._computedDistanceKm !== b._computedDistanceKm) {
          return a._computedDistanceKm - b._computedDistanceKm;
        }
      }

      // 2. Secondary: profile completion
      return (b.profileCompletion || 0) - (a.profileCompletion || 0);
    });
  } else if (feedMode === 'new_faces') {
    // Sort all profiles by newest joined / created
    feedProfiles = [...sortedProfiles].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA; // Newest first
      }
      // If timestamps are identical or missing, reverse-sort by ID/name to guarantee a distinctly fresh order
      const idA = String(a.id || a.userId || a.name || '');
      const idB = String(b.id || b.userId || b.name || '');
      return idB.localeCompare(idA);
    });
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
        {/* Left: Preferences Button + Search Toggle */}
        <div className="discover-top-left-actions">
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className={`discover-nav-icon-btn ${hasActiveFilters ? 'has-active' : ''}`}
            data-tour="discover-filters"
            aria-label="Filter preferences"
            title="Filter Preferences"
          >
            <Sliders size={20} weight="bold" />
            {hasActiveFilters && <span className="active-filter-dot" />}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic?.('light');
              setShowSearch(prev => !prev);
            }}
            className={`discover-nav-icon-btn search-toggle-btn ${showSearch ? 'is-active' : ''}`}
            aria-label="Search profiles"
            title={showSearch ? 'Close search' : 'Search profiles'}
          >
            <MagnifyingGlass size={19} weight="bold" />
          </button>
        </div>

        {/* Center: Curated Feed Pills (For You | Near Me | New Faces) */}
        <div className="discover-mode-pills" data-tour="discover-modes" role="tablist" aria-label="Discover Modes">
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
            data-tour="discover-view-switch"
            onClick={() => setViewMode(viewMode === 'deck' ? 'grid' : 'deck')}
            aria-label={`Switch to ${viewMode === 'deck' ? 'Grid' : 'Deck'} view`}
            title={`Switch to ${viewMode === 'deck' ? 'Grid' : 'Deck'} view`}
          >
            {viewMode === 'deck' ? <SquaresFour size={19} weight="bold" /> : <Cards size={19} weight="bold" />}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic?.('light');
              setShowBoostModal(true);
            }}
            data-tour="discover-boost"
            className={`discover-nav-icon-btn boost-btn ${boostState.isBoosting ? 'is-boosted' : boostState.isOnCooldown ? 'is-cooldown' : 'is-ready'}`}
            aria-label="Spotlight Boost"
            title={
              boostState.isBoosting
                ? `Spotlight Boost Active — ${formatBoostTime(boostState.boostSecondsLeft)} remaining`
                : boostState.isOnCooldown
                ? `Spotlight Boost on Cooldown — Ready in ${formatCooldownTime(boostState.cooldownSecondsLeft)}`
                : 'Spotlight Boost — 5x more visibility for 30m'
            }
          >
            <Lightning size={19} weight="fill" />
            {boostState.isBoosting && (
              <span className="boost-timer-chip font-ui">
                {formatBoostTime(boostState.boostSecondsLeft)}
              </span>
            )}
            {boostState.isOnCooldown && (
              <span className="boost-cooldown-chip font-ui">
                {formatCooldownTime(boostState.cooldownSecondsLeft)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Live GPS Status & Activation Banner in Near Me Mode */}
      {feedMode === 'near_me' && (
        <div className="discover-gps-banner page-enter font-ui">
          {userLocation?.coords ? (
            <div className="gps-banner-content active">
              <div className="gps-banner-left">
                <span className="gps-live-dot" />
                <span className="gps-banner-text">
                  <strong>Live GPS:</strong> Sorting by exact distance {userLocation.detectedCity ? `near ${userLocation.detectedCity}` : ''}
                </span>
              </div>
              <button
                type="button"
                className="gps-action-btn refresh font-ui"
                onClick={() => {
                  triggerHaptic?.('light');
                  requestUserLocation();
                }}
                disabled={isLocationLoading}
                title="Update your current GPS location"
              >
                {isLocationLoading ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>
          ) : (
            <div className="gps-banner-content prompt">
              <div className="gps-banner-left">
                <NavigationArrow size={15} weight="fill" className="gps-icon-nav" />
                <span className="gps-banner-text">
                  Enable device GPS for exact real-time distance to nearby matches
                </span>
              </div>
              <button
                type="button"
                className="gps-action-btn enable font-ui"
                onClick={() => {
                  triggerHaptic?.('light');
                  requestUserLocation();
                }}
                disabled={isLocationLoading}
              >
                {isLocationLoading ? 'Locating...' : '📍 Enable Live GPS'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Search Input Container */}
      {(showSearch || searchTerm) && (
        <div className="search-bar-wrap page-enter" ref={searchContainerRef}>
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
            {searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="search-clear-btn" aria-label="Clear search">
                <X size={16} />
              </button>
            ) : (
              <button onClick={() => setShowSearch(false)} className="search-clear-btn" aria-label="Close search">
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
            key={feedMode}
            profiles={feedProfiles}
            feedMode={feedMode}
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
            {feedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                feedMode={feedMode}
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

      {/* Spotlight Profile Boost Modal */}
      <SpotlightBoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        boostState={boostState}
        onActivate={handleActivateBoost}
      />

      <style>{`
        .discover-feed-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-4) var(--space-3);
        }

        .discover-feed-page.is-deck-view {
          max-width: 480px;
          width: 100%;
          padding-top: var(--space-2);
          padding-bottom: 0;
          box-sizing: border-box;
        }

        @media (max-width: 640px) {
          .discover-feed-page.is-deck-view {
            max-width: 100%;
            padding-left: 8px;
            padding-right: 8px;
          }
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
          gap: 6px;
          margin-bottom: var(--space-2);
          padding: 2px 0;
          flex-wrap: nowrap;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .discover-nav-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.75);
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

        [data-theme="light"] .discover-nav-icon-btn {
          color: var(--charcoal-600, #6B5E62);
        }

        [data-theme="light"] .discover-nav-icon-btn:hover {
          color: var(--charcoal-900, #1A1517);
        }

        .discover-nav-icon-btn.has-active {
          color: var(--burgundy-400);
        }

        [data-theme="light"] .discover-nav-icon-btn.has-active {
          color: var(--burgundy-500);
        }

        .discover-nav-icon-btn .active-filter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--burgundy-500);
          position: absolute;
          top: 5px;
          right: 5px;
          box-shadow: 0 0 6px var(--burgundy-400);
        }

        .discover-mode-pills {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          flex-shrink: 1;
          min-width: 0;
        }

        [data-theme="light"] .discover-mode-pills {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .discover-mode-pill {
          padding: 4px 10px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.65);
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .discover-mode-pill:hover {
          color: #FFFFFF;
        }

        [data-theme="light"] .discover-mode-pill {
          color: var(--charcoal-600, #6B5E62);
        }

        [data-theme="light"] .discover-mode-pill:hover {
          color: var(--charcoal-900, #1A1517);
        }

        .discover-mode-pill.active {
          background: #FFFFFF;
          color: #11141A !important;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        [data-theme="light"] .discover-mode-pill.active {
          background: #FFFFFF;
          color: var(--burgundy-600, #9E3256) !important;
          box-shadow: 0 2px 8px rgba(58, 14, 26, 0.12);
          border: 1px solid rgba(184, 67, 106, 0.15);
        }

        .discover-top-left-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .discover-nav-icon-btn.search-toggle-btn.is-active {
          background: rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
        }

        [data-theme="light"] .discover-nav-icon-btn.search-toggle-btn.is-active {
          background: rgba(184, 67, 106, 0.1);
          color: var(--burgundy-600, #9E3256);
          border: 1px solid rgba(184, 67, 106, 0.18);
        }

        .discover-top-right-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .discover-nav-icon-btn.mode-switch-btn {
          color: rgba(255, 255, 255, 0.6);
        }

        .discover-nav-icon-btn.mode-switch-btn:hover {
          color: #FFFFFF;
        }

        [data-theme="light"] .discover-nav-icon-btn.mode-switch-btn {
          color: var(--charcoal-600, #6B5E62);
        }

        [data-theme="light"] .discover-nav-icon-btn.mode-switch-btn:hover {
          color: var(--charcoal-900, #1A1517);
        }

        /* Velvet Hearts Signature Boost Button */
        .discover-nav-icon-btn.boost-btn {
          color: var(--burgundy-400, #D0607F);
          background: rgba(184, 67, 106, 0.12);
          border: 1px solid rgba(184, 67, 106, 0.28);
          gap: 4px;
          padding: 0 8px;
          border-radius: var(--radius-full);
          transition: all 0.25s ease;
          width: auto;
          min-width: 36px;
          height: 36px;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .discover-nav-icon-btn.boost-btn:hover {
          color: #FFFFFF;
          background: var(--burgundy-500, #B8436A);
          border-color: var(--burgundy-500, #B8436A);
          transform: scale(1.05);
        }

        [data-theme="light"] .discover-nav-icon-btn.boost-btn {
          color: var(--burgundy-600, #9B3456);
          background: rgba(184, 67, 106, 0.08);
          border: 1px solid rgba(184, 67, 106, 0.22);
        }

        [data-theme="light"] .discover-nav-icon-btn.boost-btn:hover {
          color: #FFFFFF;
          background: var(--burgundy-600, #9B3456);
          border-color: var(--burgundy-600, #9B3456);
        }

        .discover-nav-icon-btn.boost-btn.is-boosted {
          background: linear-gradient(135deg, var(--burgundy-600, #9B3456) 0%, var(--burgundy-500, #B8436A) 100%);
          color: #FFFFFF;
          box-shadow: 0 0 16px rgba(184, 67, 106, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.25);
          animation: boostGlowPulse 2s infinite;
        }

        @keyframes boostGlowPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(184, 67, 106, 0.45); }
          50% { box-shadow: 0 0 20px rgba(184, 67, 106, 0.8); }
        }

        [data-theme="light"] .discover-nav-icon-btn.boost-btn.is-boosted {
          background: linear-gradient(135deg, var(--burgundy-700, #7A2842) 0%, var(--burgundy-600, #9B3456) 100%);
          color: #FFFFFF;
          box-shadow: 0 3px 12px rgba(155, 52, 86, 0.35);
          border: none;
        }

        .discover-nav-icon-btn.boost-btn.is-cooldown {
          color: var(--charcoal-400, #B5ABAD);
          background: rgba(30, 24, 27, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        [data-theme="light"] .discover-nav-icon-btn.boost-btn.is-cooldown {
          color: var(--charcoal-600, #7A6E70);
          background: var(--charcoal-100, #F5F1F2);
          border: 1px solid var(--charcoal-200, #E8E3E4);
        }

        .boost-timer-chip {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
          color: #FFFFFF;
          line-height: 1;
        }

        .boost-cooldown-chip {
          font-size: 10px;
          font-weight: 700;
          color: var(--gold-primary, #D4AD6A);
          letter-spacing: 0.02em;
          line-height: 1;
        }

        [data-theme="light"] .boost-cooldown-chip {
          color: #8A6D3B;
        }

        /* Live GPS Proximity Banner */
        .discover-gps-banner {
          max-width: 680px;
          margin: 0 auto var(--space-3) auto;
          width: 100%;
          box-sizing: border-box;
        }

        .gps-banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 14px;
          border-radius: var(--radius-full, 999px);
          font-size: 12px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }

        .gps-banner-content.active {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--text-primary, #FFFFFF);
        }

        [data-theme="light"] .gps-banner-content.active {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.35);
          color: #065F46;
        }

        .gps-banner-content.prompt {
          background: rgba(184, 67, 106, 0.08);
          border: 1px solid rgba(184, 67, 106, 0.25);
          color: var(--text-primary, #FFFFFF);
        }

        [data-theme="light"] .gps-banner-content.prompt {
          background: rgba(184, 67, 106, 0.07);
          border-color: rgba(184, 67, 106, 0.25);
          color: var(--charcoal-900, #1A1517);
        }

        .gps-banner-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .gps-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
          animation: pulseEmerald 1.8s infinite;
          flex-shrink: 0;
        }

        .gps-icon-nav {
          color: var(--burgundy-400, #E27B9B);
          flex-shrink: 0;
        }

        [data-theme="light"] .gps-icon-nav {
          color: var(--burgundy-500, #B8436A);
        }

        .gps-banner-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gps-action-btn {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          white-space: nowrap;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .gps-action-btn.enable {
          background: linear-gradient(135deg, var(--burgundy-500, #8A1538), var(--burgundy-600, #5C0E24));
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(138, 21, 56, 0.35);
        }

        .gps-action-btn.enable:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(138, 21, 56, 0.5);
        }

        .gps-action-btn.refresh {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-primary, #FFFFFF);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        [data-theme="light"] .gps-action-btn.refresh {
          background: rgba(0, 0, 0, 0.06);
          color: var(--charcoal-900, #1A1517);
          border-color: rgba(0, 0, 0, 0.12);
        }

        .gps-action-btn.refresh:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 600px) {
          .gps-banner-content {
            padding: 6px 10px;
            font-size: 11px;
            gap: 6px;
          }
          .gps-action-btn {
            padding: 3px 9px;
            font-size: 10.5px;
          }
        }

        @media (max-width: 420px) {
          .discover-top-nav-bar {
            gap: 4px;
          }
          .discover-nav-icon-btn {
            width: 33px;
            height: 33px;
          }
          .discover-mode-pills {
            padding: 1.5px;
            gap: 1px;
          }
          .discover-mode-pill {
            padding: 3.5px 7px;
            font-size: 11px;
          }
          .discover-nav-icon-btn.boost-btn {
            height: 33px;
            padding: 0 6px;
            min-width: 33px;
          }
          .boost-timer-chip,
          .boost-cooldown-chip {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, MagnifyingGlass, X, HeartBreak, ShieldCheck } from '@phosphor-icons/react';
import { DiscoverPreferences } from './DiscoverPreferences';
import { ProfileCard } from '../../components/UI/ProfileCard';
import { EmptyState } from '../../components/UI/EmptyState';
import { PageHeader } from '../../components/UI/PageHeader';

export const DiscoverFeed = ({ onSelectProfile }) => {
  const { 
    profiles, 
    loadingProfiles, 
    interestsSent, 
    sendInterest, 
    savedProfiles,
    toggleSaveProfile,
    blockUser,
    reportUser,
    filters, 
    setFilters 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [showPreferences, setShowPreferences] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Perform search and filter locally
  const filteredProfiles = profiles.filter(profile => {
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
    if (filters.gender !== 'All' && profile.gender !== filters.gender) return false;
    if (filters.relationshipIntent !== 'All' && profile.relationshipIntent !== filters.relationshipIntent) return false;
    if (filters.city && !profile.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    
    // Enforce Age filter bounds
    if (profile.age < filters.ageMin || profile.age > filters.ageMax) return false;

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveQuickFilter('All');
    setFilters({
      gender: 'All',
      relationshipIntent: 'All',
      city: '',
      ageMin: 18,
      ageMax: 60,
      distanceMax: 50
    });
  };

  const hasActiveFilters = 
    filters.gender !== 'All' || 
    filters.relationshipIntent !== 'All' || 
    filters.city || 
    filters.ageMin > 18 || 
    filters.ageMax < 60;

  return (
    <div className="discover-feed-page page-enter">
      {/* Dynamic Header */}
      <PageHeader
        title="Discover"
        subtitle="Find someone who sees you."
        actions={
          <button 
            onClick={() => setShowPreferences(true)} 
            className="filters-toggle-btn font-ui"
            aria-label="Filter preferences drawer"
          >
            <Sliders size={20} />
            <span>Preferences</span>
            {hasActiveFilters && <span className="active-filters-indicator" />}
          </button>
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
      ) : filteredProfiles.length > 0 ? (
        <div className="gallery-wall-grid">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isInterestSent={interestsSent.includes(profile.id)}
              isSaved={savedProfiles.includes(profile.id)}
              onSendInterest={sendInterest}
              onSave={toggleSaveProfile}
              onBlock={blockUser}
              onReport={(id) => {
                const reason = window.prompt(`Report ${profile.name} - Enter reason:`);
                if (reason) reportUser(id, 'Reported from Card', reason);
              }}
              onClick={() => onSelectProfile(profile)}
            />
          ))}
        </div>
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

        .filters-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          border: 1.5px solid var(--border-default);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
          position: relative;
          color: var(--text-primary);
          background-color: var(--bg-surface);
          transition: all var(--duration-fast);
        }

        .filters-toggle-btn:hover {
          background-color: var(--bg-surface-warm);
          border-color: var(--text-primary);
        }

        .active-filters-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-accent);
          position: absolute;
          top: -2px;
          right: -2px;
          border: 2px solid var(--bg-surface);
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

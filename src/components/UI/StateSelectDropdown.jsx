import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, MagnifyingGlass, CaretDown, Check, X } from '@phosphor-icons/react';
import {
  ALL_LOCATIONS,
  WORLD_COUNTRIES,
  INDIAN_STATES,
  POPULAR_LOCATIONS,
  normalizeLocationName,
  getLocationInfo
} from '../../constants/indiaLocations';

export const StateSelectDropdown = ({
  value = '',
  onChange,
  error = null,
  id = 'state-select',
  placeholder = 'Select your Country or State / Region'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'countries' | 'india' | 'popular'
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const normalizedCurrent = useMemo(() => normalizeLocationName(value), [value]);
  const currentInfo = useMemo(() => getLocationInfo(value), [value]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let baseList = ALL_LOCATIONS;
    if (!q) {
      if (activeTab === 'popular') {
        const popSet = new Set(POPULAR_LOCATIONS.map(p => p.toLowerCase()));
        baseList = ALL_LOCATIONS.filter(l => popSet.has(l.name.toLowerCase()));
      } else if (activeTab === 'countries') {
        baseList = WORLD_COUNTRIES;
      } else if (activeTab === 'india') {
        baseList = INDIAN_STATES;
      }
    }

    if (!q) return baseList;

    return ALL_LOCATIONS.filter((s) => {
      const name = s.name.toLowerCase();
      const region = (s.region || '').toLowerCase();
      const code = (s.code || '').toLowerCase();
      const country = (s.country || '').toLowerCase();
      return (
        name.includes(q) ||
        region.includes(q) ||
        code.includes(q) ||
        country.includes(q)
      );
    });
  }, [searchQuery, activeTab]);

  const handleSelect = (locationName) => {
    onChange(locationName);
    setIsOpen(false);
  };

  return (
    <div className={`state-select-wrapper font-ui ${isOpen ? 'is-dropdown-open' : ''}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className={`state-select-trigger ${error ? 'has-error' : ''} ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="state-select-trigger-left">
          {currentInfo?.flag ? (
            <span className="state-option-flag" role="img" aria-hidden="true">{currentInfo.flag}</span>
          ) : (
            <MapPin size={18} className="state-pin-icon" weight={value ? 'fill' : 'regular'} />
          )}
          <span className={`state-select-value ${!normalizedCurrent ? 'is-placeholder' : ''}`}>
            {normalizedCurrent || placeholder}
          </span>
        </div>
        <CaretDown size={16} weight="bold" className={`state-caret-icon ${isOpen ? 'rotate' : ''}`} />
      </button>

      {error && <span className="input-error-msg font-ui">{error}</span>}

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="state-select-menu" role="listbox">
          {/* Search Box */}
          <div className="state-search-box">
            <MagnifyingGlass size={16} className="state-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="state-search-input font-ui"
              placeholder="Search country, state, region (e.g. United States, Germany, Maharashtra)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                className="state-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs (when not actively searching) */}
          {!searchQuery.trim() && (
            <div className="state-filter-tabs">
              <button
                type="button"
                className={`state-filter-tab ${activeTab === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`state-filter-tab ${activeTab === 'popular' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                ✨ Popular
              </button>
              <button
                type="button"
                className={`state-filter-tab ${activeTab === 'countries' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('countries')}
              >
                🌍 Countries
              </button>
              <button
                type="button"
                className={`state-filter-tab ${activeTab === 'india' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('india')}
              >
                🇮🇳 India States
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="state-options-list">
            {filteredLocations.length === 0 ? (
              <div className="state-no-results font-ui">No location found matching &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              filteredLocations.map((s) => {
                const isSelected = normalizedCurrent.toLowerCase() === s.name.toLowerCase();
                return (
                  <button
                    key={`${s.code}-${s.name}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`state-option-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(s.name)}
                  >
                    <div className="state-option-info">
                      {s.flag && <span className="state-option-flag" role="img" aria-hidden="true">{s.flag}</span>}
                      <span className="state-option-name">{s.name}</span>
                      <span className="state-option-region-chip">{s.region}</span>
                      {s.isUT && <span className="state-option-ut-badge">UT</span>}
                    </div>
                    {isSelected && <Check size={16} weight="bold" className="state-check-icon" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Aliased export for semantic clarity
export const LocationSelectDropdown = StateSelectDropdown;

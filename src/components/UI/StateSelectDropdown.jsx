import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, MagnifyingGlass, CaretDown, Check, X } from '@phosphor-icons/react';
import { INDIAN_STATES, normalizeStateName } from '../../constants/indiaLocations';

export const StateSelectDropdown = ({
  value = '',
  onChange,
  error = null,
  id = 'state-select',
  placeholder = 'Select your State / Union Territory'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const normalizedCurrent = useMemo(() => normalizeStateName(value), [value]);

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return INDIAN_STATES;
    const q = searchQuery.toLowerCase().trim();
    return INDIAN_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (stateName) => {
    onChange(stateName);
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
          <MapPin size={18} className="state-pin-icon" weight={value ? 'fill' : 'regular'} />
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
              placeholder="Search state, region (e.g. Maharashtra, South)..."
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

          {/* Options List */}
          <div className="state-options-list">
            {filteredStates.length === 0 ? (
              <div className="state-no-results font-ui">No state found matching &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              filteredStates.map((s) => {
                const isSelected = normalizedCurrent.toLowerCase() === s.name.toLowerCase();
                return (
                  <button
                    key={s.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`state-option-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(s.name)}
                  >
                    <div className="state-option-info">
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { StateSelectDropdown } from '../../components/UI/StateSelectDropdown';
import {
  GenderNeuter,
  UsersThree,
  MapPin,
  Sliders,
  Calendar,
  ShieldCheck,
  CaretDown,
  CaretUp,
  ArrowsDownUp
} from '@phosphor-icons/react';

export const DiscoverPreferences = ({ onClose }) => {
  const { filters, setFilters } = useApp();
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const [showAllGenders, setShowAllGenders] = useState(false);
  const contentRef = React.useRef(null);

  // Auto scroll to top on mount / open
  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      const parentBody = contentRef.current.closest('.vh-modal-body');
      if (parentBody) parentBody.scrollTop = 0;
    }
  }, []);

  const primaryGenders = ['All', 'Woman', 'Man', 'Non-binary'];
  const extendedGenders = [
    'Genderqueer',
    'Genderfluid',
    'Agender',
    'Trans Woman',
    'Trans Man',
    'Bigender',
    'Androgynous',
    'Two-Spirit',
    'Questioning',
    'Prefer to self-describe'
  ];

  const intentOptions = [
    'All',
    'Long-term Relationship',
    'Getting to Know People',
    'Companionship',
    'Open to Anything Meaningful'
  ];

  const sortByOptions = [
    { label: 'Default Vibe', value: 'default' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Profile Completion', value: 'profileCompletion' },
    { label: 'Name (A-Z)', value: 'name' }
  ];

  const handleGenderSelect = (gender) => {
    setLocalFilters(prev => ({ ...prev, gender }));
  };

  const handleIntentSelect = (relationshipIntent) => {
    setLocalFilters(prev => ({ ...prev, relationshipIntent }));
  };

  const handleSortSelect = (sortBy) => {
    setLocalFilters(prev => ({ ...prev, sortBy }));
  };

  const handleSliderChange = (field, val) => {
    setLocalFilters(prev => ({ ...prev, [field]: parseInt(val, 10) }));
  };

  const handleToggle = (field) => {
    setLocalFilters(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClearAll = () => {
    setLocalFilters({
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

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Filter Preferences"
      variant="bottom-drawer"
    >
      <div className="pref-body-content font-ui" ref={contentRef}>
        {/* 1. Gender Preference */}
        <div className="pref-item-section">
          <div className="pref-section-title-row">
            <div className="pref-title-with-icon">
              <GenderNeuter size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
              <span className="pref-item-label">Gender Preference</span>
            </div>
            {localFilters.gender && localFilters.gender !== 'All' && (
              <span className="pref-active-pill-badge">{localFilters.gender}</span>
            )}
          </div>

          <div className="pref-item-chips">
            {primaryGenders.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderSelect(g)}
                className={`pref-item-chip ${(localFilters.gender || 'All') === g ? 'active' : ''}`}
              >
                {g === 'Woman' ? 'Women' : g === 'Man' ? 'Men' : g}
              </button>
            ))}
          </div>

          {/* Expandable More Genders Toggle */}
          <div className="pref-expand-toggle-wrap">
            <button
              type="button"
              onClick={() => setShowAllGenders(!showAllGenders)}
              className="pref-expand-btn font-ui"
            >
              <span>{showAllGenders ? 'Fewer Gender Options' : 'More Gender Identities'}</span>
              {showAllGenders ? <CaretUp size={14} /> : <CaretDown size={14} />}
            </button>
          </div>

          {showAllGenders && (
            <div className="pref-item-chips extended-chips animate-fade-in">
              {extendedGenders.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderSelect(g)}
                  className={`pref-item-chip ${localFilters.gender === g ? 'active' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. State / Region in India */}
        <div className="pref-item-section border-top">
          <div className="pref-title-with-icon" style={{ marginBottom: '6px' }}>
            <MapPin size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
            <label htmlFor="pref-state-select" className="pref-item-label">
              State / Location in India
            </label>
          </div>
          <StateSelectDropdown
            id="pref-state-select"
            placeholder="All States & Union Territories (India)"
            value={localFilters.city}
            onChange={(val) => setLocalFilters(prev => ({ ...prev, city: val }))}
          />
        </div>

        {/* 3. Distance Radius */}
        <div className="pref-item-section border-top">
          <div className="label-slider-header">
            <div className="pref-title-with-icon">
              <Sliders size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
              <span className="pref-item-label">Maximum Distance</span>
            </div>
            <span className="slider-value-display">
              {localFilters.distanceMax >= 2500
                ? 'All India'
                : localFilters.distanceMax <= 50
                ? 'Within Same State (< 50 km)'
                : `${localFilters.distanceMax} km`}
            </span>
          </div>
          <input
            id="distance-slider"
            type="range"
            min="50"
            max="2500"
            step="50"
            value={localFilters.distanceMax || 2500}
            onChange={(e) => handleSliderChange('distanceMax', e.target.value)}
            className="pref-range-slider"
            aria-label="Maximum distance filter slider"
          />
          <div className="slider-subtext-row">
            <span>Nearby / Same State</span>
            <span>All India</span>
          </div>
        </div>

        {/* 4. Relationship Seeking Intent */}
        <div className="pref-item-section border-top">
          <div className="pref-title-with-icon">
            <UsersThree size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
            <span className="pref-item-label">Relationship Seeking</span>
          </div>
          <div className="pref-item-chips">
            {intentOptions.map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => handleIntentSelect(intent)}
                className={`pref-item-chip ${(localFilters.relationshipIntent || 'All') === intent ? 'active' : ''}`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Age Range Bounds */}
        <div className="pref-item-section border-top">
          <div className="label-slider-header">
            <div className="pref-title-with-icon">
              <Calendar size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
              <span className="pref-item-label">Age Range</span>
            </div>
            <span className="slider-value-display">{localFilters.ageMin || 18} - {localFilters.ageMax || 60} yrs</span>
          </div>
          <div className="slider-double-row">
            <div className="single-slider-wrap">
              <label htmlFor="age-min-slider" className="sr-only">Minimum Age</label>
              <input
                id="age-min-slider"
                type="range"
                min="18"
                max="60"
                value={localFilters.ageMin || 18}
                onChange={(e) => handleSliderChange('ageMin', e.target.value)}
                className="pref-range-slider"
              />
              <span className="slider-subtext">Min: {localFilters.ageMin || 18}</span>
            </div>
            <div className="single-slider-wrap">
              <label htmlFor="age-max-slider" className="sr-only">Maximum Age</label>
              <input
                id="age-max-slider"
                type="range"
                min="18"
                max="60"
                value={localFilters.ageMax || 60}
                onChange={(e) => handleSliderChange('ageMax', e.target.value)}
                className="pref-range-slider"
              />
              <span className="slider-subtext">Max: {localFilters.ageMax || 60}</span>
            </div>
          </div>
        </div>

        {/* 6. Verified Profiles Only Toggle */}
        <div className="pref-item-section border-top">
          <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} weight="fill" color="#22C55E" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                  Verified Profiles Only
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Only show members with authenticated live face verification
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(localFilters.verifiedOnly)}
              onChange={() => handleToggle('verifiedOnly')}
              aria-label="Verified profiles only checkbox"
            />
          </label>
        </div>

        {/* 7. Sort Results By */}
        <div className="pref-item-section border-top">
          <div className="pref-title-with-icon">
            <ArrowsDownUp size={18} weight="bold" color="var(--burgundy-500, #B8436A)" />
            <span className="pref-item-label">Sort Results By</span>
          </div>
          <div className="pref-item-chips">
            {sortByOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSortSelect(opt.value)}
                className={`pref-item-chip ${(localFilters.sortBy || 'default') === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <footer className="pref-actions-footer">
          <button type="button" onClick={handleClearAll} className="pref-clear-all font-ui">
            Reset Filters
          </button>
          <Button onClick={handleApply} variant="primary" size="md">
            Apply Filters
          </Button>
        </footer>
      </div>

      <style>{`
        .pref-body-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          padding-bottom: var(--space-2);
        }

        .pref-item-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .pref-section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pref-title-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pref-item-label {
          font-size: var(--text-body-sm);
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-primary);
          letter-spacing: 0.04em;
        }

        .pref-active-pill-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          background: rgba(184, 67, 106, 0.15);
          color: var(--burgundy-400, #E87A9A);
          border-radius: 12px;
          border: 1px solid rgba(184, 67, 106, 0.3);
        }

        .pref-item-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pref-item-chip {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
          padding: 8px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pref-item-chip:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.08);
        }

        .pref-item-chip.active {
          background: linear-gradient(135deg, #B8436A 0%, #8E2D4F 100%);
          border-color: #B8436A;
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(184, 67, 106, 0.35);
        }

        .pref-expand-toggle-wrap {
          display: flex;
          align-items: center;
          margin-top: -2px;
        }

        .pref-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--rose-400, #F0A0AD);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          font-weight: 500;
        }

        .pref-expand-btn:hover {
          text-decoration: underline;
        }

        .extended-chips {
          margin-top: 4px;
        }

        .border-top {
          border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          padding-top: var(--space-4);
        }

        .label-slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-value-display {
          font-size: 13px;
          font-weight: 600;
          color: var(--rose-300, #F3B5C0);
        }

        .slider-double-row {
          display: flex;
          gap: var(--space-4);
        }

        .single-slider-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .slider-subtext-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .slider-subtext {
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }

        .pref-range-slider {
          width: 100%;
          accent-color: var(--burgundy-500, #B8436A);
          cursor: pointer;
          height: 6px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--burgundy-500, #B8436A);
          cursor: pointer;
        }

        .pref-actions-footer {
          position: sticky;
          bottom: -24px;
          background: var(--bg-surface, #141113);
          border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
          padding: 16px 0;
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 20;
          box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.35);
        }

        .pref-clear-all {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 13px;
          text-decoration: underline;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .pref-clear-all:hover {
          color: var(--text-primary);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </Modal>
  );
};

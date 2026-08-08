import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';

export const DiscoverPreferences = ({ onClose }) => {
  const { filters, setFilters } = useApp();
  const [localFilters, setLocalFilters] = useState({ ...filters });

  const genderOptions = ['All', 'Woman', 'Man', 'Non-binary'];
  const intentOptions = ['All', 'Long-term Relationship', 'Getting to Know People', 'Companionship', 'Open to Anything Meaningful'];
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
      distanceMax: 50,
      sortBy: 'default'
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
      <div className="pref-body-content font-ui">
        {/* Sort Results By */}
        <div className="pref-item-section">
          <span className="pref-item-label">Sort Results By</span>
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

        {/* Gender Preference */}
        <div className="pref-item-section border-top">
          <span className="pref-item-label">Gender Preference</span>
          <div className="pref-item-chips">
            {genderOptions.map(g => (
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
        </div>

        {/* Relationship Intent */}
        <div className="pref-item-section border-top">
          <span className="pref-item-label">Relationship Seeking</span>
          <div className="pref-item-chips">
            {intentOptions.map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => handleIntentSelect(intent)}
                className={`pref-item-chip ${localFilters.relationshipIntent === intent ? 'active' : ''}`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range Slider */}
        <div className="pref-item-section border-top">
          <div className="label-slider-header">
            <span className="pref-item-label">Age Range Bounds</span>
            <span className="slider-value-display">{localFilters.ageMin} - {localFilters.ageMax} yrs</span>
          </div>
          <div className="slider-double-row">
            <div className="single-slider-wrap">
              <label htmlFor="age-min-slider" className="sr-only">Minimum Age</label>
              <input
                id="age-min-slider"
                type="range"
                min="18"
                max="60"
                value={localFilters.ageMin}
                onChange={(e) => handleSliderChange('ageMin', e.target.value)}
                className="pref-range-slider"
              />
              <span className="slider-subtext">Min age</span>
            </div>
            <div className="single-slider-wrap">
              <label htmlFor="age-max-slider" className="sr-only">Maximum Age</label>
              <input
                id="age-max-slider"
                type="range"
                min="18"
                max="60"
                value={localFilters.ageMax}
                onChange={(e) => handleSliderChange('ageMax', e.target.value)}
                className="pref-range-slider"
              />
              <span className="slider-subtext">Max age</span>
            </div>
          </div>
        </div>

        {/* Distance Slider */}
        <div className="pref-item-section border-top">
          <div className="label-slider-header">
            <span className="pref-item-label">Maximum Distance</span>
            <span className="slider-value-display">{localFilters.distanceMax} km</span>
          </div>
          <input
            id="distance-slider"
            type="range"
            min="5"
            max="100"
            value={localFilters.distanceMax}
            onChange={(e) => handleSliderChange('distanceMax', e.target.value)}
            className="pref-range-slider"
          />
        </div>

        {/* City Input */}
        <div className="pref-item-section border-top">
          <label htmlFor="city-pref-input" className="pref-item-label">Location (City)</label>
          <input
            id="city-pref-input"
            type="text"
            placeholder="Search by city (e.g. Mumbai, Bangalore)"
            value={localFilters.city}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, city: e.target.value }))}
            className="pref-text-input font-ui"
          />
        </div>
      </div>

      <footer className="pref-actions-footer">
        <button type="button" onClick={handleClearAll} className="pref-clear-all font-ui">
          Clear All
        </button>
        <Button onClick={handleApply} variant="primary">
          Apply Filters
        </Button>
      </footer>

      <style>{`
        .pref-body-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .pref-item-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .pref-item-label {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
        }

        .pref-item-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .pref-item-chip {
          background-color: var(--bg-surface-warm);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
          transition: all var(--duration-fast);
        }

        .pref-item-chip:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .pref-item-chip.active {
          background-color: var(--burgundy-500);
          border-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-5);
        }

        .label-slider-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .slider-value-display {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-accent);
        }

        .slider-double-row {
          display: flex;
          gap: var(--space-4);
        }

        .single-slider-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .slider-subtext {
          font-size: 10px;
          color: var(--text-muted);
          text-align: center;
        }

        .pref-range-slider {
          width: 100%;
          accent-color: var(--burgundy-500);
          cursor: pointer;
        }

        .pref-text-input {
          width: 100%;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          background-color: var(--bg-input);
          color: var(--text-primary);
          outline: none;
          transition: all var(--duration-fast);
        }

        .pref-text-input:focus {
          border-color: var(--border-focus);
          background-color: #FFFFFF;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--burgundy-500);
        }

        .pref-actions-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-4);
          margin-top: var(--space-4);
        }

        .pref-clear-all {
          color: var(--text-secondary);
          font-weight: 500;
          text-decoration: underline;
          background: none;
          border: none;
        }

        .pref-clear-all:hover {
          color: var(--text-primary);
        }
      `}</style>
    </Modal>
  );
};

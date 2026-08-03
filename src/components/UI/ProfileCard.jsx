import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Heart, DotsThreeVertical, Bookmark, Prohibit, ShieldWarning } from '@phosphor-icons/react';
import { getProfilePhoto, getDefaultAvatar } from '../../utils/avatar';

export const ProfileCard = ({
  profile,
  isInterestSent = false,
  isSaved = false,
  onSendInterest,
  onSave,
  onBlock,
  onReport,
  onClick,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  };

  return (
    <div 
      className={`vh-profile-card ${className}`} 
      onClick={onClick}
      role="article"
      tabIndex={0}
      aria-label={`Profile card of ${profile.name}, age ${profile.age}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) {
          onClick();
        }
      }}
    >
      <div className="profile-img-wrap">
        <img
            src={getProfilePhoto(profile)}
            alt={`Photo of ${profile.name}`}
            className="profile-card-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getDefaultAvatar(profile?.gender);
            }}
        />
        
        {/* Verification Badges */}
        <div className="profile-badge-row">
          {profile.verified && (
            <span className="badge-verified font-ui">
              <CheckCircle size={12} weight="fill" />
              Verified
            </span>
          )}
          {profile.isPremium && (
            <span className="badge-premium font-ui">Premium</span>
          )}
        </div>

        {/* Dropdown Options */}
        <div className="profile-card-options-wrap" ref={dropdownRef}>
          <button 
            type="button"
            onClick={toggleDropdown}
            className="profile-card-options-btn"
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-label={`Actions for ${profile.name}`}
          >
            <DotsThreeVertical size={20} weight="bold" />
          </button>
          {showDropdown && (
            <div className="profile-card-dropdown" role="menu">
              <button 
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                  onSave(profile.id);
                }}
                className={`dropdown-item ${isSaved ? 'item-active' : ''}`}
              >
                <Bookmark size={16} weight={isSaved ? 'fill' : 'regular'} />
                <span>{isSaved ? 'Saved Profile' : 'Save Profile'}</span>
              </button>
              <button 
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                  onBlock(profile.id);
                }}
                className="dropdown-item"
              >
                <Prohibit size={16} />
                <span>Remove Profile</span>
              </button>
              <button 
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                  onReport(profile.id);
                }}
                className="dropdown-item danger"
              >
                <ShieldWarning size={16} />
                <span>Report profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-card-details">
        <div className="card-name-row">
          <h3 className="card-name font-display">{profile.name}</h3>
          <span className="card-age font-ui">, {profile.age}</span>
        </div>

        <p className="card-location font-ui">{profile.city}</p>
        <span className="card-intent font-ui">{profile.relationshipIntent}</span>

        {profile.story && (
          <p className="card-story-clamp font-body italic">
            &ldquo;{profile.story}&rdquo;
          </p>
        )}

        {profile.interests?.length > 0 && (
          <div className="card-interests-wrap font-ui">
            {profile.interests.slice(0, 3).map(interest => (
              <span key={interest} className="card-interest-tag">{interest}</span>
            ))}
          </div>
        )}

        {profile.hasDisability && profile.showDisability && profile.disabilityInfo && (
          <div className="disability-indicator-pill font-ui">
            ♿ {profile.disabilityInfo}
          </div>
        )}

        <div className="card-footer-action">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSendInterest(profile.id);
            }}
            className={`vh-btn vh-btn-primary interest-action-btn ${isInterestSent ? 'sent' : ''}`}
            aria-label={isInterestSent ? `Interest sent to ${profile.name}` : `Send interest to ${profile.name}`}
          >
            <Heart size={18} weight={isInterestSent ? 'fill' : 'regular'} />
            <span className="font-ui">
              {isInterestSent ? 'Interest Sent' : 'Send Interest'}
            </span>
          </button>
        </div>
      </div>

      <style>{`
        /* Image container with correct aspect ratio */
        .profile-img-wrap {
          position: relative;
          aspect-ratio: 4/5;
          background-color: var(--charcoal-200);
          overflow: hidden;
        }

        /* Badges overlay */
        .profile-badge-row {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          display: flex;
          gap: var(--space-2);
          z-index: 10;
        }

        .badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(92, 154, 110, 0.9);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px var(--space-2);
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        .badge-premium {
          background: linear-gradient(135deg, rgba(196, 150, 74, 0.95), rgba(212, 173, 106, 0.95));
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px var(--space-2);
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        /* Card text content */
        .profile-card-details {
          padding: var(--space-4) var(--space-4) var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .card-name-row {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .card-name {
          font-size: var(--text-subheading);
          color: var(--text-primary);
          line-height: 1.2;
        }

        .card-age {
          font-size: var(--text-body);
          color: var(--text-secondary);
        }

        .card-location {
          font-size: var(--text-body-sm);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .card-intent {
          font-size: var(--text-caption);
          color: var(--text-accent);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .card-story-clamp {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: var(--space-1) 0;
        }

        /* Interest action button sent state */
        .interest-action-btn {
          width: 100%;
          justify-content: center;
          gap: var(--space-2);
          font-size: var(--text-body-sm) !important;
          padding: var(--space-2) var(--space-4) !important;
        }

        .interest-action-btn.sent {
          background-color: var(--success) !important;
          cursor: default;
        }

        .interest-action-btn.sent:hover:not(:disabled) {
          background-color: var(--success) !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Card footer */
        .card-footer-action {
          margin-top: var(--space-2);
        }

        /* Disability pill */
        .disability-indicator-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-caption);
          color: var(--success);
          background-color: var(--success-light);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          font-weight: 500;
          align-self: flex-start;
          margin-top: var(--space-1);
          border: 1px solid transparent;
        }

        [data-theme="dark"] .disability-indicator-pill {
          color: #8CE0A2;
          background-color: rgba(92, 154, 110, 0.18);
          border: 1px solid rgba(92, 154, 110, 0.4);
        }
      `}</style>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Heart, DotsThreeVertical, Bookmark, Prohibit, ShieldWarning, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getProfilePhoto, getDefaultAvatar, extractPhotoUrls } from '../../utils/avatar';

export const ProfileCard = ({
  profile,
  isInterestSent = false,
  isSaved = false,
  onSendInterest,
  onUnsendInterest,
  onSave,
  onBlock,
  onReport,
  onClick,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const dropdownRef = useRef(null);

  const extractedPhotos = extractPhotoUrls(profile);
  const photosList = extractedPhotos.length > 0 ? extractedPhotos : [getDefaultAvatar(profile?.gender)];

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex(prev => Math.min(prev + 1, photosList.length - 1));
  };

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
            src={photosList[currentPhotoIndex] || getDefaultAvatar(profile?.gender)}
            alt={`Photo ${currentPhotoIndex + 1} of ${profile.name}`}
            className="profile-card-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getDefaultAvatar(profile?.gender);
            }}
        />

        {/* Photo Navigation Indicators */}
        {photosList.length > 1 && (
          <div className="card-photo-dots">
            {photosList.map((_, idx) => (
              <span
                key={idx}
                className={`card-photo-dot ${idx === currentPhotoIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Photo Navigation Arrows */}
        {photosList.length > 1 && (
          <>
            {currentPhotoIndex > 0 && (
              <button
                type="button"
                className="card-photo-nav-btn prev"
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                title="Previous photo"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
            )}

            {currentPhotoIndex < photosList.length - 1 && (
              <button
                type="button"
                className="card-photo-nav-btn next"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                title="Next photo"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            )}
          </>
        )}
        
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
              if (isInterestSent) {
                if (onUnsendInterest) onUnsendInterest(profile.id, profile.name);
              } else {
                if (onSendInterest) onSendInterest(profile.id);
              }
            }}
            className={`vh-btn vh-btn-primary interest-action-btn ${isInterestSent ? 'sent' : ''}`}
            aria-label={isInterestSent ? `Unsend invite to ${profile.name}` : `Send interest to ${profile.name}`}
            title={isInterestSent ? "Click to unsend invite" : "Send interest"}
          >
            {isInterestSent ? (
              <CheckCircle size={18} weight="fill" />
            ) : (
              <Heart size={18} weight="regular" />
            )}
            <span className="font-ui">
              {isInterestSent ? 'Invite Sent' : 'Send Interest'}
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

        /* Photo dots indicators */
        .card-photo-dots {
          position: absolute;
          top: var(--space-2);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 5;
          background-color: rgba(0, 0, 0, 0.35);
          padding: 3px var(--space-2);
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        .card-photo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          transition: background-color var(--duration-fast);
        }

        .card-photo-dot.active {
          background-color: var(--pink-gold);
          width: 14px;
          border-radius: 3px;
        }

        /* Photo navigation tap overlays */
        .photo-nav-overlay {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          z-index: 4;
          cursor: pointer;
          display: flex;
          align-items: center;
          opacity: 0;
          transition: opacity var(--duration-fast);
          background: transparent;
          border: none;
          color: white;
        }

        .photo-nav-overlay.prev {
          left: 0;
          justify-content: flex-start;
          padding-left: var(--space-2);
        }

        .photo-nav-overlay.next {
          right: 0;
          justify-content: flex-end;
          padding-right: var(--space-2);
        }

        .profile-img-wrap:hover .photo-nav-overlay {
          opacity: 0.75;
        }

        .photo-nav-overlay:hover {
          opacity: 1 !important;
        }

        .nav-arrow-bg {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Badges */
        .profile-card-badges {
          position: absolute;
          bottom: var(--space-2);
          left: var(--space-2);
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          z-index: 5;
        }

        .badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(46, 125, 50, 0.9);
          color: white;
          font-size: var(--text-caption);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .badge-premium {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #D4AF37, #AA7C11);
          color: white;
          font-size: var(--text-caption);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          backdrop-filter: blur(4px);
        }

        /* Options Dropdown */
        .profile-card-options-wrap {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          z-index: 10;
        }

        .profile-card-options-btn {
          background: rgba(0, 0, 0, 0.4);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: background var(--duration-fast);
        }

        .profile-card-options-btn:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .profile-card-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: var(--space-1);
          background-color: var(--surface-overlay);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          min-width: 160px;
          overflow: hidden;
          z-index: 20;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: var(--text-body-sm);
          text-align: left;
          cursor: pointer;
          transition: background var(--duration-fast);
        }

        .dropdown-item:hover {
          background-color: var(--surface-hover);
        }

        .dropdown-item.item-active {
          color: var(--burgundy-500);
          font-weight: 600;
        }

        .dropdown-item.danger {
          color: var(--burgundy-500);
        }

        .dropdown-item.danger:hover {
          background-color: rgba(229, 115, 115, 0.1);
        }

        /* Profile details container */
        .profile-card-details {
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .card-name-row {
          display: flex;
          align-items: baseline;
        }

        .card-name {
          font-size: var(--text-heading-sm);
          color: var(--text-primary);
          margin: 0;
          font-weight: 600;
        }

        .card-age {
          font-size: var(--text-heading-sm);
          color: var(--text-secondary);
          margin-left: 2px;
        }

        .card-location {
          font-size: var(--text-body-sm);
          color: var(--text-tertiary);
          margin: 0;
        }

        .card-intent {
          font-size: var(--text-caption);
          color: var(--burgundy-400);
          font-weight: 500;
        }

        .card-interests-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-top: var(--space-1);
        }

        .card-interest-tag {
          font-size: var(--text-caption);
          background-color: var(--surface-raised);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
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
          background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
          border-color: #059669 !important;
          color: #FFFFFF !important;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .interest-action-btn.sent:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
          border-color: #047857 !important;
          transform: scale(1.02) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35) !important;
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

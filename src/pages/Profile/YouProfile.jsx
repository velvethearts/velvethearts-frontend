import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PencilSimple, Sliders, ShieldCheck, SignOut, Bookmark, Heart, Trash, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { getProfilePhoto, extractPhotoUrls } from '../../utils/avatar';

export const YouProfile = ({ onEditProfile, onOpenSavedProfiles, onSelectProfile }) => {
  const { userProfile, setActiveTab, logout, showConfirm, savedProfileObjects = [] } = useApp();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const userPhotosList = extractPhotoUrls(userProfile);
  const displayUserPhotos = userPhotosList.length > 0 ? userPhotosList : [getProfilePhoto(userProfile)];

  const handlePrevUserPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextUserPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex(prev => Math.min(prev + 1, displayUserPhotos.length - 1));
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      okText: 'Sign Out',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      logout();
    }
  };

  const getAge = () => {
    if (!userProfile.dobYear) return 'Age';
    return new Date().getFullYear() - parseInt(userProfile.dobYear, 10);
  };

  return (
    <div className="profile-you-page page-enter">
      <PageHeader
        title="Your Profile"
        subtitle="This is how you appear to others on Velvet Hearts."
      />

      <div className="you-content-container">
        {/* Profile Card Preview */}
        <div className="you-preview-panel">
          <div className="profile-preview-card">
            <div className="preview-img-wrap">
              <img 
                src={displayUserPhotos[currentPhotoIndex] || getProfilePhoto(userProfile)} 
                alt={userProfile.name} 
                className="preview-photo"
              />

              {displayUserPhotos.length > 1 && (
                <div className="card-photo-dots">
                  {displayUserPhotos.map((_, idx) => (
                    <span
                      key={idx}
                      className={`card-photo-dot ${idx === currentPhotoIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}

              {displayUserPhotos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <button
                      type="button"
                      className="card-photo-nav-btn prev"
                      onClick={handlePrevUserPhoto}
                      aria-label="Previous photo"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                  )}

                  {currentPhotoIndex < displayUserPhotos.length - 1 && (
                    <button
                      type="button"
                      className="card-photo-nav-btn next"
                      onClick={handleNextUserPhoto}
                      aria-label="Next photo"
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="preview-card-details">
              <div className="preview-name-row">
                <h2 className="preview-name font-display">{userProfile.name || 'Your Name'}</h2>
                <span className="preview-age font-ui">, {getAge()}</span>
              </div>
              <p className="preview-location font-ui">{userProfile.city || 'Your City'}</p>
              
              <div className="preview-intent-badge font-ui">{userProfile.relationshipIntent}</div>

              {userProfile.story && (
                <p className="preview-story font-body italic">
                  "{userProfile.story}"
                </p>
              )}

              {userProfile.interests?.length > 0 && (
                <div className="preview-interests font-ui">
                  {userProfile.interests.map(i => (
                    <span key={i} className="interest-tag">{i}</span>
                  ))}
                </div>
              )}

              {userProfile.hasDisability && userProfile.showDisability && userProfile.disabilityInfo && (
                <div className="preview-disability font-ui">
                  ♿ {userProfile.disabilityInfo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="you-actions-panel font-ui">
          <Card hoverable onClick={onEditProfile} className="you-tile-card">
            <div className="you-tile-btn-body">
              <PencilSimple size={24} className="tile-icon font-accent" />
              <div className="tile-text">
                <span className="tile-title">Edit Profile Details</span>
                <span className="tile-desc">Update your story, interests, or photos</span>
              </div>
            </div>
          </Card>

          <Card hoverable onClick={() => setActiveTab('settings')} className="you-tile-card">
            <div className="you-tile-btn-body">
              <Sliders size={24} className="tile-icon" />
              <div className="tile-text">
                <span className="tile-title">Accessibility &amp; Settings</span>
                <span className="tile-desc">Configure visual filters, motion, and themes</span>
              </div>
            </div>
          </Card>

          <Card hoverable onClick={() => setActiveTab('safety')} className="you-tile-card">
            <div className="you-tile-btn-body">
              <ShieldCheck size={24} className="tile-icon font-success" />
              <div className="tile-text">
                <span className="tile-title">Safety Center</span>
                <span className="tile-desc">Read guidelines or manage blocked profiles</span>
              </div>
            </div>
          </Card>

          <Card hoverable onClick={onOpenSavedProfiles} className="you-tile-card">
            <div className="you-tile-btn-body">
              <Bookmark size={24} className="tile-icon font-accent" weight="fill" />
              <div className="tile-text">
                <span className="tile-title">Saved Profiles ({savedProfileObjects.length})</span>
                <span className="tile-desc">View and manage your bookmarked profiles</span>
              </div>
            </div>
          </Card>

          <Card hoverable onClick={handleLogout} className="you-tile-card sign-out-tile">
            <div className="you-tile-btn-body">
              <SignOut size={24} className="tile-icon font-error" />
              <div className="tile-text">
                <span className="tile-title">Sign Out</span>
                <span className="tile-desc">Log out of your Velvet Hearts account</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .profile-you-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .you-content-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .you-content-container {
            grid-template-columns: 0.9fr 1.1fr;
            align-items: start;
          }
        }

        .you-preview-panel {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .profile-preview-card {
          width: 100%;
          max-width: 380px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-subtle);
        }

        .preview-img-wrap {
          position: relative;
          aspect-ratio: 3/4;
          background-color: var(--charcoal-200);
          overflow: hidden;
        }

        .preview-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-card-details {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .preview-name-row {
          display: flex;
          align-items: baseline;
        }

        .preview-name {
          font-size: var(--text-heading);
          color: var(--text-primary);
        }

        .preview-age {
          font-size: var(--text-body-lg);
          color: var(--text-secondary);
        }

        .preview-location {
          font-size: var(--text-body-sm);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .preview-intent-badge {
          color: var(--text-accent);
          font-size: var(--text-body-sm);
          font-weight: 600;
        }

        .preview-story {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          border-left: 2px solid var(--burgundy-200);
          padding-left: var(--space-3);
          margin: var(--space-2) 0;
        }

        .preview-interests {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .interest-tag {
          font-size: var(--text-caption);
          color: var(--burgundy-600);
          background-color: var(--burgundy-50);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .preview-disability {
          display: inline-flex;
          align-items: center;
          font-size: var(--text-caption);
          color: var(--success);
          background-color: var(--success-light);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-weight: 500;
          align-self: flex-start;
        }

        /* Action Cards */
        .you-actions-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .you-tile-card {
          padding: var(--space-4) var(--space-5);
        }

        .you-tile-btn-body {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          width: 100%;
        }

        .tile-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .tile-icon.font-accent { color: var(--text-accent); }
        .tile-icon.font-success { color: var(--success); }
        .tile-icon.font-error { color: var(--error); }

        .tile-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tile-title {
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
          transition: color var(--duration-fast);
        }

        .tile-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          transition: color var(--duration-fast);
        }

        .sign-out-tile:hover {
          border-color: var(--error);
          background-color: var(--error-light);
        }

        .sign-out-tile:hover .tile-title,
        .sign-out-tile:hover .tile-icon {
          color: var(--error);
        }

        .sign-out-tile:hover .tile-desc {
          color: var(--text-primary);
        }

        /* Saved Profiles Section */
        .saved-profiles-panel {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          box-shadow: var(--shadow-sm);
        }

        .saved-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .saved-title-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .saved-section-title {
          font-size: var(--text-subheading);
          color: var(--text-primary);
          margin: 0;
        }

        .saved-count-badge {
          background-color: var(--bg-accent-subtle);
          color: var(--burgundy-500);
          font-size: var(--text-caption);
          font-weight: 700;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .saved-profiles-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          max-height: 360px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .saved-profile-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background-color: var(--bg-page);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-fast);
          gap: var(--space-3);
        }

        .saved-profile-card:hover {
          background-color: var(--bg-surface-warm);
          border-color: var(--burgundy-300);
          transform: translateY(-1px);
        }

        .saved-card-main {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-width: 0;
          flex: 1;
        }

        .saved-card-photo {
          width: 46px;
          height: 46px;
          min-width: 46px;
          min-height: 46px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
        }

        .saved-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .saved-card-name-row {
          display: flex;
          align-items: baseline;
        }

        .saved-card-name {
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .saved-card-age {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .saved-card-city {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .saved-card-intent {
          font-size: 11px;
          color: var(--text-accent);
          font-weight: 600;
          text-transform: uppercase;
        }

        .saved-card-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .saved-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .saved-card-btn.unsave:hover {
          color: var(--error);
          background-color: var(--error-light);
          border-color: var(--error);
        }

        .saved-card-btn.interest {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          border-color: var(--burgundy-500);
        }

        .saved-card-btn.interest:hover {
          background-color: var(--burgundy-600);
        }

        .saved-card-btn.interest.sent {
          background-color: var(--success);
          border-color: var(--success);
        }

        .saved-empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-6) var(--space-4);
          background-color: var(--bg-page);
          border: 1px dashed var(--border-default);
          border-radius: var(--radius-md);
          gap: var(--space-2);
        }

        .empty-bookmark-icon {
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }

        .empty-title {
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          max-width: 280px;
        }
      `}</style>
    </div>
  );
};

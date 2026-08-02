import React from 'react';
import { useApp } from '../../context/AppContext';
import { PencilSimple, Sliders, ShieldCheck, SignOut } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';

export const YouProfile = ({ onEditProfile }) => {
  const { userProfile, setActiveTab, logout } = useApp();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
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
                src={userProfile.photos?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500"} 
                alt={userProfile.name} 
                className="preview-photo"
              />
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
          aspect-ratio: 3/4;
          background-color: var(--charcoal-200);
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
        }

        .tile-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .sign-out-tile:hover {
          border-color: var(--error);
          background-color: var(--error-light);
        }
      `}</style>
    </div>
  );
};

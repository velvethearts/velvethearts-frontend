import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Camera, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { Select } from '../../components/UI/Select';
import { PageHeader } from '../../components/UI/PageHeader';
import { getProfilePhoto } from '../../utils/avatar';

export const EditProfile = ({ onBack }) => {
  const { userProfile, setUserProfile } = useApp();
  const [localProfile, setLocalProfile] = useState({ ...userProfile });
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(null); // null or { index, percent }

  const interestOptions = [
    'Books', 'Music', 'Art', 'Nature', 'Movies', 'Food', 
    'Fitness', 'Travel', 'Games', 'Photo', 'Wellness', 'Animals', 
    'Technology', 'Sports', 'Theater', 'Social Causes', 'Podcasts'
  ];

  useEffect(() => {
    validateFields();
  }, [localProfile]);

  const handleFieldChange = (field, value) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest) => {
    setLocalProfile(prev => {
      const current = prev.interests;
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...current, interest] };
      }
    });
  };

  // Simulated Photo Manager Upload
  const handlePhotoUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Trigger simulated progress bar
    setUploadProgress({ index, percent: 0 });
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 20;
      setUploadProgress({ index, percent: currentPct });
      
      if (currentPct >= 100) {
        clearInterval(interval);
        
        // Read file contents
        const reader = new FileReader();
        reader.onloadend = () => {
          setLocalProfile(prev => {
            const nextPhotos = [...prev.photos];
            nextPhotos[index] = reader.result;
            return { ...prev, photos: nextPhotos };
          });
          setUploadProgress(null);
        };
        reader.readAsDataURL(file);
      }
    }, 200);
  };

  const handleDeletePhoto = (index) => {
    setLocalProfile(prev => {
      const nextPhotos = prev.photos.filter((_, i) => i !== index);
      return { ...prev, photos: nextPhotos };
    });
  };

  const handleMovePhoto = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localProfile.photos.length) return;

    setLocalProfile(prev => {
      const nextPhotos = [...prev.photos];
      const temp = nextPhotos[index];
      nextPhotos[index] = nextPhotos[newIndex];
      nextPhotos[newIndex] = temp;
      return { ...prev, photos: nextPhotos };
    });
  };

  const validateFields = () => {
    const errors = {};
    if (!localProfile.name || localProfile.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (localProfile.name.trim().length > 40) {
      errors.name = 'Name must be 40 characters or fewer.';
    }

    if (!localProfile.city || localProfile.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters.';
    }

    if (!localProfile.story || localProfile.story.trim().length < 20) {
      errors.story = `Story must be at least 20 characters (current: ${localProfile.story.trim().length}).`;
    }

    if (localProfile.interests.length < 3) {
      errors.interests = 'Select at least 3 interests.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    return (
      localProfile.name &&
      localProfile.city &&
      localProfile.story.trim().length >= 20 &&
      localProfile.interests.length >= 3 &&
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!isFormValid()) return;

    setUserProfile(localProfile);
    onBack();
  };

  const getAge = () => {
    if (!localProfile.dobYear) return 'Age';
    return new Date().getFullYear() - parseInt(localProfile.dobYear, 10);
  };

  return (
    <div className="edit-profile-page page-enter">
      <PageHeader
        title="Edit Profile"
        subtitle="Manage your photos, seeking rules, and biography details."
        onBack={onBack}
      />

      <div className="edit-split-container">
        
        {/* Left pane: Forms & Photos */}
        <form onSubmit={handleSubmit} className="edit-form-panel font-ui">
          
          {/* Photo Management */}
          <div className="edit-form-section">
            <span className="edit-section-label">Photos (Up to 6, drag-and-drop placeholder)</span>
            <div className="photo-manager-grid">
              {Array.from({ length: 6 }).map((_, idx) => {
                const img = localProfile.photos[idx];
                const isUploading = uploadProgress && uploadProgress.index === idx;

                return (
                  <div key={idx} className="photo-manager-slot">
                    {isUploading ? (
                      <div className="upload-progress-overlay">
                        <div className="progress-spinner" />
                        <span className="pct-txt">{uploadProgress.percent}%</span>
                      </div>
                    ) : img ? (
                      <div className="photo-active-wrap">
                        <img src={img} alt={`Profile slot ${idx + 1}`} />
                        <div className="slot-actions">
                          <button 
                            type="button" 
                            onClick={() => handleDeletePhoto(idx)} 
                            className="slot-act-btn delete"
                            title="Delete photo"
                          >
                            <Trash size={14} />
                          </button>
                          {idx > 0 && (
                            <button 
                              type="button" 
                              onClick={() => handleMovePhoto(idx, 'up')} 
                              className="slot-act-btn"
                              title="Move up"
                            >
                              <ArrowUp size={14} />
                            </button>
                          )}
                          {idx < localProfile.photos.length - 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleMovePhoto(idx, 'down')} 
                              className="slot-act-btn"
                              title="Move down"
                            >
                              <ArrowDown size={14} />
                            </button>
                          )}
                        </div>
                        {idx === 0 && <span className="primary-photo-tag font-ui">Primary</span>}
                      </div>
                    ) : (
                      <label className="photo-upload-label">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoUpload(e, idx)} 
                          className="sr-only" 
                        />
                        <Camera size={20} className="camera-icon" />
                        <span className="upload-btn-text">Add</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Input
            id="edit-name"
            label="First Name"
            value={localProfile.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={validationErrors.name}
            required
          />

          <Input
            id="edit-city"
            label="City"
            value={localProfile.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            error={validationErrors.city}
            required
          />

          <Select
            id="edit-intent"
            label="Relationship Seeking"
            value={localProfile.relationshipIntent}
            onChange={(e) => handleFieldChange('relationshipIntent', e.target.value)}
            options={[
              { value: 'Long-term Relationship', label: 'Long-term Relationship' },
              { value: 'Getting to Know People', label: 'Getting to Know People' },
              { value: 'Companionship', label: 'Companionship' },
              { value: 'Open to Anything Meaningful', label: 'Open to Anything Meaningful' }
            ]}
          />

          <Textarea
            id="edit-story"
            label="Your Story"
            value={localProfile.story}
            onChange={(e) => handleFieldChange('story', e.target.value)}
            maxLength={500}
            error={validationErrors.story}
            onEnterSubmit={handleSubmit}
            required
          />

          {/* Interests */}
          <div className="edit-form-group border-top">
            <span className="edit-section-label">Interests (Select at least 3)</span>
            <div className="edit-chips">
              {interestOptions.map(interest => {
                const isSelected = localProfile.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`edit-chip ${isSelected ? 'active' : ''}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            {validationErrors.interests && (
              <span className="vh-input-error font-ui" role="alert">{validationErrors.interests}</span>
            )}
          </div>

          {/* Disability Options */}
          <div className="edit-form-group border-top">
            <label className="checkbox-label font-ui">
              <input
                type="checkbox"
                checked={localProfile.hasDisability}
                onChange={(e) => handleFieldChange('hasDisability', e.target.checked)}
              />
              <span>I have a disability I want to share</span>
            </label>

            {localProfile.hasDisability && (
              <div className="edit-disability-sub-panel page-enter">
                <Input
                  id="edit-disability-info"
                  placeholder="Share details (e.g. Wheelchair user)"
                  value={localProfile.disabilityInfo}
                  onChange={(e) => handleFieldChange('disabilityInfo', e.target.value)}
                />
                <label className="checkbox-label font-ui">
                  <input
                    type="checkbox"
                    checked={localProfile.showDisability}
                    onChange={(e) => handleFieldChange('showDisability', e.target.checked)}
                  />
                  <span>Show disability details on my profile</span>
                </label>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="edit-actions-row">
            <Button onClick={onBack} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!isFormValid()}>
              Save Changes
            </Button>
          </div>

        </form>

        {/* Right pane: Side-by-side Live Preview */}
        <div className="edit-preview-panel">
          <span className="preview-pane-label font-ui">Profile Live Preview</span>
          <div className="profile-preview-sticky">
            <div className="profile-preview-card">
              <div className="preview-img-wrap">
                <img 
                  src={getProfilePhoto(localProfile)} 
                  alt={localProfile.name || 'Preview'} 
                  className="preview-photo"
                />
              </div>

              <div className="preview-card-details">
                <div className="preview-name-row">
                  <h2 className="preview-name font-display">{localProfile.name || 'Your Name'}</h2>
                  <span className="preview-age font-ui">, {getAge()}</span>
                </div>
                <p className="preview-location font-ui">{localProfile.city || 'Your City'}</p>
                <div className="preview-intent-badge font-ui">{localProfile.relationshipIntent}</div>

                {localProfile.story && (
                  <p className="preview-story font-body italic">
                    "{localProfile.story}"
                  </p>
                )}

                {localProfile.interests?.length > 0 && (
                  <div className="preview-interests font-ui">
                    {localProfile.interests.map(i => (
                      <span key={i} className="interest-tag">{i}</span>
                    ))}
                  </div>
                )}

                {localProfile.hasDisability && localProfile.showDisability && localProfile.disabilityInfo && (
                  <div className="preview-disability font-ui">
                    ♿ {localProfile.disabilityInfo}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .edit-profile-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .edit-split-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 992px) {
          .edit-split-container {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: start;
          }
        }

        .edit-form-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .edit-section-label {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-2);
          display: block;
        }

        /* Photo manager */
        .photo-manager-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }

        .photo-manager-slot {
          aspect-ratio: 3/4;
          border: 2px dashed var(--border-default);
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .upload-progress-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          color: var(--text-accent);
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.8);
        }

        .progress-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--charcoal-300);
          border-top-color: var(--burgundy-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .pct-txt {
          font-size: 10px;
          font-weight: bold;
        }

        .photo-active-wrap {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .photo-active-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .slot-actions {
          position: absolute;
          top: var(--space-1);
          right: var(--space-1);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .slot-act-btn {
          background-color: rgba(26, 21, 23, 0.7);
          color: #FFFFFF;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        .slot-act-btn.delete {
          background-color: rgba(196, 90, 90, 0.9);
        }

        .primary-photo-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(184, 67, 106, 0.9);
          color: #FFFFFF;
          font-size: 9px;
          text-align: center;
          padding: 2px 0;
          font-weight: bold;
          text-transform: uppercase;
        }

        .photo-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .camera-icon {
          color: var(--charcoal-500);
        }

        .upload-btn-text {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .edit-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .edit-chip {
          background-color: var(--bg-surface-warm);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
          transition: all var(--duration-fast);
        }

        .edit-chip:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .edit-chip.active {
          background-color: var(--burgundy-500);
          border-color: var(--burgundy-500);
          color: #FFFFFF;
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

        .edit-disability-sub-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding-left: var(--space-6);
          margin-top: var(--space-2);
        }

        .edit-actions-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-5);
          margin-top: var(--space-2);
        }

        /* Preview panel styling */
        .edit-preview-panel {
          display: none;
        }

        @media (min-width: 992px) {
          .edit-preview-panel {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            border-left: 1px solid var(--border-subtle);
            padding-left: var(--space-8);
          }
        }

        .preview-pane-label {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
        }

        .profile-preview-sticky {
          position: sticky;
          top: var(--space-6);
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
      `}</style>
    </div>
  );
};

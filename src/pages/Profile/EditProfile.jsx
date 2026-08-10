import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { ArrowLeft, Camera, Trash, ArrowUp, ArrowDown, CheckCircle, FloppyDisk } from '@phosphor-icons/react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { Select } from '../../components/UI/Select';
import { PageHeader } from '../../components/UI/PageHeader';
import { VoiceRecorder } from '../../components/UI/VoiceRecorder';
import { getProfilePhoto } from '../../utils/avatar';

export const EditProfile = ({ onBack }) => {
  const { userProfile, setUserProfile, updateUserProfile, showAlert } = useApp();
  const [localProfile, setLocalProfile] = useState({ ...userProfile });
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(null); // null or { index, percent }
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const autoSaveTimeoutRef = useRef(null);
  const savedPillTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const latestLocalProfile = useRef(localProfile);

  const getNormalizedProfileString = (p) => {
    if (!p) return '';
    return JSON.stringify({
      name: (p.name || '').trim(),
      city: (p.city || '').trim(),
      gender: p.gender || 'Woman',
      showGender: Boolean(p.showGender ?? true),
      orientation: p.orientation || 'Straight',
      showOrientation: Boolean(p.showOrientation ?? true),
      relationshipIntent: p.relationshipIntent || 'Long-term Relationship',
      relationshipStatus: p.relationshipStatus || 'Single',
      story: (p.story || '').trim(),
      interests: [...(p.interests || [])].sort(),
      photos: (p.photos || []).filter(Boolean),
      voiceIntroUrl: p.voiceIntroUrl || null,
      hasDisability: Boolean(p.hasDisability),
      disabilityInfo: (p.disabilityInfo || '').trim(),
      showDisability: Boolean(p.showDisability)
    });
  };

  const lastSavedProfileRef = useRef(getNormalizedProfileString(userProfile));
  latestLocalProfile.current = localProfile;

  const interestOptions = [
    'Books', 'Music', 'Art', 'Nature', 'Movies', 'Food', 
    'Fitness', 'Travel', 'Games', 'Photo', 'Wellness', 'Animals', 
    'Technology', 'Sports', 'Theater', 'Social Causes', 'Podcasts'
  ];

  // Sync loaded userProfile into localProfile if userProfile hydrates after mount
  useEffect(() => {
    if (userProfile && (userProfile.id || userProfile.name)) {
      const normalizedLoaded = getNormalizedProfileString(userProfile);
      setLocalProfile(prev => {
        if (!prev.voiceIntroUrl && userProfile.voiceIntroUrl) {
          return { ...prev, voiceIntroUrl: userProfile.voiceIntroUrl };
        }
        if (!prev.name && userProfile.name) {
          return { ...prev, ...userProfile };
        }
        return prev;
      });
      lastSavedProfileRef.current = normalizedLoaded;
    }
  }, [userProfile]);

  const getProfileValidationErrors = useCallback((p) => {
    const errors = {};
    if (!p.name || p.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (p.name.trim().length > 40) {
      errors.name = 'Name must be 40 characters or fewer.';
    }

    if (!p.city || p.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters.';
    }

    if (!p.story || p.story.trim().length < 20) {
      errors.story = `Story must be at least 20 characters (current: ${(p.story || '').trim().length}).`;
    }

    if (!p.interests || p.interests.length < 3) {
      errors.interests = 'Select at least 3 interests.';
    }

    if (!p.photos || p.photos.filter(Boolean).length < 1) {
      errors.photos = 'Keep at least 1 photo.';
    }

    return errors;
  }, []);

  const checkProfileValid = useCallback((p) => {
    const errs = getProfileValidationErrors(p);
    return Object.keys(errs).length === 0;
  }, [getProfileValidationErrors]);

  const isFormValid = useCallback(() => {
    return checkProfileValid(localProfile);
  }, [localProfile, checkProfileValid]);

  const saveProfileData = useCallback(async (profileToSave) => {
    const cleanedPhotos = (profileToSave.photos || []).filter(Boolean);
    const payload = {
      dobDay: profileToSave.dobDay || 1,
      dobMonth: profileToSave.dobMonth || 1,
      dobYear: profileToSave.dobYear || 2000,
      gender: profileToSave.gender || 'Woman',
      orientation: profileToSave.orientation || 'Straight',
      relationshipIntent: profileToSave.relationshipIntent || 'Long-term Relationship',
      relationshipStatus: profileToSave.relationshipStatus || 'Single',
      ...profileToSave,
      photos: cleanedPhotos
    };

    setIsSaving(true);
    setAutoSaveStatus('saving');
    try {
      if (updateUserProfile) {
        await updateUserProfile(payload);
      } else {
        setUserProfile(payload);
      }
      lastSavedProfileRef.current = getNormalizedProfileString(payload);
      setAutoSaveStatus('saved');
      if (savedPillTimeoutRef.current) clearTimeout(savedPillTimeoutRef.current);
      savedPillTimeoutRef.current = setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2500);
    } catch (err) {
      console.error('Auto-save profile update failed:', err);
      setAutoSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, setUserProfile]);

  // Debounced auto-save whenever fields change
  useEffect(() => {
    const errs = getProfileValidationErrors(localProfile);
    setValidationErrors(errs);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const currentStr = getNormalizedProfileString(localProfile);
    const hasChanges = currentStr !== lastSavedProfileRef.current;
    const isValid = Object.keys(errs).length === 0;

    if (hasChanges && isValid) {
      setAutoSaveStatus('saving');
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveProfileData(localProfile);
      }, 750);
    }
  }, [localProfile, getProfileValidationErrors, saveProfileData]);

  const handleBack = async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const currentStr = getNormalizedProfileString(latestLocalProfile.current);
    const hasChanges = currentStr !== lastSavedProfileRef.current;
    const isValid = checkProfileValid(latestLocalProfile.current);

    if (hasChanges && isValid && !isSaving) {
      await saveProfileData(latestLocalProfile.current);
    }
    onBack();
  };

  const handleFieldChange = (field, value) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const [customInterestInput, setCustomInterestInput] = useState('');

  const handleInterestToggle = (interest) => {
    setLocalProfile(prev => {
      const current = prev.interests || [];
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...current, interest] };
      }
    });
  };

  const handleAddCustomInterest = (e) => {
    if (e) e.preventDefault();
    const trimmed = customInterestInput.trim();
    if (!trimmed) return;
    if (!localProfile.interests.includes(trimmed)) {
      setLocalProfile(prev => ({ ...prev, interests: [...(prev.interests || []), trimmed] }));
    }
    setCustomInterestInput('');
  };

  // Real Cloudinary / DataURL Photo Manager Upload
  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress({ index, percent: 30 });

    try {
      let finalUrl = null;
      if (api.isConfigured) {
        setUploadProgress({ index, percent: 60 });
        try {
          const res = await api.uploadFile(file);
          if (res?.secureUrl) {
            finalUrl = res.secureUrl;
          }
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
        }
      }

      if (!finalUrl) {
        // Fallback to data URL
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      setUploadProgress({ index, percent: 100 });
      setLocalProfile(prev => {
        const nextPhotos = [...(prev.photos || [])];
        nextPhotos[index] = finalUrl;
        return { ...prev, photos: nextPhotos };
      });
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setTimeout(() => setUploadProgress(null), 300);
    }
  };

  const handleDeletePhoto = (index) => {
    setLocalProfile(prev => {
      const nextPhotos = (prev.photos || []).filter((_, i) => i !== index);
      return { ...prev, photos: nextPhotos };
    });
  };

  const handleMovePhoto = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= (localProfile.photos || []).length) return;

    setLocalProfile(prev => {
      const nextPhotos = [...(prev.photos || [])];
      const temp = nextPhotos[index];
      nextPhotos[index] = nextPhotos[newIndex];
      nextPhotos[newIndex] = temp;
      return { ...prev, photos: nextPhotos };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isFormValid() || isSaving) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    await saveProfileData(localProfile);
    onBack();
  };

  const getAge = () => {
    if (!localProfile.dobYear) return 'Age';
    return new Date().getFullYear() - parseInt(localProfile.dobYear, 10);
  };

  const renderAutoSavePill = () => {
    if (autoSaveStatus === 'saving' || isSaving) {
      return (
        <span className="auto-save-status-pill saving font-ui">
          <span className="auto-save-spinner" /> Saving changes...
        </span>
      );
    }
    if (autoSaveStatus === 'saved') {
      return (
        <span className="auto-save-status-pill saved font-ui">
          <CheckCircle size={14} weight="fill" /> Saved automatically
        </span>
      );
    }
    if (autoSaveStatus === 'error') {
      return (
        <span className="auto-save-status-pill error font-ui">
          ⚠️ Save failed
        </span>
      );
    }
    return (
      <span className="auto-save-status-pill idle font-ui">
        ✨ Auto-save active
      </span>
    );
  };

  return (
    <div className="edit-profile-page page-enter">
      <PageHeader
        title="Edit Profile"
        subtitle="Changes to your photos and profile details are auto-saved automatically."
        onBack={handleBack}
        actions={renderAutoSavePill()}
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
              {/* Custom interests added by user */}
              {localProfile.interests
                .filter(i => !interestOptions.includes(i))
                .map(customI => (
                  <button
                    key={customI}
                    type="button"
                    onClick={() => handleInterestToggle(customI)}
                    className="edit-chip active custom-chip"
                    title="Click to remove custom interest"
                  >
                    <span>{customI}</span>
                    <span className="chip-remove-x">×</span>
                  </button>
                ))
              }
            </div>

            {/* Custom Interest Input */}
            <div className="custom-interest-row font-ui">
              <input
                type="text"
                placeholder="Add a custom interest (e.g. Astro-photography, Skateboarding)..."
                value={customInterestInput}
                onChange={(e) => setCustomInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomInterest();
                  }
                }}
                className="custom-interest-input"
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                disabled={!customInterestInput.trim()}
                className="custom-interest-add-btn"
              >
                + Add
              </button>
            </div>

            {validationErrors.interests && (
              <span className="vh-input-error font-ui" role="alert">{validationErrors.interests}</span>
            )}
          </div>

          {/* 2-Min Voice Intro Snippet */}
          <div className="edit-form-group border-top">
            <VoiceRecorder
              initialAudioUrl={localProfile.voiceIntroUrl}
              onSaveAudio={(audioUrl) => handleFieldChange('voiceIntroUrl', audioUrl)}
              maxDurationSeconds={120}
            />
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
            <Button onClick={handleBack} type="button" variant="secondary">
              Done
            </Button>
            <Button type="submit" variant="primary" disabled={!isFormValid() || isSaving}>
              {isSaving ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved ✓' : 'Save Changes'}
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

        .custom-interest-row {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
          width: 100%;
        }

        .custom-interest-input {
          flex: 1;
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          outline: none;
          transition: border-color var(--duration-fast);
        }

        .custom-interest-input:focus {
          border-color: var(--burgundy-500);
        }

        .custom-interest-add-btn {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-fast);
          white-space: nowrap;
        }

        .custom-interest-add-btn:hover:not(:disabled) {
          background-color: var(--burgundy-600);
        }

        .custom-interest-add-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .chip-remove-x {
          margin-left: 5px;
          font-weight: bold;
          opacity: 0.85;
          font-size: 14px;
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

        .auto-save-status-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2, 6px);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: var(--text-body-xs, 12px);
          font-weight: 500;
          transition: all var(--transition-normal, 0.2s ease);
          white-space: nowrap;
        }

        .auto-save-status-pill.saving {
          background: rgba(212, 173, 106, 0.15);
          color: #b58832;
          border: 1px solid rgba(212, 173, 106, 0.35);
        }

        .auto-save-status-pill.saved {
          background: rgba(34, 197, 94, 0.12);
          color: #16a34a;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .auto-save-status-pill.error {
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .auto-save-status-pill.idle {
          background: rgba(184, 67, 106, 0.08);
          color: var(--burgundy-600);
          border: 1px solid rgba(184, 67, 106, 0.18);
        }

        .auto-save-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: autoSaveSpin 0.6s linear infinite;
        }

        @keyframes autoSaveSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

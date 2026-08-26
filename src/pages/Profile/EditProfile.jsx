import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { ArrowLeft, Camera, Trash, ArrowUp, ArrowDown, CheckCircle, FloppyDisk, ShieldCheck } from '@phosphor-icons/react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { Select } from '../../components/UI/Select';
import { PageHeader } from '../../components/UI/PageHeader';
import { VoiceRecorder } from '../../components/UI/VoiceRecorder';
import { ProtectedImage } from '../../components/UI/ProtectedImage';
import { getProfilePhoto, extractPhotoUrls } from '../../utils/avatar';
import { checkPhotoDuplicate, DUPLICATE_PHOTO_MESSAGE } from '../../utils/imageFingerprint';
import { StateSelectDropdown } from '../../components/UI/StateSelectDropdown';
import { PhotoVerificationModal } from '../../components/Safety/PhotoVerificationModal';
import { VerifiedBadge } from '../../components/UI/VerifiedBadge';
import { compareFaceBiometrics, analyzeLiveFaceStructure } from '../../utils/faceBiometrics';

export const EditProfile = ({ onBack }) => {
  const { userProfile, setUserProfile, updateUserProfile, showAlert } = useApp();
  const [localProfile, setLocalProfile] = useState(() => {
    const extracted = extractPhotoUrls(userProfile);
    return {
      ...userProfile,
      photos: extracted.length > 0 ? extracted : (Array.isArray(userProfile?.photos) ? userProfile.photos : [])
    };
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(null); // null or { index, percent }
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const autoSaveTimeoutRef = useRef(null);
  const savedPillTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const latestLocalProfile = useRef(localProfile);
  const initialPrimaryPhotoRef = useRef(extractPhotoUrls(userProfile)?.[0] || userProfile?.photos?.[0] || null);
  const hasAlertedPrimaryChangeRef = useRef(false);

  const checkAndNotifyPrimaryPhotoChange = (newPrimaryPhoto) => {
    const referencePhoto = initialPrimaryPhotoRef.current;

    // Case 1: No photo in slot 0 (all photos removed)
    if (!newPrimaryPhoto) {
      if (localProfile?.verified || userProfile?.verified) {
        setLocalProfile(prev => ({ ...prev, verified: false }));
        if (setUserProfile) setUserProfile(prev => ({ ...prev, verified: false }));
        try {
          localStorage.setItem('vh-user-verified', 'false');
          localStorage.removeItem('vh-verification-completed');
        } catch (_) {}
      }
      return;
    }

    // Case 2: Primary photo is unchanged
    if (newPrimaryPhoto === referencePhoto) {
      return;
    }

    // Case 3: Primary photo has changed to a new image -> reset verified status to protect against catfishing
    setLocalProfile(prev => ({ ...prev, verified: false }));
    if (setUserProfile) setUserProfile(prev => ({ ...prev, verified: false }));
    try {
      localStorage.setItem('vh-user-verified', 'false');
      localStorage.removeItem('vh-verification-completed');
    } catch (_) {}

    if (!hasAlertedPrimaryChangeRef.current) {
      hasAlertedPrimaryChangeRef.current = true;
      const msg = 'Your primary profile photo was updated. To maintain profile authenticity, your Verified Badge is paused. Please complete a quick 10-second live face scan to authenticate your new photo.';
      if (showAlert) {
        showAlert({
          title: 'Primary Photo Changed',
          message: msg,
          okText: 'Verify Now (10s)',
          cancelText: 'Maybe Later',
          onConfirm: () => setIsVerifyModalOpen(true)
        });
      }
    }
  };

  const getNormalizedProfileString = (p) => {
    if (!p) return '';
    return JSON.stringify({
      name: (p.name || '').trim(),
      city: (p.city || '').trim(),
      gender: p.gender || 'Woman',
      orientation: p.orientation || 'Straight',
      relationshipIntent: p.relationshipIntent || 'Long-term Relationship',
      relationshipStatus: p.relationshipStatus || 'Single',
      story: (p.story || '').trim(),
      interests: (p.interests || []).filter(Boolean).sort(),
      photos: (p.photos || []).filter(Boolean),
      education: (p.education || '').trim(),
      occupation: (p.occupation || '').trim(),
      languages: (p.languages || []).filter(Boolean).sort(),
      hasDisability: Boolean(p.hasDisability),
      disabilityInfo: (p.disabilityInfo || '').trim(),
      showDisability: Boolean(p.showDisability),
      showGender: p.showGender !== false,
      showOrientation: p.showOrientation !== false,
      dobDay: Number(p.dobDay) || 1,
      dobMonth: Number(p.dobMonth) || 1,
      dobYear: Number(p.dobYear) || 1998,
      voiceIntroUrl: (p.voiceIntroUrl || '').trim()
    });
  };

  const lastSavedProfileRef = useRef(getNormalizedProfileString(localProfile));
  latestLocalProfile.current = localProfile;

  const getAge = () => {
    const year = Number(localProfile.dobYear) || Number(userProfile?.dobYear);
    if (!year) return '';
    const day = Number(localProfile.dobDay) || Number(userProfile?.dobDay) || 1;
    const month = Number(localProfile.dobMonth) || Number(userProfile?.dobMonth) || 1;
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : (new Date().getFullYear() - year);
  };

  const handleFieldChange = (field, value) => {
    setLocalProfile((prev) => ({ ...prev, [field]: value }));
  };

  const getProfileValidationErrors = useCallback((p) => {
    const errors = {};
    if (!p.name || !p.name.trim()) errors.name = 'Name is required.';
    if (!p.city || !p.city.trim()) errors.city = 'Please select your State / Union Territory.';
    if (!p.story || !p.story.trim()) {
      errors.story = 'Story is required.';
    } else if (p.story.trim().length < 20) {
      errors.story = 'Story must be at least 20 characters.';
    }
    if (!p.interests || p.interests.length < 3) {
      errors.interests = 'Select at least 3 interests.';
    }

    const day = Number(p.dobDay);
    const month = Number(p.dobMonth);
    const year = Number(p.dobYear);
    if (!day || day < 1 || day > 31 || !month || month < 1 || month > 12 || !year) {
      errors.dob = 'Valid date of birth required.';
    } else {
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        errors.dob = 'You must be at least 18 years old.';
      }
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
    const day = Number(profileToSave.dobDay) || Number(userProfile?.dobDay) || 1;
    const month = Number(profileToSave.dobMonth) || Number(userProfile?.dobMonth) || 1;
    const year = Number(profileToSave.dobYear) || Number(userProfile?.dobYear) || 1998;

    const payload = {
      ...profileToSave,
      dobDay: day,
      dobMonth: month,
      dobYear: year,
      gender: profileToSave.gender || 'Woman',
      orientation: profileToSave.orientation || 'Straight',
      relationshipIntent: profileToSave.relationshipIntent || 'Long-term Relationship',
      relationshipStatus: profileToSave.relationshipStatus || 'Single',
      story: (profileToSave.story || '').trim(),
      city: (profileToSave.city || '').trim(),
      name: (profileToSave.name || '').trim(),
      interests: (profileToSave.interests || []).filter(Boolean),
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
      setUserProfile(prev => ({ ...prev, ...payload }));
    } finally {
      setIsSaving(false);
    }
  }, [updateUserProfile, setUserProfile, userProfile]);

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

    const currentNormalized = getNormalizedProfileString(localProfile);
    if (currentNormalized === lastSavedProfileRef.current) {
      return;
    }

    if (!checkProfileValid(localProfile)) {
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveProfileData(localProfile);
    }, 800);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [localProfile, checkProfileValid, getProfileValidationErrors, saveProfileData]);

  const interestOptions = [
    'Art', 'Music', 'Books', 'Nature', 'Cooking', 'Travel',
    'Tech', 'Gaming', 'Fitness', 'Yoga', 'Writing', 'Cinema',
    'Photography', 'Astronomy', 'Gardening', 'Dancing', 'History', 'Coffee'
  ];

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

  const handlePhotoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const otherPhotos = (localProfile.photos || []).filter((_, i) => i !== index);
    const duplicateCheck = await checkPhotoDuplicate(file, otherPhotos);
    if (duplicateCheck.isDuplicate) {
      if (showAlert) {
        showAlert({ title: 'Duplicate Photo', message: DUPLICATE_PHOTO_MESSAGE });
      } else {
        alert(DUPLICATE_PHOTO_MESSAGE);
      }
      if (e.target) e.target.value = '';
      return;
    }

    setUploadProgress({ index, percent: 30 });
    try {
      let finalUrl = null;
      if (api.isConfigured) {
        setUploadProgress({ index, percent: 60 });
        try {
          const res = await api.uploadFile(file);
          if (res?.secureUrl) finalUrl = res.secureUrl;
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
        }
      }

      if (!finalUrl) {
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      setUploadProgress({ index, percent: 100 });
      const isPrimaryUpload = (index === 0 && finalUrl !== initialPrimaryPhotoRef.current);
      setLocalProfile(prev => {
        const nextPhotos = [...(prev.photos || [])];
        nextPhotos[index] = finalUrl;
        return {
          ...prev,
          photos: nextPhotos,
          verified: isPrimaryUpload ? false : prev.verified
        };
      });

      if (index === 0) {
        checkAndNotifyPrimaryPhotoChange(finalUrl);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      const isModerationErr = err?.message?.toLowerCase().includes('inappropriate') || err?.message?.toLowerCase().includes('explicit') || err?.message?.toLowerCase().includes('moderation');
      const alertMsg = isModerationErr ? '⚠️ Image Discarded: This photo was removed because it contains inappropriate or explicit content.' : 'Photo upload failed. Please try again.';
      if (showAlert) {
        showAlert({ title: 'Image Discarded', message: alertMsg });
      } else {
        alert(alertMsg);
      }
    } finally {
      setTimeout(() => setUploadProgress(null), 300);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeletePhoto = (index) => {
    setLocalProfile(prev => {
      const nextPhotos = (prev.photos || []).filter((_, i) => i !== index);
      const isPrimaryChange = (index === 0 && nextPhotos[0] !== initialPrimaryPhotoRef.current);
      if (index === 0) {
        checkAndNotifyPrimaryPhotoChange(nextPhotos[0] || null);
      }
      return {
        ...prev,
        photos: nextPhotos,
        verified: isPrimaryChange ? false : prev.verified
      };
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
      const isPrimaryChange = (index === 0 || newIndex === 0) && (nextPhotos[0] !== initialPrimaryPhotoRef.current);
      if (index === 0 || newIndex === 0) {
        checkAndNotifyPrimaryPhotoChange(nextPhotos[0]);
      }
      return {
        ...prev,
        photos: nextPhotos,
        verified: isPrimaryChange ? false : prev.verified
      };
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

  const handleBack = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      if (isFormValid()) {
        saveProfileData(localProfile);
      }
    }
    onBack();
  };

  const renderAutoSavePill = () => {
    switch (autoSaveStatus) {
      case 'saving': return <span className="auto-save-status-pill saving font-ui"><span className="auto-save-spinner" /> Saving changes…</span>;
      case 'saved': return <span className="auto-save-status-pill saved font-ui"><CheckCircle size={14} weight="bold" /> All changes saved</span>;
      case 'error': return <span className="auto-save-status-pill error font-ui">Auto-save failed</span>;
      default: return <span className="auto-save-status-pill idle font-ui"><FloppyDisk size={14} /> Auto-saving</span>;
    }
  };

  return (
    <div className="edit-profile-page page-enter">
      <PageHeader
        title="Edit Profile"
        subtitle="Changes to your photos and profile details are auto-saved."
        onBack={handleBack}
        actions={renderAutoSavePill()}
      />

      <div className="edit-split-container">
        <form onSubmit={handleSubmit} className="edit-form-panel font-ui">
          <div className="edit-form-section">
            <span className="edit-section-label">Photos (Up to 6)</span>
            <div className="photo-manager-grid">
              {Array.from({ length: 6 }).map((_, idx) => {
                const img = localProfile.photos[idx];
                const isUploading = uploadProgress && uploadProgress.index === idx;

                return (
                  <div key={idx} className="photo-manager-slot">
                    {isUploading ? (
                      <div className="upload-progress-overlay"><div className="progress-spinner" /> <span className="pct-txt">{uploadProgress.percent}%</span></div>
                    ) : img ? (
                      <div className="photo-active-wrap">
                        <ProtectedImage src={img} alt={`Profile slot ${idx + 1}`} style={{ width: '100%', height: '100%' }} />
                        <div className="slot-actions">
                          <button type="button" onClick={() => handleDeletePhoto(idx)} className="slot-act-btn delete"><Trash size={14} /></button>
                          {idx > 0 && <button type="button" onClick={() => handleMovePhoto(idx, 'up')} className="slot-act-btn"><ArrowUp size={14} /></button>}
                          {idx < localProfile.photos.length - 1 && <button type="button" onClick={() => handleMovePhoto(idx, 'down')} className="slot-act-btn"><ArrowDown size={14} /></button>}
                        </div>
                        {idx === 0 && <span className="primary-photo-tag font-ui">Primary</span>}
                      </div>
                    ) : (
                      <label className="photo-upload-label">
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, idx)} className="sr-only" />
                        <Camera size={20} className="camera-icon" />
                        <span className="upload-btn-text">Add</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Photo Verification Status / Re-Verify Banner */}
            <div className="edit-verify-box font-ui">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={26} weight="fill" color={localProfile.verified ? '#22C55E' : '#B8436A'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {localProfile.verified ? 'Verified Profile Badge Active ✓' : 'Verification Required for Primary Photo'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {localProfile.verified
                      ? 'Your primary photo is authenticated against your live biometric face scan.'
                      : 'A quick 10-second live face scan is required to earn your Verified Rosette badge.'}
                  </div>
                </div>
              </div>
              {!localProfile.verified ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsVerifyModalOpen(true)}
                >
                  Verify Now (10s)
                </Button>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#22C55E',
                    background: 'rgba(34, 197, 94, 0.12)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckCircle size={14} weight="bold" /> Active
                </span>
              )}
            </div>
          </div>

          <Input
            id="edit-name"
            label="Name"
            value={localProfile.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={validationErrors.name}
            required
          />

          <div className="form-group">
            <label className="input-label font-ui" htmlFor="edit-state">
              State / Location in India <span className="required-star">*</span>
            </label>
            <StateSelectDropdown
              id="edit-state"
              placeholder="Select your State / Union Territory"
              value={localProfile.city}
              onChange={(val) => handleFieldChange('city', val)}
              error={validationErrors.city}
            />
          </div>

          <Select
            id="edit-gender"
            label="Gender Identity"
            value={localProfile.gender || 'Woman'}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            options={[
              { value: 'Woman', label: 'Woman' },
              { value: 'Man', label: 'Man' },
              { value: 'Non-binary', label: 'Non-binary' },
              { value: 'Genderqueer', label: 'Genderqueer' },
              { value: 'Genderfluid', label: 'Genderfluid' },
              { value: 'Agender', label: 'Agender' },
              { value: 'Trans Woman', label: 'Trans Woman' },
              { value: 'Trans Man', label: 'Trans Man' },
              { value: 'Bigender', label: 'Bigender' },
              { value: 'Androgynous', label: 'Androgynous' },
              { value: 'Two-Spirit', label: 'Two-Spirit' },
              { value: 'Questioning', label: 'Questioning' },
              { value: 'Prefer to self-describe', label: 'Prefer to self-describe' }
            ]}
          />

          <div className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              id="edit-show-gender"
              checked={Boolean(localProfile.showGender ?? true)}
              onChange={(e) => handleFieldChange('showGender', e.target.checked)}
            />
            <label htmlFor="edit-show-gender" className="font-ui" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Show gender on my public profile
            </label>
          </div>

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
                <ProtectedImage
                  src={getProfilePhoto(localProfile)}
                  alt={localProfile.name || 'Preview'}
                  className="preview-photo-wrap"
                  imgClassName="preview-photo"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div className="preview-card-details">
                <div className="preview-name-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <h2 className="preview-name font-display">{localProfile.name || 'Your Name'}</h2>
                  {getAge() ? <span className="preview-age font-ui">, {getAge()}</span> : null}
                  {localProfile.verified && <VerifiedBadge variant="icon" size="md" />}
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
          gap: 4px;
          z-index: 10;
          pointer-events: auto;
        }

        .slot-act-btn {
          background-color: rgba(26, 21, 23, 0.85);
          color: #FFFFFF;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.15s ease, background-color 0.15s ease;
          z-index: 11;
        }

        .slot-act-btn:hover {
          transform: scale(1.1);
          background-color: rgba(26, 21, 23, 1);
        }

        .slot-act-btn.delete {
          background-color: rgba(220, 53, 69, 0.9);
        }

        .slot-act-btn.delete:hover {
          background-color: rgba(220, 53, 69, 1);
        }

        .primary-photo-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(184, 67, 106, 0.95);
          color: #FFFFFF;
          font-size: 9px;
          text-align: center;
          padding: 2px 0;
          font-weight: bold;
          text-transform: uppercase;
          z-index: 10;
          pointer-events: none;
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

      <PhotoVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        primaryPhotoUrl={localProfile.photos?.[0] || null}
        onVerified={() => {
          setLocalProfile(prev => ({ ...prev, verified: true }));
          if (setUserProfile) setUserProfile(prev => ({ ...prev, verified: true }));
          initialPrimaryPhotoRef.current = localProfile.photos?.[0] || null;
          hasAlertedPrimaryChangeRef.current = false;
          try {
            localStorage.setItem('vh-user-verified', 'true');
            localStorage.setItem('vh-verification-completed', 'true');
            localStorage.removeItem('vh_verification_snoozed_until');
          } catch (_) {}
          setIsVerifyModalOpen(false);
        }}
      />
    </div>
  );
};

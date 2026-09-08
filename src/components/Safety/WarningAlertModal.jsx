import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import {
  Warning,
  Clock,
  UploadSimple,
  Trash,
  CheckCircle,
  X,
  ShieldWarning,
  ArrowRight,
  Eye,
  HourglassMedium,
  ChatCircleText,
} from '@phosphor-icons/react';

export const WarningAlertModal = () => {
  const { isFeatureTourActive, setActiveTab } = useApp();
  const [warning, setWarning] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalTab, setModalTab] = useState('overview'); // 'overview' | 'appeal'
  const [appealText, setAppealText] = useState('');
  const [appealPhotos, setAppealPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Fetch active warning on mount
  const fetchActiveWarning = async () => {
    try {
      const res = await api.warnings.getActive();
      if (res?.data) {
        setWarning(res.data);
        // Only open automatically if not dismissed this session
        const dismissedId = sessionStorage.getItem('dismissed_warning_id');
        if (dismissedId !== res.data.id) {
          setIsOpen(true);
        }
      } else {
        setWarning(null);
        setIsOpen(false);
      }
    } catch {
      // User might be unauthenticated or no warning exists
    }
  };

  useEffect(() => {
    fetchActiveWarning();

    // Listen to real-time socket events
    const socket = getSocket();
    if (socket) {
      const handleWarningIssued = (data) => {
        setWarning({
          id: data.warningId,
          violationType: data.violationType,
          message: data.message,
          deadlineHours: data.deadlineHours,
          expiresAt: data.expiresAt,
          autoSuspend: data.autoSuspend,
          status: 'ACTIVE',
          remainingMs: Math.max(0, new Date(data.expiresAt).getTime() - Date.now()),
        });
        setIsOpen(true);
        sessionStorage.removeItem('dismissed_warning_id');
      };

      socket.on('warning_issued', handleWarningIssued);
      return () => {
        socket.off('warning_issued', handleWarningIssued);
      };
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!warning || !warning.expiresAt || warning.status === 'APPEALED') return;

    const calculateTime = () => {
      const diff = new Date(warning.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired (Subject to Suspension)');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [warning]);

  if (!isOpen || !warning || isFeatureTourActive) return null;

  const handleDismiss = () => {
    if (warning?.id) {
      sessionStorage.setItem('dismissed_warning_id', warning.id);
    }
    setIsOpen(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      const uploadPromises = files.map((file) => api.uploadPhoto(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.secureUrl).filter(Boolean);

      setAppealPhotos((prev) => [...prev, ...newUrls].slice(0, 4));
    } catch (err) {
      console.error('Photo upload failed:', err);
      setError('Failed to upload proof photo. Please try an image under 10MB.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removeProofPhoto = (index) => {
    setAppealPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!appealText.trim()) {
      setError('Please provide an explanation for your appeal.');
      return;
    }

    try {
      setSubmittingAppeal(true);
      setError(null);

      await api.warnings.submitAppeal(warning.id, {
        appealText: appealText.trim(),
        appealPhotos,
      });

      setAppealSuccess(true);
      setWarning((prev) => ({
        ...prev,
        status: 'APPEALED',
        appealText: appealText.trim(),
        appealPhotos,
      }));
    } catch (err) {
      console.error('Failed to submit appeal:', err);
      setError(err.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const isAppealed = warning.status === 'APPEALED';

  return (
    <div className="warning-alert-overlay" onClick={handleDismiss}>
      <div className="warning-alert-card" onClick={(e) => e.stopPropagation()}>
        {/* Glow accent */}
        <div className="warning-alert-glow" />

        {/* Header */}
        <div className="warning-alert-header">
          <div className="warning-alert-header-info">
            <div className={`warning-alert-icon-wrap ${isAppealed ? 'icon-appealed' : 'icon-active'}`}>
              {isAppealed ? (
                <HourglassMedium size={26} weight="fill" className="alert-spin-pulse" />
              ) : (
                <ShieldWarning size={28} weight="fill" />
              )}
            </div>
            <div>
              <div className="warning-alert-tag-row">
                <span className="warning-alert-tag">
                  {isAppealed ? 'Appeal In Review' : 'Profile Action Required'}
                </span>
                {warning.violationType && (
                  <span className="warning-alert-violation-tag">
                    • {warning.violationType}
                  </span>
                )}
              </div>
              <h2 className="warning-alert-title font-display">
                {isAppealed ? 'Safe Harbor: Countdown Paused' : 'Account Compliance Warning'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="warning-alert-close-btn"
            title="Dismiss notification"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        <div className="warning-alert-body font-ui">
          {/* Status / Countdown Banner */}
          {isAppealed ? (
            <div className="warning-alert-banner banner-appealed">
              <CheckCircle size={20} weight="fill" className="banner-icon text-appealed" />
              <div className="banner-text">
                <strong className="banner-title">Your appeal is under active admin review.</strong>
                <p className="banner-sub">
                  The auto-suspension countdown has been paused. A moderator will review your explanation and attached proof images shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="warning-alert-banner banner-active">
              <div className="banner-left">
                <Clock size={20} weight="fill" className="banner-icon text-active" />
                <div>
                  <span className="banner-deadline-label">Compliance Deadline</span>
                  <span className="banner-deadline-time">{timeLeft || '24 Hours'}</span>
                </div>
              </div>
              {warning.autoSuspend && (
                <span className="banner-suspend-badge">
                  Auto-suspends on expiry
                </span>
              )}
            </div>
          )}

          {/* Admin Notice Message */}
          <div className="warning-alert-section">
            <label className="warning-alert-label">
              Notice from Admin Team
            </label>
            <div className="warning-alert-message-box">
              {warning.message}
            </div>
          </div>

          {/* Navigation / Mode Tabs if not appealed yet */}
          {!isAppealed && (
            <div className="warning-alert-tabs-nav">
              <button
                type="button"
                onClick={() => setModalTab('overview')}
                className={`warning-alert-tab-btn ${modalTab === 'overview' ? 'tab-active' : ''}`}
              >
                1. Update Profile (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('appeal')}
                className={`warning-alert-tab-btn ${modalTab === 'appeal' ? 'tab-active' : ''}`}
              >
                2. Reply & Appeal with Proof
              </button>
            </div>
          )}

          {/* Tab 1: Direct Profile Update guidance */}
          {modalTab === 'overview' && !isAppealed && (
            <div className="warning-alert-guidance-card">
              <p className="guidance-desc">
                If the notice is accurate, simply update your profile name or photos. The system will automatically detect the correction and resolve this warning immediately.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleDismiss();
                  setActiveTab('profile');
                }}
                className="btn-alert-primary-action"
              >
                <span>Go to Profile to Update</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          )}

          {/* Tab 2: Appeal Form with Proof Images */}
          {(modalTab === 'appeal' || isAppealed) && (
            <div className="warning-alert-appeal-form-area">
              {isAppealed ? (
                <div className="appeal-submitted-card">
                  <label className="warning-alert-label label-appealed">
                    Your Submitted Explanation
                  </label>
                  <div className="appeal-submitted-text">
                    {warning.appealText}
                  </div>

                  {warning.appealPhotos && warning.appealPhotos.length > 0 && (
                    <div className="appeal-submitted-photos-section">
                      <label className="warning-alert-label label-appealed">
                        Attached Proof Images ({warning.appealPhotos.length})
                      </label>
                      <div className="appeal-submitted-photos-grid">
                        {warning.appealPhotos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewModalImg(url)}
                            className="appeal-preview-thumb-card"
                          >
                            <img src={url} alt={`Proof ${idx + 1}`} className="appeal-preview-thumb-img" />
                            <div className="appeal-preview-thumb-overlay">
                              <Eye size={18} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitAppeal} className="appeal-input-form">
                  {error && (
                    <div className="appeal-error-box">
                      {error}
                    </div>
                  )}

                  <div className="form-field-group">
                    <label className="warning-alert-label">
                      Your Explanation / Reply
                    </label>
                    <textarea
                      rows={3}
                      value={appealText}
                      onChange={(e) => setAppealText(e.target.value)}
                      placeholder="Explain why this name/photo is legitimate (e.g., 'My real legal name genuinely is Luffy', or 'This photo is authentic')..."
                      className="appeal-textarea"
                    />
                  </div>

                  {/* Attach Proof Images */}
                  <div className="form-field-group">
                    <div className="field-header-row">
                      <label className="warning-alert-label">
                        Attach Proof Images (Optional)
                      </label>
                      <span className="field-hint">ID proof, document, alternate photo</span>
                    </div>

                    {/* Previews */}
                    {appealPhotos.length > 0 && (
                      <div className="appeal-draft-photos-row">
                        {appealPhotos.map((url, idx) => (
                          <div key={idx} className="appeal-draft-thumb">
                            <img src={url} alt={`Proof ${idx + 1}`} className="appeal-draft-thumb-img" />
                            <button
                              type="button"
                              onClick={() => removeProofPhoto(idx)}
                              className="btn-draft-remove"
                              title="Remove photo"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    {appealPhotos.length < 4 && (
                      <label className="appeal-upload-label">
                        <UploadSimple size={18} className="upload-icon" />
                        <span>{uploadingPhoto ? 'Uploading Proof...' : 'Upload Proof Images (ID / Document)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden-file-input"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAppeal || !appealText.trim() || uploadingPhoto}
                    className="btn-submit-appeal"
                  >
                    {submittingAppeal ? (
                      <>
                        <HourglassMedium size={16} className="btn-icon-spin" />
                        <span>Submitting Appeal...</span>
                      </>
                    ) : (
                      <>
                        <ChatCircleText size={16} weight="bold" />
                        <span>Submit Appeal & Pause Timer</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="warning-alert-footer font-ui">
          <span className="footer-brand">Velvet Hearts Trust & Safety</span>
          <button
            type="button"
            onClick={handleDismiss}
            className="footer-dismiss-btn"
          >
            I understand
          </button>
        </div>
      </div>

      {/* Proof Image Fullscreen Lightbox Modal */}
      {previewModalImg && (
        <div
          className="warning-lightbox-overlay"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="warning-lightbox-box">
            <img src={previewModalImg} alt="Proof Fullscreen" className="warning-lightbox-img" />
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="warning-lightbox-close-btn"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .warning-alert-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: warningFadeIn 0.2s ease-out;
        }

        .warning-alert-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          background: linear-gradient(165deg, rgba(28, 20, 24, 0.98) 0%, rgba(14, 10, 12, 0.98) 100%);
          border: 1px solid rgba(212, 173, 106, 0.35);
          border-radius: 24px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.75);
          overflow: hidden;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          animation: warningPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .warning-alert-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 3px;
          background: #D4AD6A;
          box-shadow: 0 0 20px #D4AD6A;
          border-radius: 999px;
        }

        /* ── Header ── */
        .warning-alert-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 22px 24px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .warning-alert-header-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .warning-alert-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid transparent;
        }

        .icon-active {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }

        .icon-appealed {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
        }

        .warning-alert-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .warning-alert-tag {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #D4AD6A;
          background: rgba(212, 173, 106, 0.12);
          border: 1px solid rgba(212, 173, 106, 0.25);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .warning-alert-violation-tag {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          font-weight: 600;
        }

        .warning-alert-title {
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          margin: 4px 0 0;
          letter-spacing: -0.01em;
        }

        .warning-alert-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .warning-alert-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        /* ── Body ── */
        .warning-alert-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-height: 70vh;
          overflow-y: auto;
        }

        /* Banner */
        .warning-alert-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border-radius: 14px;
          gap: 12px;
        }

        .banner-active {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .banner-appealed {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.35);
          align-items: flex-start;
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .banner-icon {
          flex-shrink: 0;
        }

        .banner-deadline-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.6);
        }

        .banner-deadline-time {
          font-size: 13.5px;
          font-weight: 700;
          color: #fbbf24;
        }

        .banner-suspend-badge {
          font-size: 10.5px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
          font-weight: 600;
        }

        .banner-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .banner-title {
          font-size: 13px;
          color: #e0f2fe;
          font-weight: 700;
        }

        .banner-sub {
          margin: 0;
          font-size: 12px;
          color: rgba(224, 242, 254, 0.8);
          line-height: 1.5;
        }

        /* Notice Message */
        .warning-alert-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .warning-alert-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.6);
        }

        .label-appealed {
          color: #38bdf8;
        }

        .warning-alert-message-box {
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        /* Tabs Nav */
        .warning-alert-tabs-nav {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 4px;
        }

        .warning-alert-tab-btn {
          flex: 1;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .warning-alert-tab-btn:hover {
          color: #ffffff;
        }

        .warning-alert-tab-btn.tab-active {
          background: #D4AD6A;
          color: #1a1209;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(212, 173, 106, 0.3);
        }

        /* Guidance Card */
        .warning-alert-guidance-card {
          padding: 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .guidance-desc {
          margin: 0;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.55;
        }

        .btn-alert-primary-action {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #B8436A 0%, #8A2548 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.4);
          transition: all 0.2s ease;
        }

        .btn-alert-primary-action:hover {
          background: linear-gradient(135deg, #CA5078 0%, #9C2E54 100%);
          transform: translateY(-1px);
        }

        /* Appeal Form Area */
        .warning-alert-appeal-form-area {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .appeal-submitted-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .appeal-submitted-text {
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #e0f2fe;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .appeal-submitted-photos-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .appeal-submitted-photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .appeal-preview-thumb-card {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }

        .appeal-preview-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .appeal-preview-thumb-card:hover .appeal-preview-thumb-img {
          transform: scale(1.05);
        }

        .appeal-preview-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #ffffff;
        }

        .appeal-preview-thumb-card:hover .appeal-preview-thumb-overlay {
          opacity: 1;
        }

        .appeal-input-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .appeal-error-box {
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          font-size: 12px;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-hint {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.45);
        }

        .appeal-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 12.5px;
          outline: none;
          resize: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .appeal-textarea:focus {
          border-color: #D4AD6A;
        }

        .appeal-draft-photos-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 4px;
        }

        .appeal-draft-thumb {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .appeal-draft-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-draft-remove {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 20px;
          height: 20px;
          border-radius: 999px;
          background: rgba(220, 38, 38, 0.85);
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-draft-remove:hover {
          background: #dc2626;
        }

        .appeal-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .appeal-upload-label:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #D4AD6A;
          color: #ffffff;
        }

        .upload-icon {
          color: #D4AD6A;
        }

        .hidden-file-input {
          display: none;
        }

        .btn-submit-appeal {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D4AD6A 0%, #B8924B 100%);
          border: none;
          color: #1a1209;
          font-size: 12.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(212, 173, 106, 0.35);
          transition: all 0.2s ease;
        }

        .btn-submit-appeal:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 173, 106, 0.5);
        }

        .btn-submit-appeal:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Footer ── */
        .warning-alert-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: rgba(0, 0, 0, 0.35);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-brand {
          font-weight: 500;
        }

        .footer-dismiss-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .footer-dismiss-btn:hover {
          color: #ffffff;
        }

        /* ── Lightbox ── */
        .warning-lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: rgba(0, 0, 0, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .warning-lightbox-box {
          position: relative;
          max-width: 680px;
          max-height: 85vh;
          border-radius: 16px;
          overflow: hidden;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .warning-lightbox-img {
          width: 100%;
          height: 100%;
          max-height: 80vh;
          object-fit: contain;
        }

        .warning-lightbox-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .alert-spin-pulse {
          animation: adminIconPulse 1.5s ease-in-out infinite;
        }

        .btn-icon-spin {
          animation: adminIconSpin 1s linear infinite;
        }

        @keyframes adminIconSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes adminIconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.92); }
        }

        @keyframes warningFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes warningPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  Warning,
  X,
  Clock,
  ShieldCheck,
  CheckCircle,
  HourglassMedium,
  User,
  Image as ImageIcon,
  Scroll,
} from '@phosphor-icons/react';

const PRESETS = {
  NAME: {
    label: 'Profile Name Violation',
    icon: User,
    defaultMessage:
      'Your profile name appears to be a pseudonym, joke, or placeholder. Velvet Hearts requires genuine, real names for an authentic dating community. Please update your profile name to your real name within 24 hours to keep your account active.',
  },
  PHOTO: {
    label: 'Profile Photo Violation',
    icon: ImageIcon,
    defaultMessage:
      'One or more of your profile photos violates our community standards (clear personal face photo required; no celebrities, memes, cartoons, or group-only photos). Please replace the photo(s) within 24 hours.',
  },
  POLICY: {
    label: 'Community Standards Violation',
    icon: Scroll,
    defaultMessage:
      'Your profile content or bio violates Velvet Hearts Community Guidelines. Please review and adjust your profile details within 24 hours to avoid account suspension.',
  },
  CUSTOM: {
    label: 'Custom Notice',
    icon: Warning,
    defaultMessage: '',
  },
};

export const AdminWarningModal = ({ isOpen, onClose, user, onSuccess }) => {
  if (!isOpen || !user) return null;

  const [violationType, setViolationType] = useState('NAME');
  const [message, setMessage] = useState(PRESETS.NAME.defaultMessage);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [autoSuspend, setAutoSuspend] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectType = (type) => {
    setViolationType(type);
    setMessage(PRESETS[type].defaultMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a warning message for the user.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetUserId = user.id || user.userId;
      await api.admin.issueWarning(targetUserId, {
        violationType,
        message: message.trim(),
        deadlineHours: Number(deadlineHours),
        autoSuspend,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to issue warning:', err);
      setError(err.message || 'Failed to issue warning. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user.name || user.profile?.name || 'User';
  const targetUserId = user.id || user.userId;

  return (
    <div className="admin-warn-overlay" onClick={onClose}>
      <div className="admin-warn-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-warn-header">
          <div className="admin-warn-header-left">
            <div className="admin-warn-icon-badge">
              <Warning size={22} weight="fill" />
            </div>
            <div>
              <h2 className="admin-warn-title">Issue Compliance Warning</h2>
              <p className="admin-warn-subtitle">
                To: <strong>{userName}</strong> ({targetUserId.slice(0, 8)}...)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="admin-warn-close-btn"
            title="Close modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="admin-warn-form">
          {error && (
            <div className="admin-warn-error-box">
              {error}
            </div>
          )}

          {/* Violation Category Selector */}
          <div className="admin-warn-field">
            <label className="admin-warn-label">
              Violation Type
            </label>
            <div className="admin-warn-presets-grid">
              {Object.entries(PRESETS).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = violationType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectType(key)}
                    className={`admin-warn-preset-btn ${isSelected ? 'is-active' : ''}`}
                  >
                    <Icon size={18} weight={isSelected ? 'fill' : 'regular'} className="admin-warn-preset-icon" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning Message */}
          <div className="admin-warn-field">
            <div className="admin-warn-field-header">
              <label className="admin-warn-label">
                Warning Instructions
              </label>
              <span className="admin-warn-field-hint">Visible to user in-app</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Specify the exact issue and required action..."
              className="admin-warn-textarea"
            />
          </div>

          {/* Deadline & Auto-Suspend Controls */}
          <div className="admin-warn-row">
            <div className="admin-warn-col">
              <label className="admin-warn-label flex-label">
                <Clock size={14} className="gold-icon" />
                <span>Compliance Deadline</span>
              </label>
              <select
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="admin-warn-select"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours (Standard)</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days)</option>
              </select>
            </div>

            <div className="admin-warn-col">
              <label className="admin-warn-autosuspend-card">
                <input
                  type="checkbox"
                  checked={autoSuspend}
                  onChange={(e) => setAutoSuspend(e.target.checked)}
                  className="admin-warn-checkbox"
                />
                <div className="admin-warn-checkbox-text">
                  <strong>Auto-Suspend</strong>
                  <span>If uncorrected & not appealed</span>
                </div>
              </label>
            </div>
          </div>

          {/* Automated Change Tracking Alert Box */}
          <div className="admin-warn-alert-box">
            <ShieldCheck size={20} weight="fill" className="admin-warn-alert-icon" />
            <div>
              <strong>Automated Change Tracking:</strong> The system automatically snapshots current profile data. If the user updates their name or photos within the deadline, it will be detected automatically and auto-suspension will be prevented.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-warn-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="admin-warn-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="admin-warn-submit-btn"
            >
              {submitting ? (
                <>
                  <HourglassMedium size={16} className="admin-warn-spin" />
                  <span>Issuing Warning...</span>
                </>
              ) : (
                <>
                  <Warning size={16} weight="bold" />
                  <span>Send Warning ({deadlineHours}h)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Scoped Styling */}
      <style>{`
        .admin-warn-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(14, 10, 13, 0.78);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          animation: adminWarnFadeIn 0.25s ease;
        }

        .admin-warn-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          background: linear-gradient(165deg, rgba(30, 22, 26, 0.98) 0%, rgba(16, 12, 14, 0.98) 100%);
          border: 1px solid rgba(212, 173, 106, 0.35);
          border-radius: 22px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(184, 67, 106, 0.25);
          overflow: hidden;
          color: #FFFFFF;
          font-family: var(--font-ui, 'Inter', -apple-system, sans-serif);
          animation: adminWarnPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .admin-warn-header {
          padding: 20px 24px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(212, 173, 106, 0.06);
        }

        .admin-warn-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-warn-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(212, 173, 106, 0.15);
          border: 1px solid rgba(212, 173, 106, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F3C68F;
          flex-shrink: 0;
          box-shadow: 0 0 14px rgba(212, 173, 106, 0.2);
        }

        .admin-warn-title {
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
        }

        .admin-warn-subtitle {
          font-size: 12px;
          color: rgba(243, 198, 143, 0.85);
          margin: 3px 0 0 0;
        }

        .admin-warn-subtitle strong {
          color: #FFFFFF;
        }

        .admin-warn-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-warn-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
        }

        .admin-warn-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .admin-warn-error-box {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #FCA5A5;
          font-size: 12.5px;
          line-height: 1.4;
        }

        .admin-warn-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-warn-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-warn-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-warn-label.flex-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gold-icon {
          color: #D4AD6A;
        }

        .admin-warn-field-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .admin-warn-presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        @media (max-width: 480px) {
          .admin-warn-presets-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-warn-preset-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 13px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .admin-warn-preset-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .admin-warn-preset-btn.is-active {
          background: rgba(212, 173, 106, 0.16);
          border-color: #D4AD6A;
          color: #F3C68F;
          box-shadow: 0 4px 14px rgba(212, 173, 106, 0.15);
        }

        .admin-warn-preset-icon {
          color: #D4AD6A;
          flex-shrink: 0;
        }

        .admin-warn-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-size: 13px;
          line-height: 1.5;
          resize: none;
          font-family: var(--font-ui, 'Inter', -apple-system, sans-serif);
          transition: all 0.2s ease;
        }

        .admin-warn-textarea:focus {
          outline: none;
          border-color: #D4AD6A;
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.2);
        }

        .admin-warn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 480px) {
          .admin-warn-row {
            grid-template-columns: 1fr;
          }
        }

        .admin-warn-col {
          display: flex;
          flex-direction: column;
          gap: 7px;
          justify-content: flex-end;
        }

        .admin-warn-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-size: 12.5px;
          font-family: var(--font-ui, 'Inter', sans-serif);
          cursor: pointer;
        }

        .admin-warn-select:focus {
          outline: none;
          border-color: #D4AD6A;
        }

        .admin-warn-autosuspend-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
          box-sizing: border-box;
        }

        .admin-warn-autosuspend-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .admin-warn-checkbox {
          width: 17px;
          height: 17px;
          accent-color: #D4AD6A;
          cursor: pointer;
          margin: 0;
        }

        .admin-warn-checkbox-text {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          line-height: 1.3;
        }

        .admin-warn-checkbox-text strong {
          color: #FFFFFF;
        }

        .admin-warn-checkbox-text span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
        }

        .admin-warn-alert-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 14px;
          background: rgba(212, 173, 106, 0.09);
          border: 1px solid rgba(212, 173, 106, 0.28);
          color: #F3C68F;
          font-size: 12px;
          line-height: 1.5;
        }

        .admin-warn-alert-icon {
          color: #D4AD6A;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .admin-warn-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-warn-cancel-btn {
          padding: 10px 18px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-warn-cancel-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.06);
        }

        .admin-warn-submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, #B8436A 0%, #8A2548 100%);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.45);
          transition: all 0.2s ease;
        }

        .admin-warn-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #CA5078 0%, #9C2E54 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.6);
        }

        .admin-warn-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-warn-spin {
          animation: adminWarnSpin 1s linear infinite;
        }

        @keyframes adminWarnSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes adminWarnFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes adminWarnPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

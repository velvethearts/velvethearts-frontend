import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ThemeToggle } from '../UI/ThemeToggle';
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
        {/* Glowing Top Accent */}
        <div className="admin-warn-glow-bar" />

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
          <div className="admin-warn-header-actions">
            <ThemeToggle className="admin-warn-theme-toggle" />
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="admin-warn-close-btn"
              title="Close modal"
              aria-label="Close dialog"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
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

          {/* Deadline & Auto-Suspend Working Toggle Controls */}
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
              <label className="admin-warn-label flex-label">
                <ShieldCheck size={14} className="gold-icon" />
                <span>Enforcement Action</span>
              </label>
              <div
                className={`admin-warn-autosuspend-card ${autoSuspend ? 'is-active' : ''}`}
                onClick={() => setAutoSuspend((prev) => !prev)}
                role="switch"
                aria-checked={autoSuspend}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setAutoSuspend((prev) => !prev);
                  }
                }}
                title="Click to toggle auto-suspension"
              >
                <div className="admin-warn-checkbox-text">
                  <strong>Auto-Suspend</strong>
                  <span>{autoSuspend ? 'Suspends if deadline expires' : 'No automatic suspension'}</span>
                </div>
                {/* Working iOS-Style Toggle Switch Button */}
                <div className={`admin-warn-toggle-switch ${autoSuspend ? 'is-checked' : ''}`}>
                  <div className="admin-warn-toggle-knob" />
                </div>
              </div>
            </div>
          </div>

          {/* Automated Change Tracking Alert Box */}
          <div className="admin-warn-alert-box">
            <ShieldCheck size={20} weight="fill" className="admin-warn-alert-icon" />
            <div>
              <strong>Automated Change Tracking:</strong> The system automatically snapshots current profile data. If the user updates their details within the deadline or appeals with proof, it will be detected automatically and auto-suspension will be prevented.
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

      {/* Embedded Scoped Styling with Full App Theme Integration */}
      <style>{`
        .admin-warn-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(14, 10, 13, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          animation: adminWarnFadeIn 0.2s ease-out;
        }

        .admin-warn-card {
          position: relative;
          width: 100%;
          max-width: 580px;
          background: var(--bg-surface, #FFFFFF);
          border: 1px solid var(--border-subtle, #E5E7EB);
          border-radius: var(--radius-xl, 24px);
          box-shadow: var(--shadow-xl, 0 20px 60px rgba(0, 0, 0, 0.18));
          color: var(--text-primary, #111827);
          font-family: var(--font-ui, 'Outfit', sans-serif);
          animation: adminWarnPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-sizing: border-box;
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }

        [data-theme="dark"] .admin-warn-card {
          background: linear-gradient(165deg, rgba(28, 20, 24, 0.98) 0%, rgba(14, 10, 12, 0.98) 100%);
          border: 1px solid rgba(212, 173, 106, 0.35);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.75);
        }

        .admin-warn-glow-bar {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          height: 3px;
          background: var(--burgundy-500, #B8436A);
          border-radius: 999px;
          box-shadow: 0 0 16px var(--burgundy-500, #B8436A);
        }

        [data-theme="dark"] .admin-warn-glow-bar {
          background: #D4AD6A;
          box-shadow: 0 0 20px #D4AD6A;
        }

        /* ── Header ── */
        .admin-warn-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 22px 24px 16px;
          border-bottom: 1px solid var(--border-subtle, #E5E7EB);
          gap: 16px;
        }

        [data-theme="dark"] .admin-warn-header {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .admin-warn-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-warn-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #d97706;
          flex-shrink: 0;
        }

        [data-theme="dark"] .admin-warn-icon-badge {
          background: rgba(212, 173, 106, 0.14);
          border-color: rgba(212, 173, 106, 0.35);
          color: #D4AD6A;
        }

        .admin-warn-title {
          font-family: var(--font-display, 'DM Serif Display', serif);
          font-size: 21px;
          font-weight: 700;
          color: var(--text-primary, #111827);
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .admin-warn-subtitle {
          font-size: 12.5px;
          color: var(--text-secondary, #4B5563);
          margin: 4px 0 0;
          line-height: 1.4;
        }

        .admin-warn-subtitle strong {
          color: var(--text-primary, #111827);
        }

        .admin-warn-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-warn-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--bg-surface-warm, #F3F4F6);
          border: 1px solid var(--border-subtle, #E5E7EB);
          color: var(--text-secondary, #6B7280);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .admin-warn-close-btn:hover {
          background: var(--bg-muted, #E5E7EB);
          color: var(--text-primary, #111827);
        }

        [data-theme="dark"] .admin-warn-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.6);
        }

        [data-theme="dark"] .admin-warn-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        /* ── Form Body ── */
        .admin-warn-form {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .admin-warn-error-box {
          padding: 11px 14px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #dc2626;
          font-size: 12px;
          line-height: 1.4;
        }

        [data-theme="dark"] .admin-warn-error-box {
          color: #fca5a5;
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
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary, #4B5563);
        }

        [data-theme="dark"] .admin-warn-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .admin-warn-field-hint {
          font-size: 10.5px;
          color: var(--text-muted, #9CA3AF);
        }

        .flex-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gold-icon {
          color: var(--burgundy-500, #B8436A);
        }

        [data-theme="dark"] .gold-icon {
          color: #D4AD6A;
        }

        /* ── Preset Buttons Grid ── */
        .admin-warn-presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        @media (max-width: 500px) {
          .admin-warn-presets-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-warn-preset-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: var(--radius-md, 12px);
          background: var(--bg-surface-warm, #FFF8F0);
          border: 1px solid var(--border-subtle, #E5E7EB);
          color: var(--text-secondary, #374151);
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .admin-warn-preset-btn:hover {
          background: var(--bg-muted, #FAEEE0);
          color: var(--text-primary, #111827);
          border-color: var(--border-default, #D1D5DB);
        }

        .admin-warn-preset-btn.is-active {
          background: rgba(184, 67, 106, 0.08);
          border-color: var(--burgundy-500, #B8436A);
          color: var(--burgundy-500, #B8436A);
          box-shadow: 0 2px 8px rgba(184, 67, 106, 0.15);
        }

        [data-theme="dark"] .admin-warn-preset-btn {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        [data-theme="dark"] .admin-warn-preset-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        [data-theme="dark"] .admin-warn-preset-btn.is-active {
          background: rgba(212, 173, 106, 0.12);
          border-color: #D4AD6A;
          color: #F3C68F;
          box-shadow: 0 2px 10px rgba(212, 173, 106, 0.2);
        }

        .admin-warn-preset-icon {
          flex-shrink: 0;
        }

        /* ── Inputs & Selects ── */
        .admin-warn-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius-md, 12px);
          background: var(--bg-input, #FFF8F0);
          border: 1px solid var(--border-default, #D1D5DB);
          color: var(--text-primary, #111827);
          font-family: inherit;
          font-size: 13px;
          line-height: 1.5;
          outline: none;
          resize: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        [data-theme="dark"] .admin-warn-textarea {
          background: rgba(0, 0, 0, 0.45);
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .admin-warn-textarea:focus {
          border-color: var(--burgundy-500, #B8436A);
          box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.15);
        }

        [data-theme="dark"] .admin-warn-textarea:focus {
          border-color: #D4AD6A;
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.15);
        }

        /* ── Row & Columns ── */
        .admin-warn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 500px) {
          .admin-warn-row {
            grid-template-columns: 1fr;
          }
        }

        .admin-warn-col {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-warn-select {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: var(--radius-md, 12px);
          background: var(--bg-input, #FFF8F0);
          border: 1px solid var(--border-default, #D1D5DB);
          color: var(--text-primary, #111827);
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        [data-theme="dark"] .admin-warn-select {
          background: rgba(0, 0, 0, 0.45);
          border-color: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .admin-warn-select:focus {
          border-color: var(--burgundy-500, #B8436A);
          box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.15);
        }

        [data-theme="dark"] .admin-warn-select:focus {
          border-color: #D4AD6A;
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.15);
        }

        /* ── Working Toggle Switch Button ── */
        .admin-warn-autosuspend-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          height: 48px;
          border-radius: var(--radius-md, 12px);
          background: var(--bg-surface-warm, #FFF8F0);
          border: 1px solid var(--border-subtle, #E5E7EB);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .admin-warn-autosuspend-card:hover {
          border-color: var(--border-default, #D1D5DB);
          background: var(--bg-muted, #FAEEE0);
        }

        .admin-warn-autosuspend-card.is-active {
          border-color: var(--burgundy-500, #B8436A);
          background: rgba(184, 67, 106, 0.05);
        }

        [data-theme="dark"] .admin-warn-autosuspend-card {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        [data-theme="dark"] .admin-warn-autosuspend-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        [data-theme="dark"] .admin-warn-autosuspend-card.is-active {
          border-color: #D4AD6A;
          background: rgba(212, 173, 106, 0.08);
        }

        .admin-warn-checkbox-text {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          line-height: 1.25;
          text-align: left;
        }

        .admin-warn-checkbox-text strong {
          color: var(--text-primary, #111827);
        }

        .admin-warn-checkbox-text span {
          color: var(--text-muted, #6B7280);
          font-size: 10.5px;
        }

        /* Authentic iOS-style Toggle Button Track & Knob */
        .admin-warn-toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: #cbd5e1;
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        [data-theme="dark"] .admin-warn-toggle-switch {
          background: rgba(255, 255, 255, 0.2);
        }

        .admin-warn-toggle-switch.is-checked {
          background: var(--burgundy-500, #B8436A);
          box-shadow: 0 0 10px rgba(184, 67, 106, 0.4);
        }

        [data-theme="dark"] .admin-warn-toggle-switch.is-checked {
          background: #D4AD6A;
          box-shadow: 0 0 12px rgba(212, 173, 106, 0.45);
        }

        .admin-warn-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .admin-warn-toggle-switch.is-checked .admin-warn-toggle-knob {
          transform: translateX(20px);
        }

        /* ── Alert Box ── */
        .admin-warn-alert-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 16px;
          border-radius: var(--radius-lg, 14px);
          background: rgba(212, 173, 106, 0.12);
          border: 1px solid rgba(196, 154, 74, 0.35);
          color: #854d0e;
          font-size: 12px;
          line-height: 1.5;
        }

        [data-theme="dark"] .admin-warn-alert-box {
          background: rgba(212, 173, 106, 0.09);
          border-color: rgba(212, 173, 106, 0.28);
          color: #F3C68F;
        }

        .admin-warn-alert-icon {
          color: var(--burgundy-500, #B8436A);
          flex-shrink: 0;
          margin-top: 2px;
        }

        [data-theme="dark"] .admin-warn-alert-icon {
          color: #D4AD6A;
        }

        /* ── Footer ── */
        .admin-warn-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle, #E5E7EB);
        }

        [data-theme="dark"] .admin-warn-footer {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .admin-warn-cancel-btn {
          padding: 10px 18px;
          border-radius: var(--radius-md, 12px);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary, #4B5563);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-warn-cancel-btn:hover {
          color: var(--text-primary, #111827);
          background: var(--bg-surface-warm, #F3F4F6);
        }

        [data-theme="dark"] .admin-warn-cancel-btn {
          color: rgba(255, 255, 255, 0.7);
        }

        [data-theme="dark"] .admin-warn-cancel-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.06);
        }

        .admin-warn-submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: var(--radius-md, 12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, #B8436A 0%, #8A2548 100%);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.35);
          transition: all 0.2s ease;
        }

        .admin-warn-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #CA5078 0%, #9C2E54 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.5);
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

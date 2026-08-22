import React, { useState } from 'react';
import { EnvelopeSimple, LockKey, Sparkle, X, WarningCircle } from '@phosphor-icons/react';
import { api } from '../../lib/api';

const MAX_CHARS = 500;

export const RewindLetterCompose = ({ matchId, partnerName, isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const charCount = content.length;
  const remaining = MAX_CHARS - charCount;
  const isOverLimit = remaining < 0;
  const isValid = content.trim().length > 0 && !isOverLimit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.writeRewindLetter(matchId, content.trim());
      setContent('');
      if (onSuccess) onSuccess(res?.data || res);
      onClose();
    } catch (err) {
      console.error('Failed to seal rewind letter:', err);
      setError(err?.message || 'Failed to seal letter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rewind-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rewind-modal-title">
      <div className="rewind-modal-card">
        <div className="rewind-modal-header">
          <div className="rewind-modal-header-icon">
            <EnvelopeSimple size={24} weight="duotone" />
          </div>
          <div>
            <h3 id="rewind-modal-title" className="rewind-modal-title">
              Rewind Letter for {partnerName || 'your match'}
            </h3>
            <p className="rewind-modal-subtitle">
              A private message sealed until 7 days or 50 messages pass.
            </p>
          </div>
          <button
            type="button"
            className="rewind-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rewind-modal-body">
          <div className="rewind-sealed-notice">
            <LockKey size={18} weight="fill" className="rewind-sealed-notice-icon" />
            <span>
              <strong>Sealed upon sending:</strong> Once sealed, this letter cannot be edited, unsent, or previewed. It will be delivered privately to {partnerName || 'your match'} when the time comes.
            </span>
          </div>

          {error && (
            <div className="rewind-error-banner" role="alert">
              <WarningCircle size={18} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <div className="rewind-textarea-wrapper">
            <textarea
              className="rewind-textarea"
              placeholder={`What stood out about ${partnerName || 'them'}? What are you curious to know? Write your thoughts here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={MAX_CHARS + 50}
              disabled={isSubmitting}
              autoFocus
            />
            <div className={`rewind-char-counter ${remaining < 20 ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
              {charCount} / {MAX_CHARS}
            </div>
          </div>

          <div className="rewind-modal-actions">
            <button
              type="button"
              className="rewind-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rewind-btn-seal"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <span>Sealing...</span>
              ) : (
                <>
                  <LockKey size={18} weight="bold" />
                  <span>Seal & Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

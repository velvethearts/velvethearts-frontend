import React, { useState } from 'react';
import { EnvelopeSimple, LockKey, Calendar, X, WarningCircle, Clock } from '@phosphor-icons/react';
import { api } from '../../lib/api';

const MAX_CHARS = 500;
const MIN_DAYS = 7;
const MAX_DAYS = 90;
const PRESET_DAYS = [7, 14, 30, 60, 90];

export const RewindLetterCompose = ({
  matchId,
  partnerName,
  isOpen,
  onClose,
  onSuccess,
  isReschedule = false,
  initialDays = 7,
}) => {
  const [content, setContent] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(initialDays);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const charCount = content.length;
  const remaining = MAX_CHARS - charCount;
  const isOverLimit = remaining < 0;
  const isValid = isReschedule ? true : (content.trim().length > 0 && !isOverLimit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isReschedule) {
        const res = await api.updateRewindLetterSchedule(matchId, Number(deliveryDays));
        if (onSuccess) onSuccess(res?.data || res);
        onClose();
      } else {
        const res = await api.writeRewindLetter(matchId, content.trim(), Number(deliveryDays));
        setContent('');
        if (onSuccess) onSuccess(res?.data || res);
        onClose();
      }
    } catch (err) {
      console.error('Failed to save rewind letter:', err);
      setError(err?.message || 'Failed to save letter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rewind-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rewind-modal-title">
      <div className="rewind-modal-card">
        <div className="rewind-modal-header">
          <div className="rewind-modal-header-icon">
            {isReschedule ? <Clock size={24} weight="duotone" /> : <EnvelopeSimple size={24} weight="duotone" />}
          </div>
          <div>
            <h3 id="rewind-modal-title" className="rewind-modal-title">
              {isReschedule ? `Reschedule Letter for ${partnerName || 'your match'}` : `Rewind Letter for ${partnerName || 'your match'}`}
            </h3>
            <p className="rewind-modal-subtitle">
              {isReschedule
                ? `Choose when your sealed letter will unlock (between ${MIN_DAYS} and ${MAX_DAYS} days).`
                : `A private message sealed until ${deliveryDays} days or 50 messages pass.`}
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
              {isReschedule ? (
                <>
                  <strong>Adjust unlock timeframe:</strong> Set how long your letter remains sealed. It will unlock after <strong>{deliveryDays} days</strong> of matching or <strong>50 messages</strong>.
                </>
              ) : (
                <>
                  <strong>Sealed upon sending:</strong> Once sealed, this letter cannot be edited, unsent, or previewed. It will be delivered privately to {partnerName || 'your match'} after {deliveryDays} days or 50 messages.
                </>
              )}
            </span>
          </div>

          {error && (
            <div className="rewind-error-banner" role="alert">
              <WarningCircle size={18} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          {!isReschedule && (
            <div className="rewind-textarea-wrapper">
              <textarea
                className="rewind-textarea"
                placeholder={`What stood out about ${partnerName || 'them'}? What are you curious to know? Write your thoughts here...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={MAX_CHARS + 50}
                disabled={isSubmitting}
                autoFocus
              />
              <div className={`rewind-char-counter ${remaining < 20 ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                {charCount} / {MAX_CHARS}
              </div>
            </div>
          )}

          {/* Delivery Duration Selector (7-90 Days) */}
          <div className="rewind-duration-picker">
            <div className="rewind-duration-header">
              <span className="rewind-duration-label">
                <Calendar size={16} weight="duotone" />
                <span>Unlock Timeframe</span>
              </span>
              <span className="rewind-duration-value">
                {deliveryDays} Days
              </span>
            </div>

            <div className="rewind-duration-presets">
              {PRESET_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`rewind-preset-btn ${deliveryDays === days ? 'active' : ''}`}
                  onClick={() => setDeliveryDays(days)}
                  disabled={isSubmitting}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <div className="rewind-duration-slider-row">
              <input
                type="range"
                min={MIN_DAYS}
                max={MAX_DAYS}
                step={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="rewind-duration-slider"
                disabled={isSubmitting}
              />
            </div>

            <div className="rewind-duration-range-limits">
              <span>Min: {MIN_DAYS} days</span>
              <span>Max: {MAX_DAYS} days</span>
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
                <span>{isReschedule ? 'Saving...' : 'Sealing...'}</span>
              ) : isReschedule ? (
                <>
                  <Clock size={18} weight="bold" />
                  <span>Update Schedule</span>
                </>
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

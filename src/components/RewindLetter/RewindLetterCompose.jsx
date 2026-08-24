import React, { useState, useEffect, useMemo } from 'react';
import {
  EnvelopeSimple,
  LockKey,
  Calendar,
  CalendarBlank,
  CalendarCheck,
  X,
  WarningCircle,
  Clock,
  PencilSimple,
  CaretLeft,
  CaretRight,
  Check
} from '@phosphor-icons/react';
import { api } from '../../lib/api';

const MAX_WORDS = 500;
const MIN_DAYS = 1;
const MAX_DAYS = 90;
const PRESET_DAYS = [1, 3, 7, 14, 30, 90];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const RewindLetterCompose = ({
  matchId,
  partnerName,
  isOpen,
  onClose,
  onSuccess,
  mode = 'create', // 'create' | 'edit' | 'reschedule'
  initialContent = '',
  initialDays = 7,
  letterId = null,
  letterCreatedAt = null,
}) => {
  const [content, setContent] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isReschedule = mode === 'reschedule';
  const isEdit = mode === 'edit';

  // Base date calculation (normalized to midnight)
  const baseDate = useMemo(() => {
    const d = letterCreatedAt ? new Date(letterCreatedAt) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [letterCreatedAt]);

  // Minimum selectable date: baseDate + 7 days
  const minSelectableDate = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + MIN_DAYS);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [baseDate]);

  // Maximum selectable date: baseDate + 90 days (~3 months)
  const maxSelectableDate = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + MAX_DAYS);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [baseDate]);

  // Selected delivery date state
  const [selectedDate, setSelectedDate] = useState(() => {
    const initial = new Date(baseDate);
    initial.setDate(initial.getDate() + (initialDays || MIN_DAYS));
    initial.setHours(0, 0, 0, 0);
    return initial < minSelectableDate ? minSelectableDate : (initial > maxSelectableDate ? maxSelectableDate : initial);
  });

  // Calendar View Month state
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth());

  useEffect(() => {
    if (isOpen) {
      setShowCalendarOverlay(false);
      if (mode === 'create') {
        setContent('');
        setDeliveryDays(7);
        const defaultDate = new Date(baseDate);
        defaultDate.setDate(defaultDate.getDate() + MIN_DAYS);
        defaultDate.setHours(0, 0, 0, 0);
        setSelectedDate(defaultDate);
        setViewYear(defaultDate.getFullYear());
        setViewMonth(defaultDate.getMonth());
      } else if (mode === 'edit') {
        setContent(initialContent || '');
        const days = initialDays || 7;
        setDeliveryDays(days);
        const existingDate = new Date(baseDate);
        existingDate.setDate(existingDate.getDate() + days);
        existingDate.setHours(0, 0, 0, 0);
        const clampedDate = existingDate < minSelectableDate ? minSelectableDate : (existingDate > maxSelectableDate ? maxSelectableDate : existingDate);
        setSelectedDate(clampedDate);
        setViewYear(clampedDate.getFullYear());
        setViewMonth(clampedDate.getMonth());
      } else if (mode === 'reschedule') {
        setContent('');
        const days = initialDays || 7;
        setDeliveryDays(days);
        const existingDate = new Date(baseDate);
        existingDate.setDate(existingDate.getDate() + days);
        existingDate.setHours(0, 0, 0, 0);
        const clampedDate = existingDate < minSelectableDate ? minSelectableDate : (existingDate > maxSelectableDate ? maxSelectableDate : existingDate);
        setSelectedDate(clampedDate);
        setViewYear(clampedDate.getFullYear());
        setViewMonth(clampedDate.getMonth());
      }
      setError('');
    }
  }, [isOpen, mode, initialContent, initialDays, baseDate, minSelectableDate, maxSelectableDate]);

  // Adjust date when slider changes
  const handleSliderChange = (days) => {
    const clampedDays = Math.max(MIN_DAYS, Math.min(MAX_DAYS, days));
    setDeliveryDays(clampedDays);
    const target = new Date(baseDate);
    target.setDate(target.getDate() + clampedDays);
    target.setHours(0, 0, 0, 0);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Adjust slider when calendar date is chosen
  const handleCalendarDateSelect = (cellDate) => {
    setSelectedDate(cellDate);
    const diffMs = cellDate.getTime() - baseDate.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const clampedDays = Math.max(MIN_DAYS, Math.min(MAX_DAYS, days));
    setDeliveryDays(clampedDays);
    setShowCalendarOverlay(false);
  };

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const remainingWords = MAX_WORDS - wordCount;
  const isOverLimit = remainingWords < 0;
  const isValid = isReschedule ? true : (wordCount > 0 && !isOverLimit);

  // Month navigation boundary guards
  const currentViewMonthStart = new Date(viewYear, viewMonth, 1);
  const minMonthStart = new Date(minSelectableDate.getFullYear(), minSelectableDate.getMonth(), 1);
  const maxMonthStart = new Date(maxSelectableDate.getFullYear(), maxSelectableDate.getMonth(), 1);

  const canGoPrevMonth = currentViewMonthStart > minMonthStart;
  const canGoNextMonth = currentViewMonthStart < maxMonthStart;

  const handlePrevMonth = (e) => {
    e.preventDefault();
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    if (!canGoNextMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formattedSelectedDate = selectedDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isReschedule) {
        const res = await api.updateRewindLetterSchedule(matchId, Number(deliveryDays), letterId);
        if (onSuccess) onSuccess(res?.data || res);
        onClose();
      } else if (isEdit) {
        const res = await api.editRewindLetter(matchId, content.trim(), Number(deliveryDays), letterId);
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
            {isReschedule ? (
              <Clock size={24} weight="duotone" />
            ) : isEdit ? (
              <PencilSimple size={24} weight="duotone" />
            ) : (
              <EnvelopeSimple size={24} weight="duotone" />
            )}
          </div>
          <div>
            <h3 id="rewind-modal-title" className="rewind-modal-title">
              {isReschedule
                ? `Reschedule Letter for ${partnerName || 'your match'}`
                : isEdit
                ? `Edit Rewind Letter for ${partnerName || 'your match'}`
                : `Rewind Letter for ${partnerName || 'your match'}`}
            </h3>
            <p className="rewind-modal-subtitle">
              {isReschedule
                ? `Pick an unlock date within 3 months (minimum 7 days).`
                : isEdit
                ? `Edit your message or adjust unlock timeframe within 48 hours.`
                : `A private message (up to ${MAX_WORDS} words) sealed until delivery.`}
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
                  <strong>Adjust unlock timeframe:</strong> Set how long your letter remains sealed. It will unlock after <strong>{deliveryDays} days</strong> of sealing.
                </>
              ) : isEdit ? (
                <>
                  <strong>48-hour edit window:</strong> You can refine your message or adjust unlock days. Once the 48-hour window closes, this letter will be permanently locked in the time capsule.
                </>
              ) : (
                <>
                  <strong>48-hour grace edit window:</strong> Once sealed, you can edit or delete this letter within 48 hours. After 48 hours, it is permanently locked until delivery ({deliveryDays} days from sealing).
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
                placeholder={`What stood out about ${partnerName || 'them'}? What are you curious to know? Write your thoughts here (up to ${MAX_WORDS} words)...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                disabled={isSubmitting}
                autoFocus
              />
              <div className={`rewind-char-counter ${remainingWords < 30 ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                {wordCount} / {MAX_WORDS} words
              </div>
            </div>
          )}

          {/* Delivery Duration Section with Slider & Calendar Button */}
          <div className="rewind-duration-picker">
            <div className="rewind-duration-header">
              <span className="rewind-duration-label font-ui">
                <Calendar size={16} weight="duotone" />
                <span>Unlock Timeframe</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="rewind-pick-calendar-btn font-ui"
                  onClick={() => setShowCalendarOverlay(true)}
                  title="Choose a specific date on the calendar"
                  disabled={isSubmitting}
                >
                  <CalendarBlank size={15} weight="bold" />
                  <span>Choose from Calendar</span>
                </button>

                <span className="rewind-duration-value font-ui">
                  {deliveryDays} Days
                </span>
              </div>
            </div>

            <div className="rewind-duration-presets">
              {PRESET_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`rewind-preset-btn ${deliveryDays === days ? 'active' : ''}`}
                  onClick={() => handleSliderChange(days)}
                  disabled={isSubmitting}
                >
                  {days === 1 ? '1 Day' : `${days} Days`}
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
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="rewind-duration-slider"
                disabled={isSubmitting}
                aria-label="Unlock timeframe slider"
              />
            </div>

            <div className="rewind-duration-range-limits font-ui">
              <span>Min: 1 day</span>
              <span className="rewind-duration-live-date font-body">
                Unlocks on <strong>{formattedSelectedDate}</strong>
              </span>
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
                <span>{isEdit ? 'Saving...' : isReschedule ? 'Updating...' : 'Sealing...'}</span>
              ) : isEdit ? (
                <>
                  <PencilSimple size={18} weight="bold" />
                  <span>Save Changes</span>
                </>
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

        {/* Centered Calendar Modal Overlay with Blurred Backdrop */}
        {showCalendarOverlay && (
          <div
            className="rewind-cal-overlay"
            onClick={() => setShowCalendarOverlay(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Select unlock date from calendar"
          >
            <div
              className="rewind-cal-popover-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rewind-cal-popover-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} weight="duotone" style={{ color: 'var(--burgundy-300, #f472b6)' }} />
                  <div>
                    <h4 className="rewind-cal-popover-title font-display">Choose Unlock Date</h4>
                    <span className="rewind-cal-popover-subtitle font-ui">Available for the next 3 months</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rewind-cal-popover-close"
                  onClick={() => setShowCalendarOverlay(false)}
                  aria-label="Close calendar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Month Navigation */}
              <div className="rewind-calendar-month-nav font-ui">
                <button
                  type="button"
                  className="rewind-cal-nav-btn"
                  onClick={handlePrevMonth}
                  disabled={!canGoPrevMonth}
                  aria-label="Previous month"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <span className="rewind-cal-month-title font-display">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  className="rewind-cal-nav-btn"
                  onClick={handleNextMonth}
                  disabled={!canGoNextMonth}
                  aria-label="Next month"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="rewind-calendar-weekdays-row font-ui">
                {DAY_NAMES.map((day) => (
                  <span key={day} className="rewind-calendar-weekday-cell">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="rewind-calendar-grid">
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                  <div key={`cal-offset-${index}`} className="rewind-cal-day-cell empty" />
                ))}

                {Array.from({ length: daysInCurrentMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const cellDate = new Date(viewYear, viewMonth, dayNum, 0, 0, 0, 0);

                  const isDisabled = cellDate < minSelectableDate || cellDate > maxSelectableDate;
                  const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();
                  const isCellToday = cellDate.getTime() === today.getTime();

                  return (
                    <button
                      key={`cal-day-${dayNum}`}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleCalendarDateSelect(cellDate)}
                      className={`rewind-cal-day-cell font-ui ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isCellToday ? 'today' : ''}`}
                      title={
                        isDisabled
                          ? cellDate < minSelectableDate
                            ? `Cannot select dates within 7 days`
                            : `Cannot select dates beyond 3 months`
                          : `Select ${cellDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      }
                    >
                      <span className="rewind-cal-day-number">{dayNum}</span>
                      {isSelected && <span className="rewind-cal-selected-dot" />}
                    </button>
                  );
                })}
              </div>

              <div className="rewind-cal-popover-footer font-ui">
                <div className="rewind-cal-footer-preview">
                  <span>Selected: <strong>{formattedSelectedDate}</strong></span>
                  <span className="rewind-cal-footer-pill">in {deliveryDays} days</span>
                </div>
                <button
                  type="button"
                  className="rewind-cal-apply-btn font-ui"
                  onClick={() => setShowCalendarOverlay(false)}
                >
                  <Check size={14} weight="bold" />
                  <span>Apply Date</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

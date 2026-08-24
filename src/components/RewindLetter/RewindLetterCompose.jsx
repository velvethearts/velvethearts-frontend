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
  Sparkle
} from '@phosphor-icons/react';
import { api } from '../../lib/api';

const MAX_CHARS = 500;
const MIN_DAYS = 7;
const MAX_DAYS = 90;
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

  // Calculated delivery days from baseDate
  const deliveryDays = useMemo(() => {
    if (!selectedDate) return MIN_DAYS;
    const diffMs = selectedDate.getTime() - baseDate.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(MIN_DAYS, Math.min(MAX_DAYS, days));
  }, [selectedDate, baseDate]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setContent('');
        const defaultDate = new Date(baseDate);
        defaultDate.setDate(defaultDate.getDate() + MIN_DAYS);
        defaultDate.setHours(0, 0, 0, 0);
        setSelectedDate(defaultDate);
        setViewYear(defaultDate.getFullYear());
        setViewMonth(defaultDate.getMonth());
      } else if (mode === 'edit') {
        setContent(initialContent || '');
        const existingDate = new Date(baseDate);
        existingDate.setDate(existingDate.getDate() + (initialDays || MIN_DAYS));
        existingDate.setHours(0, 0, 0, 0);
        const clampedDate = existingDate < minSelectableDate ? minSelectableDate : (existingDate > maxSelectableDate ? maxSelectableDate : existingDate);
        setSelectedDate(clampedDate);
        setViewYear(clampedDate.getFullYear());
        setViewMonth(clampedDate.getMonth());
      } else if (mode === 'reschedule') {
        setContent('');
        const existingDate = new Date(baseDate);
        existingDate.setDate(existingDate.getDate() + (initialDays || MIN_DAYS));
        existingDate.setHours(0, 0, 0, 0);
        const clampedDate = existingDate < minSelectableDate ? minSelectableDate : (existingDate > maxSelectableDate ? maxSelectableDate : existingDate);
        setSelectedDate(clampedDate);
        setViewYear(clampedDate.getFullYear());
        setViewMonth(clampedDate.getMonth());
      }
      setError('');
    }
  }, [isOpen, mode, initialContent, initialDays, baseDate, minSelectableDate, maxSelectableDate]);

  if (!isOpen) return null;

  const charCount = content.length;
  const remaining = MAX_CHARS - charCount;
  const isOverLimit = remaining < 0;
  const isValid = isReschedule ? true : (content.trim().length > 0 && !isOverLimit);

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

  // Generate calendar days for viewYear & viewMonth
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
                ? `Pick an unlock date within the next 3 months (minimum 7 days).`
                : isEdit
                ? `Edit your message or choose a new unlock date within 48 hours.`
                : `A private message sealed until your chosen future date.`}
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
                  <strong>Choose unlock date:</strong> Select a date between 7 days and 3 months. Your letter will safely remain sealed until then.
                </>
              ) : isEdit ? (
                <>
                  <strong>48-hour edit window:</strong> You can refine your message or change the unlock date. Once the 48-hour window closes, this letter is permanently locked in the time capsule.
                </>
              ) : (
                <>
                  <strong>48-hour grace edit window:</strong> Once sealed, you can edit or delete this letter within 48 hours. After 48 hours, it is permanently locked until the unlock date.
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
                rows={4}
                maxLength={MAX_CHARS + 50}
                disabled={isSubmitting}
                autoFocus
              />
              <div className={`rewind-char-counter ${remaining < 20 ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                {charCount} / {MAX_CHARS}
              </div>
            </div>
          )}

          {/* Interactive 3-Month Calendar Picker */}
          <div className="rewind-calendar-picker-section">
            <div className="rewind-calendar-picker-header">
              <span className="rewind-calendar-label font-ui">
                <Calendar size={16} weight="duotone" />
                <span>Choose Unlock Date (Next 3 Months)</span>
              </span>
              <span className="rewind-calendar-limit-tag font-ui">
                Min: 7 days · Max: 3 months
              </span>
            </div>

            <div className="rewind-calendar-widget">
              {/* Month Navigation */}
              <div className="rewind-calendar-month-nav font-ui">
                <button
                  type="button"
                  className="rewind-cal-nav-btn"
                  onClick={handlePrevMonth}
                  disabled={!canGoPrevMonth || isSubmitting}
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
                  disabled={!canGoNextMonth || isSubmitting}
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
                {/* Empty cells for leading offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                  <div key={`offset-${index}`} className="rewind-cal-day-cell empty" />
                ))}

                {/* Days of Current Month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const cellDate = new Date(viewYear, viewMonth, dayNum, 0, 0, 0, 0);

                  const isDisabled = cellDate < minSelectableDate || cellDate > maxSelectableDate;
                  const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();
                  const isCellToday = cellDate.getTime() === today.getTime();

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      disabled={isDisabled || isSubmitting}
                      onClick={() => setSelectedDate(cellDate)}
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

              {/* Selected Date Summary */}
              {selectedDate && (
                <div className="rewind-calendar-summary font-ui">
                  <div className="rewind-cal-summary-left">
                    <CalendarCheck size={16} weight="duotone" className="rewind-cal-summary-icon" />
                    <span>
                      Unlocks on <strong>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </span>
                  </div>
                  <span className="rewind-cal-summary-pill font-ui">
                    in {deliveryDays} days
                  </span>
                </div>
              )}
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
      </div>
    </div>
  );
};

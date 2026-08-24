import React, { useEffect } from 'react';
import {
  X,
  CaretLeft,
  CalendarBlank,
  Quotes,
  EnvelopeOpen,
  LockKey,
  Trash,
  Clock,
  Heart
} from '@phosphor-icons/react';

export const RewindLetterReaderModal = ({
  isOpen,
  onClose,
  letter,
  partnerName = 'Your Match',
  isSentByMe = false,
  onDeleteLetter,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !letter) return null;

  const authorName = isSentByMe ? 'You' : partnerName;

  const formatDeliveredDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWrittenDate = (dateStr) => {
    if (!dateStr) return 'on connection';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="rewind-reader-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-letter-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rewind-reader-parchment animate-fade">
        {/* Top Header Controls */}
        <div className="rewind-reader-header font-ui">
          <button
            type="button"
            className="rewind-reader-back-btn"
            onClick={onClose}
            aria-label="Back"
          >
            <CaretLeft size={18} weight="bold" />
            <span>Back to Vault</span>
          </button>

          <div className="rewind-reader-seal-badge font-ui">
            <span className="rewind-reader-seal-dot" />
            <span>Velvet Hearts Capsule</span>
          </div>

          <button
            type="button"
            className="rewind-reader-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Letter Metadata */}
        <div className="rewind-reader-meta-section">
          <div className="rewind-reader-meta-title-box">
            <h2 id="reader-letter-title" className="rewind-reader-title font-display">
              {isSentByMe ? `Letter for ${partnerName}` : `Letter from ${partnerName}`}
            </h2>
            <div className="rewind-reader-meta-tags font-ui">
              <span className="rewind-reader-date-tag">
                <CalendarBlank size={14} weight="duotone" />
                <span>
                  {letter.status === 'DELIVERED'
                    ? `Delivered on ${formatDeliveredDate(letter.deliveredAt)}`
                    : `Sealed on ${formatWrittenDate(letter.createdAt)}`}
                </span>
              </span>
              <span className={`rewind-reader-status-tag ${letter.status === 'DELIVERED' ? 'delivered' : 'sealed'}`}>
                {letter.status === 'DELIVERED' ? 'Delivered' : 'Sealed Time Capsule'}
              </span>
            </div>
          </div>
        </div>

        {/* Letter Parchment Body */}
        <div className="rewind-reader-body">
          <div className="rewind-reader-quotes-accent">
            <Quotes size={32} weight="fill" />
          </div>

          <div className="rewind-reader-letter-content font-body">
            {letter.content || 'Your letter content is safely preserved.'}
          </div>

          {/* Aesthetic Closing Signature */}
          <div className="rewind-reader-signature">
            <div className="rewind-reader-sig-line" />
            <div className="rewind-reader-sig-details">
              <span className="rewind-reader-sig-meta font-ui">
                Preserved since {formatWrittenDate(letter.createdAt)}
              </span>
              <span className="rewind-reader-sig-author font-display">
                With care, {authorName}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="rewind-reader-footer font-ui">
          <span className="rewind-reader-footer-note font-ui">
            Private memory between you and {partnerName}.
          </span>
          <div className="rewind-reader-footer-actions">
            {onDeleteLetter && (
              <button
                type="button"
                className="rewind-reader-delete-btn font-ui"
                onClick={() => {
                  onDeleteLetter(letter.id);
                  onClose();
                }}
              >
                <Trash size={15} weight="bold" />
                <span>Delete Letter</span>
              </button>
            )}
            <button
              type="button"
              className="rewind-reader-done-btn font-ui"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

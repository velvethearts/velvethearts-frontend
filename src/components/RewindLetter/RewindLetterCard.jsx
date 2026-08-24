import React, { useState } from 'react';
import { LockKey, EnvelopeOpen, X } from '@phosphor-icons/react';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';
import { RewindLetterReaderModal } from './RewindLetterReaderModal';

export const RewindLetterCard = ({ letter, partnerName }) => {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);

  const isAuthor = Boolean(letter?.isAuthor);
  const isSealed = letter?.status === 'SEALED';
  const isDelivered = letter?.status === 'DELIVERED';

  if (!letter) return null;

  const author = isAuthor ? 'You' : (partnerName || letter.authorName || 'Your match');
  const bannerTitle = isAuthor
    ? `Your Rewind Letter for ${partnerName || 'your match'}`
    : `Rewind Letter from ${author}`;

  const unlockDate = letter?.deliverAfter
    ? new Date(letter.deliverAfter).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleBannerClick = (e) => {
    e?.preventDefault();
    triggerHaptic('light');
    playHapticSound('pop');

    // If sealed and not the author, display the locked message modal
    if (isSealed && !isAuthor) {
      setIsLockedModalOpen(true);
    } else {
      // If unlocked/delivered (or author viewing their letter), open scroll animation
      setIsReaderOpen(true);
    }
  };

  return (
    <>
      <div
        className={`rewind-delivery-container ${isSealed ? 'is-locked-status' : 'is-unlocked-status'}`}
        role="region"
        aria-label="Rewind Letter Banner"
      >
        {/* Clickable Banner with Shimmer & Pulse Animation */}
        <button
          type="button"
          className="rewind-delivery-banner font-ui has-tap-cue"
          onClick={handleBannerClick}
          aria-label={bannerTitle}
        >
          <div className="rewind-delivery-icon-box tap-pulse-icon">
            {isSealed ? (
              <LockKey size={22} weight="duotone" className="rewind-delivery-icon" />
            ) : (
              <EnvelopeOpen size={22} weight="duotone" className="rewind-delivery-icon" />
            )}
          </div>

          <div className="rewind-delivery-text">
            <div className="rewind-delivery-title-row">
              <span className="rewind-delivery-title font-ui">
                {bannerTitle}
              </span>
              <span className="rewind-delivery-badge font-ui">
                {isSealed ? 'SEALED 🔒' : 'UNLOCKED 📜'}
              </span>
            </div>
            <p className="rewind-delivery-sub font-body">
              {isSealed
                ? (unlockDate ? `Sealed in a time capsule • Unlocks on ${unlockDate}` : 'Sealed in a time capsule • Tap to view')
                : 'Preserved time capsule letter • Tap to open scroll'}
            </p>
          </div>
        </button>
      </div>

      {/* Locked Capsule Info Modal */}
      {isLockedModalOpen && (
        <div
          className="rewind-locked-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="locked-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLockedModalOpen(false);
          }}
        >
          <div className="rewind-locked-modal-card font-ui">
            <button
              type="button"
              className="rewind-locked-modal-close-btn"
              onClick={() => setIsLockedModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="rewind-locked-modal-icon-glow">
              <LockKey size={38} weight="duotone" />
            </div>

            <h3 id="locked-modal-title" className="rewind-locked-modal-title font-display">
              {author} Sealed a Rewind Letter
            </h3>

            <p className="rewind-locked-modal-desc font-body">
              This time-capsule letter was written by {author}. It is safely encrypted in the Velvet Hearts vault and will automatically unlock on its scheduled delivery date.
            </p>

            <div className="rewind-locked-modal-date-badge font-ui">
              <LockKey size={14} weight="bold" />
              <span>Scheduled to unlock: {unlockDate || 'On delivery date'}</span>
            </div>

            <p className="rewind-locked-modal-note font-body">
              A private thought preserved from the beginning of your connection.
            </p>

            <button
              type="button"
              className="rewind-locked-modal-cta-btn font-ui"
              onClick={() => setIsLockedModalOpen(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Antique Parchment Reader Modal */}
      {isReaderOpen && (
        <RewindLetterReaderModal
          isOpen={isReaderOpen}
          letter={letter}
          isSentByMe={isAuthor}
          partnerName={partnerName || author}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </>
  );
};

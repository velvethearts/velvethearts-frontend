import React, { useState } from 'react';
import { EnvelopeSimple, EnvelopeOpen, LockKey, CaretRight, Sparkle } from '@phosphor-icons/react';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';
import { RewindLetterReaderModal } from './RewindLetterReaderModal';

export const RewindLetterCard = ({ letter, partnerName }) => {
  const [isReaderOpen, setIsReaderOpen] = useState(false);

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

  const handleOpenReader = (e) => {
    e?.preventDefault();
    triggerHaptic('match');
    playHapticSound('spark');
    setIsReaderOpen(true);
  };

  return (
    <>
      <div
        className={`rewind-delivery-container ${isSealed ? 'is-locked-status' : 'is-unlocked-status'}`}
        role="region"
        aria-label="Rewind Letter Banner"
      >
        {/* Interactive Scroll Opener Banner */}
        <button
          type="button"
          className="rewind-delivery-banner font-ui"
          onClick={handleOpenReader}
          aria-label={bannerTitle}
        >
          <div className="rewind-delivery-icon-box">
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
              <span className={`rewind-delivery-badge ${isSealed ? 'sealed-pill' : 'delivered-pill'} font-ui`}>
                {isSealed ? 'Sealed 🔒' : 'Delivered 📜'}
              </span>
            </div>
            <p className="rewind-delivery-sub font-body">
              {isSealed
                ? (unlockDate ? `Sealed in a time capsule • Unlocks on ${unlockDate}` : 'Sealed in a time capsule • Tap to view scroll')
                : 'A preserved time capsule scroll • Tap to open & read'}
            </p>
          </div>

          <div className="rewind-delivery-action-chip font-ui">
            <span>{isSealed ? 'View Scroll' : 'Open Scroll'}</span>
            <CaretRight size={15} weight="bold" />
          </div>
        </button>
      </div>

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

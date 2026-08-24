import React, { useState } from 'react';
import { EnvelopeSimple, EnvelopeOpen, Quotes, Heart, CaretDown, CaretUp, LockKey, PaperPlaneTilt } from '@phosphor-icons/react';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';

export const RewindLetterCard = ({ letter, partnerName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstOpenAnimation, setIsFirstOpenAnimation] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const isAuthor = Boolean(letter?.isAuthor);
  const isSealed = letter?.status === 'SEALED';
  const isDelivered = letter?.status === 'DELIVERED';

  const storageKey = letter?.id ? `vh-letter-unsealed-${letter.id}` : null;
  const [hasEverOpened, setHasEverOpened] = useState(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  if (!letter) return null;

  const author = isAuthor ? 'You' : (partnerName || letter.authorName || 'Your match');
  const deliveredDate = letter.deliveredAt
    ? new Date(letter.deliveredAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const writtenDate = letter.createdAt
    ? new Date(letter.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const handleToggleOpen = (e) => {
    e?.preventDefault();

    // If still sealed, just toggle info card with light haptic
    if (isSealed) {
      triggerHaptic('light');
      setIsOpen(prev => !prev);
      return;
    }

    // If delivered:
    if (!isOpen) {
      const isFirst = !hasEverOpened && !isAuthor;

      if (isFirst) {
        // Grand first-time unsealing effects for recipient
        setIsFirstOpenAnimation(true);
        triggerHaptic('match');
        playHapticSound('spark');

        // Generate 25 floating velvet hearts across the screen
        const hearts = Array.from({ length: 25 }).map((_, i) => ({
          id: Date.now() + i,
          left: `${10 + Math.random() * 80}%`,
          bottom: `${20 + Math.random() * 30}%`,
          delay: `${Math.random() * 0.4}s`,
          duration: `${1.4 + Math.random() * 1.0}s`,
          size: `${22 + Math.random() * 20}px`,
          drift: `${(Math.random() - 0.5) * 80}px`,
          rotate: `${(Math.random() - 0.5) * 60}deg`
        }));
        setFloatingHearts(hearts);

        if (storageKey) {
          try {
            localStorage.setItem(storageKey, 'true');
          } catch (_) {}
        }
        setHasEverOpened(true);

        setTimeout(() => {
          setIsFirstOpenAnimation(false);
          setFloatingHearts([]);
        }, 2400);
      } else {
        // Subsequent openings or sender view
        triggerHaptic('light');
        playHapticSound('pop');
      }

      setIsOpen(true);
    } else {
      // Closing letter
      triggerHaptic('light');
      setIsOpen(false);
      setIsFirstOpenAnimation(false);
      setFloatingHearts([]);
    }
  };

  return (
    <div
      className={`rewind-delivery-container ${isOpen ? 'is-opened' : 'is-sealed'} ${isSealed ? 'is-locked-status' : ''}`}
      role="region"
      aria-label="Rewind Letter Status"
    >
      {/* Full-screen floating hearts burst ONLY on recipient's first opening */}
      {isFirstOpenAnimation && floatingHearts.length > 0 && (
        <div className="rewind-fullscreen-hearts" aria-hidden="true">
          {floatingHearts.map(h => (
            <span
              key={h.id}
              className="rewind-floating-heart-burst"
              style={{
                left: h.left,
                bottom: h.bottom,
                animationDelay: h.delay,
                animationDuration: h.duration,
                fontSize: h.size,
                '--drift-x': h.drift,
                transform: `rotate(${h.rotate})`
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      {/* Interactive Envelope Banner */}
      <button
        type="button"
        className="rewind-delivery-banner"
        onClick={handleToggleOpen}
        aria-expanded={isOpen}
      >
        <div className={`rewind-delivery-icon-box ${isFirstOpenAnimation ? 'animate-seal-pop' : ''}`}>
          {isSealed ? (
            <LockKey size={24} weight="duotone" className="rewind-delivery-icon" />
          ) : isOpen ? (
            <EnvelopeOpen size={24} weight="duotone" className="rewind-delivery-icon" />
          ) : (
            <EnvelopeSimple size={24} weight="duotone" className="rewind-delivery-icon" />
          )}
        </div>

        <div className="rewind-delivery-text">
          <div className="rewind-delivery-title-row">
            <span className="rewind-delivery-title font-ui">
              Rewind Letter from {author}
            </span>
            <span className={`rewind-delivery-badge ${!hasEverOpened && !isAuthor && isDelivered ? 'new' : ''} font-ui`}>
              {isSealed ? 'Sealed 🔒' : (!hasEverOpened ? 'Tap to Unseal' : 'Unlocked')}
            </span>
          </div>
          <p className="rewind-delivery-sub font-body">
            {isOpen
              ? 'Tap to collapse'
              : isSealed
              ? 'Sealed in a time capsule • Unlocks on scheduled delivery date'
              : !hasEverOpened
              ? 'A sealed time capsule has arrived for you • Tap to unseal & read'
              : 'Sealed time capsule written when you connected • Tap to re-read'}
          </p>
        </div>

        <div className="rewind-delivery-toggle">
          {isOpen ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
        </div>
      </button>

      {/* Unfolded Content (Either Locked Info Card or Unlocked Letter) */}
      {isOpen && (
        <div className={`rewind-unfolded-card font-body ${isFirstOpenAnimation ? 'animate-grand-open' : 'animate-unfold'}`}>
          {isSealed ? (
            <div className="rewind-sealed-explanation">
              <div className="rewind-unfolded-header font-ui">
                <div className="rewind-unfolded-author-info">
                  <span className="rewind-unfolded-author font-display">Time Capsule Sealed</span>
                  <span className="rewind-unfolded-meta">Written {writtenDate ? `on ${writtenDate}` : 'when you matched'}</span>
                </div>
                <div className="rewind-unfolded-seal">
                  <LockKey size={16} weight="fill" className="rewind-seal-heart" />
                </div>
              </div>
              <div className="rewind-unfolded-body">
                <p className="rewind-unfolded-text font-body" style={{ fontStyle: 'normal' }}>
                  {author} tucked away a private letter when you first matched. It is safely locked in the Velvet Hearts vault and will automatically unlock on its scheduled delivery date.
                </p>
              </div>
              <div className="rewind-unfolded-footer font-ui">
                <span>A private thought preserved from the beginning of your connection.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="rewind-unfolded-header font-ui">
                <div className="rewind-unfolded-author-info">
                  <span className="rewind-unfolded-author font-display">{author}</span>
                  <span className="rewind-unfolded-meta">
                    Delivered on {deliveredDate}
                  </span>
                </div>
                <div className={`rewind-unfolded-seal ${isFirstOpenAnimation ? 'seal-stamp-pop' : ''}`}>
                  <Heart size={18} weight="fill" className="rewind-seal-heart" />
                </div>
              </div>

              <div className="rewind-unfolded-body">
                <Quotes size={26} weight="fill" className="rewind-unfolded-quote-icon" />
                <p className="rewind-unfolded-text font-body">
                  {letter.content}
                </p>

                {/* Aesthetic Letter Signature */}
                <div className="rewind-letter-signature">
                  <div className="rewind-signature-divider" />
                  <div className="rewind-signature-content">
                    <span className="rewind-signature-date font-ui">
                      Written on {writtenDate || 'connection day'}
                    </span>
                    <span className="rewind-signature-author font-display">
                      Sent with care, {author} <span className="rewind-signature-heart">❤️</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="rewind-unfolded-footer font-ui">
                <span>A private thought preserved from the beginning of your connection.</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

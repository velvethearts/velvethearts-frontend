import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  CaretLeft,
  CalendarBlank,
  Quotes,
  Trash,
  Sparkle,
  ArrowCounterClockwise,
  FastForward,
  PenNib,
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
  const fullText = letter?.content || '';
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const handleCloseWithRollIn = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  // Auto-scroll body as text is written
  useEffect(() => {
    if (isWriting && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [displayedLength, isWriting]);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseWithRollIn();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handwriting Animation Loop
  useEffect(() => {
    if (!isOpen || !fullText) {
      setDisplayedLength(0);
      setIsWriting(false);
      setIsCompleted(false);
      return;
    }

    // Reset and start handwriting after parchment unrolls (500ms)
    setDisplayedLength(0);
    setIsCompleted(false);
    setIsWriting(true);

    let currentIndex = 0;
    const totalChars = fullText.length;

    const writeNextChar = () => {
      if (currentIndex >= totalChars) {
        setIsWriting(false);
        setIsCompleted(true);
        return;
      }

      currentIndex += 1;
      setDisplayedLength(currentIndex);

      const char = fullText[currentIndex - 1];
      let delay = 22; // Base speed per char

      if (char === '.' || char === '!' || char === '?') {
        delay = 140; // Natural pause after sentences
      } else if (char === ',') {
        delay = 80;
      } else if (char === '\n') {
        delay = 120;
      }

      timeoutRef.current = setTimeout(writeNextChar, delay);
    };

    const initialDelay = setTimeout(() => {
      writeNextChar();
    }, 450);

    return () => {
      clearTimeout(initialDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, fullText]);

  const handleSkipAnimation = (e) => {
    if (e) e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayedLength(fullText.length);
    setIsWriting(false);
    setIsCompleted(true);
  };

  const handleReplay = (e) => {
    if (e) e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayedLength(0);
    setIsCompleted(false);
    setIsWriting(true);

    let currentIndex = 0;
    const totalChars = fullText.length;

    const writeNextChar = () => {
      if (currentIndex >= totalChars) {
        setIsWriting(false);
        setIsCompleted(true);
        return;
      }

      currentIndex += 1;
      setDisplayedLength(currentIndex);

      const char = fullText[currentIndex - 1];
      let delay = 20;

      if (char === '.' || char === '!' || char === '?') {
        delay = 140;
      } else if (char === ',') {
        delay = 80;
      } else if (char === '\n') {
        delay = 120;
      }

      timeoutRef.current = setTimeout(writeNextChar, delay);
    };

    timeoutRef.current = setTimeout(writeNextChar, 100);
  };

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

  const displayedText = fullText.slice(0, displayedLength);

  return (
    <div
      className={`rewind-reader-overlay ${isClosing ? 'closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-letter-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseWithRollIn();
      }}
    >
      {/* Parchment Scroll Roll Container (Animates as a unified scroll) */}
      <div className={`rewind-parchment-scroll-wrapper ${isClosing ? 'roll-in-closing' : 'unroll-opening'}`}>
        {/* Top Decorative Scroll Cylinder / Header Roller */}
        <div className="rewind-parchment-roller top">
          <div className="rewind-parchment-roller-cap left" />
          <div className="rewind-parchment-roller-rod" />
          <div className="rewind-parchment-roller-cap right" />
        </div>

        {/* Letter Parchment */}
        <div
          className="rewind-reader-parchment"
          onClick={isWriting ? handleSkipAnimation : undefined}
          title={isWriting ? 'Click to show entire letter' : undefined}
        >
          {/* Subtle Vintage Watermark */}
          <div className="rewind-parchment-watermark" aria-hidden="true">
            <Heart size={140} weight="duotone" />
          </div>

          {/* Top Header Controls */}
          <div className="rewind-reader-header font-ui">
            <button
              type="button"
              className="rewind-reader-back-btn"
              onClick={handleCloseWithRollIn}
              aria-label="Back"
            >
              <CaretLeft size={18} weight="bold" />
              <span>Back to Vault</span>
            </button>

            <div className="rewind-reader-seal-badge font-ui">
              <PenNib size={14} weight="duotone" style={{ color: 'var(--gold-400, #f59e0b)' }} />
              <span>Velvet Hearts Capsule</span>
            </div>

            <button
              type="button"
              className="rewind-reader-close-btn"
              onClick={handleCloseWithRollIn}
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

                {/* Animation Status / Skip Button */}
                {isWriting && (
                  <button
                    type="button"
                    className="rewind-reader-skip-btn font-ui"
                    onClick={handleSkipAnimation}
                    title="Skip typing animation"
                  >
                    <FastForward size={13} weight="bold" />
                    <span>Show All</span>
                  </button>
                )}

                {isCompleted && (
                  <button
                    type="button"
                    className="rewind-reader-replay-btn font-ui"
                    onClick={handleReplay}
                    title="Replay handwriting animation"
                  >
                    <ArrowCounterClockwise size={13} weight="bold" />
                    <span>Replay Pen</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Letter Parchment Body with Handwriting */}
          <div className="rewind-reader-body" ref={scrollContainerRef}>
            <div className="rewind-reader-quotes-accent">
              <Quotes size={32} weight="fill" />
            </div>

            <div className="rewind-reader-letter-handwriting">
              {displayedText}
              {isWriting && <span className="rewind-ink-pen-cursor" />}
            </div>

            {/* Aesthetic Closing Signature */}
            <div className={`rewind-reader-signature ${isCompleted ? 'visible' : ''}`}>
              <div className="rewind-reader-sig-line" />
              <div className="rewind-reader-sig-details">
                <span className="rewind-reader-sig-meta font-ui">
                  Preserved since {formatWrittenDate(letter.createdAt)}
                </span>
                <span className="rewind-reader-sig-author font-handwriting-sig">
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
                  className="rewind-reader-delete-icon-btn"
                  title="Delete Letter"
                  aria-label="Delete Letter"
                  onClick={() => {
                    onDeleteLetter(letter.id);
                    handleCloseWithRollIn();
                  }}
                >
                  <Trash size={17} weight="bold" />
                </button>
              )}
              <button
                type="button"
                className="rewind-reader-done-btn font-ui"
                onClick={handleCloseWithRollIn}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Scroll Cylinder / Footer Roller */}
        <div className="rewind-parchment-roller bottom">
          <div className="rewind-parchment-roller-cap left" />
          <div className="rewind-parchment-roller-rod" />
          <div className="rewind-parchment-roller-cap right" />
        </div>
      </div>
    </div>
  );
};

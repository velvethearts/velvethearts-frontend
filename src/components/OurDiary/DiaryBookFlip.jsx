import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  Heart,
  Sparkle,
  CaretRight,
  Quotes,
  Trash
} from '@phosphor-icons/react';

/**
 * Individual Flippable Page Leaf with ref forwarding for StPageFlip
 */
const DiaryPageLeaf = forwardRef(({ className = '', density = 'soft', children, onClick }, ref) => {
  return (
    <div
      ref={ref}
      className={`diary-leaf-page ${className}`}
      data-density={density}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

DiaryPageLeaf.displayName = 'DiaryPageLeaf';

/**
 * Velvet Hearts — Realistic PageFlip Book Component
 * Supports full-height edge tapping, touch swipe gestures, and theme adaptive styling
 */
export const DiaryBookFlip = forwardRef(({
  pages = [],
  userName = 'You',
  partnerName = 'Partner',
  onDeleteEntry,
  onPageFlip,
  VoicePlayerComponent
}, ref) => {
  const flipBookRef = useRef(null);
  const touchStartRef = useRef(null);

  const [dimensions, setDimensions] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isShort = typeof window !== 'undefined' && window.innerHeight < 720;
    const w = isMobile ? Math.min(window.innerWidth - 60, 240) : 280;
    const h = isShort || isMobile ? Math.min(window.innerHeight - 320, 330) : 380;
    return { width: Math.max(w, 220), height: Math.max(h, 290) };
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const isShort = window.innerHeight < 720;
      const w = isMobile ? Math.min(window.innerWidth - 60, 240) : 280;
      const h = isShort || isMobile ? Math.min(window.innerHeight - 320, 330) : 380;
      setDimensions({ width: Math.max(w, 220), height: Math.max(h, 290) });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expose flip methods to parent
  useImperativeHandle(ref, () => ({
    flipNext: () => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        if (pf) pf.flipNext('top');
      } catch (e) {
        console.warn('flipNext error:', e);
      }
    },
    flipPrev: () => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        if (pf) pf.flipPrev('top');
      } catch (e) {
        console.warn('flipPrev error:', e);
      }
    },
    goToCover: () => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        if (pf) {
          pf.turnToPage(0);
        }
      } catch (e) {
        console.warn('goToCover error:', e);
      }
    },
    turnToPage: (pageIndex) => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        if (pf) {
          if (pageIndex === 0) {
            pf.turnToPage(0); // Cover
          } else {
            pf.turnToPage(pageIndex + 1); // Day page
          }
        }
      } catch (e) {
        console.warn('turnToPage error:', e);
      }
    },
    getCurrentPageIndex: () => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        return pf ? pf.getCurrentPageIndex() : 0;
      } catch (e) {
        return 0;
      }
    }
  }));

  const handleFlipNext = (e) => {
    e?.stopPropagation?.();
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (pf) pf.flipNext('top');
    } catch (err) {
      console.warn('flipNext error:', err);
    }
  };

  const handleFlipPrev = (e) => {
    e?.stopPropagation?.();
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (pf) pf.flipPrev('top');
    } catch (err) {
      console.warn('flipPrev error:', err);
    }
  };

  // Touch Swipe Handlers for mobile responsiveness
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches || !e.changedTouches[0]) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Horizontal swipe detected
    if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 500) {
      if (deltaX < 0) {
        handleFlipNext();
      } else {
        handleFlipPrev();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      className="diary-st-pageflip-viewport font-ui"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        size="fixed"
        minWidth={220}
        maxWidth={320}
        minHeight={290}
        maxHeight={440}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={false}
        useMouseEvents={true}
        swipeDistance={20}
        clickEventForward={true}
        usePortrait={true}
        startPage={0}
        onFlip={(e) => onPageFlip?.(e.data)}
        ref={flipBookRef}
        className="diary-st-pageflip-book"
        style={{ margin: '0 auto' }}
      >
        {/* =========================================================
            LEAF 0: FRONT HARDCOVER (BURGUNDY & GOLD EMBOSSED)
            ========================================================= */}
        <DiaryPageLeaf
          density="hard"
          className="diary-cover-leaf"
          onClick={handleFlipNext}
        >
          <div className="diary-cover-spine-edge" />
          <div className="diary-cover-inner-panel">
            <div className="diary-cover-gold-border">
              <div className="diary-cover-emblem">
                <Heart size={34} weight="duotone" />
              </div>

              <h2 className="diary-cover-main-title font-display">Our Diary</h2>

              <p className="diary-cover-names font-display">
                {userName || 'You'} &amp; {partnerName || 'Partner'}
              </p>

              <div className="diary-cover-count-badge font-ui">
                <Sparkle size={11} weight="fill" />
                <span>{pages.length} {pages.length === 1 ? 'Day Saved' : 'Days Saved'}</span>
              </div>

              <div className="diary-cover-tap-prompt font-ui">
                <span>Tap to open</span>
                <CaretRight size={12} weight="bold" />
              </div>
            </div>
          </div>
        </DiaryPageLeaf>

        {/* =========================================================
            LEAF 1..N: INDIVIDUAL DAY-PAGES (CRISP THEMED PAPER)
            ========================================================= */}
        {pages.map((dayGroup, pageIndex) => (
          <DiaryPageLeaf
            key={dayGroup.dayKey || pageIndex}
            density="soft"
            className="diary-inner-white-leaf"
          >
            <div className="diary-leaf-paper-surface">
              {/* Full-height Tap-to-Flip Zones along the sides of the page */}
              <div
                className="diary-leaf-click-zone right"
                onClick={handleFlipNext}
                title="Tap right edge to flip next"
                aria-label="Next page"
              />
              <div
                className="diary-leaf-click-zone left"
                onClick={handleFlipPrev}
                title="Tap left edge to flip previous"
                aria-label="Previous page"
              />

              {/* Day Header */}
              <div className="diary-leaf-header">
                <h3 className="diary-leaf-date font-display">{dayGroup.dateLabel}</h3>
                <span className="diary-leaf-counter font-ui">
                  {pageIndex + 1}/{pages.length}
                </span>
              </div>

              <div className="diary-leaf-divider" />

              {/* Day Memories Scrapbook List */}
              <div className="diary-leaf-scroll-content">
                {(!dayGroup.items || dayGroup.items.length === 0) ? (
                  <div className="diary-leaf-empty font-ui">
                    <Heart size={24} weight="duotone" className="text-burgundy" />
                    <p className="diary-leaf-empty-text font-body">No memories recorded on this day.</p>
                  </div>
                ) : (
                  dayGroup.items.map((entry) => {
                    if (!entry) return null;
                    const isMine = Boolean(entry.isMine);
                    const timeStr = entry.createdAt
                      ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const sourceType = (entry.sourceType || 'MESSAGE').toUpperCase();

                    return (
                      <div key={entry.id || Math.random()} className={`diary-leaf-entry-item type-${sourceType.toLowerCase()}`}>
                        {/* Metadata row */}
                        <div className="diary-leaf-entry-meta">
                          <span className="diary-leaf-author font-ui">
                            <span className="diary-leaf-author-dot" />
                            <span>{isMine ? 'Saved by you' : `Saved by ${entry.savedByName || partnerName || 'Partner'}`}</span>
                            {timeStr && <span className="diary-leaf-time">· {timeStr}</span>}
                          </span>

                          {isMine && entry.id && (
                            <button
                              type="button"
                              className="diary-leaf-del-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEntry?.(entry.id);
                              }}
                              title="Delete this memory"
                              aria-label="Delete this memory"
                            >
                              <Trash size={12} />
                            </button>
                          )}
                        </div>

                        {/* 1. Quote Message */}
                        {sourceType === 'MESSAGE' && entry.content && (
                          <div className="diary-leaf-quote-box font-display">
                            <Quotes size={14} weight="fill" className="diary-leaf-quote-mark" />
                            <div className="diary-leaf-quote-body">
                              <p className="diary-leaf-quote-text font-body">{entry.content}</p>
                              {entry.caption && (
                                <p className="diary-leaf-caption font-ui">{entry.caption}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. Written Note */}
                        {sourceType === 'NOTE' && entry.content && (
                          <div className="diary-leaf-note-box">
                            <p className="diary-leaf-note-text font-display">{entry.content}</p>
                            {entry.caption && (
                              <p className="diary-leaf-caption font-ui">{entry.caption}</p>
                            )}
                          </div>
                        )}

                        {/* 3. Voice Note */}
                        {sourceType === 'VOICE_NOTE' && entry.attachmentUrl && VoicePlayerComponent && (
                          <div className="diary-leaf-voice-box">
                            <VoicePlayerComponent url={entry.attachmentUrl} />
                            {entry.caption && (
                              <p className="diary-leaf-caption font-ui">{entry.caption}</p>
                            )}
                          </div>
                        )}

                        {/* 4. Polaroid Photo */}
                        {sourceType === 'IMAGE' && entry.attachmentUrl && (
                          <div className="diary-leaf-polaroid-box">
                            <div className="diary-leaf-washi-tape" />
                            <div className="diary-leaf-photo-frame">
                              <img
                                src={entry.attachmentUrl}
                                alt="Memory"
                                className="diary-leaf-photo-img"
                                loading="lazy"
                              />
                            </div>
                            {entry.caption && (
                              <p className="diary-leaf-polaroid-caption font-display">{entry.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Page Footer Curl / Turn Hint */}
              <div className="diary-leaf-footer font-ui" onClick={handleFlipNext}>
                <span className="diary-leaf-footer-num">Page {pageIndex + 1}</span>
                <span className="diary-leaf-curl-hint">
                  <span>Tap anywhere to flip</span>
                  <CaretRight size={11} weight="bold" />
                </span>
              </div>
            </div>
          </DiaryPageLeaf>
        ))}

        {/* =========================================================
            LEAF N+1: BACK HARDCOVER
            ========================================================= */}
        <DiaryPageLeaf density="hard" className="diary-back-cover-leaf">
          <div className="diary-back-cover-inner">
            <div className="diary-back-cover-emblem">
              <Heart size={28} weight="duotone" />
            </div>
            <p className="diary-back-cover-text font-display">
              “To all our cherished moments, big and small.”
            </p>
            <span className="diary-back-cover-brand font-ui">Velvet Hearts</span>
          </div>
        </DiaryPageLeaf>
      </HTMLFlipBook>
    </div>
  );
});

DiaryBookFlip.displayName = 'DiaryBookFlip';
export default DiaryBookFlip;

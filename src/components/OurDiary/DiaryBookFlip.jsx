import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  Sparkle,
  CaretRight,
  Quotes,
  Trash
} from '@phosphor-icons/react';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';

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

const COUPLE_COVER_QUOTES = [
  "“Where you are, that is where home is.”",
  "“Together is my favorite place to be.”",
  "“You are my today and all of my tomorrows.”",
  "“In you, I found my love and my safe haven.”",
  "“Every moment with you is a memory I cherish.”",
  "“You make the ordinary feel like magic.”",
  "“Whatever our souls are made of, yours and mine are one.”",
  "“With you, every day is another page in our story.”",
  "“Loving you is the easiest thing I have ever done.”",
  "“Two hearts, one story written in velvet.”",
  "“In a sea of people, my eyes will always search for you.”",
  "“Held close in thought, forever in my heart.”",
  "“Every chapter with you only gets sweeter.”",
  "“You are the melody in the quiet of my heart.”",
  "“A lifetime of cherished moments, starting with you.”"
];

function getDeterministicQuote(name1 = '', name2 = '') {
  const combined = `${(name1 || '').toLowerCase().trim()}_${(name2 || '').toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COUPLE_COVER_QUOTES.length;
  return COUPLE_COVER_QUOTES[index];
}

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

  const coupleQuote = React.useMemo(() => {
    return getDeterministicQuote(userName, partnerName);
  }, [userName, partnerName]);

  const [dimensions, setDimensions] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isShort = typeof window !== 'undefined' && window.innerHeight < 700;
    const w = isMobile ? Math.min(window.innerWidth - 36, 325) : 340;
    const h = isShort ? Math.min(window.innerHeight - 240, 420) : (isMobile ? 440 : 475);
    return { width: Math.max(w, 290), height: Math.max(h, 400) };
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const isShort = window.innerHeight < 700;
      const w = isMobile ? Math.min(window.innerWidth - 36, 325) : 340;
      const h = isShort ? Math.min(window.innerHeight - 240, 420) : (isMobile ? 440 : 475);
      setDimensions({ width: Math.max(w, 290), height: Math.max(h, 400) });
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
        minWidth={250}
        maxWidth={360}
        minHeight={350}
        maxHeight={500}
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
              {/* 1. Top Section: Logo, Title, Couple Names & Edition */}
              <div className="diary-cover-top-group">
                <div className="diary-cover-emblem">
                  <img src={velvetHeartLogo} alt="Velvet Hearts" className="diary-cover-logo-img" />
                </div>

                <h2 className="diary-cover-main-title font-display">Our Diary</h2>

                <p className="diary-cover-names font-display">
                  {userName || 'You'} &amp; {partnerName || 'Partner'}
                </p>

              </div>

              {/* 2. Middle Centerpiece: Personalized Romantic Inscription Plaque */}
              <div className="diary-cover-quote-wrapper">
                <div className="diary-cover-quote-plaque">
                  <div className="diary-cover-flourish-line">
                  </div>
                  <p className="diary-cover-quote-text font-display">
                    {coupleQuote}
                  </p>
                  <div className="diary-cover-flourish-line bottom">
                  </div>
                </div>
              </div>

              {/* 3. Bottom Section: Counter Badge & Tap prompt */}
              <div className="diary-cover-bottom-group font-ui">
                <div className="diary-cover-count-badge font-ui">
                  <Sparkle size={12} weight="fill" />
                  <span>{pages.length} {pages.length === 1 ? 'Day Saved' : 'Days Saved'}</span>
                </div>

                <div className="diary-cover-tap-prompt font-ui">
                  <span>Tap to open diary</span>
                  <CaretRight size={13} weight="bold" />
                </div>
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
              {/* Day Header */}
              <div className="diary-leaf-header">
                <h3 className="diary-leaf-date font-display">{dayGroup.dateLabel}</h3>
                <span className="diary-leaf-counter font-ui">
                  {pageIndex + 1}/{pages.length}
                </span>
              </div>

              <div className="diary-leaf-divider" />

              {/* Day Memories Scrapbook List */}
              <div
                className="diary-leaf-scroll-content"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {(!dayGroup.items || dayGroup.items.length === 0) ? (
                  <div className="diary-leaf-empty font-ui">
                    <img src={velvetHeartLogo} alt="Velvet Hearts" className="diary-empty-logo-img" />
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
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDeleteEntry?.(entry.id);
                              }}
                              title="Delete this memory"
                              aria-label="Delete this memory"
                            >
                              <Trash size={14} />
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

                        {/* 5. Video Memory */}
                        {sourceType === 'VIDEO' && entry.attachmentUrl && (
                          <div className="diary-leaf-video-box">
                            <div className="diary-leaf-washi-tape" />
                            <div className="diary-leaf-video-frame">
                              <video
                                src={entry.attachmentUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="diary-leaf-video-element"
                                onClick={(e) => e.stopPropagation()}
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
              <img src={velvetHeartLogo} alt="Velvet Hearts" className="diary-cover-logo-img" />
            </div>
            <p className="diary-back-cover-text font-display">
              “Every love story is beautiful, but ours is my favorite.”
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

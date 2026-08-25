import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { PageFlip } from 'page-flip';
import {
  Heart,
  Sparkle,
  CaretRight,
  Quotes,
  Trash
} from '@phosphor-icons/react';

/**
 * Velvet Hearts — Realistic PageFlip Book Component
 * Powered by StPageFlip (page-flip) engine for authentic physics, shadows & corner curl
 */

export const DiaryBookFlip = forwardRef(({
  pages = [],
  userName = 'You',
  partnerName = 'Partner',
  onDeleteEntry,
  onPageFlip,
  VoicePlayerComponent
}, ref) => {
  const bookContainerRef = useRef(null);
  const pageFlipInstance = useRef(null);

  // Expose flip methods to parent (for < > arrows and date drawer)
  useImperativeHandle(ref, () => ({
    flipNext: () => {
      if (pageFlipInstance.current) {
        pageFlipInstance.current.flipNext('top');
      }
    },
    flipPrev: () => {
      if (pageFlipInstance.current) {
        pageFlipInstance.current.flipPrev('top');
      }
    },
    turnToPage: (pageIndex) => {
      if (pageFlipInstance.current) {
        // page 0 is Cover, so day page index `i` maps to page `i + 1`
        pageFlipInstance.current.turnToPage(pageIndex + 1);
      }
    },
    getCurrentPageIndex: () => {
      return pageFlipInstance.current ? pageFlipInstance.current.getCurrentPageIndex() : 0;
    }
  }));

  useEffect(() => {
    if (!bookContainerRef.current) return;

    // Determine dimensions based on screen width
    const isMobile = window.innerWidth < 640;
    const pageWidth = isMobile ? Math.min(window.innerWidth - 40, 320) : 340;
    const pageHeight = isMobile ? 460 : 500;

    let pf = null;

    try {
      pf = new PageFlip(bookContainerRef.current, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        minWidth: 260,
        maxWidth: 380,
        minHeight: 400,
        maxHeight: 560,
        maxShadowOpacity: 0.6,
        showCover: true,
        mobileScrollSupport: false,
        useMouseEvents: true,
        swipeDistance: 25,
        clickEventForward: true,
        usePortrait: true, // single-page view with spine on left
        startPage: 0
      });

      const pageElements = bookContainerRef.current.querySelectorAll('.diary-leaf-page');
      if (pageElements && pageElements.length > 0) {
        pf.loadFromHTML(pageElements);
      }

      pf.on('flip', (e) => {
        const pageIdx = e.data; // 0 = cover, 1 = day 1, etc.
        onPageFlip?.(pageIdx);
      });

      pageFlipInstance.current = pf;
    } catch (err) {
      console.error('Error initializing PageFlip:', err);
    }

    return () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
        pageFlipInstance.current = null;
      }
    };
  }, [pages.length]);

  const handleCoverClick = (e) => {
    // If click was on cover, flip open!
    if (pageFlipInstance.current) {
      pageFlipInstance.current.flipNext('top');
    }
  };

  return (
    <div className="diary-st-pageflip-viewport font-ui">
      <div ref={bookContainerRef} className="diary-st-pageflip-book">
        {/* =========================================================
            LEAF 0: FRONT HARDCOVER (BURGUNDY & GOLD EMBOSSED)
            ========================================================= */}
        <div
          className="diary-leaf-page diary-cover-leaf"
          data-density="hard"
          onClick={handleCoverClick}
        >
          <div className="diary-cover-spine-edge" />
          <div className="diary-cover-inner-panel">
            <div className="diary-cover-gold-border">
              <div className="diary-cover-emblem">
                <Heart size={42} weight="duotone" />
              </div>

              <h2 className="diary-cover-main-title font-display">Our Diary</h2>

              <p className="diary-cover-names font-display">
                {userName || 'You'} &amp; {partnerName || 'Partner'}
              </p>

              <div className="diary-cover-count-badge font-ui">
                <Sparkle size={12} weight="fill" />
                <span>{pages.length} {pages.length === 1 ? 'Day of Memories' : 'Days of Memories'}</span>
              </div>

              <div className="diary-cover-tap-prompt font-ui">
                <span>Tap to Open</span>
                <CaretRight size={14} weight="bold" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            LEAF 1..N: INDIVIDUAL DAY-PAGES (CRISP WHITE PAPER)
            ========================================================= */}
        {pages.map((dayGroup, pageIndex) => {
          return (
            <div
              key={dayGroup.dayKey || pageIndex}
              className="diary-leaf-page diary-inner-white-leaf"
              data-density="soft"
            >
              <div className="diary-leaf-paper-surface">
                {/* Day Header */}
                <div className="diary-leaf-header">
                  <h3 className="diary-leaf-date font-display">{dayGroup.dateLabel}</h3>
                  <span className="diary-leaf-counter font-ui">
                    {pageIndex + 1} / {pages.length}
                  </span>
                </div>

                <div className="diary-leaf-divider" />

                {/* Day Memories Scrapbook List */}
                <div className="diary-leaf-scroll-content">
                  {(!dayGroup.items || dayGroup.items.length === 0) ? (
                    <div className="diary-leaf-empty font-ui">
                      <Heart size={28} weight="duotone" className="text-burgundy" />
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
                                <Trash size={13} />
                              </button>
                            )}
                          </div>

                          {/* 1. Quote Message */}
                          {sourceType === 'MESSAGE' && entry.content && (
                            <div className="diary-leaf-quote-box font-display">
                              <Quotes size={16} weight="fill" className="diary-leaf-quote-mark" />
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

                          {/* 4. Polaroid Photo (Physical print look, clean img) */}
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
                <div className="diary-leaf-footer font-ui">
                  <span className="diary-leaf-footer-num">Page {pageIndex + 1}</span>
                  <span className="diary-leaf-curl-hint">
                    <span>Drag or click corner to flip</span>
                    <CaretRight size={11} weight="bold" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================
            LEAF N+1: BACK HARDCOVER
            ========================================================= */}
        <div className="diary-leaf-page diary-back-cover-leaf" data-density="hard">
          <div className="diary-back-cover-inner">
            <div className="diary-back-cover-emblem">
              <Heart size={32} weight="duotone" />
            </div>
            <p className="diary-back-cover-text font-display">
              “To all our cherished moments, big and small.”
            </p>
            <span className="diary-back-cover-brand font-ui">Velvet Hearts</span>
          </div>
        </div>
      </div>
    </div>
  );
});

DiaryBookFlip.displayName = 'DiaryBookFlip';
export default DiaryBookFlip;

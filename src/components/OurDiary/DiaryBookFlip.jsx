import React, { useRef, useImperativeHandle, forwardRef } from 'react';
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
 * Powered by react-pageflip (StPageFlip)
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
    turnToPage: (pageIndex) => {
      try {
        const pf = flipBookRef.current?.pageFlip();
        if (pf) {
          // page 0 = cover, page 1 = day 1
          pf.turnToPage(pageIndex + 1);
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

  const handleCoverClick = () => {
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (pf) pf.flipNext('top');
    } catch (e) {
      console.warn('cover click error:', e);
    }
  };

  const isMobile = window.innerWidth < 640;
  const bookWidth = isMobile ? Math.min(window.innerWidth - 48, 320) : 340;
  const bookHeight = isMobile ? 460 : 490;

  return (
    <div className="diary-st-pageflip-viewport font-ui">
      <HTMLFlipBook
        width={bookWidth}
        height={bookHeight}
        size="fixed"
        minWidth={260}
        maxWidth={380}
        minHeight={400}
        maxHeight={560}
        maxShadowOpacity={0.6}
        showCover={true}
        mobileScrollSupport={false}
        useMouseEvents={true}
        swipeDistance={25}
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
        </DiaryPageLeaf>

        {/* =========================================================
            LEAF 1..N: INDIVIDUAL DAY-PAGES (CRISP WHITE PAPER)
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
              <div className="diary-leaf-footer font-ui">
                <span className="diary-leaf-footer-num">Page {pageIndex + 1}</span>
                <span className="diary-leaf-curl-hint">
                  <span>Drag or click corner to flip</span>
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
              <Heart size={32} weight="duotone" />
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

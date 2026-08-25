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
 * Isolated DOM Container pattern to prevent React virtual-DOM unmount/reconciliation conflicts
 */

export const DiaryBookFlip = forwardRef(({
  pages = [],
  userName = 'You',
  partnerName = 'Partner',
  onDeleteEntry,
  onPageFlip,
  VoicePlayerComponent
}, ref) => {
  const mountRef = useRef(null);
  const templateRef = useRef(null);
  const pageFlipInstance = useRef(null);

  // Expose flip methods to parent (for < > arrows and date drawer)
  useImperativeHandle(ref, () => ({
    flipNext: () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.flipNext('top');
        } catch (e) {
          console.warn('flipNext error:', e);
        }
      }
    },
    flipPrev: () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.flipPrev('top');
        } catch (e) {
          console.warn('flipPrev error:', e);
        }
      }
    },
    turnToPage: (pageIndex) => {
      if (pageFlipInstance.current) {
        try {
          // page 0 is Cover, so day page index `i` maps to page `i + 1`
          pageFlipInstance.current.turnToPage(pageIndex + 1);
        } catch (e) {
          console.warn('turnToPage error:', e);
        }
      }
    },
    getCurrentPageIndex: () => {
      return pageFlipInstance.current ? pageFlipInstance.current.getCurrentPageIndex() : 0;
    }
  }));

  useEffect(() => {
    if (!mountRef.current || !templateRef.current) return;

    // Clean up any existing book in mountRef
    if (pageFlipInstance.current) {
      try {
        pageFlipInstance.current.destroy();
      } catch (e) {}
      pageFlipInstance.current = null;
    }
    mountRef.current.innerHTML = '';

    const isMobile = window.innerWidth < 640;
    const pageWidth = isMobile ? Math.min(window.innerWidth - 40, 320) : 340;
    const pageHeight = isMobile ? 460 : 500;

    // Clone templates into mount container to avoid React reconciliation conflicts
    const rawPages = templateRef.current.querySelectorAll('.diary-leaf-page');
    if (!rawPages || rawPages.length === 0) return;

    const clonedElements = [];
    rawPages.forEach((el) => {
      const clone = el.cloneNode(true);
      mountRef.current.appendChild(clone);
      clonedElements.push(clone);
    });

    // Wire up event listeners on cloned DOM
    clonedElements.forEach((el, index) => {
      // 1. Cover click to open
      if (index === 0) {
        el.addEventListener('click', () => {
          if (pageFlipInstance.current) {
            pageFlipInstance.current.flipNext('top');
          }
        });
      }

      // 2. Delete button clicks
      const delBtns = el.querySelectorAll('.diary-leaf-del-btn');
      delBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const entryId = btn.getAttribute('data-entry-id');
          if (entryId) {
            onDeleteEntry?.(entryId);
          }
        });
      });

      // 3. Audio voice play button clicks
      const voicePlayBtns = el.querySelectorAll('.diary-cloned-voice-play-btn');
      voicePlayBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const audioEl = btn.parentElement.querySelector('audio');
          if (audioEl) {
            if (audioEl.paused) {
              audioEl.play().catch(console.error);
              btn.classList.add('playing');
            } else {
              audioEl.pause();
              btn.classList.remove('playing');
            }
          }
        });
      });
    });

    let pf = null;
    try {
      pf = new PageFlip(mountRef.current, {
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
        usePortrait: true,
        startPage: 0
      });

      pf.loadFromHTML(clonedElements);

      pf.on('flip', (e) => {
        onPageFlip?.(e.data);
      });

      pageFlipInstance.current = pf;
    } catch (err) {
      console.error('Error initializing PageFlip:', err);
    }

    return () => {
      if (pageFlipInstance.current) {
        try {
          pageFlipInstance.current.destroy();
        } catch (e) {}
        pageFlipInstance.current = null;
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [pages]);

  return (
    <div className="diary-st-pageflip-viewport font-ui">
      {/* Real PageFlip container where cloned nodes live */}
      <div ref={mountRef} className="diary-st-pageflip-book" />

      {/* Hidden React templates — React manages these safely off-screen */}
      <div ref={templateRef} style={{ display: 'none' }} aria-hidden="true">
        {/* =========================================================
            LEAF 0: FRONT HARDCOVER (BURGUNDY & GOLD EMBOSSED)
            ========================================================= */}
        <div className="diary-leaf-page diary-cover-leaf" data-density="hard">
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
                                data-entry-id={entry.id}
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
                          {sourceType === 'VOICE_NOTE' && entry.attachmentUrl && (
                            <div className="diary-leaf-voice-box">
                              <div className="diary-voice-ribbon font-ui">
                                <audio src={entry.attachmentUrl} preload="metadata" />
                                <button type="button" className="diary-voice-play-btn diary-cloned-voice-play-btn" aria-label="Play voice note">
                                  ▶
                                </button>
                                <div className="diary-voice-waveform-track">
                                  <div className="diary-voice-wave-bars">
                                    {[35, 65, 30, 80, 55, 95, 40, 75, 50, 90, 35, 70, 45, 85, 60, 35].map((h, i) => (
                                      <span key={i} className="diary-wave-bar filled" style={{ height: `${h}%` }} />
                                    ))}
                                  </div>
                                </div>
                                <span className="diary-voice-time font-ui">Voice Note</span>
                              </div>
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

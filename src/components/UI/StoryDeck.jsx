import React, { useState, useEffect, useRef } from 'react';
import { computeVibeMatch } from '../../utils/vibe';
import {
  Heart,
  X,
  Star,
  Sparkle,
  ChatCircleText,
  CaretLeft,
  CaretRight,
  Bookmark,
  ArrowCounterClockwise,
  PaperPlaneTilt,
  ArrowUp
} from '@phosphor-icons/react';
import { getDefaultAvatar, extractPhotoUrls } from '../../utils/avatar';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';
import { PromptReactionModal } from './PromptReactionModal';
import { ProtectedImage } from './ProtectedImage';
import { VerifiedBadge } from './VerifiedBadge';

export const StoryDeck = ({
  profiles = [],
  interestsSent = [],
  savedProfiles = [],
  userProfile = {},
  feedMode = 'for_you',
  onSendInterest,
  onUnsendInterest,
  onPassProfile,
  onUnpassProfile,
  onSaveProfile,
  onSelectProfile,
}) => {
  const currentIndex = 0;
  const [swipeHistory, setSwipeHistory] = useState([]); // Undo stack
  const [photoIndices, setPhotoIndices] = useState({}); // photo index per profile id

  const [showSwipeGuide, setShowSwipeGuide] = useState(true);

  const completeSwipeGuide = () => {
    setShowSwipeGuide(false);
  };

  // Reaction Modal State
  const [reactionTarget, setReactionTarget] = useState(null); // { isOpen, profile, targetType, targetContent }

  // Gesture Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const activeProfile = profiles[currentIndex] || null;

  const vibeScore = computeVibeMatch(userProfile, activeProfile);

  // Current photo index for active profile
  const currentPhotoIndex = activeProfile ? (photoIndices[activeProfile.id] || 0) : 0;
  const photosList = activeProfile ? extractPhotoUrls(activeProfile) : [];
  const displayPhotos = photosList.length > 0 ? photosList : [getDefaultAvatar(activeProfile?.gender)];

  const handlePrevPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!activeProfile) return;
    triggerHaptic('light');
    playHapticSound('pop');
    setPhotoIndices(prev => ({
      ...prev,
      [activeProfile.id]: Math.max((prev[activeProfile.id] || 0) - 1, 0)
    }));
  };

  const handleNextPhoto = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!activeProfile) return;
    triggerHaptic('light');
    playHapticSound('pop');
    setPhotoIndices(prev => ({
      ...prev,
      [activeProfile.id]: Math.min((prev[activeProfile.id] || 0) + 1, displayPhotos.length - 1)
    }));
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (!activeProfile) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSwipe('super');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeProfile]);

  const [swipeDirection, setSwipeDirection] = useState(null); // 'right' | 'left' | 'super' | null
  const [particles, setParticles] = useState([]); // Burst particles

  const spawnParticles = (type) => {
    const isSuper = type === 'super';
    const count = isSuper ? 18 : 14;
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * (i / count)) - (Math.PI / 2) + (Math.random() * 0.4 - 0.2);
      const speed = 120 + Math.random() * 160;
      return {
        id: Date.now() + '-' + i,
        type: isSuper ? 'star' : 'heart',
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 60,
        rotation: Math.random() * 360,
        size: 14 + Math.random() * 14,
        color: isSuper ? '#38BDF8' : '#10B981'
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);
  };

  const handleSwipe = (direction, reactionData = null) => {
    if (!activeProfile || swipeDirection) return;

    completeSwipeGuide();

    const currentSwipedProfile = activeProfile;
    setSwipeDirection(direction);
    triggerHaptic(direction === 'right' || direction === 'super' ? 'medium' : 'light');
    playHapticSound(direction === 'right' || direction === 'super' ? 'spark' : 'swoosh');

    if (direction === 'right' || direction === 'super') {
      spawnParticles(direction);
    }

    // Save history for undo
    setSwipeHistory(prev => [...prev, { profile: currentSwipedProfile, direction }]);

    // Animate card offscreen
    setDragOffset({
      x: direction === 'left' ? -680 : direction === 'right' ? 680 : 0,
      y: direction === 'super' ? -680 : 0
    });

    setTimeout(() => {
      if (direction === 'right' || direction === 'super') {
        onSendInterest(currentSwipedProfile.id, reactionData?.comment, { ...reactionData, isSuper: direction === 'super' });
      } else if (direction === 'left') {
        if (onPassProfile) onPassProfile(currentSwipedProfile.id);
      }
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }, 380);
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, prev.length - 1));
    triggerHaptic('light');
    playHapticSound('pop');

    if (last.direction === 'right' || last.direction === 'super') {
      onUnsendInterest(last.profile.id, last.profile.name);
    } else if (last.direction === 'left') {
      if (onUnpassProfile) onUnpassProfile(last.profile.id);
    }
  };

  // Drag Gesture Handlers
  const handleTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('.story-tap-zone') || e.target.closest('.story-badge-likes')) return;
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    setDragOffset({ x: dx, y: 0 });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      handleSwipe('right');
    } else if (dragOffset.x < -100) {
      handleSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.story-tap-zone') || e.target.closest('.story-badge-likes') || e.target.closest('.story-expand-btn')) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    setDragOffset({ x: dx, y: 0 });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      handleSwipe('right');
    } else if (dragOffset.x < -100) {
      handleSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (!activeProfile || currentIndex >= profiles.length) {
    return (
      <div className="story-deck-empty page-enter">
        <div className="empty-deck-sparkle">
          <Sparkle size={48} color="var(--gold-400)" weight="fill" />
        </div>
        <h3 className="empty-deck-title font-display">You're All Caught Up!</h3>
        <p className="empty-deck-desc font-body">
          You've explored all current profiles in this mode. Check back soon or try switching categories.
        </p>
        <button
          type="button"
          onClick={() => {
            setSwipeHistory([]);
            if (onUnpassProfile) onUnpassProfile(null);
          }}
          className="restart-deck-btn font-ui"
        >
          Review Profiles Again
        </button>

        <style>{`
          .story-deck-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 520px;
            padding: var(--space-8) var(--space-4);
            background-color: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-2xl);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
          }

          .empty-deck-sparkle {
            animation: heartbeat 2s infinite ease-in-out;
            margin-bottom: var(--space-4);
          }

          .empty-deck-title {
            font-size: var(--text-heading);
            color: var(--text-primary);
            margin-bottom: var(--space-2);
          }

          .empty-deck-desc {
            font-size: var(--text-body);
            color: var(--text-secondary);
            max-width: 360px;
            margin-bottom: var(--space-6);
          }

          .restart-deck-btn {
            background-color: var(--burgundy-500);
            color: #FFFFFF;
            padding: var(--space-3) var(--space-6);
            border-radius: var(--radius-full);
            font-weight: 600;
            transition: all var(--duration-fast);
            border: none;
            cursor: pointer;
          }

          .restart-deck-btn:hover {
            background-color: var(--burgundy-400);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  const isSaved = savedProfiles.includes(activeProfile.id);
  const rotateDeg = dragOffset.x * 0.05;

  const stampSparkOpacity = swipeDirection === 'right' ? 1 : Math.min(Math.max(dragOffset.x / 80, 0), 1);
  const stampPassOpacity = swipeDirection === 'left' ? 1 : Math.min(Math.max(-dragOffset.x / 80, 0), 1);
  const stampSuperOpacity = swipeDirection === 'super' ? 1 : 0;


  return (
    <div className="story-deck-wrapper">
      {/* Burst Particles Container */}
      <div className="burst-particles-container" aria-hidden="true">
        {particles.map(p => (
          <div
            key={p.id}
            className="burst-particle"
            style={{
              '--tx': `${p.x}px`,
              '--ty': `${p.y}px`,
              '--rot': `${p.rotation}deg`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              color: p.color
            }}
          >
            {p.type === 'star' ? (
              <Star size={p.size} weight="fill" color={p.color} />
            ) : (
              <Heart size={p.size} weight="fill" color={p.color} />
            )}
          </div>
        ))}
      </div>

      {/* Main Full-Bleed Card Container */}
      <div
        className={`story-card-container ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotateDeg}deg)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dynamic Drag Stamp Overlays */}
        <div className="card-stamp stamp-spark font-display" style={{ opacity: stampSparkOpacity }}>
          SPARK ✨
        </div>
        <div className="card-stamp stamp-pass font-display" style={{ opacity: stampPassOpacity }}>
          PASS
        </div>
        <div className="card-stamp stamp-super font-display" style={{ opacity: stampSuperOpacity }}>
          SUPER SPARK ⭐️
        </div>

        {/* Edge-to-Edge Full Photo */}
        <ProtectedImage
          src={displayPhotos[currentPhotoIndex] || getDefaultAvatar(activeProfile?.gender)}
          alt={`${activeProfile.name}'s photo ${currentPhotoIndex + 1}`}
          className="story-card-photo-full"
          fallbackSrc={getDefaultAvatar(activeProfile?.gender)}
        />

        {/* Bottom Scrim Gradient */}
        <div className="story-card-scrim" />

        {/* Top Story Indicator Bars */}
        <div className="story-photo-bars" aria-label="Photo carousel progress">
          {displayPhotos.map((_, idx) => (
            <div
              key={idx}
              className={`story-photo-bar ${idx === currentPhotoIndex ? 'active' : idx < currentPhotoIndex ? 'filled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                setPhotoIndices(prev => ({ ...prev, [activeProfile.id]: idx }));
              }}
            />
          ))}
        </div>

        {/* Tap Navigation Zones */}
        {displayPhotos.length > 1 && (
          <>
            <div
              className="story-tap-zone zone-prev"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
            />
            <div
              className="story-tap-zone zone-next"
              onClick={handleNextPhoto}
              aria-label="Next photo"
            />
          </>
        )}

        {/* First-time swipe guide overlay */}
        {showSwipeGuide && (
          <div className="card-gesture-guide-overlay font-ui" onClick={completeSwipeGuide}>
            <div className="guide-item guide-left">
              <CaretLeft size={18} weight="bold" className="anim-pulse-left" />
              <span>Swipe Left to Pass</span>
            </div>
            <div className="guide-item guide-right">
              <span>Swipe Right to Spark</span>
              <CaretRight size={18} weight="bold" className="anim-pulse-right" />
            </div>
            <span className="guide-tap-dismiss">Tap anywhere to dismiss</span>
          </div>
        )}

        {/* Bottom Content Overlay */}
        <div className="story-card-overlay-content">
          {/* Status Pill (Active, Near Me, New Face, or Likes You) */}
          {activeProfile.likesYou ? (
            <div
              className="story-status-pill pill-likes-you font-ui"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                setReactionTarget({
                  isOpen: true,
                  profile: activeProfile,
                  targetType: 'letter',
                  targetContent: ''
                });
              }}
              title="Likes you! Tap to reply"
            >
              <span>🫶 Likes You</span>
              <CaretRight size={12} weight="bold" />
            </div>
          ) : feedMode === 'near_me' ? (
            <div className="story-status-pill pill-near-me font-ui">
              <span className="pulsing-location-dot" />
              <span>{activeProfile._computedDistanceText || activeProfile.distance || (activeProfile.city ? `📍 ${activeProfile.city}` : '📍 Nearby')}</span>
            </div>
          ) : feedMode === 'new_faces' ? (
            <div className="story-status-pill pill-new-face font-ui">
              <Sparkle size={12} weight="fill" color="#B8436A" />
              <span>New Face</span>
            </div>
          ) : (
            <div className="story-status-pill pill-active font-ui">
              <span className="pulsing-green-dot" />
              <span>Active</span>
            </div>
          )}

          {/* Headline: Name, Age, VerifiedBadge, Expand Arrow */}
          <div className="story-overlay-headline">
            <div className="headline-left">
              <h2
                className="story-profile-name font-ui"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProfile) onSelectProfile(activeProfile);
                }}
                title="View full profile"
              >
                {activeProfile.name} <span className="story-profile-age">{activeProfile.age}</span>
              </h2>
              {activeProfile.verified && (
                <VerifiedBadge variant="icon" size="md" />
              )}
            </div>

            {/* Upward Circular Expander Button */}
            <button
              type="button"
              className="story-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                if (onSelectProfile && activeProfile) onSelectProfile(activeProfile);
              }}
              title="View full profile details"
              aria-label="Expand profile"
            >
              <ArrowUp size={18} weight="bold" />
            </button>
          </div>

          {/* Clean Quote Bio directly over gradient (Nancy style) */}
          {(activeProfile.story || activeProfile.bio) && (
            <div
              className="story-quote-clean font-ui"
              onClick={(e) => {
                e.stopPropagation();
                setReactionTarget({
                  isOpen: true,
                  profile: activeProfile,
                  targetType: 'story',
                  targetContent: activeProfile.story || activeProfile.bio
                });
              }}
              title="Click to reply to this quote"
            >
              <span className="quote-glyph">&ldquo;</span>
              <p className="quote-text">{activeProfile.story || activeProfile.bio}</p>
            </div>
          )}

          {/* Profile Attributes Row (Bella style: college, occupation, city, intent) */}
          <div className="story-meta-row font-ui">
            {activeProfile.college && (
              <span className="meta-item">
                <span className="meta-icon">🎓</span> {activeProfile.college}
              </span>
            )}
            {activeProfile.occupation && (
              <span className="meta-item">
                <span className="meta-icon">💼</span> {activeProfile.occupation}
              </span>
            )}
            {activeProfile.city && (
              <span className="meta-item">
                <span className="meta-icon">📍</span> {activeProfile.city}
              </span>
            )}
            {activeProfile.relationshipIntent && (
              <span className="meta-item intent-item">
                ✨ {activeProfile.relationshipIntent}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating 5-Button Circular Console */}
      <div className="story-floating-console" aria-label="Profile actions">
        {/* 1. Rewind / Undo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={swipeHistory.length === 0}
          className="console-btn btn-rewind"
          aria-label="Undo last swipe"
          title="Rewind (Backspace)"
        >
          <ArrowCounterClockwise size={20} weight="bold" />
        </button>

        {/* 2. Pass */}
        <button
          type="button"
          onClick={() => handleSwipe('left')}
          className="console-btn btn-pass"
          aria-label="Pass this profile"
          title="Pass (Left Arrow)"
        >
          <X size={26} weight="bold" />
        </button>

        {/* 3. Super Spark */}
        <button
          type="button"
          onClick={() => handleSwipe('super')}
          className="console-btn btn-super"
          aria-label="Super Spark — stand out instantly"
          title="Super Spark (Up Arrow)"
        >
          <Star size={22} weight="fill" />
        </button>

        {/* 4. Spark / Like */}
        <button
          type="button"
          onClick={() => handleSwipe('right')}
          className="console-btn btn-spark"
          aria-label="Spark this profile"
          title="Spark (Right Arrow)"
        >
          <Heart size={26} weight="fill" />
        </button>

        {/* 5. Direct Letter / Note */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setReactionTarget({
              isOpen: true,
              profile: activeProfile,
              targetType: 'letter',
              targetContent: ''
            });
          }}
          className="console-btn btn-letter"
          aria-label="Send direct handwritten letter"
          title="Send a Velvet Letter"
        >
          <PaperPlaneTilt size={20} weight="fill" />
        </button>
      </div>

      {/* Prompt Reaction Modal */}
      {reactionTarget && (
        <PromptReactionModal
          isOpen={Boolean(reactionTarget)}
          onClose={() => setReactionTarget(null)}
          profileName={reactionTarget.profile.name}
          targetType={reactionTarget.targetType}
          targetContent={reactionTarget.targetContent}
          onSendReaction={(reactionData) => {
            handleSwipe('right', reactionData);
          }}
        />
      )}

      <style>{`
        .story-deck-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          user-select: none;
        }

        @media (max-width: 640px) {
          .story-deck-wrapper {
            max-width: 100%;
            width: 100%;
          }
        }

        /* Full-Bleed Card Frame */
        .story-card-container {
          position: relative;
          width: 100%;
          height: clamp(580px, calc(100dvh - 215px), 750px);
          aspect-ratio: 9 / 15.5;
          min-height: 560px;
          max-height: 750px;
          border-radius: 22px;
          overflow: hidden;
          background-color: #0d0f14;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          cursor: grab;
        }

        @media (max-width: 640px) {
          .story-card-container {
            height: calc(100dvh - 200px);
            min-height: 540px;
            max-height: 720px;
            aspect-ratio: auto;
          }
        }

        @media (max-height: 720px) {
          .story-card-container {
            height: calc(100dvh - 180px);
            min-height: 480px;
            max-height: 580px;
          }
        }

        .story-card-container:active {
          cursor: grabbing;
        }

        /* Full Card Photo */
        .story-card-photo-full {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        /* Deep Gradient Bottom Scrim - perfectly starts in lower 40% */
        .story-card-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0) 48%,
            rgba(0, 0, 0, 0.18) 62%,
            rgba(0, 0, 0, 0.65) 80%,
            rgba(0, 0, 0, 0.94) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        /* Horizontal Story Photo Bars */
        .story-photo-bars {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          gap: 4px;
          z-index: 10;
        }

        .story-photo-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .story-photo-bar.active {
          background: #FFFFFF;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        }

        .story-photo-bar.filled {
          background: rgba(255, 255, 255, 0.75);
        }

        /* Tap Navigation Zones */
        .story-tap-zone {
          position: absolute;
          top: 0;
          bottom: 140px;
          width: 32%;
          z-index: 6;
          cursor: pointer;
        }

        .zone-prev {
          left: 0;
        }

        .zone-next {
          right: 0;
        }

        /* Bottom Overlaid Details */
        .story-card-overlay-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 16px 18px;
          z-index: 8;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: auto;
        }

        /* Status Pills (Active / Likes You) directly above the name */
        .story-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          border-radius: 999px;
          margin-bottom: 2px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .story-status-pill:hover {
          transform: scale(1.04);
        }

        .story-status-pill.pill-active,
        .story-status-pill.pill-near-me,
        .story-status-pill.pill-new-face {
          background: #FFFFFF;
          color: #111827;
          padding: 3px 10px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .story-status-pill.pill-likes-you {
          background: #F59E0B;
          color: #181102;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
        }

        .pulsing-location-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #B8436A;
          box-shadow: 0 0 8px #B8436A;
          animation: pulseEmerald 1.8s infinite;
        }

        .pulsing-green-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
          animation: pulseEmerald 1.8s infinite;
        }

        @keyframes pulseEmerald {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.75; }
        }

        /* Headline: Name + Age + Verified + Expand Arrow */
        .story-overlay-headline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .headline-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .story-profile-name {
          font-family: var(--font-ui), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.15;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .story-profile-name:hover {
          color: #F3C68F;
        }

        .story-profile-age {
          font-weight: 500;
          font-size: 1.6rem;
          opacity: 0.95;
        }

        /* Circular Upward Expander Button */
        .story-expand-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .story-expand-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.12);
        }

        .story-expand-btn:active {
          transform: scale(0.95);
        }

        /* Clean Quote Line directly on scrim (Nancy style) */
        .story-quote-clean {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          cursor: pointer;
          margin-top: 2px;
          transition: opacity 0.2s ease;
        }

        .story-quote-clean:hover {
          opacity: 0.85;
        }

        .story-quote-clean .quote-glyph {
          font-size: 1.4rem;
          line-height: 1;
          color: #FFFFFF;
          font-weight: 800;
          opacity: 0.9;
          font-family: Georgia, serif;
          flex-shrink: 0;
        }

        .story-quote-clean .quote-text {
          font-family: var(--font-ui), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }

        /* Clean Profile Attributes (Bella style: college, occupation, city, intent) */
        .story-meta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px 10px;
          margin-top: 2px;
        }

        .meta-item {
          font-family: var(--font-ui), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.88);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }

        .meta-item.intent-item {
          color: #FFAEC5;
          font-weight: 600;
        }

        /* FLOATING 5-BUTTON CIRCULAR CONSOLE */
        .story-floating-console {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 14px;
          width: 100%;
          z-index: 20;
        }

        .console-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: rgba(24, 27, 34, 0.85);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
          padding: 0;
        }

        .console-btn:hover:not(:disabled) {
          transform: scale(1.12);
          background: rgba(34, 38, 48, 0.95);
        }

        .console-btn:active:not(:disabled) {
          transform: scale(0.92);
        }

        /* 1. Rewind — Amber/Yellow (44px) */
        .btn-rewind {
          width: 44px;
          height: 44px;
          color: #F59E0B;
        }

        .btn-rewind:hover:not(:disabled) {
          box-shadow: 0 4px 18px rgba(245, 158, 11, 0.4);
        }

        .btn-rewind:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          transform: none;
        }

        /* 2. Pass — Rose/Red (58px) */
        .btn-pass {
          width: 58px;
          height: 58px;
          color: #FF4458;
        }

        .btn-pass:hover {
          box-shadow: 0 6px 24px rgba(255, 68, 88, 0.45);
        }

        /* 3. Super Spark — Sky Blue (44px) */
        .btn-super {
          width: 44px;
          height: 44px;
          color: #38BDF8;
        }

        .btn-super:hover {
          box-shadow: 0 4px 18px rgba(56, 189, 248, 0.45);
        }

        /* 4. Spark / Like — Emerald Green (58px) */
        .btn-spark {
          width: 58px;
          height: 58px;
          color: #10B981;
        }

        .btn-spark:hover {
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.45);
        }

        /* 5. Direct Letter / Boost — Purple (44px) */
        .btn-letter {
          width: 44px;
          height: 44px;
          color: #A855F7;
        }

        .btn-letter:hover {
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.4);
        }

        /* Overlay Stamp Badges */
        .card-stamp {
          position: absolute;
          top: var(--space-6);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-heading);
          font-weight: 800;
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          z-index: 50;
          pointer-events: none;
          backdrop-filter: blur(4px);
          transition: opacity var(--duration-fast);
        }

        .stamp-spark {
          right: var(--space-6);
          border: 3px solid #10B981;
          color: #10B981;
          transform: rotate(12deg);
          background-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .stamp-pass {
          left: var(--space-6);
          border: 3px solid #EF4444;
          color: #EF4444;
          transform: rotate(-12deg);
          background-color: rgba(239, 68, 68, 0.2);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        .stamp-super {
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-6deg) scale(1.1);
          border: 3.5px solid #38BDF8;
          color: #38BDF8;
          background-color: rgba(56, 189, 248, 0.25);
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.6);
        }

        .swiping-right {
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.55) !important;
        }

        .swiping-super {
          box-shadow: 0 0 50px rgba(56, 189, 248, 0.65) !important;
        }

        /* Burst Particles Container */
        .burst-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          overflow: visible;
        }

        .burst-particle {
          position: absolute;
          left: 50%;
          bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: particleFloatOut 0.65s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        @keyframes particleFloatOut {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.5);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.4);
          }
        }

        /* Card Gesture Guide Overlay */
        .card-gesture-guide-overlay {
          position: absolute;
          inset: 0;
          z-index: 25;
          background: rgba(12, 10, 11, 0.76);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          cursor: pointer;
          border-radius: 28px;
          animation: fadeIn 0.3s ease-out;
        }

        .guide-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
          margin: 6px 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
        }

        .guide-left {
          background: rgba(239, 83, 80, 0.18);
          border: 1px solid rgba(239, 83, 80, 0.5);
          color: #FF8A80;
        }

        .guide-right {
          background: rgba(102, 187, 106, 0.18);
          border: 1px solid rgba(102, 187, 106, 0.5);
          color: #A5D6A7;
        }

        .guide-tap-dismiss {
          margin-top: 14px;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.3px;
        }

        @keyframes pulseLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }

        @keyframes pulseRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        .anim-pulse-left {
          animation: pulseLeft 1.4s ease-in-out infinite;
        }

        .anim-pulse-right {
          animation: pulseRight 1.4s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

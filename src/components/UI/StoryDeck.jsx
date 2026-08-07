import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  X, 
  ArrowLeft, 
  Star, 
  Sparkle, 
  ChatCircleText, 
  CheckCircle, 
  CaretLeft, 
  CaretRight,
  CaretUp,
  Info,
  Bookmark,
  HandGrabbing
} from '@phosphor-icons/react';
import { getProfilePhoto, getDefaultAvatar, extractPhotoUrls } from '../../utils/avatar';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';
import { PromptReactionModal } from './PromptReactionModal';

export const StoryDeck = ({
  profiles = [],
  interestsSent = [],
  savedProfiles = [],
  userProfile = {},
  onSendInterest,
  onUnsendInterest,
  onPassProfile,
  onUnpassProfile,
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

  // Compute Vibe Match percentage based on shared interests & intent
  const computeVibeMatch = (profile) => {
    if (!profile) return 80;
    let score = 75;
    const userInterests = userProfile?.interests || [];
    const profileInterests = profile?.interests || [];
    const sharedCount = profileInterests.filter(i => userInterests.includes(i)).length;

    score += sharedCount * 6;
    if (userProfile?.relationshipIntent === profile?.relationshipIntent) score += 10;
    if (userProfile?.city === profile?.city) score += 5;

    return Math.min(Math.max(score, 70), 99);
  };

  // Current photo index for active profile
  const currentPhotoIndex = activeProfile ? (photoIndices[activeProfile.id] || 0) : 0;
  const photosList = activeProfile ? extractPhotoUrls(activeProfile) : [];
  const displayPhotos = photosList.length > 0 ? photosList : [getDefaultAvatar(activeProfile?.gender)];

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (!activeProfile) return;
    triggerHaptic('light');
    playHapticSound('pop');
    setPhotoIndices(prev => ({
      ...prev,
      [activeProfile.id]: Math.max((prev[activeProfile.id] || 0) - 1, 0)
    }));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
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
    const count = isSuper ? 16 : 12;
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * (i / count)) - (Math.PI / 2) + (Math.random() * 0.4 - 0.2);
      const speed = 120 + Math.random() * 160;
      return {
        id: Date.now() + '-' + i,
        type: isSuper ? 'star' : 'heart',
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 60,
        rotation: Math.random() * 360,
        size: 14 + Math.random() * 12,
        color: isSuper ? '#D4AD6A' : '#B8436A'
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
      x: direction === 'left' ? -650 : direction === 'right' ? 650 : 0,
      y: direction === 'super' ? -650 : 0
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
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      handleSwipe('right');
    } else if (dragOffset.x < -100) {
      handleSwipe('left');
    } else if (dragOffset.y < -120) {
      handleSwipe('super');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 100) {
      handleSwipe('right');
    } else if (dragOffset.x < -100) {
      handleSwipe('left');
    } else if (dragOffset.y < -120) {
      handleSwipe('super');
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
          You've explored all current profiles in your area. Check back soon or try adjusting your preferences.
        </p>
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
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
            min-height: 480px;
            padding: var(--space-8) var(--space-4);
            background-color: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-xl);
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
  const vibeScore = computeVibeMatch(activeProfile);

  // Rotation tilt angle based on drag x offset
  const rotateDeg = dragOffset.x * 0.06;

  // Overlay stamp opacity
  const stampSparkOpacity = swipeDirection === 'right' ? 1 : Math.min(Math.max(dragOffset.x / 80, 0), 1);
  const stampPassOpacity = swipeDirection === 'left' ? 1 : Math.min(Math.max(-dragOffset.x / 80, 0), 1);
  const stampSuperOpacity = swipeDirection === 'super' ? 1 : Math.min(Math.max(-dragOffset.y / 80, 0), 1);

  return (
    <div className="story-deck-wrapper">
      {/* Explosive Burst Particles Container */}
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

      {/* Dynamic Main Card */}
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
          PASS Softly
        </div>
        <div className="card-stamp stamp-super font-display" style={{ opacity: stampSuperOpacity }}>
          SUPER SPARK ⭐️
        </div>

        {/* Hero Photo Panel */}
        <div className="story-card-hero">
          {/* Session-Based Gesture Guide Overlay */}
          {showSwipeGuide && (
            <div className="card-gesture-guide-overlay font-ui" onClick={completeSwipeGuide}>
              <div className="guide-item guide-left">
                <CaretLeft size={18} weight="bold" className="anim-pulse-left" />
                <span>Swipe Left to Pass</span>
              </div>

              <div className="guide-item guide-up">
                <CaretUp size={18} weight="bold" className="anim-pulse-up" />
                <span>Swipe Up for Super Spark</span>
              </div>

              <div className="guide-item guide-right">
                <span>Swipe Right to Spark</span>
                <CaretRight size={18} weight="bold" className="anim-pulse-right" />
              </div>

              <span className="guide-tap-dismiss">Tap anywhere to dismiss</span>
            </div>
          )}
          <img
            src={displayPhotos[currentPhotoIndex] || getDefaultAvatar(activeProfile?.gender)}
            alt={`${activeProfile.name}'s photo ${currentPhotoIndex + 1}`}
            className="story-card-photo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getDefaultAvatar(activeProfile?.gender);
            }}
          />

          {/* Photo Dots */}
          {displayPhotos.length > 1 && (
            <div className="story-photo-dots">
              {displayPhotos.map((_, idx) => (
                <span
                  key={idx}
                  className={`story-photo-dot ${idx === currentPhotoIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Photo Arrows */}
          {displayPhotos.length > 1 && (
            <>
              {currentPhotoIndex > 0 && (
                <button
                  type="button"
                  className="story-photo-arrow prev"
                  onClick={handlePrevPhoto}
                  aria-label="Previous photo"
                >
                  <CaretLeft size={18} weight="bold" />
                </button>
              )}
              {currentPhotoIndex < displayPhotos.length - 1 && (
                <button
                  type="button"
                  className="story-photo-arrow next"
                  onClick={handleNextPhoto}
                  aria-label="Next photo"
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              )}
            </>
          )}

          {/* Vibe Match & Verification Badges */}
          <div className="story-top-badges">
            <div className="badge-vibe-radar font-ui">
              <Sparkle size={14} color="var(--gold-300)" weight="fill" />
              <span>{vibeScore}% Vibe Match</span>
            </div>
            {activeProfile.verified && (
              <span className="badge-verified font-ui">
                <CheckCircle size={12} weight="fill" /> Verified
              </span>
            )}
          </div>

          {/* Photo Reaction Pin Launcher */}
          <button
            type="button"
            className="photo-pin-reaction-btn font-ui"
            onClick={(e) => {
              e.stopPropagation();
              setReactionTarget({
                isOpen: true,
                profile: activeProfile,
                targetType: 'photo',
                targetContent: displayPhotos[currentPhotoIndex]
              });
            }}
            title="React to this photo"
          >
            <ChatCircleText size={16} weight="fill" />
            <span>React</span>
          </button>
        </div>

        {/* Story Body Details */}
        <div className="story-card-body font-ui">
          <div className="story-header-row">
            <div className="story-name-wrap">
              <h2 className="story-name font-display">{activeProfile.name}</h2>
              <span className="story-age font-ui">, {activeProfile.age}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveProfile(activeProfile.id);
              }}
              className={`story-bookmark-btn ${isSaved ? 'saved' : ''}`}
              title={isSaved ? "Saved" : "Save Profile"}
            >
              <Bookmark size={20} weight={isSaved ? 'fill' : 'regular'} />
            </button>
          </div>

          <p className="story-location-intent font-ui">
            {activeProfile.city} &bull; <span className="story-intent-highlight">{activeProfile.relationshipIntent}</span>
          </p>

          {/* Editorial Story Quote Block */}
          {activeProfile.story && (
            <div 
              className="story-quote-block"
              onClick={(e) => {
                e.stopPropagation();
                setReactionTarget({
                  isOpen: true,
                  profile: activeProfile,
                  targetType: 'story',
                  targetContent: activeProfile.story
                });
              }}
              title="Click to comment on this story"
            >
              <span className="quote-icon-small">&ldquo;</span>
              <p className="story-quote-text font-body">{activeProfile.story}</p>
              <span className="quote-reply-hint font-ui">💬 Reply to story</span>
            </div>
          )}

          {/* Identity & Pronouns */}
          <div className="story-identity-row font-ui">
            <span className="identity-tag">{activeProfile.gender}</span>
            <span className="identity-tag">{activeProfile.orientation}</span>
          </div>

          {/* Interests Pills */}
          {activeProfile.interests?.length > 0 && (
            <div className="story-interests-wrap font-ui">
              {activeProfile.interests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  className="story-interest-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReactionTarget({
                      isOpen: true,
                      profile: activeProfile,
                      targetType: 'interest',
                      targetContent: interest
                    });
                  }}
                  title={`React to ${interest}`}
                >
                  <span>{interest}</span>
                  <span className="chip-plus">+</span>
                </button>
              ))}
            </div>
          )}

          {/* Full detail view link */}
          <button
            type="button"
            className="story-view-full-btn font-ui"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProfile(activeProfile);
            }}
          >
            <Info size={16} />
            <span>View Full Profile</span>
          </button>
        </div>
      </div>

      {/* Floating Action Control Bar */}
      <div className="story-actions-bar">
        {/* Undo button */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={swipeHistory.length === 0}
          className="action-btn btn-undo"
          aria-label="Undo last swipe"
          title="Undo (Backspace)"
        >
          <ArrowLeft size={22} weight="bold" />
        </button>

        {/* Pass Softly (X) */}
        <button
          type="button"
          onClick={() => handleSwipe('left')}
          className="action-btn btn-pass"
          aria-label="Pass softly"
          title="Pass (Left Arrow)"
        >
          <X size={26} weight="bold" />
        </button>

        {/* Super Spark (Star) */}
        <button
          type="button"
          onClick={() => handleSwipe('super')}
          className="action-btn btn-super"
          aria-label="Super spark"
          title="Super Spark (Up Arrow)"
        >
          <Star size={24} weight="fill" />
        </button>

        {/* Send Spark (Heart) */}
        <button
          type="button"
          onClick={() => handleSwipe('right')}
          className="action-btn btn-spark"
          aria-label="Send spark"
          title="Send Spark (Right Arrow)"
        >
          <Heart size={26} weight="fill" />
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
          max-width: 380px;
          margin: 0 auto;
          user-select: none;
        }

        .story-card-container {
          width: 100%;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
          position: relative;
          cursor: grab;
        }

        .story-card-container:active {
          cursor: grabbing;
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
          border: 3px solid var(--burgundy-400);
          color: var(--burgundy-400);
          transform: rotate(12deg);
          background-color: rgba(184, 67, 106, 0.2);
          box-shadow: 0 0 20px rgba(184, 67, 106, 0.4);
        }

        .stamp-pass {
          left: var(--space-6);
          border: 3px solid var(--charcoal-400);
          color: var(--charcoal-300);
          transform: rotate(-12deg);
          background-color: rgba(40, 32, 35, 0.4);
        }

        .stamp-super {
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-6deg) scale(1.1);
          border: 3.5px solid var(--gold-400);
          color: var(--gold-400);
          background-color: rgba(212, 173, 106, 0.25);
          box-shadow: 0 0 30px rgba(212, 173, 106, 0.6);
        }

        .swiping-right {
          box-shadow: 0 0 40px rgba(184, 67, 106, 0.6) !important;
        }

        .swiping-super {
          box-shadow: 0 0 50px rgba(212, 173, 106, 0.7) !important;
        }

        /* Hero Photo */
        .story-card-hero {
          position: relative;
          aspect-ratio: 16/13;
          width: 100%;
          background-color: var(--charcoal-200);
        }

        .story-card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .story-photo-dots {
          position: absolute;
          top: var(--space-3);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          width: calc(100% - 24px);
          max-width: 140px;
          z-index: 12;
        }

        .story-photo-dot {
          flex: 1;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 999px;
          transition: background-color var(--duration-fast);
        }

        .story-photo-dot.active {
          background-color: #FFFFFF;
        }

        .story-photo-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(26, 21, 23, 0.65);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 15;
          cursor: pointer;
          backdrop-filter: blur(4px);
          padding: 0;
          transition: all var(--duration-fast);
        }

        .story-photo-arrow:hover {
          background-color: rgba(26, 21, 23, 0.9);
          transform: translateY(-50%) scale(1.08);
        }

        .story-photo-arrow.prev { left: var(--space-2); }
        .story-photo-arrow.next { right: var(--space-2); }

        .story-top-badges {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          display: flex;
          gap: var(--space-2);
          z-index: 10;
        }

        .badge-vibe-radar {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(26, 21, 23, 0.75);
          border: 1px solid rgba(212, 173, 106, 0.4);
          color: var(--cream-100);
          font-size: 11px;
          font-weight: 600;
          padding: 3px var(--space-2);
          border-radius: var(--radius-full);
          backdrop-filter: blur(6px);
        }

        .badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(92, 154, 110, 0.9);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          padding: 3px var(--space-2);
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        .photo-pin-reaction-btn {
          position: absolute;
          bottom: var(--space-3);
          right: var(--space-3);
          background-color: rgba(26, 21, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #FFFFFF;
          border-radius: var(--radius-full);
          padding: 3px var(--space-3);
          font-size: var(--text-caption);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(6px);
          cursor: pointer;
          transition: all var(--duration-fast);
          z-index: 15;
        }

        .photo-pin-reaction-btn:hover {
          background-color: var(--burgundy-500);
          border-color: var(--burgundy-400);
          transform: scale(1.05);
        }

        /* Card Body Details */
        .story-card-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .story-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .story-name-wrap {
          display: flex;
          align-items: baseline;
        }

        .story-name {
          font-size: var(--text-heading);
          color: var(--text-primary);
        }

        .story-age {
          font-size: var(--text-subheading);
          color: var(--text-secondary);
        }

        .story-bookmark-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: 50%;
          transition: all var(--duration-fast);
        }

        .story-bookmark-btn:hover, .story-bookmark-btn.saved {
          color: var(--gold-500);
        }

        .story-location-intent {
          font-size: var(--text-body-sm);
          color: var(--text-tertiary);
        }

        .story-intent-highlight {
          color: var(--text-accent);
          font-weight: 600;
        }

        /* Quote Block */
        .story-quote-block {
          background-color: var(--bg-surface-warm);
          border-left: 3px solid var(--burgundy-400);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          padding: var(--space-3) var(--space-4);
          position: relative;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .story-quote-block:hover {
          background-color: var(--bg-accent-subtle);
        }

        .quote-icon-small {
          font-size: 20px;
          color: var(--burgundy-400);
          line-height: 1;
        }

        .story-quote-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          font-style: italic;
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-1);
        }

        .quote-reply-hint {
          font-size: 11px;
          color: var(--burgundy-500);
          font-weight: 600;
        }

        /* Identity */
        .story-identity-row {
          display: flex;
          gap: var(--space-2);
        }

        .identity-tag {
          font-size: 11px;
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 2px var(--space-3);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        /* Interests Chips */
        .story-interests-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .story-interest-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--burgundy-50);
          color: var(--burgundy-600);
          border: 1px solid var(--burgundy-200);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .story-interest-chip:hover {
          background-color: var(--burgundy-100);
          border-color: var(--burgundy-300);
        }

        .chip-plus {
          font-weight: bold;
          opacity: 0.7;
        }

        .story-view-full-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background: transparent;
          border: 1px dashed var(--border-default);
          border-radius: var(--radius-full);
          padding: var(--space-2);
          color: var(--text-secondary);
          font-size: var(--text-body-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
          margin-top: var(--space-2);
        }

        .story-view-full-btn:hover {
          border-color: var(--burgundy-300);
          color: var(--burgundy-500);
          background-color: var(--bg-surface-warm);
        }

        /* Floating Action Deck */
        .story-actions-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-6);
        }

        .action-btn {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--duration-fast);
          border: none;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-undo {
          width: 50px;
          height: 50px;
          background-color: var(--bg-surface);
          color: var(--gold-400);
          border: 1.5px solid var(--gold-400);
        }

        .btn-pass {
          width: 60px;
          height: 60px;
          background-color: var(--bg-surface);
          color: var(--burgundy-400);
          border: 2px solid var(--burgundy-400);
        }

        .btn-super {
          width: 50px;
          height: 50px;
          background-color: var(--bg-surface);
          color: var(--gold-400);
          border: 1.5px solid var(--gold-400);
        }

        .btn-spark {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--burgundy-500), var(--burgundy-600));
          color: #FFFFFF;
          border: 2px solid var(--burgundy-400);
          box-shadow: 0 8px 20px rgba(184, 67, 106, 0.4);
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
        }

        /* Swipe Tutorial Hint Overlay & Animation */
        @keyframes cardNudgeHint {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          20% { transform: translate3d(22px, -5px, 0) rotate(3deg); }
          40% { transform: translate3d(-22px, -5px, 0) rotate(-3deg); }
          60% { transform: translate3d(10px, -2px, 0) rotate(1.5deg); }
          80% { transform: translate3d(-10px, -2px, 0) rotate(-1.5deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }

        .story-card-container.initial-nudge-hint {
          animation: cardNudgeHint 1.4s ease-in-out 0.3s 1 normal forwards;
        }

        @keyframes pulseHandSwipe {
          0%, 100% { transform: translateX(0) scale(1); }
          30% { transform: translateX(5px) scale(1.1); }
          70% { transform: translateX(-5px) scale(1.1); }
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
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
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

        .guide-up {
          background: rgba(255, 213, 79, 0.18);
          border: 1px solid rgba(255, 213, 79, 0.5);
          color: #FFE082;
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

        @keyframes pulseUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes pulseLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }

        @keyframes pulseRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        .anim-pulse-up {
          animation: pulseUp 1.4s ease-in-out infinite;
        }

        .anim-pulse-left {
          animation: pulseLeft 1.4s ease-in-out infinite;
        }

        .anim-pulse-right {
          animation: pulseRight 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

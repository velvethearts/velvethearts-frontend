import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Sparkle, ChatCircleText } from '@phosphor-icons/react';
import { getProfilePhoto, getDefaultAvatar } from '../utils/avatar';
import { playHapticSound, triggerHaptic } from '../utils/haptics';
import { computeVibeMatch } from '../utils/vibe';

export const Celebration = () => {
  const { showCelebration, setShowCelebration, userProfile, setActiveTab, sendMessage, setDeepLinkConversationId } = useApp();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (showCelebration) {
      triggerHaptic('match');
      playHapticSound('match');

      // Generate some confetti particles in brand colors
      const colors = ['#B8436A', '#D4AD6A', '#F0A0AD', '#FAEEE0'];
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
        duration: `${1.5 + Math.random() * 2}s`,
        size: `${8 + Math.random() * 8}px`,
        drift: `${-30 + Math.random() * 60}px`
      }));
      setParticles(newParticles);
    }
  }, [showCelebration]);

  if (!showCelebration) return null;

  const handleStartChat = (icebreakerText = '') => {
    const partnerId = showCelebration.id;
    const conversationId = showCelebration.conversationId;
    const targetId = conversationId || partnerId;

    if (icebreakerText && typeof icebreakerText === 'string') {
      sendMessage(targetId, icebreakerText);
    }
    if (setDeepLinkConversationId && partnerId) {
      setDeepLinkConversationId(partnerId);
    }
    setShowCelebration(null);
    setActiveTab('chat');
  };

  const handleClose = () => {
    setShowCelebration(null);
  };

  // Shared interests for icebreaker suggestions
  const userInterests = userProfile?.interests || [];
  const partnerInterests = showCelebration?.interests || [];
  const shared = partnerInterests.filter(i => userInterests.includes(i));
  const icebreakerTopic = shared.length > 0 ? shared[0] : (partnerInterests[0] || 'interests');

  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true">
      {/* Confetti container */}
      <div className="confetti-container">
        {particles.map(p => (
          <div 
            key={p.id}
            className="confetti-particle"
            style={{
              backgroundColor: p.color,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
              '--drift': p.drift
            }}
          />
        ))}
      </div>

      <div className="celebration-content">
        <div className="hearts-pulse">
          <Heart size={48} color="#B8436A" weight="fill" className="pulse-heart-1" />
          <Heart size={32} color="#D4AD6A" weight="fill" className="pulse-heart-2" />
        </div>

        {/* Vibe Match Radar Indicator */}
        <div className="celebration-vibe-badge font-ui">
          <Sparkle size={14} color="#D4AD6A" weight="fill" />
          <span>{computeVibeMatch(userProfile, showCelebration)}% Vibe Match</span>
        </div>

        <h2 className="celebration-title font-display">It's a Connection!</h2>
        <p className="celebration-subtitle font-body">
          You and <strong>{showCelebration.name}</strong> have both shown mutual interest.
        </p>

        {/* Avatars */}
        <div className="avatar-meet-container">
          <div className="celebration-avatar user-avatar-slide">
            <img 
              src={getProfilePhoto(userProfile)} 
              alt="You" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getDefaultAvatar(userProfile?.gender);
              }}
            />
            <span className="avatar-label font-ui">You</span>
          </div>

          <div className="avatar-connector">
            <Heart size={24} weight="fill" color="#B8436A" />
          </div>

          <div className="celebration-avatar partner-avatar-slide">
            <img
              src={getProfilePhoto(showCelebration)}
              alt={showCelebration.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getDefaultAvatar(showCelebration?.gender);
              }}
            />
            <span className="avatar-label font-ui">{showCelebration.name}</span>
          </div>
        </div>

        {/* 1-Tap Icebreaker Starters */}
        <div className="celebration-icebreaker-wrap font-ui">
          <span className="icebreaker-label">1-Tap Icebreakers:</span>
          <div className="icebreaker-chips">
            <button 
              type="button" 
              onClick={() => handleStartChat(`👋 Hey ${showCelebration.name}!`)} 
              className="icebreaker-chip"
            >
              👋 &ldquo;Hey {showCelebration.name}!&rdquo;
            </button>
            <button 
              type="button" 
              onClick={() => handleStartChat(`☕ Tell me more about your interest in ${icebreakerTopic}!`)} 
              className="icebreaker-chip"
            >
              ☕ &ldquo;Ask about {icebreakerTopic}&rdquo;
            </button>
          </div>
        </div>

        <div className="celebration-actions">
          <button onClick={handleStartChat} className="primary-btn-celebration font-ui">
            <ChatCircleText size={16} weight="fill" />
            <span>Send a Warm Message</span>
          </button>
          <button onClick={handleClose} className="secondary-btn-celebration font-ui">
            Keep Discovering
          </button>
        </div>
      </div>

      <style>{`
        .celebration-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(26, 21, 23, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: overlayFadeIn 0.3s ease-out forwards;
        }

        .celebration-content {
          max-width: 440px;
          width: 90%;
          text-align: center;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-8);
          animation: contentSlideUp 0.6s var(--ease-spring) forwards;
        }

        .hearts-pulse {
          position: relative;
          height: 60px;
          width: 80px;
          margin-bottom: var(--space-4);
        }

        .pulse-heart-1 {
          animation: heartbeat 1.5s infinite;
        }

        .pulse-heart-2 {
          position: absolute;
          top: -10px;
          right: 10px;
          animation: heartbeat 1.5s infinite;
          animation-delay: 0.3s;
        }

        .celebration-vibe-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 173, 106, 0.15);
          border: 1px solid rgba(212, 173, 106, 0.4);
          color: #F0D4A0;
          font-size: var(--text-body-sm);
          font-weight: 600;
          padding: 4px var(--space-4);
          border-radius: var(--radius-full);
          margin-bottom: var(--space-3);
          backdrop-filter: blur(4px);
        }

        .celebration-title {
          font-size: var(--text-display);
          color: var(--cream-100);
          margin-bottom: var(--space-2);
          letter-spacing: var(--tracking-tight);
        }

        .celebration-subtitle {
          color: var(--charcoal-300);
          font-size: var(--text-body);
          margin-bottom: var(--space-6);
        }

        .celebration-icebreaker-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
          width: 100%;
        }

        .icebreaker-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          color: var(--charcoal-400);
          font-weight: 600;
        }

        .icebreaker-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-2);
        }

        .icebreaker-chip {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 6px var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .icebreaker-chip:hover {
          background: rgba(184, 67, 106, 0.4);
          border-color: var(--burgundy-300);
          transform: translateY(-1px);
        }

        .avatar-meet-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-bottom: var(--space-10);
        }

        .celebration-avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .celebration-avatar img {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #FFFFFF;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .avatar-label {
          font-size: var(--text-caption);
          color: var(--charcoal-300);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .user-avatar-slide {
          animation: avatarSlideLeft 0.8s var(--ease-spring) forwards;
        }

        .partner-avatar-slide {
          animation: avatarSlideRight 0.8s var(--ease-spring) forwards;
        }

        .avatar-connector {
          animation: connectorScale 0.8s var(--ease-spring) forwards;
          background-color: var(--cream-100);
          border-radius: 50%;
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .celebration-icebreaker-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-top: var(--space-4);
          margin-bottom: var(--space-1);
        }

        .icebreaker-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .icebreaker-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .icebreaker-chip {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .icebreaker-chip:hover {
          background: rgba(212, 173, 106, 0.25);
          border-color: var(--gold-400);
          color: var(--gold-300);
          transform: translateY(-1px);
        }

        .celebration-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          margin-top: var(--space-3);
        }

        .primary-btn-celebration {
          width: 100%;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          padding: 0 20px;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: var(--text-body-sm);
          border: none;
          box-shadow: 0 4px 14px rgba(184, 67, 106, 0.35);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .primary-btn-celebration:hover {
          background-color: var(--burgundy-400);
          transform: translateY(-1px);
          box-shadow: var(--shadow-glow);
        }

        .secondary-btn-celebration {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          color: var(--charcoal-200);
          border: 1px solid var(--charcoal-400);
          padding: 0 20px;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: var(--text-body-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .secondary-btn-celebration:hover {
          color: #FFFFFF;
          border-color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Confetti physics */
        .confetti-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti-particle {
          position: absolute;
          top: -20px;
          border-radius: 2px;
          opacity: 1;
          animation: fall linear forwards;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes contentSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes avatarSlideLeft {
          from { opacity: 0; transform: translateX(-80px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes avatarSlideRight {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes connectorScale {
          from { opacity: 0; transform: scale(0.2); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) translateX(var(--drift)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
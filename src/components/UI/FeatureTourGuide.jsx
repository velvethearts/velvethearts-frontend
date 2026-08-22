import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkle,
  Heart,
  Star,
  X,
  CaretRight,
  CaretLeft,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Compass,
  Chats,
  Bell,
  User,
  ShieldCheck,
  Lightning
} from '@phosphor-icons/react';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';

export const FeatureTourGuide = () => {
  const {
    isLoggedIn,
    isOnboarded,
    activeTab,
    setActiveTab,
    isFeatureTourActive,
    setIsFeatureTourActive,
    userProfile
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [cardStyle, setCardStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const [arrowDirection, setArrowDirection] = useState(null);
  const cardRef = useRef(null);

  // 9-step multi-page tour sequence with specific, focused target selectors
  const tourSteps = [
    {
      id: 'welcome',
      tab: 'discover',
      badge: 'Welcome to Velvet Hearts',
      badgeIcon: Sparkle,
      badgeColor: '#D4AD6A',
      title: 'A Different Kind of Dating Space',
      subtitle: `Welcome, ${userProfile?.name || 'there'}. Velvet Hearts focuses on intentional connections rather than superficial swiping. Here is a quick guide to each core feature.`,
      targetSelector: '.story-card-hero, .story-card-container',
      fallbackSelector: '.story-card-container',
      preferredPlacement: 'right'
    },
    {
      id: 'stories',
      tab: 'discover',
      badge: 'Story Deck',
      badgeIcon: Compass,
      badgeColor: '#B8436A',
      title: 'Browse Intentional Stories',
      subtitle: 'Profiles are presented as editorial stories. Tap photo sides to flip through pictures, read life stories, and check your real-time Vibe Match percentage.',
      targetSelector: '.story-card-hero, .story-card-photo-wrap',
      fallbackSelector: '.story-card-container',
      preferredPlacement: 'right'
    },
    {
      id: 'actions',
      tab: 'discover',
      badge: 'Meaningful Actions',
      badgeIcon: Heart,
      badgeColor: '#B8436A',
      title: 'Spark, Pass, or Super Spark',
      subtitle: 'Send a Spark to express interest, a Super Spark to stand out, or Pass Softly without negative pressure.',
      targetSelector: '.story-actions-bar, .story-actions-primary',
      fallbackSelector: '.story-actions-bar',
      preferredPlacement: 'top'
    },
    {
      id: 'matches',
      tab: 'matches',
      badge: 'Mutual Connections',
      badgeIcon: Heart,
      badgeColor: '#D4AD6A',
      title: 'Connections & 24h Spark Nudges',
      subtitle: 'When interest is mutual, a connection forms. View match details, send icebreakers, and nudge conversations to get started.',
      targetSelector: '.recent-matches-carousel-wrap, .matches-content-container, [data-tour-nav="matches"]',
      fallbackSelector: '[data-tour-nav="matches"]',
      preferredPlacement: 'bottom'
    },
    {
      id: 'chat',
      tab: 'chat',
      badge: 'Private Conversations',
      badgeIcon: Chats,
      badgeColor: '#B8436A',
      title: 'Safe Chat & Voice Notes',
      subtitle: 'Connect with authentic voice intros, photo sharing, replies, and read receipts in a private conversation space.',
      targetSelector: '.chat-main-area, .chat-view-container, [data-tour-nav="chat"]',
      fallbackSelector: '[data-tour-nav="chat"]',
      preferredPlacement: 'bottom'
    },
    {
      id: 'notifications',
      tab: 'notifications',
      badge: 'Real-Time Alerts',
      badgeIcon: Bell,
      badgeColor: '#D4AD6A',
      title: 'Instant Notifications',
      subtitle: 'Receive alerts when someone sparks your story, comments on an interest, or when a new connection is made.',
      targetSelector: '.notif-list-container, .notifications-page, [data-tour-nav="notifications"]',
      fallbackSelector: '[data-tour-nav="notifications"]',
      preferredPlacement: 'bottom'
    },
    {
      id: 'profile',
      tab: 'profile',
      badge: 'Your Profile',
      badgeIcon: User,
      badgeColor: '#B8436A',
      title: 'Public Profile & Saved Bookmarks',
      subtitle: 'Preview how others see you, update your details anytime, and access profiles you have bookmarked to rediscover later.',
      targetSelector: '.preview-photo-wrap, .preview-card-details, [data-tour-nav="profile"]',
      fallbackSelector: '[data-tour-nav="profile"]',
      preferredPlacement: 'right'
    },
    {
      id: 'safety',
      tab: 'safety',
      badge: 'Safety & Privacy',
      badgeIcon: ShieldCheck,
      badgeColor: '#28A745',
      title: 'Your Peace of Mind',
      subtitle: 'Screenshot protection, identity verification, 2-tap report tools, and accessibility settings keep your experience secure.',
      targetSelector: '.safety-section:first-child, [data-tour-nav="safety"]',
      fallbackSelector: '[data-tour-nav="safety"]',
      preferredPlacement: 'bottom'
    },
    {
      id: 'finish',
      tab: 'discover',
      badge: 'Tour Complete',
      badgeIcon: Lightning,
      badgeColor: '#D4AD6A',
      title: "You're Ready to Connect",
      subtitle: 'You are ready to begin discovering authentic people. You can replay this tour anytime from your Settings.',
      targetSelector: '.story-actions-bar, .story-card-hero',
      fallbackSelector: '.story-card-container',
      preferredPlacement: 'top'
    }
  ];

  const getTourStorageKey = useCallback(() => {
    const uid = userProfile?.id || userProfile?.uid || 'user';
    return `vh-tour-completed-${uid}`;
  }, [userProfile]);

  // Auto-launch tour ONLY ONCE when onboarding is complete for the user
  useEffect(() => {
    if (isLoggedIn && isOnboarded) {
      const tourKey = getTourStorageKey();
      const hasCompletedTour = localStorage.getItem(tourKey) || localStorage.getItem('vh-tour-completed');
      if (!hasCompletedTour && !isFeatureTourActive) {
        const timer = setTimeout(() => {
          setIsFeatureTourActive(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, isOnboarded, isFeatureTourActive, setIsFeatureTourActive, getTourStorageKey]);

  // Sync visibility with isFeatureTourActive
  useEffect(() => {
    if (isFeatureTourActive) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isFeatureTourActive]);

  // Handle active tab change and calculate smart positioning relative to target element
  const calculatePosition = useCallback(() => {
    const stepData = tourSteps[currentStep];
    if (!stepData || !stepData.targetSelector) {
      setTargetRect(null);
      setArrowDirection(null);
      setCardStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '460px',
        width: 'calc(100vw - 32px)'
      });
      return;
    }

    let el = document.querySelector(stepData.targetSelector);
    if (!el && stepData.fallbackSelector) {
      el = document.querySelector(stepData.fallbackSelector);
    }

    if (!el) {
      setTargetRect(null);
      setArrowDirection(null);
      setCardStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '460px',
        width: 'calc(100vw - 32px)'
      });
      return;
    }

    // Measure target element
    const rect = el.getBoundingClientRect();
    const padding = 6;
    const boundedRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      rawTop: rect.top,
      rawLeft: rect.left,
      rawRight: rect.right,
      rawBottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };

    setTargetRect(boundedRect);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(390, vw - 32);
    const cardEstHeight = 230;

    const spaceAbove = boundedRect.rawTop;
    const spaceBelow = vh - boundedRect.rawBottom;
    const spaceRight = vw - boundedRect.rawRight;
    const spaceLeft = boundedRect.rawLeft;

    let computedCardStyle = {
      position: 'fixed',
      width: `${cardWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 1000001
    };

    let computedArrowStyle = {};
    let computedArrowDir = 'down';

    // Desktop Left Sidebar Target Check
    const isSidebarTarget = boundedRect.rawLeft < 120 && boundedRect.width < 300 && vw > 768;

    if (isSidebarTarget && spaceRight >= cardWidth + 24) {
      // Position Card to the RIGHT of sidebar element
      computedCardStyle.left = `${boundedRect.rawRight + 16}px`;
      computedCardStyle.top = `${Math.max(16, Math.min(vh - cardEstHeight - 16, boundedRect.centerY - cardEstHeight / 2))}px`;
      computedArrowDir = 'left';
      computedArrowStyle = {
        left: '-18px',
        top: `${Math.min(cardEstHeight - 40, Math.max(20, boundedRect.centerY - (parseInt(computedCardStyle.top, 10) || 0) - 12))}px`
      };
    } else if (spaceAbove >= cardEstHeight + 20) {
      // Position Card ABOVE the target element
      computedCardStyle.bottom = `${vh - boundedRect.rawTop + 14}px`;
      const idealLeft = boundedRect.centerX - cardWidth / 2;
      const clampedLeft = Math.max(16, Math.min(vw - cardWidth - 16, idealLeft));
      computedCardStyle.left = `${clampedLeft}px`;
      computedArrowDir = 'down';
      computedArrowStyle = {
        bottom: '-18px',
        left: `${Math.max(24, Math.min(cardWidth - 24, boundedRect.centerX - clampedLeft - 12))}px`
      };
    } else if (spaceBelow >= cardEstHeight + 20) {
      // Position Card BELOW the target element
      computedCardStyle.top = `${boundedRect.rawBottom + 14}px`;
      const idealLeft = boundedRect.centerX - cardWidth / 2;
      const clampedLeft = Math.max(16, Math.min(vw - cardWidth - 16, idealLeft));
      computedCardStyle.left = `${clampedLeft}px`;
      computedArrowDir = 'up';
      computedArrowStyle = {
        top: '-18px',
        left: `${Math.max(24, Math.min(cardWidth - 24, boundedRect.centerX - clampedLeft - 12))}px`
      };
    } else if (spaceRight >= cardWidth + 20 && vw > 768) {
      // Position Card to the RIGHT
      computedCardStyle.left = `${boundedRect.rawRight + 14}px`;
      computedCardStyle.top = `${Math.max(16, Math.min(vh - cardEstHeight - 16, boundedRect.centerY - cardEstHeight / 2))}px`;
      computedArrowDir = 'left';
      computedArrowStyle = {
        left: '-18px',
        top: '30px'
      };
    } else {
      // Fallback: Place at bottom with subtle bounce down
      computedCardStyle.bottom = '24px';
      computedCardStyle.left = `${Math.max(16, (vw - cardWidth) / 2)}px`;
      computedArrowDir = 'up';
      computedArrowStyle = {
        top: '-18px',
        left: '50%',
        transform: 'translateX(-50%)'
      };
    }

    setCardStyle(computedCardStyle);
    setArrowStyle(computedArrowStyle);
    setArrowDirection(computedArrowDir);
  }, [currentStep]);

  // Sync step change, active tab, and re-calculate positions
  useEffect(() => {
    if (!isVisible) return;

    const stepData = tourSteps[currentStep];
    if (stepData && stepData.tab && activeTab !== stepData.tab) {
      setActiveTab(stepData.tab);
    }

    const timer = setTimeout(calculatePosition, 260);
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [currentStep, isVisible, activeTab, setActiveTab, calculatePosition]);

  const handleNext = () => {
    triggerHaptic('light');
    playHapticSound('pop');

    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    playHapticSound('pop');

    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    handleComplete();
  };

  const handleComplete = () => {
    try {
      const tourKey = getTourStorageKey();
      localStorage.setItem(tourKey, 'true');
      localStorage.setItem('vh-tour-completed', 'true');
    } catch (_) {}
    setIsFeatureTourActive(false);
    setIsVisible(false);
    setActiveTab('discover');
  };

  if (!isVisible || !isLoggedIn || !isOnboarded) {
    return null;
  }

  const step = tourSteps[currentStep] || tourSteps[0];
  const BadgeIcon = step.badgeIcon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const totalSteps = tourSteps.length;

  return (
    <div className="vh-tour-overlay animate-fade-in" role="dialog" aria-modal="true">
      {/* 100% Crystal-Clear Spotlight Hole with 9999px Translucent Dim Spread */}
      {targetRect ? (
        <div
          className="vh-spotlight-hole"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="vh-tour-full-dim" aria-hidden="true" />
      )}

      {/* Smart Anchored Floating Tooltip Card */}
      <div
        ref={cardRef}
        className="vh-tour-floating-card-wrap animate-scale-up"
        style={cardStyle}
      >
        {/* Dynamic Pointing Arrow */}
        {arrowDirection && (
          <div
            className={`vh-tour-pointer-arrow arrow-${arrowDirection}`}
            style={arrowStyle}
            aria-hidden="true"
          >
            {arrowDirection === 'down' && <ArrowDown size={28} weight="bold" className="anim-pulse-down" />}
            {arrowDirection === 'up' && <ArrowUp size={28} weight="bold" className="anim-pulse-up" />}
            {arrowDirection === 'left' && <ArrowLeft size={28} weight="bold" className="anim-pulse-left" />}
            {arrowDirection === 'right' && <ArrowRight size={28} weight="bold" className="anim-pulse-right" />}
          </div>
        )}

        <div className="vh-tour-card font-ui">
          {/* Card Header */}
          <div className="vh-tour-card-header">
            <div className="vh-tour-badge" style={{ backgroundColor: `${step.badgeColor}22`, borderColor: step.badgeColor }}>
              <BadgeIcon size={14} weight="fill" color={step.badgeColor} />
              <span style={{ color: step.badgeColor }}>{step.badge}</span>
            </div>

            <button
              type="button"
              className="vh-tour-skip-btn"
              onClick={handleSkip}
              aria-label="Skip app tour"
            >
              <X size={15} />
              <span>Skip</span>
            </button>
          </div>

          {/* Headline & Explanatory Body */}
          <div className="vh-tour-body">
            <h3 className="vh-tour-title font-display">{step.title}</h3>
            <p className="vh-tour-subtitle font-body">{step.subtitle}</p>
          </div>

          {/* Card Footer with Dots & Navigation */}
          <div className="vh-tour-footer">
            <div className="vh-tour-progress">
              <span className="vh-tour-step-counter">
                {currentStep + 1} of {totalSteps}
              </span>
              <div className="vh-tour-dots">
                {tourSteps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`vh-tour-dot ${idx === currentStep ? 'active' : idx < currentStep ? 'passed' : ''}`}
                    onClick={() => {
                      triggerHaptic('light');
                      setCurrentStep(idx);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="vh-tour-actions">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="vh-tour-btn vh-tour-btn-back font-ui"
                  aria-label="Previous step"
                >
                  <CaretLeft size={16} weight="bold" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="vh-tour-btn vh-tour-btn-next font-ui"
                aria-label={isLastStep ? 'Complete tour and begin' : 'Next step'}
              >
                <span>{isLastStep ? 'Start Discovering' : isFirstStep ? 'Begin Tour' : 'Next Step'}</span>
                {!isLastStep && <CaretRight size={16} weight="bold" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .vh-tour-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000000;
          pointer-events: auto;
          user-select: none;
        }

        .vh-spotlight-hole {
          position: fixed;
          border-radius: 16px;
          border: 2px solid #D4AD6A;
          background: transparent !important;
          box-shadow: 0 0 0 9999px rgba(8, 6, 9, 0.65), 0 0 25px rgba(212, 173, 106, 0.75);
          pointer-events: none;
          z-index: 999998;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: spotlightHolePulse 2s infinite ease-in-out;
        }

        .vh-tour-full-dim {
          position: fixed;
          inset: 0;
          background: rgba(8, 6, 9, 0.65);
          pointer-events: none;
          z-index: 999998;
        }

        @keyframes spotlightHolePulse {
          0%, 100% {
            box-shadow: 0 0 0 9999px rgba(8, 6, 9, 0.65), 0 0 15px rgba(212, 173, 106, 0.6);
            border-color: rgba(212, 173, 106, 0.85);
          }
          50% {
            box-shadow: 0 0 0 9999px rgba(8, 6, 9, 0.65), 0 0 30px rgba(243, 198, 143, 0.95);
            border-color: #F3C68F;
          }
        }

        .vh-tour-floating-card-wrap {
          transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vh-tour-card {
          background: rgba(24, 18, 22, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(212, 173, 106, 0.4);
          border-radius: 20px;
          padding: 20px 20px 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(184, 67, 106, 0.35);
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: #ffffff;
        }

        /* Directional Pointer Arrows */
        .vh-tour-pointer-arrow {
          position: absolute;
          color: #F3C68F;
          filter: drop-shadow(0 2px 10px rgba(184, 67, 106, 0.7));
          pointer-events: none;
          z-index: 10;
        }

        .anim-pulse-down {
          animation: pulseDown 1.3s infinite ease-in-out;
        }

        .anim-pulse-up {
          animation: pulseUp 1.3s infinite ease-in-out;
        }

        .anim-pulse-left {
          animation: pulseLeft 1.3s infinite ease-in-out;
        }

        .anim-pulse-right {
          animation: pulseRight 1.3s infinite ease-in-out;
        }

        @keyframes pulseDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @keyframes pulseUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulseLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }

        @keyframes pulseRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }

        /* Header */
        .vh-tour-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vh-tour-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .vh-tour-skip-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .vh-tour-skip-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Body */
        .vh-tour-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vh-tour-title {
          font-size: 18.5px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
        }

        .vh-tour-subtitle {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.5;
          margin: 0;
        }

        /* Footer */
        .vh-tour-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 2px;
        }

        .vh-tour-progress {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .vh-tour-step-counter {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .vh-tour-dots {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .vh-tour-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.22);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vh-tour-dot.active {
          width: 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #B8436A 0%, #D4AD6A 100%);
          box-shadow: 0 0 6px rgba(184, 67, 106, 0.6);
        }

        .vh-tour-dot.passed {
          background: rgba(212, 173, 106, 0.65);
        }

        .vh-tour-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vh-tour-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 36px;
          padding: 0 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vh-tour-btn-back {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .vh-tour-btn-back:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .vh-tour-btn-next {
          background: linear-gradient(135deg, #B8436A 0%, #E86B93 100%);
          border: none;
          color: #ffffff;
          box-shadow: 0 3px 12px rgba(184, 67, 106, 0.45);
        }

        .vh-tour-btn-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(184, 67, 106, 0.65);
          filter: brightness(1.08);
        }

        .vh-tour-btn-next:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .vh-tour-card {
            padding: 16px 16px 14px;
          }
          .vh-tour-title {
            font-size: 17px;
          }
          .vh-tour-subtitle {
            font-size: 13px;
          }
          .vh-tour-btn {
            height: 34px;
            padding: 0 12px;
            font-size: 12.5px;
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureTourGuide;

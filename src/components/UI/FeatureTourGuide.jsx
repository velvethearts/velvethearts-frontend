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
  CheckCircle,
  Lightning,
  Eye,
  Sliders
} from '@phosphor-icons/react';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';

const TOUR_STORAGE_KEY = 'vh-feature-tour-completed';

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
  const [spotlightRect, setSpotlightRect] = useState(null);
  const previousTabRef = useRef(activeTab);

  // Define the comprehensive 8-step multi-page tour sequence
  const tourSteps = [
    {
      id: 'welcome',
      tab: 'discover',
      badge: 'Welcome to Velvet Hearts',
      badgeIcon: Sparkle,
      badgeColor: '#D4AD6A',
      title: 'A Different Kind of Dating Space',
      subtitle: `Welcome, ${userProfile?.name || 'there'}! Velvet Hearts replaces mindless swiping with meaningful human connections. Let's take a quick 1-minute tour of your new space.`,
      targetSelector: null,
      arrowDirection: null,
      cardPosition: 'center'
    },
    {
      id: 'stories',
      tab: 'discover',
      badge: 'Story Deck',
      badgeIcon: Compass,
      badgeColor: '#B8436A',
      title: 'Browse Intentional Stories',
      subtitle: 'Profiles are presented like magazine stories. Tap on photo sides to flip through pictures, read personal stories, and check the real-time Vibe Match % indicator.',
      targetSelector: '.story-card-container, .story-deck-wrapper',
      arrowDirection: 'down',
      cardPosition: 'bottom'
    },
    {
      id: 'actions',
      tab: 'discover',
      badge: 'Meaningful Actions',
      badgeIcon: Heart,
      badgeColor: '#B8436A',
      title: 'Spark ✨, Pass Softly, or Super Spark',
      subtitle: 'No hasty swipe gestures! Send a thoughtful Spark ✨ to show interest, a Super Spark ⭐️ to stand out instantly, or Pass Softly without negative gamification.',
      targetSelector: '.story-actions-bar, .story-actions-primary',
      arrowDirection: 'down',
      cardPosition: 'top'
    },
    {
      id: 'matches',
      tab: 'matches',
      badge: 'Mutual Connections',
      badgeIcon: Heart,
      badgeColor: '#D4AD6A',
      title: 'Connections & 24h Spark Nudges',
      subtitle: 'When mutual interest is shared, you match! See spark countdowns, 1-tap icebreakers, and send playful nudges to get conversations started.',
      targetSelector: '.recent-matches-carousel-wrap, .matches-content-container, .page-header',
      arrowDirection: 'down',
      cardPosition: 'center'
    },
    {
      id: 'chat',
      tab: 'chat',
      badge: 'Private Conversations',
      badgeIcon: Chats,
      badgeColor: '#B8436A',
      title: 'Safe Chat & Voice Notes',
      subtitle: 'Connect deeply with 2-minute voice intros, photo sharing, message replies, and real-time seen receipts in a distraction-free space.',
      targetSelector: '.chat-main-area, .chat-view-container',
      arrowDirection: 'down',
      cardPosition: 'center'
    },
    {
      id: 'notifications',
      tab: 'notifications',
      badge: 'Real-Time Alerts',
      badgeIcon: Bell,
      badgeColor: '#D4AD6A',
      title: 'Instant Updates',
      subtitle: 'Never miss a connection! Get real-time alerts whenever someone sparks your story, comments on an interest, or becomes a mutual match.',
      targetSelector: '.notif-list-container, .notifications-page',
      arrowDirection: 'down',
      cardPosition: 'center'
    },
    {
      id: 'profile',
      tab: 'profile',
      badge: 'Your Persona',
      badgeIcon: User,
      badgeColor: '#B8436A',
      title: 'Your Public Profile & Saved Bookmarks',
      subtitle: 'Preview how others see you, update your photos and bio details anytime, and access profiles you have bookmarked to rediscover later.',
      targetSelector: '.profile-preview-card, .you-preview-panel',
      arrowDirection: 'down',
      cardPosition: 'center'
    },
    {
      id: 'safety',
      tab: 'safety',
      badge: 'Safety & Privacy',
      badgeIcon: ShieldCheck,
      badgeColor: '#28A745',
      title: 'Your Peace of Mind is First',
      subtitle: 'Anti-screenshot protection, active identity verification, 2-tap report tools, and customizable accessibility settings keep your experience secure.',
      targetSelector: '.safety-content-grid, .safety-center-page',
      arrowDirection: 'down',
      cardPosition: 'center'
    },
    {
      id: 'finish',
      tab: 'discover',
      badge: 'Tour Complete',
      badgeIcon: Lightning,
      badgeColor: '#D4AD6A',
      title: "You're Ready to Connect! 💖",
      subtitle: 'You are all set to start discovering authentic people who truly see you. You can revisit this tour anytime from your Settings.',
      targetSelector: null,
      arrowDirection: null,
      cardPosition: 'center'
    }
  ];

  // Auto-launch tour on first-time onboarding
  useEffect(() => {
    if (isLoggedIn && isOnboarded) {
      const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompletedTour && !isFeatureTourActive) {
        // Short delay so page loads and animates in smoothly first
        const timer = setTimeout(() => {
          setIsFeatureTourActive(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, isOnboarded, isFeatureTourActive, setIsFeatureTourActive]);

  // Sync visibility with isFeatureTourActive
  useEffect(() => {
    if (isFeatureTourActive) {
      setIsVisible(true);
      setCurrentStep(0);
      previousTabRef.current = activeTab;
    } else {
      setIsVisible(false);
    }
  }, [isFeatureTourActive]);

  // Update active tab and spotlight rectangle when step changes
  useEffect(() => {
    if (!isVisible) return;

    const stepData = tourSteps[currentStep];
    if (stepData && stepData.tab && activeTab !== stepData.tab) {
      setActiveTab(stepData.tab);
    }

    // Measure target element position for spotlight cutout
    const updateSpotlight = () => {
      if (!stepData || !stepData.targetSelector) {
        setSpotlightRect(null);
        return;
      }

      const el = document.querySelector(stepData.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          top: Math.max(0, rect.top - 8),
          left: Math.max(0, rect.left - 8),
          width: rect.width + 16,
          height: rect.height + 16
        });
      } else {
        setSpotlightRect(null);
      }
    };

    const timer = setTimeout(updateSpotlight, 280);
    window.addEventListener('resize', updateSpotlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [currentStep, isVisible, activeTab, setActiveTab]);

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
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
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
      {/* Dynamic SVG Spotlight Cutout Backdrop */}
      <svg className="vh-tour-backdrop-svg" aria-hidden="true">
        <defs>
          <mask id="vhTourSpotlightMask">
            <rect width="100%" height="100%" fill="#ffffff" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="16"
                fill="#000000"
                className="vh-spotlight-cutout"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 8, 11, 0.85)"
          mask="url(#vhTourSpotlightMask)"
        />
      </svg>

      {/* Spotlight Halo Glow Ring if targeted */}
      {spotlightRect && (
        <div
          className="vh-spotlight-halo"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height
          }}
          aria-hidden="true"
        />
      )}

      {/* Tour Step Card Container */}
      <div className={`vh-tour-card-wrap position-${step.cardPosition}`}>
        {/* Animated Directional Pointer Arrow */}
        {step.arrowDirection && (
          <div className={`vh-tour-arrow-box arrow-${step.arrowDirection}`}>
            {step.arrowDirection === 'down' && <ArrowDown size={32} weight="bold" className="anim-bounce-down" />}
            {step.arrowDirection === 'up' && <ArrowUp size={32} weight="bold" className="anim-bounce-up" />}
            {step.arrowDirection === 'left' && <ArrowLeft size={32} weight="bold" className="anim-bounce-left" />}
            {step.arrowDirection === 'right' && <ArrowRight size={32} weight="bold" className="anim-bounce-right" />}
          </div>
        )}

        <div className="vh-tour-card animate-scale-up font-ui">
          {/* Top Bar with Step Dots & Skip button */}
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
              <X size={16} />
              <span>Skip</span>
            </button>
          </div>

          {/* Headline & Story Subtitle */}
          <div className="vh-tour-body">
            <h3 className="vh-tour-title font-display">{step.title}</h3>
            <p className="vh-tour-subtitle font-body">{step.subtitle}</p>
          </div>

          {/* Progress Indicators & Navigation Controls */}
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
                  aria-label="Previous tour step"
                >
                  <CaretLeft size={16} weight="bold" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="vh-tour-btn vh-tour-btn-next font-ui"
                aria-label={isLastStep ? 'Complete tour and start exploring' : 'Next tour step'}
              >
                <span>{isLastStep ? 'Start Discovering ✨' : isFirstStep ? "Let's Go!" : 'Next Step'}</span>
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
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          user-select: none;
        }

        .vh-tour-backdrop-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          backdrop-filter: blur(4px);
        }

        .vh-spotlight-halo {
          position: absolute;
          border-radius: 16px;
          border: 2px solid rgba(212, 173, 106, 0.8);
          box-shadow: 0 0 30px rgba(184, 67, 106, 0.4), 0 0 15px rgba(212, 173, 106, 0.6);
          pointer-events: none;
          animation: spotlightPulse 2s infinite ease-in-out;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes spotlightPulse {
          0%, 100% {
            box-shadow: 0 0 25px rgba(184, 67, 106, 0.4), 0 0 10px rgba(212, 173, 106, 0.5);
            border-color: rgba(212, 173, 106, 0.7);
          }
          50% {
            box-shadow: 0 0 45px rgba(184, 67, 106, 0.7), 0 0 20px rgba(212, 173, 106, 0.9);
            border-color: rgba(240, 212, 160, 1);
          }
        }

        .vh-tour-card-wrap {
          position: relative;
          z-index: 10;
          max-width: 480px;
          width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .vh-tour-card-wrap.position-top {
          margin-bottom: auto;
          margin-top: 40px;
        }

        .vh-tour-card-wrap.position-bottom {
          margin-top: auto;
          margin-bottom: 40px;
        }

        .vh-tour-card {
          width: 100%;
          background: rgba(26, 20, 24, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1.5px solid rgba(212, 173, 106, 0.35);
          border-radius: 24px;
          padding: 24px 24px 20px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(184, 67, 106, 0.3);
          display: flex;
          flex-direction: column;
          gap: 16px;
          color: #ffffff;
        }

        /* Directional Pointing Arrows */
        .vh-tour-arrow-box {
          color: #F3C68F;
          filter: drop-shadow(0 4px 12px rgba(184, 67, 106, 0.6));
          margin-bottom: 8px;
        }

        .anim-bounce-down {
          animation: bounceDown 1.4s infinite ease-in-out;
        }

        .anim-bounce-up {
          animation: bounceUp 1.4s infinite ease-in-out;
        }

        .anim-bounce-left {
          animation: bounceLeft 1.4s infinite ease-in-out;
        }

        .anim-bounce-right {
          animation: bounceRight 1.4s infinite ease-in-out;
        }

        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        @keyframes bounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bounceLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }

        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
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
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid;
          font-size: 12px;
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
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .vh-tour-skip-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Body */
        .vh-tour-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vh-tour-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }

        .vh-tour-subtitle {
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.55;
          margin: 0;
        }

        /* Footer */
        .vh-tour-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 4px;
        }

        .vh-tour-progress {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vh-tour-step-counter {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .vh-tour-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .vh-tour-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vh-tour-dot.active {
          width: 22px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #B8436A 0%, #D4AD6A 100%);
          box-shadow: 0 0 8px rgba(184, 67, 106, 0.6);
        }

        .vh-tour-dot.passed {
          background: rgba(212, 173, 106, 0.6);
        }

        .vh-tour-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vh-tour-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 40px;
          padding: 0 16px;
          border-radius: 9999px;
          font-size: 13.5px;
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
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.45);
        }

        .vh-tour-btn-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.65);
          filter: brightness(1.08);
        }

        .vh-tour-btn-next:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .vh-tour-card {
            padding: 20px 18px 16px;
          }
          .vh-tour-title {
            font-size: 19px;
          }
          .vh-tour-subtitle {
            font-size: 13.5px;
          }
          .vh-tour-btn {
            height: 38px;
            padding: 0 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureTourGuide;

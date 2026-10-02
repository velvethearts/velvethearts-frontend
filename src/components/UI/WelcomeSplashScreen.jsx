import React, { useState, useEffect, useRef, useCallback } from 'react';
import { triggerHaptic } from '../../utils/haptics';
import './WelcomeSplashScreen.css';

const SLIDES = [
  {
    id: 'romance',
    badge: 'CURATED ✦',
    verticalLetters: ['R', 'O', 'M', 'A', 'N', 'C', 'E'],
    headline: 'Where authentic hearts meet.',
    subtitle: 'Intentionally curated connections for those who cherish true romance and meaningful depth.',
    buttonText: 'Begin Your Journey',
    renderArt: () => (
      <svg
        aria-label="Artistic illustration of two hands gently meeting around a velvet heart"
        className="vh-art-svg"
        fill="none"
        viewBox="0 0 320 380"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Decorative Backing Organic Sun/Aura */}
        <ellipse cx="160" cy="190" fill="#FAD1DA" rx="98" ry="102" />
        <circle cx="160" cy="190" fill="#F4BAC8" fillOpacity={0.6} r="74" />

        {/* Stylized Floating Sparks */}
        <path d="M 68 110 L 71 118 L 79 121 L 71 124 L 68 132 L 65 124 L 57 121 L 65 118 Z" fill="#BE123C" />
        <path d="M 248 100 L 250 106 L 256 108 L 250 110 L 248 116 L 246 110 L 240 108 L 246 106 Z" fill="#D4AF37" />
        <circle cx="236" cy="138" fill="#BE123C" r="4.5" />
        <circle cx="82" cy="155" fill="#D4AF37" r="3" />

        {/* Lower Left Reaching Hand */}
        <path d="M -10 370 L 60 270 L 105 305 L 35 410 Z" fill="#8E1738" />
        <circle cx="78" cy="292" fill="#FAF6F0" r="5" />

        {/* Hand Palm & Reaching Palm */}
        <path
          d="M 52 278 C 65 260 88 250 112 258 C 128 263 150 272 172 268 C 188 265 198 252 195 240 C 192 230 178 226 158 230 C 138 234 116 235 98 222 C 84 212 80 196 90 185 C 99 174 122 178 138 186 L 168 198 C 179 202 196 200 206 193 C 215 186 218 174 210 167 C 200 158 174 158 152 165"
          fill="#D97A53"
          stroke="#2A0B14"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />

        {/* Graceful Reaching Hand From Top-Right */}
        <path d="M 330 60 L 250 120 L 285 160 L 370 105 Z" fill="#2A0B14" />
        <circle cx="270" cy="142" fill="#D4AF37" r="4" />

        {/* Descending Loving Hand */}
        <path
          d="M 260 128 C 248 140 230 152 205 160 C 182 168 155 168 135 158 C 120 150 115 138 122 128 C 130 118 148 118 168 124 C 186 130 205 130 220 120 C 232 112 238 98 230 88 C 220 78 195 82 178 92"
          fill="#F1C2A8"
          stroke="#2A0B14"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />

        {/* Painted Nail Accent Details */}
        <path d="M 194 240 C 196 244 195 248 192 250 C 189 252 185 250 184 246 Z" fill="#BE123C" />
        <path d="M 122 128 C 120 124 122 120 125 119 C 128 118 131 121 131 125 Z" fill="#BE123C" />

        {/* Centerpiece: Velvet Rose Heart Emblem */}
        <g transform="translate(160, 205)">
          <path
            d="M 0 -22 C -20 -44 -46 -15 -26 12 C -12 28 0 40 0 40 C 0 40 12 28 26 12 C 46 -15 20 -44 0 -22 Z"
            fill="#BE123C"
            stroke="#2A0B14"
            strokeWidth="4.5"
          />
          <path
            d="M -8 -8 C -14 -18 -4 -25 3 -20 C 10 -15 12 -4 4 4 C -4 12 -12 6 -6 0"
            fill="none"
            stroke="#FCE7EB"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
          <circle cx="10" cy="6" fill="#FAF6F0" r="2.5" />
        </g>

        {/* Golden Ring Accessory on Finger */}
        <ellipse cx="140" cy="188" fill="#D4AF37" rx="4" ry="7" stroke="#2A0B14" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'devotion',
    badge: 'SANCTUARY ✦',
    verticalLetters: ['D', 'E', 'V', 'O', 'T', 'I', 'O', 'N'],
    headline: 'A sanctuary built for true devotion.',
    subtitle: 'Step into an elevated private community where every match is meaningful and authentic.',
    buttonText: 'Begin Your Journey',
    renderArt: () => (
      <svg
        aria-label="Artistic illustration of sanctuary and devotion"
        className="vh-art-svg animate-float"
        fill="none"
        viewBox="0 0 300 350"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient cx="50%" cy="48%" fx="50%" fy="48%" id="vhAuraGlow" r="48%">
            <stop offset="0%" stopColor="#FCDADA" stopOpacity={0.95} />
            <stop offset="65%" stopColor="#FDE8EA" stopOpacity={0.65} />
            <stop offset="100%" stopColor="#FAF6F0" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="vhVelvetGradient" x1="20%" y1="10%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#C53050" />
            <stop offset="60%" stopColor="#9F1239" />
            <stop offset="100%" stopColor="#4A081C" />
          </linearGradient>
          <linearGradient id="vhDeepSleeve" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A0B1A" />
            <stop offset="100%" stopColor="#1B040B" />
          </linearGradient>
        </defs>

        {/* Central Circular Aura */}
        <circle cx="150" cy="168" fill="url(#vhAuraGlow)" r="88" />
        <circle cx="150" cy="168" r="80" stroke="#F1D1D4" strokeDasharray="3 3" strokeWidth="1" />

        {/* Constellation Orbit Ring */}
        <ellipse
          cx="150"
          cy="168"
          rx="100"
          ry="46"
          stroke="#DEC3B7"
          strokeDasharray="4 6"
          strokeWidth="0.8"
          transform="rotate(-18 150 168)"
        />

        {/* Floating Sparkles */}
        <g className="animate-sparkle">
          <path d="M 85 106 Q 85 116 75 116 Q 85 116 85 126 Q 85 116 95 116 Q 85 116 85 106 Z" fill="#9F1239" />
          <circle cx="85" cy="116" fill="#FAF7F2" r="1.5" />
        </g>
        <g className="animate-sparkle-delayed">
          <path d="M 226 112 Q 226 119 219 119 Q 226 119 226 126 Q 226 119 233 119 Q 226 119 226 112 Z" fill="#D98A52" />
        </g>
        <circle cx="196" cy="94" fill="#E8B097" r="2.5" />
        <circle cx="98" cy="225" fill="#E0B6A7" r="2" />

        {/* Lower Left Stylized Cradling Arm */}
        <path d="M 40 310 L 82 208 L 126 238 L 84 340 Z" fill="url(#vhDeepSleeve)" />
        <circle cx="106" cy="226" fill="#FAF6F0" r="3.2" />
        <path
          d="M 82 208 C 96 174, 118 165, 142 188 C 158 205, 178 208, 192 196 C 205 184, 195 160, 172 165 C 145 170, 134 148, 146 132 C 160 114, 192 118, 204 135"
          fill="none"
          stroke="#DFA891"
          strokeLinecap="round"
          strokeWidth="19"
        />
        <path
          d="M 82 208 C 96 174, 118 165, 142 188 C 158 205, 178 208, 192 196 C 205 184, 195 160, 172 165"
          fill="none"
          stroke="#1D0810"
          strokeLinecap="round"
          strokeWidth="3.2"
        />

        {/* Upper Right Intertwining Reaching Hand */}
        <path d="M 276 88 L 222 136 L 246 162 L 300 114 Z" fill="url(#vhDeepSleeve)" />
        <circle cx="236" cy="148" fill="#E9CFC0" r="3" />
        <path
          d="M 224 136 C 202 154, 185 142, 168 126 C 150 110, 126 120, 136 142 C 144 158, 166 164, 186 160"
          fill="none"
          stroke="#E5BAA4"
          strokeLinecap="round"
          strokeWidth="16"
        />
        <path
          d="M 224 136 C 202 154, 185 142, 168 126 C 150 110, 126 120, 136 142"
          fill="none"
          stroke="#1D0810"
          strokeLinecap="round"
          strokeWidth="3"
        />

        {/* Botanical Velvet Rose Petals Behind Heart */}
        <path d="M 132 176 C 120 160, 122 144, 136 138 C 148 132, 164 138, 166 152 Z" fill="#E89BA7" opacity="0.7" />
        <path d="M 166 172 C 178 156, 176 140, 162 134 C 150 128, 134 134, 132 148 Z" fill="#D36B7E" opacity="0.6" />

        {/* Radiant Heart Blossom Centerpiece */}
        <g className="animate-heart-pulse">
          <path
            d="M 150 186 C 132 165, 114 148, 126 130 C 136 116, 150 126, 150 135 C 150 126, 164 116, 174 130 C 186 148, 168 165, 150 186 Z"
            fill="url(#vhVelvetGradient)"
            stroke="#1D0810"
            strokeWidth="3.2"
          />
          <path
            d="M 143 148 C 140 141, 146 136, 150 139 C 155 142, 148 154, 153 160 C 156 164, 162 162, 160 156"
            fill="none"
            stroke="#FAF7F2"
            strokeDasharray="0.2 2"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="140" cy="138" fill="#FAF6F0" r="2" />
          <circle cx="160" cy="138" fill="#FAF6F0" opacity="0.8" r="1.5" />
        </g>

        {/* Botanical Tendril Accents */}
        <path d="M 148 190 Q 150 216 166 226" fill="none" stroke="#9F1239" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="166" cy="226" fill="#9F1239" r="3" />
        <circle cx="128" cy="116" fill="#C53050" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'intention',
    badge: 'VERIFIED ✦',
    verticalLetters: ['I', 'N', 'T', 'E', 'N', 'T', 'I', 'O', 'N'],
    headline: 'Thoughtful,\nintentional dating.',
    subtitle: 'Designed for genuine people seeking profound chemistry, shared values, and lasting romance.',
    buttonText: 'Continue',
    renderArt: () => (
      <svg
        aria-label="Artistic illustration of love letter with wax seal"
        className="vh-art-svg animate-float"
        fill="none"
        viewBox="0 0 280 340"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter height="120%" id="vhSoftGlow" width="120%" x="-10%" y="-10%">
            <feDropShadow dx="0" dy="4" floodColor="#8A1538" floodOpacity={0.16} stdDeviation={5} />
          </filter>
          <linearGradient gradientUnits="userSpaceOnUse" id="vhEnvelopeGradient" x1="60" x2="220" y1="120" y2="280">
            <stop offset="0%" stopColor="#FFF9F5" />
            <stop offset="100%" stopColor="#EFE1D5" />
          </linearGradient>
          <linearGradient id="vhWineAccent" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#A51D42" />
            <stop offset="100%" stopColor="#6F0A29" />
          </linearGradient>
        </defs>

        {/* Background Ambient Circle Aura */}
        <circle cx="140" cy="175" fill="#F8DFE3" fillOpacity={0.75} r="78" />

        {/* Golden Decorative Sparkles */}
        <path d="M 215 105 Q 215 113 223 113 Q 215 113 215 121 Q 215 113 207 113 Q 215 113 215 105 Z" fill="#D4AF37" />
        <circle cx="198" cy="126" fill="#D4AF37" r="2.5" />

        <path d="M 76 138 Q 76 145 83 145 Q 76 145 76 152 Q 76 145 69 145 Q 76 145 76 138 Z" fill="#A51D42" />
        <circle cx="89" cy="162" fill="#D4AF37" r="2" />

        {/* Flowing Hand / Ribbon Tendril */}
        <path
          d="M 45 220 C 70 200 85 130 142 122 C 195 115 228 148 238 185 C 244 208 230 236 195 242 C 160 248 115 222 105 200"
          fill="none"
          opacity="0.9"
          stroke="#280C19"
          strokeLinecap="round"
          strokeWidth="3"
        />

        {/* Skin Tone Organic Loop */}
        <path
          d="M 70 240 C 95 245 112 230 120 215 C 132 190 148 175 180 180 C 205 184 216 198 214 212 C 210 232 178 248 140 248 C 105 248 78 235 70 240 Z"
          fill="#E6B898"
          stroke="#280C19"
          strokeWidth="2.5"
        />

        {/* Editorial Love Letter / Envelope Silhouette */}
        <g transform="translate(140, 178) rotate(-7) translate(-140, -178)">
          <rect
            fill="url(#vhEnvelopeGradient)"
            filter="url(#vhSoftGlow)"
            height="96"
            rx="8"
            stroke="#280C19"
            strokeWidth="3"
            width="120"
            x="80"
            y="125"
          />
          {/* Inner Letter Sheet */}
          <path d="M 92 125 L 92 105 C 92 102 94 100 97 100 L 183 100 C 186 100 188 102 188 105 L 188 125 Z" fill="#FFFDFC" stroke="#280C19" strokeWidth="2" />
          <line stroke="#C9BDB3" strokeLinecap="round" strokeWidth="2" x1="102" x2="148" y1="110" y2="110" />
          <line stroke="#C9BDB3" strokeLinecap="round" strokeWidth="2" x1="102" x2="168" y1="117" y2="117" />

          {/* Envelope Flap */}
          <path d="M 80 127 L 140 168 L 200 127" fill="#FAF1E8" stroke="#280C19" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M 80 220 L 126 175" stroke="#280C19" strokeWidth="2" />
          <path d="M 200 220 L 154 175" stroke="#280C19" strokeWidth="2" />

          {/* Deep Wine Ribbon */}
          <path d="M 75 170 L 205 170" stroke="#8A1538" strokeLinecap="square" strokeWidth="7" />
          <path d="M 75 170 L 205 170" stroke="#280C19" strokeDasharray="3 3" strokeWidth="1.5" />

          {/* Central Velvet Heart Wax Seal */}
          <g transform="translate(140, 170)">
            <circle cx="0" cy="0" fill="url(#vhWineAccent)" r="23" stroke="#280C19" strokeWidth="2.5" />
            <path
              d="M 0 10 C -13 0 -15 -11 -6 -15 C -2 -17 0 -13 0 -11 C 0 -13 2 -17 6 -15 C 15 -11 13 0 0 10 Z"
              fill="#FFFFFF"
              opacity="0.92"
            />
          </g>
        </g>

        {/* Forefront Ribbon Line */}
        <path d="M 68 250 C 95 270 160 270 190 235 C 205 218 200 195 188 185" fill="none" stroke="#280C19" strokeLinecap="round" strokeWidth="3" />

        {/* Velvet Tag */}
        <path d="M 52 235 L 102 290 L 76 312 L 26 257 Z" fill="#8A1538" stroke="#280C19" strokeWidth="2.5" />
        <circle cx="68" cy="265" fill="#FAF7F2" r="3.5" stroke="#280C19" strokeWidth="1.5" />

        {/* Small Heart Accent */}
        <path d="M 140 76 C 137 72 131 72 129 76 C 127 80 140 89 140 89 C 140 89 153 80 151 76 C 149 72 143 72 140 76 Z" fill="#8A1538" />
      </svg>
    ),
  },
];

export const WelcomeSplashScreen = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isFinishedRef = useRef(false);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  const handleFinish = useCallback(
    (options) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      setIsExiting(true);
      triggerHaptic('light');
      setTimeout(() => {
        if (onComplete) onComplete(options);
      }, 500);
    },
    [onComplete]
  );

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    triggerHaptic('selection');
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    triggerHaptic('selection');
  }, []);

  const goToSlide = (idx) => {
    setActiveIndex(idx);
    triggerHaptic('selection');
  };

  // Automatic scrolling: smoothly transitions every 4.2 seconds unless paused
  useEffect(() => {
    if (isPaused || isExiting) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [isPaused, isExiting, activeIndex]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish, nextSlide, prevSlide]);

  // Touch Swipe Handling
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <div
      className={`vh-splash-overlay ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-label="Welcome to Velvet Hearts"
    >
      {/* Ambient Atmospheric Glows */}
      <div className="vh-ambient-glow vh-glow-top-right" aria-hidden="true" />
      <div className="vh-ambient-glow vh-glow-bottom-left" aria-hidden="true" />

      {/* Free-standing Responsive Container */}
      <div
        className="vh-editorial-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Header: Brandmark + Skip */}
        <header className="vh-header-bar">
          <div className="vh-brandmark">
            <span className="vh-brand-dot" />
            <h1 className="vh-brand-title">Velvet Hearts</h1>
          </div>

          <button
            type="button"
            className="vh-skip-btn"
            onClick={() => handleFinish()}
            aria-label="Skip introduction"
          >
            Skip
          </button>
        </header>

        {/* Responsive Content Body: Vertical stack on mobile, 2-column luxury spread on laptop */}
        <div className="vh-editorial-body">
          {/* Central Component: Fixed Arch Window with Silk-Smooth Artwork Transition */}
          <section className="vh-center-stage" aria-label="Editorial Showcase Carousel">
            <div className="vh-arch-outer">
              <div className="vh-arch-inner">
                {/* Subtle Dotted Texture Pattern */}
                <div className="vh-arch-dot-grid" aria-hidden="true" />

                {/* Delicate Dashed Arch Line */}
                <div className="vh-arch-dashed-border" aria-hidden="true" />

                {/* Vertical Micro-Lettering on Left Arch Margin (Safely positioned to never clip!) */}
                <div
                  className="vh-micro-lettering"
                  key={`lettering-${activeIndex}`}
                  aria-hidden="true"
                >
                  {currentSlide.verticalLetters.map((char, cIdx) => (
                    <span key={cIdx}>{char}</span>
                  ))}
                </div>

                {/* Artwork Stage: Smoothly Crossfades without any page-flipping motion */}
                <div className="vh-art-stage">
                  {SLIDES.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`vh-art-slide ${idx === activeIndex ? 'is-active' : ''}`}
                      aria-hidden={idx !== activeIndex}
                    >
                      {slide.renderArt()}
                    </div>
                  ))}
                </div>

                {/* Bottom-Right Floating Pill Badge */}
                <div className="vh-arch-badge" key={`badge-${activeIndex}`}>
                  <span>{currentSlide.badge}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Copy, Dots Navigation & Primary Actions */}
          <footer className="vh-footer-section">
            {/* Pagination Indicators */}
            <nav
              className="vh-dots-nav"
              aria-label="Slide indicators"
              onClick={(e) => e.stopPropagation()}
            >
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="vh-dot-btn"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={activeIndex === idx ? 'true' : 'false'}
                >
                  <span
                    className={`vh-dot ${
                      activeIndex === idx ? 'is-active' : 'is-inactive'
                    }`}
                  />
                </button>
              ))}
            </nav>

            {/* Editorial Headline & Subtitle */}
            <div className="vh-copy-block">
              <h2 className="vh-headline" key={`headline-${activeIndex}`}>
                {currentSlide.headline}
              </h2>
              <p className="vh-subtitle" key={`sub-${activeIndex}`}>
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Primary Action Button — Single click enters the app/landing page immediately */}
            <button
              type="button"
              className="vh-primary-btn group"
              onClick={() => handleFinish()}
            >
              <span className="vh-btn-label">{currentSlide.buttonText}</span>
              <div className="vh-arrow-circle">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                  />
                </svg>
              </div>
            </button>

            {/* Secondary Sign In Link */}
            <p className="vh-signin-prompt">
              Already a member?
              <button
                type="button"
                className="vh-signin-link"
                onClick={() => handleFinish({ openSignIn: true })}
              >
                Sign In
              </button>
            </p>

            {/* iOS Home Indicator Bar */}
            <div className="vh-home-indicator" aria-hidden="true" />
          </footer>
        </div>
      </div>
    </div>
  );
};

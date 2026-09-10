import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';
import { triggerHaptic } from '../../utils/haptics';
import './WelcomeSplashScreen.css';

// 40 balanced star positions spread across the entire viewport (desktop & mobile)
const FULL_SCREEN_STARS = [
  { top: '6%', left: '8%', size: 10, delay: '0.2s', duration: '2.4s' },
  { top: '10%', left: '22%', size: 14, delay: '0.8s', duration: '3.0s' },
  { top: '7%', left: '42%', size: 8, delay: '1.2s', duration: '2.1s' },
  { top: '12%', left: '60%', size: 12, delay: '0.4s', duration: '2.8s' },
  { top: '8%', left: '78%', size: 13, delay: '1.5s', duration: '3.3s' },
  { top: '14%', left: '92%', size: 9, delay: '0.6s', duration: '2.5s' },

  { top: '22%', left: '5%', size: 11, delay: '1.1s', duration: '2.9s' },
  { top: '26%', left: '18%', size: 15, delay: '0.3s', duration: '3.2s' },
  { top: '20%', left: '33%', size: 8, delay: '1.7s', duration: '2.2s' },
  { top: '24%', left: '52%', size: 10, delay: '0.5s', duration: '2.7s' },
  { top: '28%', left: '70%', size: 14, delay: '1.0s', duration: '3.1s' },
  { top: '22%', left: '85%', size: 9, delay: '0.9s', duration: '2.6s' },

  { top: '38%', left: '10%', size: 12, delay: '0.7s', duration: '2.8s' },
  { top: '36%', left: '26%', size: 8, delay: '1.3s', duration: '2.3s' },
  { top: '42%', left: '40%', size: 13, delay: '0.1s', duration: '3.4s' },
  { top: '39%', left: '62%', size: 9, delay: '1.6s', duration: '2.5s' },
  { top: '44%', left: '79%', size: 15, delay: '0.4s', duration: '3.0s' },
  { top: '40%', left: '94%', size: 10, delay: '1.1s', duration: '2.7s' },

  { top: '56%', left: '7%', size: 14, delay: '0.5s', duration: '3.2s' },
  { top: '52%', left: '20%', size: 9, delay: '1.4s', duration: '2.4s' },
  { top: '58%', left: '36%', size: 11, delay: '0.8s', duration: '2.9s' },
  { top: '54%', left: '56%', size: 8, delay: '1.8s', duration: '2.2s' },
  { top: '60%', left: '74%', size: 13, delay: '0.2s', duration: '3.1s' },
  { top: '55%', left: '88%', size: 10, delay: '1.2s', duration: '2.6s' },

  { top: '72%', left: '12%', size: 10, delay: '0.9s', duration: '2.7s' },
  { top: '68%', left: '28%', size: 14, delay: '0.3s', duration: '3.3s' },
  { top: '75%', left: '48%', size: 9, delay: '1.5s', duration: '2.5s' },
  { top: '70%', left: '66%', size: 12, delay: '0.6s', duration: '2.8s' },
  { top: '76%', left: '82%', size: 8, delay: '1.1s', duration: '2.1s' },
  { top: '72%', left: '93%', size: 13, delay: '0.7s', duration: '3.0s' },

  { top: '88%', left: '6%', size: 11, delay: '1.3s', duration: '2.9s' },
  { top: '84%', left: '22%', size: 8, delay: '0.4s', duration: '2.3s' },
  { top: '90%', left: '38%', size: 13, delay: '1.0s', duration: '3.2s' },
  { top: '86%', left: '58%', size: 10, delay: '0.2s', duration: '2.6s' },
  { top: '91%', left: '75%', size: 15, delay: '1.6s', duration: '3.1s' },
  { top: '85%', left: '89%', size: 9, delay: '0.8s', duration: '2.4s' },
];

export const WelcomeSplashScreen = ({ onComplete }) => {
  // Strict Choreography: 'welcome' -> 'rocket' -> 'clouds' -> 'reveal' -> 'exit'
  const [stage, setStage] = useState('welcome');
  const [progress, setProgress] = useState(0);
  const isCompletedRef = useRef(false);

  // System & App Theme Detection for the cloud/reveal stage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark') return true;
      if (attr === 'light') return false;
      return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = () => {
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'dark') {
          setIsDarkMode(true);
        } else if (attr === 'light') {
          setIsDarkMode(false);
        } else {
          setIsDarkMode(mq.matches);
        }
      };
      mq.addEventListener('change', handleThemeChange);
      const observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => {
        mq.removeEventListener('change', handleThemeChange);
        observer.disconnect();
      };
    } catch (_) {}
  }, []);

  const handleFinish = () => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setStage('exit');
    triggerHaptic('light');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  // Seamless, tight timing & Edge-case Handling
  useEffect(() => {
    // Edge case 1: User prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const params = new URLSearchParams(window.location.search);
    const isForced = params.get('splash') === '1' || params.get('splash') === 'true';

    // If reduced motion is preferred and not explicitly forced, fast-forward directly to reveal
    if (prefersReducedMotion && !isForced) {
      setStage('reveal');
      setProgress(100);
      return;
    }

    const startTime = Date.now();

    // Rocket blasts off at 1.8s
    const tLaunch = setTimeout(() => {
      setStage('rocket');
    }, 1800);

    // Clouds roll down immediately as rocket clears top of screen at 3.1s
    const tClouds = setTimeout(() => {
      setStage('clouds');
    }, 3100);

    // Brand Reveal displays at 4.3s once clouds have rolled in
    const tReveal = setTimeout(() => {
      setStage('reveal');
    }, 4300);

    // Inactivity safety fallback (35s)
    const tTimeout = setTimeout(() => {
      handleFinish();
    }, 35000);

    // Progress bar runs up to reveal
    const PROGRESS_DURATION = 4300;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / PROGRESS_DURATION) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 40);

    // Edge case 2: Background tab synchronization
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 4300) {
          setStage('reveal');
          setProgress(100);
        } else if (elapsed >= 3100) {
          setStage('clouds');
        } else if (elapsed >= 1800) {
          setStage('rocket');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(tLaunch);
      clearTimeout(tClouds);
      clearTimeout(tReveal);
      clearTimeout(tTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Edge case 3: Global Keyboard accessibility (Escape to skip, Enter/Space to continue)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      } else if ((e.key === 'Enter' || e.key === ' ') && stage === 'reveal') {
        e.preventDefault();
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  const isCloudRevealStage = stage === 'clouds' || stage === 'reveal' || stage === 'exit';

  return (
    <div
      className={`vws-fullscreen-root ${stage === 'exit' ? 'is-exiting' : ''} ${
        isCloudRevealStage ? (isDarkMode ? 'is-dark-canvas' : 'is-light-canvas') : ''
      }`}
      role="dialog"
      aria-label="Welcome to Velvet Hearts"
      onClick={() => {
        if (stage === 'reveal') handleFinish();
      }}
    >
      {/* Dynamic Edge-to-Edge Starfield Canvas */}
      <div className="vws-starfield-canvas" aria-hidden="true">
        {FULL_SCREEN_STARS.map((star, idx) => (
          <svg
            key={idx}
            className="vws-star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--delay': star.delay,
              '--duration': star.duration,
            }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        ))}

        {/* Floating stardust motes */}
        <div className="vws-dust" style={{ left: '15%', '--drift-time': '7s', '--drift-x': '20px' }} />
        <div className="vws-dust" style={{ left: '35%', '--drift-time': '9s', '--drift-x': '-25px' }} />
        <div className="vws-dust" style={{ left: '65%', '--drift-time': '8s', '--drift-x': '30px' }} />
        <div className="vws-dust" style={{ left: '85%', '--drift-time': '10s', '--drift-x': '-20px' }} />
      </div>

      {/* Top Header Navigation: Skip Button */}
      <header className="vws-top-nav">
        <div className={`vws-brand-indicator ${stage !== 'welcome' ? 'is-fading-out' : ''}`}>
          <img src={velvetHeartLogo} alt="" className="vws-mini-logo" />
          <span>VELVET HEARTS</span>
        </div>

        <button
          type="button"
          className={`vws-skip-pill ${
            isCloudRevealStage ? (isDarkMode ? 'is-dark-pill' : 'is-light-pill') : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          aria-label="Skip splash animation and go to landing page"
        >
          <span>Skip</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </header>

      {/* ==========================================================
          STAGE 1: WELCOME SCREEN (Cosmic typography, clean & romantic)
         ========================================================== */}
      <div className={`vws-welcome-stage ${stage !== 'welcome' ? 'is-fading-out' : ''}`}>
        <div className="vws-welcome-content">
          <h1 className="vws-hero-title font-display">WELCOME</h1>

          <p className="vws-hero-sub font-ui">
            Where authentic hearts meet, verified stories connect, and true romance begins.
          </p>
        </div>
      </div>

      {/* ==========================================================
          STAGE 2: SMOOTH CUPID HEART-ROCKET ASCENT
          Launches swiftly and is COMPLETELY GONE before clouds appear
         ========================================================== */}
      {(stage === 'welcome' || stage === 'rocket') && (
        <div className="vws-rocket-stage" aria-hidden="true">
          <div
            className={`vws-rocket-assembly ${
              stage === 'welcome' ? 'is-hovering' : 'is-ascending'
            }`}
          >
            {/* Custom SVG Cupid Heart-Rocket */}
            <svg
              className="vws-rocket-svg"
              viewBox="0 0 160 250"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic Rose-Gold Shading */}
                <linearGradient id="rocketBodyGrad" x1="20" y1="20" x2="140" y2="190" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#FFF0F3" />
                  <stop offset="55%" stopColor="#F7CAD6" />
                  <stop offset="85%" stopColor="#E28EA6" />
                  <stop offset="100%" stopColor="#A83258" />
                </linearGradient>

                {/* Heart Wings Velvet Crimson */}
                <linearGradient id="rocketWingGrad" x1="0" y1="120" x2="160" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E11D48" />
                  <stop offset="50%" stopColor="#BE123C" />
                  <stop offset="100%" stopColor="#670C23" />
                </linearGradient>

                {/* Champagne Gold Nose Cone */}
                <linearGradient id="goldNoseGrad" x1="60" y1="5" x2="100" y2="65" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="40%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>

                {/* Specular Highlight Streak */}
                <linearGradient id="bodyHighlight" x1="50" y1="30" x2="70" y2="170" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                {/* Glowing Heart Core */}
                <radialGradient id="heartPortholeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="70%" stopColor="#BE123C" />
                  <stop offset="100%" stopColor="#4C0519" />
                </radialGradient>
              </defs>

              {/* Left Heart-Shaped Aerofoil Wing */}
              <path
                d="M52 135 C32 135 12 158 15 186 C17 205 36 215 52 208 Z"
                fill="url(#rocketWingGrad)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />

              {/* Right Heart-Shaped Aerofoil Wing */}
              <path
                d="M108 135 C128 135 148 158 145 186 C143 205 124 215 108 208 Z"
                fill="url(#rocketWingGrad)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />

              {/* Main Rocket Fuselage */}
              <path
                d="M80 18 C96 50 106 100 106 170 C106 198 100 206 80 206 C60 206 54 198 54 170 C54 100 64 50 80 18 Z"
                fill="url(#rocketBodyGrad)"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
              />

              {/* Smooth Specular Glaze Reflection */}
              <path
                d="M74 35 C70 65 66 110 66 160 C66 180 67 195 70 198 C66 195 62 170 62 140 C62 90 68 50 74 35 Z"
                fill="url(#bodyHighlight)"
              />

              {/* Gold Aerodynamic Nose Tip */}
              <path
                d="M80 16 C87 34 94 54 95 65 C85 68 75 68 65 65 C66 54 73 34 80 16 Z"
                fill="url(#goldNoseGrad)"
              />

              {/* Center Porthole Window with Beating Heart */}
              <circle cx="80" cy="118" r="21" fill="#1C0914" stroke="#FDE047" strokeWidth="2.5" />
              <circle cx="80" cy="118" r="16" fill="url(#heartPortholeGlow)" />
              <path
                d="M80 128 C73 121 68 116 68 111 C68 107 71 104 75 104 C77.5 104 79.5 105.5 80 107 C80.5 105.5 82.5 104 85 104 C89 104 92 107 92 111 C92 116 87 121 80 128 Z"
                fill="#FFFFFF"
                opacity="0.95"
              />

              {/* Engine Exhaust Nozzles */}
              <path d="M64 206 L96 206 L100 220 L60 220 Z" fill="#471426" stroke="#FBBF24" strokeWidth="1.5" />
              <path d="M68 220 L92 220 L94 228 L66 228 Z" fill="#1C0914" />
            </svg>

            {/* Smooth Dual Flame Exhaust Plume */}
            <div className="vws-plasma-thruster">
              <div className="vws-flame-outer" />
              <div className="vws-flame-inner" />
              <div className="vws-flame-core" />
            </div>

            {/* Stardust exhaust spark particles */}
            <div className="vws-spark-cascade">
              <span className="vws-spark s-1" />
              <span className="vws-spark s-2" />
              <span className="vws-spark s-3" />
              <span className="vws-spark s-4" />
              <span className="vws-spark s-5" />
              <span className="vws-spark s-6" />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          STAGE 3: ORGANIC BILLOWING VOLUMETRIC CLOUD CURTAIN
          CRITICAL: RENDERED ONLY AFTER ROCKET IS 100% OFF-SCREEN!
          Adapts palette dynamically to system/app theme (Dark or Light)
         ========================================================== */}
      {isCloudRevealStage && (
        <div className="vws-cloud-wipe-layer" aria-hidden="true">
          <div className="vws-cloud-curtain-wrap is-sweeping-down">
            {/* Solid 100% viewport coverage body */}
            <div className="vws-cloud-solid-body" />

            {/* Continuous multi-layered organic wave lip */}
            <div className="vws-cloud-wave-lip">
              <svg
                className="vws-fluid-cloud-svg"
                viewBox="0 0 1920 320"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Theme-Adaptive Cloud Wave Gradients */}
                  <linearGradient id="cloudDeepGrad" x1="960" y1="0" x2="960" y2="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={isDarkMode ? '#0c050b' : '#FFF5F7'} />
                    <stop offset="50%" stopColor={isDarkMode ? '#170614' : '#FEE4EC'} />
                    <stop offset="100%" stopColor={isDarkMode ? '#250820' : '#FBCFE8'} />
                  </linearGradient>

                  <linearGradient id="cloudMidGrad" x1="960" y1="0" x2="960" y2="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={isDarkMode ? '#130510' : '#FFFFFF'} />
                    <stop offset="60%" stopColor={isDarkMode ? '#22081c' : '#FFF2F6'} />
                    <stop offset="100%" stopColor={isDarkMode ? '#340b2a' : '#FDD8E5'} />
                  </linearGradient>

                  <linearGradient id="cloudFrontGrad" x1="960" y1="0" x2="960" y2="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={isDarkMode ? '#1a0717' : '#FFFFFF'} />
                    <stop offset="70%" stopColor={isDarkMode ? '#2e0a25' : '#FFF5F8'} />
                    <stop offset="100%" stopColor={isDarkMode ? '#440f37' : '#FDE2EC'} />
                  </linearGradient>

                  <filter id="cloudSoftBloom" x="-10%" y="-10%" width="120%" height="150%">
                    <feDropShadow
                      dx="0"
                      dy="16"
                      stdDeviation="20"
                      floodColor={isDarkMode ? '#f43f5e' : '#881337'}
                      floodOpacity={isDarkMode ? 0.25 : 0.14}
                    />
                  </filter>
                </defs>

                {/* Layer 1: Background Velvet Blush/Night Wave */}
                <path
                  d="M 0,0 L 1920,0 L 1920,190 C 1800,250 1680,150 1520,210 C 1360,270 1240,170 1080,230 C 920,290 800,170 640,220 C 480,270 360,160 200,220 C 100,260 0,200 0,200 Z"
                  fill="url(#cloudDeepGrad)"
                  opacity="0.85"
                />

                {/* Layer 2: Middle Soft Wave */}
                <path
                  d="M 0,0 L 1920,0 L 1920,150 C 1780,200 1660,120 1500,170 C 1340,220 1220,130 1060,180 C 900,230 780,130 620,175 C 460,220 340,120 180,170 C 90,200 0,155 0,155 Z"
                  fill="url(#cloudMidGrad)"
                  opacity="0.95"
                />

                {/* Layer 3: Foreground Billowing Wave */}
                <path
                  d="M 0,0 L 1920,0 L 1920,110 C 1760,160 1640,85 1480,130 C 1320,175 1200,90 1040,135 C 880,180 760,95 600,135 C 440,175 320,90 160,130 C 80,155 0,115 0,115 Z"
                  fill="url(#cloudFrontGrad)"
                  filter="url(#cloudSoftBloom)"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          STAGE 4: VELVET HEARTS BRAND REVEAL (Prestige Minimalist Design)
          Adapts typography and buttons to Dark Mode or Light Mode
         ========================================================== */}
      <div className={`vws-brand-stage ${stage === 'reveal' || stage === 'exit' ? 'is-visible' : ''}`}>
        <div className="vws-brand-card">
          {/* Concentric Gold Medallion Halo */}
          <div className="vws-emblem-medallion">
            <div className="vws-gold-filigree-ring" />
            <div className="vws-gold-filigree-ring-outer" />
            <img
              src={velvetHeartLogo}
              alt="Velvet Hearts Logo"
              className="vws-emblem-image"
            />
          </div>

          <div className="vws-prestige-tag font-ui">OFFICIAL PLATFORM</div>

          {/* Clean, Modern, Highly Readable Typography */}
          <h2 className="vws-brand-title">Velvet Hearts</h2>
          <p className="vws-brand-tagline">Where sweet moments turn into forever</p>

          <div className="vws-continue-hint font-ui">
            Tap anywhere to continue
          </div>
        </div>
      </div>

      {/* Bottom Timeline Bar */}
      <div className="vws-footer-bar">
        <div className="vws-progress-track">
          <div className="vws-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

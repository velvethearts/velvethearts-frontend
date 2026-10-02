import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import gsap from 'gsap';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';
import { triggerHaptic } from '../../utils/haptics';
import './WelcomeSplashScreen.css';

// 32 balanced celestial stardust motes across the viewport
const CELESTIAL_MOTES = [
  { top: '8%', left: '10%', size: 3, delay: '0.2s', duration: '2.5s' },
  { top: '14%', left: '26%', size: 4, delay: '0.8s', duration: '3.2s' },
  { top: '9%', left: '46%', size: 2, delay: '1.2s', duration: '2.2s' },
  { top: '15%', left: '68%', size: 4, delay: '0.4s', duration: '2.8s' },
  { top: '10%', left: '86%', size: 3, delay: '1.5s', duration: '3.4s' },
  { top: '24%', left: '6%', size: 3, delay: '1.1s', duration: '2.9s' },
  { top: '28%', left: '20%', size: 4, delay: '0.3s', duration: '3.1s' },
  { top: '22%', left: '80%', size: 3, delay: '1.0s', duration: '2.7s' },
  { top: '26%', left: '92%', size: 4, delay: '0.7s', duration: '3.0s' },
  { top: '40%', left: '8%', size: 3, delay: '0.9s', duration: '2.8s' },
  { top: '38%', left: '24%', size: 2, delay: '1.4s', duration: '2.4s' },
  { top: '44%', left: '76%', size: 4, delay: '0.5s', duration: '3.3s' },
  { top: '42%', left: '90%', size: 3, delay: '1.2s', duration: '2.6s' },
  { top: '58%', left: '9%', size: 4, delay: '0.6s', duration: '3.0s' },
  { top: '62%', left: '22%', size: 2, delay: '1.6s', duration: '2.3s' },
  { top: '56%', left: '82%', size: 3, delay: '0.2s', duration: '3.2s' },
  { top: '60%', left: '94%', size: 4, delay: '1.3s', duration: '2.9s' },
  { top: '74%', left: '12%', size: 3, delay: '0.8s', duration: '2.7s' },
  { top: '78%', left: '28%', size: 4, delay: '0.4s', duration: '3.4s' },
  { top: '72%', left: '72%', size: 2, delay: '1.5s', duration: '2.5s' },
  { top: '76%', left: '88%', size: 4, delay: '0.9s', duration: '3.1s' },
  { top: '88%', left: '15%', size: 3, delay: '1.0s', duration: '2.8s' },
  { top: '85%', left: '34%', size: 2, delay: '0.3s', duration: '2.4s' },
  { top: '90%', left: '65%', size: 4, delay: '1.1s', duration: '3.3s' },
  { top: '86%', left: '84%', size: 3, delay: '0.5s', duration: '2.6s' },
];

export const WelcomeSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const isFinishedRef = useRef(false);
  const containerRef = useRef(null);

  const handleFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsExiting(true);
    triggerHaptic('light');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 700);
  };

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const params = new URLSearchParams(window.location.search);
    const isForced = params.get('splash') === '1' || params.get('splash') === 'true';

    if (prefersReducedMotion && !isForced) {
      handleFinish();
      return;
    }

    const startTime = Date.now();
    const TOTAL_DURATION = 4800; // Complete cinematic sequence

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / TOTAL_DURATION) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        handleFinish();
      }
    }, 40);

    // Global keyboard listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`vws-root ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-label="Welcome to Velvet Hearts"
      onClick={handleFinish}
    >
      {/* Deep Ambient Lighting Flares */}
      <div className="vws-ambient-glow vws-glow-primary" />
      <div className="vws-ambient-glow vws-glow-gold" />

      {/* Stardust Celestial Particles */}
      <div className="vws-starfield" aria-hidden="true">
        {CELESTIAL_MOTES.map((mote, idx) => (
          <div
            key={idx}
            className="vws-star-mote"
            style={{
              top: mote.top,
              left: mote.left,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              '--delay': mote.delay,
              '--duration': mote.duration,
            }}
          />
        ))}
      </div>

      {/* Top Header: Brandmark + Skip Button */}
      <header className="vws-header">
        <div className="vws-brandmark">
          <img
            src={velvetHeartLogo}
            alt="Velvet Hearts Emblem"
            className="vws-brand-emblem-mini"
          />
          <span className="vws-brand-name">VELVET HEARTS</span>
        </div>

        <button
          type="button"
          className="vws-skip-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          aria-label="Skip welcome animation"
        >
          <span>Skip</span>
          <ArrowRight size={13} weight="bold" />
        </button>
      </header>

      {/* Centerpiece Arena: Silk Ribbons + Floating Love Letters + Sculpted Heart */}
      <main className="vws-arena">
        {/* Floating Love Letters with Wax Seals in 3D Orbit */}
        <div className="vws-letters-orbit" aria-hidden="true">
          <div className="vws-floating-letter letter-1">
            <div className="vws-wax-seal" />
          </div>
          <div className="vws-floating-letter letter-2">
            <div className="vws-wax-seal" />
          </div>
          <div className="vws-floating-letter letter-3">
            <div className="vws-wax-seal" />
          </div>
          <div className="vws-floating-letter letter-4">
            <div className="vws-wax-seal" />
          </div>
        </div>

        {/* Dynamic Dual Silk Ribbons Stage */}
        <div className="vws-ribbon-stage" aria-hidden="true">
          <svg
            className="vws-ribbon-svg"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Crimson Velvet Silk Gradient */}
              <linearGradient id="vwsCrimsonRibbon" x1="50" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fda4af" stopOpacity="0.4" />
                <stop offset="30%" stopColor="#f43f5e" />
                <stop offset="70%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>

              {/* Champagne Gold Silk Gradient */}
              <linearGradient id="vwsGoldRibbon" x1="350" y1="50" x2="50" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                <stop offset="35%" stopColor="#fde047" />
                <stop offset="75%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              {/* Heart Drop Shadow Glow */}
              <filter id="vwsHeartGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#e11d48" floodOpacity="0.5" />
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#f6d365" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Crimson Silk Ribbon Ribbon Loop (Forms Left Heart Arch) */}
            <path
              className="vws-ribbon-crimson"
              d="M 40,80 C 120,-10 240,40 200,160 C 170,250 80,260 70,170 C 60,110 130,80 200,160 C 240,210 210,290 200,340"
              stroke="url(#vwsCrimsonRibbon)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Champagne Gold Ribbon Ribbon Loop (Forms Right Heart Arch) */}
            <path
              className="vws-ribbon-gold"
              d="M 360,320 C 280,410 160,360 200,240 C 230,150 320,140 330,230 C 340,290 270,320 200,240 C 160,190 190,110 200,60"
              stroke="url(#vwsGoldRibbon)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Sculpted Velvet Heart Emblem Core */}
          <div className="vws-heart-core">
            <svg
              className="vws-heart-svg"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              filter="url(#vwsHeartGlow)"
            >
              <defs>
                <radialGradient id="vwsHeartVelvet" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="45%" stopColor="#be123c" />
                  <stop offset="85%" stopColor="#881337" />
                  <stop offset="100%" stopColor="#4c0519" />
                </radialGradient>
                <linearGradient id="vwsGoldFiligree" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>

              {/* Heart Outer Filigree Rim */}
              <path
                d="M 80,145 C 30,105 10,75 10,48 C 10,25 28,12 48,12 C 63,12 74,21 80,31 C 86,21 97,12 112,12 C 132,12 150,25 150,48 C 150,75 130,105 80,145 Z"
                fill="url(#vwsHeartVelvet)"
                stroke="url(#vwsGoldFiligree)"
                strokeWidth="2.5"
              />

              {/* Inner Specular Light Glaze */}
              <path
                d="M 28,45 C 28,32 37,22 48,22 C 55,22 62,26 68,34 C 55,42 40,55 33,70 C 30,62 28,53 28,45 Z"
                fill="#ffffff"
                opacity="0.3"
              />
            </svg>

            {/* Embedded Official Velvet Heart Brandmark */}
            <img
              src={velvetHeartLogo}
              alt=""
              className="vws-heart-logo-embed"
            />
          </div>
        </div>

        {/* Editorial Luxury Typography */}
        <div className="vws-typography">
          <h1 className="vws-title">VELVET HEARTS</h1>
          <p className="vws-tagline">
            Where intentional hearts meet, verified stories connect, and true romance begins.
          </p>
          <button
            type="button"
            className="vws-cta-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
          >
            <Sparkle size={16} weight="fill" />
            <span>Enter Velvet Hearts</span>
            <ArrowRight size={15} weight="bold" />
          </button>
          <div className="vws-tap-hint">Tap anywhere to enter</div>
        </div>
      </main>

      {/* Footer: Timeline Progress Track */}
      <footer className="vws-footer">
        <div className="vws-progress-track">
          <div className="vws-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="vws-footer-legal">Curated Verified Romantic Discovery &bull; India</span>
      </footer>
    </div>
  );
};

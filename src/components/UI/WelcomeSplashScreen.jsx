import React, { useState, useEffect, useRef } from 'react';
import { Sparkle, ArrowRight, Heart } from '@phosphor-icons/react';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';
import { triggerHaptic } from '../../utils/haptics';
import './WelcomeSplashScreen.css';

// 24 Deterministic star positions for a balanced starry sky
const STARS = [
  { top: '8%', left: '15%', size: 10, delay: '0.2s', duration: '2.4s' },
  { top: '12%', left: '80%', size: 14, delay: '0.6s', duration: '3.1s' },
  { top: '18%', left: '35%', size: 8, delay: '1.1s', duration: '2.0s' },
  { top: '22%', left: '68%', size: 12, delay: '0.4s', duration: '2.8s' },
  { top: '28%', left: '12%', size: 9, delay: '1.4s', duration: '2.5s' },
  { top: '34%', left: '88%', size: 11, delay: '0.8s', duration: '3.0s' },
  { top: '42%', left: '25%', size: 13, delay: '0.1s', duration: '2.2s' },
  { top: '46%', left: '75%', size: 8, delay: '1.5s', duration: '2.7s' },
  { top: '55%', left: '18%', size: 11, delay: '0.9s', duration: '2.9s' },
  { top: '60%', left: '82%', size: 14, delay: '0.3s', duration: '2.6s' },
  { top: '68%', left: '42%', size: 9, delay: '1.2s', duration: '2.1s' },
  { top: '74%', left: '15%', size: 12, delay: '0.5s', duration: '3.2s' },
  { top: '78%', left: '72%', size: 10, delay: '1.0s', duration: '2.4s' },
  { top: '85%', left: '30%', size: 13, delay: '0.7s', duration: '2.8s' },
];

export const WelcomeSplashScreen = ({ onComplete }) => {
  // Stages: 'welcome' | 'rocket' | 'clouds' | 'reveal' | 'exit'
  const [stage, setStage] = useState('welcome');
  const [progress, setProgress] = useState(0);
  const isCompletedRef = useRef(false);

  const handleFinish = () => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setStage('exit');
    triggerHaptic('light');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 550);
  };

  // Run timed progression
  useEffect(() => {
    // Stage 1: 'welcome' (0s - 1.4s)
    const t1 = setTimeout(() => {
      setStage('rocket');
    }, 1400);

    // Stage 2: 'clouds' (2.9s)
    const t2 = setTimeout(() => {
      setStage('clouds');
    }, 2900);

    // Stage 3: 'reveal' (4.0s)
    const t3 = setTimeout(() => {
      setStage('reveal');
    }, 4000);

    // Stage 4: 'exit' auto transition (5.6s)
    const t4 = setTimeout(() => {
      handleFinish();
    }, 5600);

    // Progress bar animation ticker
    const startTime = Date.now();
    const duration = 5600;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`vws-container ${stage === 'exit' ? 'is-exiting' : ''}`}
      role="dialog"
      aria-label="Welcome to Velvet Hearts"
    >
      {/* Ambient background decoration for desktop */}
      <div className="vws-ambient-backdrop">
        <div className="vws-ambient-cloud vws-ambient-cloud-1" />
        <div className="vws-ambient-cloud vws-ambient-cloud-2" />
      </div>

      {/* Main Mobile Screen Mockup */}
      <div className="vws-phone-frame">
        <div
          className="vws-screen"
          onClick={() => {
            if (stage === 'reveal') handleFinish();
          }}
        >
          {/* Top Bar with Skip Button */}
          <div className="vws-top-bar">
            <div className="vws-brand-mini">
              <Sparkle size={14} weight="fill" color="#ffd7aa" />
              <span>Velvet Hearts</span>
            </div>

            <button
              type="button"
              className="vws-skip-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleFinish();
              }}
              aria-label="Skip animation"
            >
              <span>Skip</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>

          {/* Starfield Background */}
          <div
            className="vws-starfield"
            style={{ opacity: stage === 'reveal' || stage === 'exit' ? 0 : 1 }}
          >
            {STARS.map((star, idx) => (
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

            {/* Ambient Gold Stardust Motes */}
            <div className="vws-dust" style={{ left: '20%', '--drift-time': '5s', '--drift-x': '15px' }} />
            <div className="vws-dust" style={{ left: '50%', '--drift-time': '7s', '--drift-x': '-20px' }} />
            <div className="vws-dust" style={{ left: '80%', '--drift-time': '6s', '--drift-x': '25px' }} />
          </div>

          {/* ==========================================================
              STAGE 1: WELCOME SCREEN (Stars + Typography)
             ========================================================== */}
          <div className={`vws-welcome-stage ${stage !== 'welcome' ? 'is-fading-out' : ''}`}>
            <div className="vws-welcome-badge">
              <Sparkle size={12} weight="fill" />
              <span>Intentional Dating</span>
            </div>
            <h1 className="vws-welcome-title font-display">WELCOME</h1>
            <p className="vws-welcome-sub">
              A dating experience where vulnerability is cherished and real connection ignites.
            </p>
          </div>

          {/* ==========================================================
              STAGE 2: CUPID HEART-ROCKET ASCENT
             ========================================================== */}
          <div className="vws-rocket-stage">
            <div className={`vws-rocket-wrapper ${stage !== 'welcome' ? 'is-launching' : ''}`}>
              {/* Illustrated Cupid Heart-Rocket */}
              <svg
                className="vws-rocket-svg"
                viewBox="0 0 140 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Fuselage Metallic Rose-Gold Gradient */}
                  <linearGradient id="rocketBody" x1="20" y1="20" x2="120" y2="170" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFF5F7" />
                    <stop offset="45%" stopColor="#F9D2DC" />
                    <stop offset="85%" stopColor="#E28EA6" />
                    <stop offset="100%" stopColor="#B8436A" />
                  </linearGradient>

                  {/* Heart Wings Velvet Gradient */}
                  <linearGradient id="rocketWings" x1="0" y1="100" x2="140" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D94E78" />
                    <stop offset="100%" stopColor="#7E1D3B" />
                  </linearGradient>

                  {/* Nosecone Champagne Gold Gradient */}
                  <linearGradient id="noseCone" x1="50" y1="0" x2="90" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FEEFAD" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>

                  {/* Thruster Glow */}
                  <radialGradient id="nozzleGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#FDE047" />
                    <stop offset="80%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Left Heart Aerofoil Wing */}
                <path
                  d="M48 115 C30 115 12 135 15 162 C17 180 34 190 48 184 Z"
                  fill="url(#rocketWings)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />

                {/* Right Heart Aerofoil Wing */}
                <path
                  d="M92 115 C110 115 128 135 125 162 C123 180 106 190 92 184 Z"
                  fill="url(#rocketWings)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />

                {/* Center Rocket Body Capsule */}
                <path
                  d="M70 15 C85 45 94 90 94 150 C94 175 88 182 70 182 C52 182 46 175 46 150 C46 90 55 45 70 15 Z"
                  fill="url(#rocketBody)"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2"
                />

                {/* Nose Cone Cap */}
                <path
                  d="M70 14 C76 30 82 48 83 58 C74 61 66 61 57 58 C58 48 64 30 70 14 Z"
                  fill="url(#noseCone)"
                />

                {/* Center Porthole with Beating Heart */}
                <circle cx="70" cy="105" r="18" fill="#1E0B16" stroke="#FDE047" strokeWidth="2.5" />
                <circle cx="70" cy="105" r="14" fill="#3D1225" />
                <path
                  d="M70 113 C64 107 60 102 60 98 C60 94.5 62.5 92 65.5 92 C67.5 92 69.2 93 70 94.2 C70.8 93 72.5 92 74.5 92 C77.5 92 80 94.5 80 98 C80 102 76 107 70 113 Z"
                  fill="#F43F5E"
                />

                {/* Lower Engine Bell Nozzle */}
                <path
                  d="M56 182 L84 182 L88 194 L52 194 Z"
                  fill="#451A2B"
                  stroke="#FDE047"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Animated Exhaust Flame */}
              <div className="vws-exhaust-fire">
                <svg viewBox="0 0 44 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Rose-Orange Flame */}
                  <path
                    d="M22 80 C36 55 44 35 44 15 C44 -5 0 -5 0 15 C0 35 8 55 22 80 Z"
                    fill="url(#flameOuter)"
                  />
                  {/* Inner Golden-Yellow Core Flame */}
                  <path
                    d="M22 62 C30 45 34 30 34 14 C34 -2 10 -2 10 14 C10 30 14 45 22 62 Z"
                    fill="url(#flameInner)"
                  />
                  {/* White Hot Core */}
                  <ellipse cx="22" cy="18" rx="6" ry="12" fill="#FFFFFF" opacity="0.9" />

                  <defs>
                    <linearGradient id="flameOuter" x1="22" y1="0" x2="22" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F43F5E" />
                      <stop offset="50%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <linearGradient id="flameInner" x1="22" y1="0" x2="22" y2="62" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="40%" stopColor="#FDE047" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Spark Emitter Dropping Golden Embers */}
              <div className="vws-spark-emitter">
                <div className="vws-rocket-spark" style={{ '--sx': '-18px', '--sy': '70px', animationDelay: '0.1s' }} />
                <div className="vws-rocket-spark" style={{ '--sx': '16px', '--sy': '85px', animationDelay: '0.25s' }} />
                <div className="vws-rocket-spark" style={{ '--sx': '-6px', '--sy': '95px', animationDelay: '0.4s' }} />
                <div className="vws-rocket-spark" style={{ '--sx': '10px', '--sy': '65px', animationDelay: '0.15s' }} />
              </div>
            </div>
          </div>

          {/* ==========================================================
              STAGE 3: VOLUMETRIC CLOUD LIQUID WIPE
             ========================================================== */}
          <div className="vws-cloud-wipe-stage">
            <div
              className={`vws-cloud-curtain ${
                stage === 'clouds' || stage === 'reveal' || stage === 'exit' ? 'is-wiping' : ''
              }`}
            >
              <svg
                className="vws-cloud-svg"
                viewBox="0 0 420 900"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Organic Puffy Cloud Gradient */}
                  <linearGradient id="cloudGrad" x1="210" y1="0" x2="210" y2="900" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="40%" stopColor="#FFF2F5" />
                    <stop offset="75%" stopColor="#FDE7ED" />
                    <stop offset="100%" stopColor="#FAD4E0" />
                  </linearGradient>
                  <linearGradient id="cloudShade" x1="0" y1="300" x2="420" y2="600" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FCE7EE" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Cloud Volume Fill: Puffy Cloud Bottom Edge */}
                <path
                  d="
                    M 0 0 
                    L 420 0 
                    L 420 720 
                    C 380 720, 360 670, 310 670 
                    C 260 670, 240 710, 200 710 
                    C 160 710, 145 660, 100 660 
                    C 60 660, 40 700, 0 700 
                    Z
                  "
                  fill="url(#cloudGrad)"
                />

                {/* Puffy 3D Cloud Bubbles on leading bottom edge */}
                <circle cx="70" cy="710" r="70" fill="url(#cloudGrad)" />
                <circle cx="170" cy="740" r="85" fill="url(#cloudGrad)" />
                <circle cx="280" cy="715" r="75" fill="url(#cloudGrad)" />
                <circle cx="370" cy="735" r="65" fill="url(#cloudGrad)" />
                <circle cx="210" cy="780" r="60" fill="url(#cloudGrad)" />

                {/* Cloud Specular Highlights */}
                <circle cx="150" cy="720" r="45" fill="url(#cloudShade)" />
                <circle cx="270" cy="695" r="40" fill="url(#cloudShade)" />
              </svg>
            </div>
          </div>

          {/* ==========================================================
              STAGE 4: VELVET HEARTS BRAND REVEAL
             ========================================================== */}
          <div className={`vws-brand-stage ${stage === 'reveal' || stage === 'exit' ? 'is-visible' : ''}`}>
            <div className="vws-logo-halo-wrap">
              <div className="vws-logo-pulse-ring" />
              <img
                src={velvetHeartLogo}
                alt="Velvet Hearts"
                className="vws-logo-img"
              />
            </div>

            <h2 className="vws-brand-name font-display">Velvet Hearts</h2>
            <p className="vws-brand-tagline font-ui">Where Intentional Connections Ignite</p>

            <button
              type="button"
              className="vws-enter-pill"
              onClick={(e) => {
                e.stopPropagation();
                handleFinish();
              }}
            >
              <span>Enter Experience</span>
              <ArrowRight size={15} weight="bold" />
            </button>
          </div>

          {/* Bottom Progress Bar */}
          <div className="vws-progress-wrap">
            <div className="vws-progress-bar" style={{ width: `${progress}%` }} />
          </div>

          {stage === 'reveal' && (
            <div className="vws-tap-hint font-ui">Tap anywhere to enter →</div>
          )}
        </div>
      </div>
    </div>
  );
};

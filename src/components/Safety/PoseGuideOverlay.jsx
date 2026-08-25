import React from 'react';

/**
 * PoseGuideOverlay (Biometric FaceScan Overlay)
 * Perfectly centered, luxury Face ID biometric viewfinder with golden HUD brackets,
 * cardinal alignment ticks, and dynamic scanning beam.
 */
export const PoseGuideOverlay = () => {
  return (
    <div className="pose-guide-overlay-container">
      <svg
        viewBox="0 0 300 300"
        className="pose-guide-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Drop shadow filter for contrast against any background or lighting */}
          <filter id="hudDropGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          {/* Golden Rose gradient for the scanning beam */}
          <linearGradient id="scanBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AD6A" stopOpacity="0" />
            <stop offset="25%" stopColor="#D4AD6A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="75%" stopColor="#B8436A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B8436A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Four Symmetrical Viewfinder Corner Brackets */}
        <g filter="url(#hudDropGlow)" stroke="#D4AD6A" strokeWidth="2.5" strokeLinecap="round">
          {/* Top-Left */}
          <path d="M 24,52 L 24,24 L 52,24" />
          {/* Top-Right */}
          <path d="M 248,24 L 276,24 L 276,52" />
          {/* Bottom-Left */}
          <path d="M 24,248 L 24,276 L 52,276" />
          {/* Bottom-Right */}
          <path d="M 248,276 L 276,276 L 276,248" />
        </g>

        {/* 2. Perfectly Centered Biometric Face Oval (Center: 150, 150) */}
        <g filter="url(#hudDropGlow)">
          {/* Primary Dashed Face Oval */}
          <ellipse
            cx="150"
            cy="150"
            rx="82"
            ry="114"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />

          {/* Inner Golden Accent Ring */}
          <ellipse
            cx="150"
            cy="150"
            rx="75"
            ry="107"
            stroke="#D4AD6A"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.65"
          />

          {/* Cardinal Axis Alignment Ticks */}
          {/* Top Cardinal Tick */}
          <line x1="150" y1="28" x2="150" y2="40" stroke="#D4AD6A" strokeWidth="2" strokeLinecap="round" />
          {/* Bottom Cardinal Tick */}
          <line x1="150" y1="260" x2="150" y2="272" stroke="#D4AD6A" strokeWidth="2" strokeLinecap="round" />
          {/* Left Cardinal Tick */}
          <line x1="60" y1="150" x2="72" y2="150" stroke="#D4AD6A" strokeWidth="2" strokeLinecap="round" />
          {/* Right Cardinal Tick */}
          <line x1="228" y1="150" x2="240" y2="150" stroke="#D4AD6A" strokeWidth="2" strokeLinecap="round" />

          {/* Subtle Eye-Level Alignment Guide */}
          <line
            x1="125"
            y1="132"
            x2="175"
            y2="132"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        </g>

        {/* 3. Animated Biometric Scan Beam */}
        <g className="biometric-scan-beam">
          <line
            x1="70"
            y1="150"
            x2="230"
            y2="150"
            stroke="url(#scanBeamGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

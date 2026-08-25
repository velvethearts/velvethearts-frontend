import React from 'react';

/**
 * PoseGuideOverlay
 * Simple, elegant head-and-shoulders person outline stencil for natural face & identity alignment.
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
          {/* Subtle drop shadow filter for high contrast against any camera background */}
          <filter id="personOutlineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          {/* Golden Rose gradient for smooth scan beam */}
          <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AD6A" stopOpacity="0" />
            <stop offset="25%" stopColor="#D4AD6A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="75%" stopColor="#B8436A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B8436A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Four Symmetrical Viewfinder Corner Brackets */}
        <g filter="url(#personOutlineGlow)" stroke="#D4AD6A" strokeWidth="2" strokeLinecap="round">
          {/* Top-Left */}
          <path d="M 24,50 L 24,24 L 50,24" />
          {/* Top-Right */}
          <path d="M 250,24 L 276,24 L 276,50" />
          {/* Bottom-Left */}
          <path d="M 24,250 L 24,276 L 50,276" />
          {/* Bottom-Right */}
          <path d="M 250,276 L 276,276 L 276,250" />
        </g>

        {/* 2. Simple, Symmetrical Outline of a Person (Head, Chin, Neck & Shoulders) */}
        <g filter="url(#personOutlineGlow)">
          {/* Head & Chin Outline */}
          <path
            d="M 150,45 C 108,45 92,85 92,130 C 92,175 116,204 150,204 C 184,204 208,175 208,130 C 208,85 192,45 150,45 Z"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="8 5"
          />

          {/* Left Neck & Shoulder Line */}
          <path
            d="M 120,195 C 114,218 85,242 30,268"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />

          {/* Right Neck & Shoulder Line */}
          <path
            d="M 180,195 C 186,218 215,242 270,268"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
        </g>

        {/* 3. Subtle Animated Biometric Scan Beam */}
        <g className="biometric-scan-beam">
          <line
            x1="70"
            y1="130"
            x2="230"
            y2="130"
            stroke="url(#scanBeamGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

import React from 'react';

/**
 * FaceScanOverlay
 * High-tech aesthetic biometric facial scan viewfinder overlay with alignment guides and HUD brackets.
 */
export const PoseGuideOverlay = ({ instruction = 'Center your face in the oval guide and look at the camera' }) => {
  return (
    <div className="pose-guide-overlay-container font-ui">
      <svg
        viewBox="0 0 400 400"
        className="pose-guide-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
          </filter>

          {/* Linear gradient for animated scan sweep */}
          <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4AD6A" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4AD6A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B8436A" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 1. Four Corner Futuristic Viewfinder Brackets */}
        <g filter="url(#hudGlow)" stroke="#D4AD6A" strokeWidth="2.5" strokeLinecap="round">
          {/* Top-Left */}
          <path d="M 45,65 L 45,45 L 65,45" />
          {/* Top-Right */}
          <path d="M 335,45 L 355,45 L 355,65" />
          {/* Bottom-Left */}
          <path d="M 45,335 L 45,355 L 65,355" />
          {/* Bottom-Right */}
          <path d="M 335,355 L 355,355 L 355,335" />
        </g>

        {/* 2. Biometric Head & Face Oval Wireframe Guide */}
        <g filter="url(#hudGlow)">
          {/* Outer Face Contour */}
          <ellipse
            cx="200"
            cy="185"
            rx="75"
            ry="105"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />

          {/* Inner Accent Ring */}
          <ellipse
            cx="200"
            cy="185"
            rx="68"
            ry="98"
            stroke="rgba(212, 173, 106, 0.45)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Horizontal Eye-level Alignment Line */}
          <line
            x1="150"
            y1="160"
            x2="250"
            y2="160"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Left Eye Target Bracket */}
          <circle cx="170" cy="160" r="10" stroke="#D4AD6A" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Right Eye Target Bracket */}
          <circle cx="230" cy="160" r="10" stroke="#D4AD6A" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Vertical Nose-Bridge Axis */}
          <line
            x1="200"
            y1="130"
            x2="200"
            y2="240"
            stroke="rgba(255, 255, 255, 0.55)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Mouth Target Guide */}
          <line
            x1="180"
            y1="235"
            x2="220"
            y2="235"
            stroke="rgba(212, 173, 106, 0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Shoulder Contours */}
          <path
            d="M 148,270 C 135,310 90,345 20,385"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
          <path
            d="M 252,270 C 265,310 310,345 380,385"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        </g>

        {/* 3. Subtle Animated Biometric Scan Beam */}
        <g className="biometric-scan-beam">
          <line
            x1="120"
            y1="185"
            x2="280"
            y2="185"
            stroke="url(#scanBeamGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Floating Bottom Instruction Banner */}
      <div className="pose-guide-instruction-pill font-ui">
        <span className="pose-guide-pill-text">👤 {instruction}</span>
      </div>
    </div>
  );
};

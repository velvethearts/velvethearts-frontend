import React from 'react';

/**
 * PoseGuideOverlay
 * Renders a dynamic, aesthetic wireframe stencil matching the active single-handed selfie pose challenge.
 */
export const PoseGuideOverlay = ({ poseId, emoji, instruction }) => {
  return (
    <div className="pose-guide-overlay-container">
      <svg
        viewBox="0 0 400 400"
        className="pose-guide-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle drop shadow filter for high contrast on any camera background */}
          <filter id="poseStrokeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. Universal Head & Shoulders Wireframe Guide */}
        <g filter="url(#poseStrokeGlow)">
          {/* Head & Chin Contour */}
          <path
            d="M 200,65 C 145,65 130,120 130,185 C 130,248 160,285 200,285 C 240,285 270,248 270,185 C 270,120 255,65 200,65 Z"
            stroke="rgba(255, 255, 255, 0.88)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />

          {/* Eye & Nose alignment reference guides */}
          <line
            x1="165"
            y1="165"
            x2="235"
            y2="165"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1="200"
            y1="155"
            x2="200"
            y2="215"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Neck & Shoulders Contour */}
          <path
            d="M 158,272 C 150,305 105,335 35,375"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
          <path
            d="M 242,272 C 250,305 295,335 365,375"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Specific Pose Outline based on poseId */}
        <g filter="url(#poseStrokeGlow)">
          {/* POSE 1: PEACE SIGN (✌️) */}
          {poseId === 'PEACE_SIGN' && (
            <g className="pose-hand-peace">
              {/* Hand Palm & Wrist */}
              <path
                d="M 285,255 C 285,225 305,215 320,215 C 335,215 350,225 350,255 C 350,275 335,290 315,290 C 295,290 285,275 285,255 Z"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                fill="rgba(184, 67, 106, 0.18)"
              />
              {/* Folded Thumb over ring & pinky */}
              <path
                d="M 302,235 C 310,238 318,245 320,255"
                stroke="#F8B4C4"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Index Finger (Left branch of V) */}
              <path
                d="M 305,215 L 295,140 C 294,132 305,130 309,138 L 320,210"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(184, 67, 106, 0.22)"
              />
              {/* Middle Finger (Right branch of V) */}
              <path
                d="M 324,210 L 340,135 C 342,127 353,130 351,138 L 338,215"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(184, 67, 106, 0.22)"
              />
              {/* Target Prompt Glow Icon */}
              <circle cx="322" cy="180" r="42" stroke="#F8B4C4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            </g>
          )}

          {/* POSE 2: THUMBS UP (👍) */}
          {poseId === 'THUMBS_UP' && (
            <g className="pose-hand-thumbs-up">
              {/* Fist body */}
              <path
                d="M 290,230 C 290,205 310,200 330,200 C 350,200 355,215 355,245 C 355,275 340,285 318,285 C 298,285 290,265 290,230 Z"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                fill="rgba(184, 67, 106, 0.18)"
              />
              {/* Knuckle Lines */}
              <path d="M 315,220 L 345,220 M 315,236 L 345,236 M 315,252 L 345,252" stroke="#F8B4C4" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              {/* Upward Extended Thumb */}
              <path
                d="M 294,212 C 290,195 288,160 295,145 C 300,136 312,138 312,148 C 310,165 312,185 315,202"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(184, 67, 106, 0.25)"
              />
              {/* Target Indicator */}
              <circle cx="304" cy="170" r="38" stroke="#F8B4C4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            </g>
          )}

          {/* POSE 3: SHAKA / CALL ME (🤙) */}
          {poseId === 'SHAKA_SIGN' && (
            <g className="pose-hand-shaka">
              {/* Folded 3 Middle Fingers in Center */}
              <rect x="300" y="195" width="34" height="52" rx="10" stroke="#F8B4C4" strokeWidth="2.5" fill="rgba(184, 67, 106, 0.2)" />
              <line x1="305" y1="212" x2="330" y2="212" stroke="#F8B4C4" strokeWidth="1.5" />
              <line x1="305" y1="228" x2="330" y2="228" stroke="#F8B4C4" strokeWidth="1.5" />
              {/* Extended Thumb (pointing left/up towards ear) */}
              <path
                d="M 302,205 C 290,190 270,175 260,160 C 255,152 265,146 272,154 C 285,168 298,185 304,196"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(184, 67, 106, 0.22)"
              />
              {/* Extended Pinky (pointing right/up) */}
              <path
                d="M 332,235 C 345,225 365,205 375,190 C 382,182 390,190 385,198 C 372,216 352,238 334,248"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="rgba(184, 67, 106, 0.22)"
              />
              <circle cx="320" cy="195" r="42" stroke="#F8B4C4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            </g>
          )}

          {/* POSE 4: OPEN PALM WAVE (🖐️) */}
          {poseId === 'OPEN_PALM' && (
            <g className="pose-hand-open-palm">
              {/* Palm base */}
              <path
                d="M 292,230 C 292,205 348,205 348,230 C 348,265 335,285 318,285 C 300,285 292,265 292,230 Z"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                fill="rgba(184, 67, 106, 0.18)"
              />
              {/* Thumb */}
              <path d="M 292,225 C 280,215 268,200 262,192 C 256,184 266,178 274,185 L 295,208" stroke="#F8B4C4" strokeWidth="2.3" strokeLinecap="round" fill="rgba(184, 67, 106, 0.2)" />
              {/* Index Finger */}
              <path d="M 298,205 L 292,145 C 290,137 302,135 304,143 L 310,202" stroke="#F8B4C4" strokeWidth="2.3" strokeLinecap="round" fill="rgba(184, 67, 106, 0.2)" />
              {/* Middle Finger */}
              <path d="M 312,202 L 316,132 C 317,124 329,124 329,132 L 325,202" stroke="#F8B4C4" strokeWidth="2.3" strokeLinecap="round" fill="rgba(184, 67, 106, 0.2)" />
              {/* Ring Finger */}
              <path d="M 327,203 L 338,142 C 340,134 350,136 348,144 L 338,205" stroke="#F8B4C4" strokeWidth="2.3" strokeLinecap="round" fill="rgba(184, 67, 106, 0.2)" />
              {/* Pinky */}
              <path d="M 340,210 L 358,162 C 362,154 372,160 368,168 L 348,220" stroke="#F8B4C4" strokeWidth="2.3" strokeLinecap="round" fill="rgba(184, 67, 106, 0.2)" />
              {/* Open Wave Indicator */}
              <circle cx="320" cy="180" r="45" stroke="#F8B4C4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            </g>
          )}

          {/* POSE 5: FINGER ON CHIN (🤔) */}
          {poseId === 'FINGER_CHIN' && (
            <g className="pose-hand-finger-chin">
              {/* Fist resting under chin */}
              <path
                d="M 195,300 C 185,285 190,265 210,265 C 230,265 240,285 235,305 C 230,325 205,325 195,300 Z"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                fill="rgba(184, 67, 106, 0.18)"
              />
              {/* Folded thumb resting on side */}
              <path d="M 194,285 C 185,280 180,268 185,260 C 190,252 198,258 198,272" stroke="#F8B4C4" strokeWidth="2.2" strokeLinecap="round" />
              {/* Extended Index finger reaching up to touch the chin/jaw */}
              <path
                d="M 210,265 L 210,225 C 210,216 222,216 222,225 L 222,265"
                stroke="#F8B4C4"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="rgba(184, 67, 106, 0.25)"
              />
              {/* Touch Point Focus on Chin */}
              <circle cx="216" cy="225" r="14" stroke="#F8B4C4" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="216" cy="225" r="4" fill="#F8B4C4" />
            </g>
          )}
        </g>

        {/* 3. Pose Gesture Label Pill Overlay at bottom of silhouette */}
        <g filter="url(#poseStrokeGlow)" transform="translate(200, 355)">
          <rect
            x="-75"
            y="-14"
            width="150"
            height="28"
            rx="14"
            fill="rgba(44, 24, 32, 0.75)"
            stroke="rgba(248, 180, 196, 0.5)"
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            fill="#FFFFFF"
            fontSize="11"
            fontWeight="600"
            fontFamily="inherit"
            textAnchor="middle"
          >
            {emoji} Match This Pose
          </text>
        </g>
      </svg>
    </div>
  );
};

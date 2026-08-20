import React, { useState, useEffect, useRef, useMemo } from 'react';
import './LoadingScreen.css';

export interface LoadingScreenProps {
  /**
   * Whether the loading screen is visible.
   * Defaults to true. When false, the component smoothly unmounts/fades out.
   */
  isLoading?: boolean;

  /**
   * Status messages rotated during loading.
   * If not provided, a default set of friendly, warm messages is used.
   */
  messages?: string[];

  /**
   * Message cycle interval in milliseconds (recommended 1500 - 3000ms).
   * Default is 2200ms.
   */
  messageInterval?: number;

  /**
   * Time in milliseconds before triggering the long wait state.
   * Default is 10000ms (10 seconds). Set to 0 or Infinity to disable.
   */
  longWaitThreshold?: number;

  /**
   * Headline message displayed when loading exceeds longWaitThreshold.
   * Default is "This is taking a little longer than usual…"
   */
  longWaitMessage?: string;

  /**
   * Subtitle or reassurance message displayed during the long wait state.
   */
  longWaitSubtext?: string;

  /**
   * Optional custom action or retry button callback when long wait is reached.
   */
  onRetry?: () => void;

  /**
   * Optional custom cancel / dismiss button callback.
   */
  onCancel?: () => void;

  /**
   * Text for the retry button. Defaults to "Try Again".
   */
  retryLabel?: string;

  /**
   * Text for the cancel button. Defaults to "Cancel".
   */
  cancelLabel?: string;

  /**
   * Whether the loader overlays the entire viewport (fixed fullscreen)
   * or fits inside a parent container. Defaults to true.
   */
  fullscreen?: boolean;

  /**
   * Visual variant:
   * - 'overlay': Frosted glass full backdrop with ambient glow (default)
   * - 'card': Elevated velvet card surface suitable for modals/insets
   * - 'minimal': Clean, lightweight layout without heavy backdrop
   */
  variant?: 'overlay' | 'card' | 'minimal';

  /**
   * Size of the animated heart icon in pixels. Defaults to 72.
   */
  heartSize?: number;

  /**
   * Optional custom logo or heart image source to animate within the radiant rings.
   */
  logoSrc?: string;

  /**
   * Optional static brand title or step label shown above the heart (e.g. "Velvet Hearts").
   */
  title?: string;


  /**
   * Whether to apply frosted backdrop blur to the underlying content.
   * Defaults to true.
   */
  blurBackdrop?: boolean;

  /**
   * Custom additional class names.
   */
  className?: string;

  /**
   * Custom style overrides.
   */
  style?: React.CSSProperties;

  /**
   * Optional callback triggered when the long wait threshold is crossed.
   */
  onLongWait?: () => void;
}

const DEFAULT_MESSAGES: readonly string[] = [
  'Getting everything ready…',
  'Putting the finishing touches on it…',
  'Almost there…',
  'Making sure everything looks right…',
  'Saving your progress…',
  'Just a moment…'
];

/**
 * Animated SVG Heart Loader component with glowing multi-layer gradients and heartbeat rhythm
 */
const HeartVisual: React.FC<{ size?: number; isLongWait?: boolean; logoSrc?: string }> = ({
  size = 72,
  isLongWait = false,
  logoSrc
}) => {
  return (
    <div
      className={`vh-heart-loader-container ${isLongWait ? 'is-delayed' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Radiant ambient glow rings */}
      <div className="vh-heart-glow-ring ring-1" />
      <div className="vh-heart-glow-ring ring-2" />
      <div className="vh-heart-glow-ring ring-3" />

      {/* Floating sparkle motes */}
      <span className="vh-heart-sparkle sparkle-1" />
      <span className="vh-heart-sparkle sparkle-2" />
      <span className="vh-heart-sparkle sparkle-3" />

      {logoSrc ? (
        <img
          src={logoSrc}
          alt="Velvet Hearts"
          className="vh-heart-logo-img"
          style={{ width: size, height: size, objectFit: 'contain' }}
        />
      ) : (
        /* Bespoke Multi-layer SVG Heart */
        <svg
          className="vh-heart-svg"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size, height: size }}
        >

        <defs>
          {/* Rich Velvet Hearts Primary Gradient */}
          <linearGradient id="vhHeartGradPrimary" x1="10" y1="10" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--rose-400, #F0A0AD)" />
            <stop offset="35%" stopColor="var(--burgundy-500, #B8436A)" />
            <stop offset="85%" stopColor="var(--burgundy-700, #7A2842)" />
            <stop offset="100%" stopColor="var(--burgundy-950, #2A0812)" />
          </linearGradient>

          {/* Accent Gold Highlights */}
          <linearGradient id="vhHeartGradGold" x1="20" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--gold-300, #E4C88E)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="var(--gold-500, #C4964A)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--burgundy-500, #B8436A)" stopOpacity="0" />
          </linearGradient>

          {/* Soft inner glow gradient */}
          <radialGradient id="vhHeartInnerGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="var(--rose-500, #E07A8A)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--burgundy-800, #5C1A2E)" stopOpacity="0" />
          </radialGradient>

          {/* Dynamic Drop Shadow Filter */}
          <filter id="vhHeartGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background blurred heart for luscious depth */}
        <path
          className="vh-heart-layer-ambient"
          d="M50 86.5 C50 86.5 12 60.5 12 33 C12 18.5 23.5 10 36.5 10 C44 10 50 14.5 50 14.5 C50 14.5 56 10 63.5 10 C76.5 10 88 18.5 88 33 C88 60.5 50 86.5 50 86.5 Z"
          fill="url(#vhHeartGradPrimary)"
          filter="url(#vhHeartGlowFilter)"
          opacity="0.6"
        />

        {/* Main Solid Velvet Heart Body */}
        <path
          className="vh-heart-layer-body"
          d="M50 84.5 C50 84.5 14 59 14 33 C14 19.5 24.5 11.5 36.5 11.5 C43.5 11.5 49 15.5 50 17 C51 15.5 56.5 11.5 63.5 11.5 C75.5 11.5 86 19.5 86 33 C86 59 50 84.5 50 84.5 Z"
          fill="url(#vhHeartGradPrimary)"
        />

        {/* Inner Highlight Layer */}
        <path
          className="vh-heart-layer-inner"
          d="M50 80 C50 80 18 56 18 33 C18 22 26 14.5 36.5 14.5 C42.5 14.5 47.5 18 50 20.5 C52.5 18 57.5 14.5 63.5 14.5 C74 14.5 82 22 82 33 C82 56 50 80 50 80 Z"
          fill="url(#vhHeartInnerGlow)"
        />

        {/* Gold Trim Shimmer Path */}
        <path
          className="vh-heart-layer-shimmer"
          d="M50 84.5 C50 84.5 14 59 14 33 C14 19.5 24.5 11.5 36.5 11.5 C43.5 11.5 49 15.5 50 17 C51 15.5 56.5 11.5 63.5 11.5 C75.5 11.5 86 19.5 86 33 C86 59 50 84.5 50 84.5 Z"
          stroke="url(#vhHeartGradGold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top-Left Gloss Accent */}
        <path
          d="M26 24 C22 28 20 33 21 38"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      )}
    </div>
  );
};

/**
 * LoadingScreen: A warm, reassuring, and polished loading experience
 * with rotating messages, timeout state, reduced motion, and full accessibility.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading = true,
  messages,
  messageInterval = 2200,
  longWaitThreshold = 10000,
  longWaitMessage = 'This is taking a little longer than usual…',
  longWaitSubtext = "We're making sure everything is just right. Thank you for your patience.",
  onRetry,
  onCancel,
  retryLabel = 'Try Again',
  cancelLabel = 'Cancel',
  fullscreen = true,
  variant = 'overlay',
  heartSize = 72,
  logoSrc,
  title,
  blurBackdrop = true,
  className = '',
  style,
  onLongWait
}) => {
  // Normalize messages array
  const activeMessages = useMemo(() => {
    if (messages && messages.length > 0) {
      return messages;
    }
    return DEFAULT_MESSAGES;
  }, [messages]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLongWait, setIsLongWait] = useState<boolean>(false);
  const [animatingTextKey, setAnimatingTextKey] = useState<number>(0);
  const [shouldRender, setShouldRender] = useState<boolean>(isLoading);

  // Store callbacks in ref to avoid unnecessary re-triggers
  const onLongWaitRef = useRef(onLongWait);
  useEffect(() => {
    onLongWaitRef.current = onLongWait;
  }, [onLongWait]);

  // Handle enter / exit transitions smoothly
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setCurrentIndex(0);
      setIsLongWait(false);
      setAnimatingTextKey(0);
    } else {
      // Allow exit fade animation
      const exitTimer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading]);

  // Long wait threshold timer
  useEffect(() => {
    if (!isLoading || !longWaitThreshold || longWaitThreshold === Infinity) return;

    const timeout = setTimeout(() => {
      setIsLongWait(true);
      if (onLongWaitRef.current) {
        onLongWaitRef.current();
      }
    }, longWaitThreshold);

    return () => clearTimeout(timeout);
  }, [isLoading, longWaitThreshold]);

  // Message rotation timer (stops once in long wait state)
  useEffect(() => {
    if (!isLoading || isLongWait || activeMessages.length <= 1) return;

    const clampedInterval = Math.max(1200, Math.min(6000, messageInterval));

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMessages.length);
      setAnimatingTextKey((prev) => prev + 1);
    }, clampedInterval);

    return () => clearInterval(interval);
  }, [isLoading, isLongWait, activeMessages, messageInterval]);

  // Guard against unrendered state
  if (!shouldRender && !isLoading) {
    return null;
  }

  const currentMessage = isLongWait ? longWaitMessage : activeMessages[currentIndex];

  const rootClassNames = [
    'vh-loading-screen',
    fullscreen ? 'is-fullscreen' : 'is-inline',
    `variant-${variant}`,
    blurBackdrop ? 'has-blur' : '',
    isLoading ? 'is-active' : 'is-exiting',
    isLongWait ? 'is-long-wait' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClassNames}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      aria-atomic="true"
    >
      {/* Backdrop overlay */}
      <div className="vh-loading-backdrop" aria-hidden="true" />

      {/* Centered Content Card */}
      <div className="vh-loading-card">
        {/* Optional Title */}
        {title && <div className="vh-loading-brand font-display">{title}</div>}

        {/* Animated Heart Loader */}
        <HeartVisual size={heartSize} isLongWait={isLongWait} logoSrc={logoSrc} />

        {/* Message Container with ARIA status */}
        <div className="vh-loading-message-box">
          <div
            key={`msg-${animatingTextKey}-${isLongWait}`}
            className="vh-loading-message font-ui"
          >
            {currentMessage}
          </div>

          {/* Subtext shown during long wait or if explicitly configured */}
          {isLongWait && longWaitSubtext && (
            <p className="vh-loading-subtext font-body">
              {longWaitSubtext}
            </p>
          )}
        </div>

        {/* Optional Action Buttons on Long Wait */}
        {isLongWait && (onRetry || onCancel) && (
          <div className="vh-loading-actions">
            {onRetry && (
              <button
                type="button"
                className="vh-loading-btn vh-loading-btn-retry"
                onClick={onRetry}
              >
                {retryLabel}
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                className="vh-loading-btn vh-loading-btn-cancel"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            )}
          </div>
        )}

        {/* Subtle decorative progress ambient bar (non-fake, ambient breathing shimmer) */}
        <div className="vh-loading-ambient-bar" aria-hidden="true">
          <div className="vh-loading-ambient-pill" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

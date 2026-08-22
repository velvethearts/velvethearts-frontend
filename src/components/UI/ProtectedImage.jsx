import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { LockSimple, EyeSlash, ShieldWarning } from '@phosphor-icons/react';

/**
 * ProtectedImage
 * Multi-layered web privacy and anti-screenshot image protection:
 * 1. Disables right-click context menu and drag-to-save.
 * 2. Overlays a subtle, dynamic watermark with viewer username/ID/date to deter screenshots and external camera photos.
 * 3. Proactively intercepts PrintScreen & Screenshot shortcut keys (Win+Shift+S, Cmd+Shift+4, PrintScreen) with an instant blackout lock.
 * 4. Automatic blur on window focus loss (e.g. Snipping Tool overlay / window switching).
 * 5. Instant blur when mouse leaves window boundaries.
 * 6. Optional press-and-hold reveal mode for sensitive media.
 */
export const ProtectedImage = memo(function ProtectedImage({
  src,
  alt = 'Protected Image',
  className = '',
  imgClassName = '',
  style = {},
  imgStyle = {},
  watermarkText,
  showWatermark = true,
  pressToReveal = false,
  enableBlurOnFocusLoss = true,
  fallbackSrc,
  onError,
  onClick,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  loading = 'lazy',
  fetchpriority = 'auto',
  decoding = 'async',
  ...restProps
}) {
  const { userProfile } = useApp?.() || {};
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(!pressToReveal);
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef(null);
  const screenshotTimeoutRef = useRef(null);

  // Generate dynamic viewer watermark text
  const viewerName = userProfile?.name || userProfile?.username || 'VelvetHearts User';
  const viewerIdentifier = userProfile?.id || userProfile?.uid ? `#${String(userProfile.id || userProfile.uid).slice(-5)}` : '';
  const dateStamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const activeWatermark = watermarkText || `@${viewerName} ${viewerIdentifier} • ${dateStamp}`;

  // Proactive anti-screenshot shortcut & window focus listeners
  useEffect(() => {
    if (!enableBlurOnFocusLoss) return;

    const handleBlur = () => setIsWindowFocused(false);
    const handleFocus = () => setIsWindowFocused(true);

    const handleVisibility = () => {
      if (document.hidden) {
        setIsWindowFocused(false);
      } else {
        setIsWindowFocused(true);
      }
    };

    const handleMouseLeave = (e) => {
      // If mouse leaves the top or sides of the viewport
      if (!e.relatedTarget && !e.toElement) {
        setIsWindowFocused(false);
      }
    };

    const handleMouseEnter = () => {
      setIsWindowFocused(true);
    };

    // Intercept Screenshot & Capture Keys
    const handleKeyDown = (e) => {
      const isPrintScreen = e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44;
      const isWinSnipping = (e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey);
      const isMacScreenshot = (e.key === '3' || e.key === '4' || e.key === '5') && e.metaKey && e.shiftKey;
      const isPrint = (e.key === 'p' || e.key === 'P') && (e.ctrlKey || e.metaKey);

      if (isPrintScreen || isWinSnipping || isMacScreenshot || isPrint) {
        // Trigger instant blackout shield
        setIsScreenshotAttempted(true);
        setIsWindowFocused(false);

        // Clear clipboard if possible to prevent paste
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('⚠️ Protected Content - Velvet Hearts').catch(() => {});
          }
        } catch {
          // ignore clipboard errors
        }

        if (screenshotTimeoutRef.current) clearTimeout(screenshotTimeoutRef.current);
        screenshotTimeoutRef.current = setTimeout(() => {
          setIsScreenshotAttempted(false);
        }, 2500);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
        setIsScreenshotAttempted(true);
        if (screenshotTimeoutRef.current) clearTimeout(screenshotTimeoutRef.current);
        screenshotTimeoutRef.current = setTimeout(() => {
          setIsScreenshotAttempted(false);
        }, 2500);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      if (screenshotTimeoutRef.current) clearTimeout(screenshotTimeoutRef.current);
    };
  }, [enableBlurOnFocusLoss]);

  // Handle Press-to-reveal interactions
  const handlePressStart = useCallback((e) => {
    if (pressToReveal) {
      setIsRevealed(true);
    }
    if (onTouchStart && e.type.startsWith('touch')) onTouchStart(e);
    if (onMouseDown && e.type.startsWith('mouse')) onMouseDown(e);
  }, [pressToReveal, onTouchStart, onMouseDown]);

  const handlePressEnd = useCallback((e) => {
    if (pressToReveal) {
      setIsRevealed(false);
    }
    if (onTouchEnd && e.type.startsWith('touch')) onTouchEnd(e);
    if (onMouseUp && e.type.startsWith('mouse')) onMouseUp(e);
  }, [pressToReveal, onTouchEnd, onMouseUp]);

  const handleImageError = useCallback((e) => {
    setImgError(true);
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
    if (onError) onError(e);
  }, [fallbackSrc, onError]);

  const isBlurred =
    (enableBlurOnFocusLoss && (!isWindowFocused || isScreenshotAttempted)) ||
    (pressToReveal && !isRevealed);

  return (
    <div
      ref={containerRef}
      className={`vh-protected-img-wrap ${isBlurred ? 'is-blurred' : ''} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...style
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onClick={onClick}
      {...restProps}
    >
      {/* Primary Protected Image */}
      <img
        src={src}
        alt={alt}
        className={`vh-protected-img ${imgClassName}`}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
          opacity: isBlurred ? 0 : 1,
          filter: isBlurred ? 'blur(60px) brightness(0.05)' : 'none',
          transform: isBlurred ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity 0.12s ease, filter 0.12s ease, transform 0.12s ease',
          ...imgStyle
        }}
        draggable={false}
        loading={loading}
        fetchpriority={fetchpriority}
        decoding={decoding}
        onError={handleImageError}
      />

      {/* Dynamic Semi-Transparent Viewer Watermark */}
      {showWatermark && !imgError && (
        <div
          className="vh-protected-watermark-layer"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            opacity: 0.18,
            transform: 'rotate(-18deg) scale(1.15)',
            transformOrigin: 'center center',
            zIndex: 2,
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          <div className="vh-watermark-row" style={{ whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {activeWatermark}&nbsp;&nbsp;&nbsp;&nbsp;{activeWatermark}
          </div>
          <div className="vh-watermark-row" style={{ whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {activeWatermark}&nbsp;&nbsp;&nbsp;&nbsp;{activeWatermark}
          </div>
          <div className="vh-watermark-row" style={{ whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {activeWatermark}&nbsp;&nbsp;&nbsp;&nbsp;{activeWatermark}
          </div>
        </div>
      )}

      {/* Transparent Click Shield */}
      <div
        className="vh-protected-shield"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          backgroundColor: 'transparent',
          cursor: pressToReveal ? 'pointer' : 'inherit'
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Window Focus Lost / Screenshot Shortcut Mask */}
      {enableBlurOnFocusLoss && (!isWindowFocused || isScreenshotAttempted) && (
        <div className="vh-privacy-mask">
          <div className="vh-mask-icon-circle">
            {isScreenshotAttempted ? (
              <ShieldWarning size={22} color="#ff2d55" weight="bold" />
            ) : (
              <LockSimple size={20} color="#ff2d55" weight="bold" />
            )}
          </div>
          <span className="vh-mask-title font-ui">
            {isScreenshotAttempted ? 'Screenshot Blocked' : 'Protected Content'}
          </span>
          <span className="vh-mask-subtitle font-ui">
            {isScreenshotAttempted ? 'Capturing photos is prohibited' : 'Focus window to view'}
          </span>
        </div>
      )}

      {/* Press & Hold to Reveal Prompt */}
      {pressToReveal && !isRevealed && isWindowFocused && !isScreenshotAttempted && (
        <div
          className="vh-press-reveal-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 15, 20, 0.65)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            gap: '10px'
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          >
            <EyeSlash size={16} weight="bold" />
            <span>Hold to View</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProtectedImage;

import React from 'react';
import { Compass, HeartBreak, House, ArrowLeft, ShieldCheck, SignIn, Sparkle } from '@phosphor-icons/react';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';

export const NotFoundPage = ({
  path = '',
  isLoggedIn = false,
  onNavigate,
  onSignIn,
  onGetStarted,
}) => {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      if (onNavigate) onNavigate(isLoggedIn ? 'discover' : 'home');
    }
  };

  return (
    <div className="vh-notfound-page page-enter">
      {/* Ambient background glows */}
      <div className="notfound-glow notfound-glow-top" />
      <div className="notfound-glow notfound-glow-bottom" />

      {/* Floating subtle romantic hearts in background */}
      <div className="notfound-ambient-hearts" aria-hidden="true">
        <span className="ambient-heart h1">♥</span>
        <span className="ambient-heart h2">♥</span>
        <span className="ambient-heart h3">♥</span>
        <span className="ambient-heart h4">♥</span>
      </div>

      <div className="notfound-card-wrap">
        {/* Brand Logo Header */}
        <div className="notfound-logo-row">
          <img src={velvetHeartLogo} alt="Velvet Hearts" className="notfound-logo" />
        </div>

        {/* Central 404 & Icon Hero */}
        <div className="notfound-hero-cluster">
          <div className="notfound-num font-display">404</div>
          <div className="notfound-icon-badge">
            <HeartBreak size={42} weight="fill" className="notfound-heart-icon" />
          </div>
        </div>

        {/* Editorial Text */}
        <h1 className="notfound-title font-display">
          Looks Like This Heart Wandered Off
        </h1>

        <p className="notfound-subtitle font-body">
          The page you're searching for doesn't exist, was moved, or was just a passing crush. Let's guide you back to where genuine connections thrive.
        </p>

        {path && (
          <div className="notfound-path-chip font-ui">
            <span className="path-label">Lost URL:</span>
            <code>{path}</code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="notfound-actions-group">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="notfound-btn notfound-btn-primary font-ui"
                onClick={() => onNavigate && onNavigate('discover')}
              >
                <Compass size={18} weight="bold" />
                <span>Return to Discover</span>
              </button>

              <button
                type="button"
                className="notfound-btn notfound-btn-secondary font-ui"
                onClick={() => onNavigate && onNavigate('matches')}
              >
                <Sparkle size={18} weight="fill" />
                <span>View Matches</span>
              </button>

              <button
                type="button"
                className="notfound-btn notfound-btn-ghost font-ui"
                onClick={handleGoBack}
              >
                <ArrowLeft size={17} weight="bold" />
                <span>Go Back</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="notfound-btn notfound-btn-primary font-ui"
                onClick={() => onNavigate && onNavigate('home')}
              >
                <House size={18} weight="bold" />
                <span>Return to Home</span>
              </button>

              {onSignIn && (
                <button
                  type="button"
                  className="notfound-btn notfound-btn-secondary font-ui"
                  onClick={onSignIn}
                >
                  <SignIn size={18} weight="bold" />
                  <span>Sign In</span>
                </button>
              )}

              <button
                type="button"
                className="notfound-btn notfound-btn-ghost font-ui"
                onClick={handleGoBack}
              >
                <ArrowLeft size={17} weight="bold" />
                <span>Go Back</span>
              </button>
            </>
          )}
        </div>

        {/* Quick Footer Links */}
        <div className="notfound-footer-links font-ui">
          {isLoggedIn ? (
            <>
              <button type="button" onClick={() => onNavigate && onNavigate('safety')}>
                <ShieldCheck size={14} weight="bold" /> Safety Center
              </button>
              <span className="dot-sep">•</span>
              <button type="button" onClick={() => onNavigate && onNavigate('settings')}>
                Settings
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onNavigate && onNavigate('home')}>
                About Velvet Hearts
              </button>
              <span className="dot-sep">•</span>
              <button type="button" onClick={onGetStarted}>
                Join Now
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .vh-notfound-page {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6) var(--space-4);
          position: relative;
          overflow: hidden;
          background-color: var(--bg-page);
          box-sizing: border-box;
        }

        /* Ambient Glows */
        .notfound-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.28;
        }

        .notfound-glow-top {
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, #b8436a 0%, transparent 70%);
        }

        .notfound-glow-bottom {
          bottom: -150px;
          right: -150px;
          background: radial-gradient(circle, #800020 0%, transparent 70%);
        }

        /* Ambient Floating Hearts */
        .notfound-ambient-hearts {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .ambient-heart {
          position: absolute;
          color: var(--burgundy-400);
          opacity: 0.12;
          font-size: 28px;
          animation: floatHeart 8s infinite ease-in-out;
        }

        .ambient-heart.h1 { top: 18%; left: 12%; animation-duration: 9s; font-size: 24px; }
        .ambient-heart.h2 { top: 65%; left: 8%; animation-duration: 11s; font-size: 32px; animation-delay: 1.5s; }
        .ambient-heart.h3 { top: 22%; right: 14%; animation-duration: 10s; font-size: 30px; animation-delay: 0.8s; }
        .ambient-heart.h4 { top: 72%; right: 10%; animation-duration: 12s; font-size: 22px; animation-delay: 2.2s; }

        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-24px) rotate(14deg); }
        }

        /* Main Card */
        .notfound-card-wrap {
          position: relative;
          z-index: 10;
          max-width: 500px;
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-2xl, 24px);
          padding: var(--space-8) var(--space-6);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.04);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .notfound-logo-row {
          margin-bottom: var(--space-4);
        }

        .notfound-logo {
          height: 44px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(184, 67, 106, 0.35));
        }

        /* Hero 404 Cluster */
        .notfound-hero-cluster {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-3);
        }

        .notfound-num {
          font-size: clamp(5rem, 16vw, 7.5rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #ffffff 20%, var(--burgundy-300) 60%, var(--burgundy-500) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          user-select: none;
        }

        [data-theme="light"] .notfound-num {
          background: linear-gradient(135deg, var(--burgundy-700) 20%, var(--burgundy-500) 70%, var(--burgundy-400) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .notfound-icon-badge {
          position: absolute;
          bottom: 2px;
          right: -8px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--bg-surface-elevated, #241d20);
          border: 2px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          animation: pulseIcon 2.4s infinite ease-in-out;
        }

        .notfound-heart-icon {
          color: var(--burgundy-400);
        }

        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* Titles */
        .notfound-title {
          font-size: clamp(1.4rem, 4.5vw, 1.85rem);
          color: var(--text-primary);
          margin: var(--space-2) 0 var(--space-3);
          font-weight: 700;
          line-height: 1.25;
        }

        .notfound-subtitle {
          font-size: var(--text-body-sm, 14px);
          color: var(--text-secondary);
          line-height: 1.55;
          max-width: 410px;
          margin: 0 0 var(--space-4);
        }

        /* Path chip */
        .notfound-path-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-muted, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full, 999px);
          padding: 4px 14px;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: var(--space-6);
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notfound-path-chip code {
          color: var(--burgundy-300);
          font-weight: 600;
        }

        /* Action Buttons */
        .notfound-actions-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          width: 100%;
          max-width: 340px;
        }

        .notfound-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: var(--radius-full, 999px);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: none;
          outline: none;
          text-decoration: none;
        }

        .notfound-btn-primary {
          background: linear-gradient(135deg, var(--burgundy-500), var(--burgundy-600));
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(184, 67, 106, 0.35);
        }

        .notfound-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(184, 67, 106, 0.5);
          filter: brightness(1.08);
        }

        .notfound-btn-secondary {
          background: var(--bg-surface-elevated, #241d20);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
        }

        .notfound-btn-secondary:hover {
          background: var(--bg-muted);
          border-color: var(--burgundy-400);
          color: var(--burgundy-300);
          transform: translateY(-2px);
        }

        .notfound-btn-ghost {
          background: transparent;
          color: var(--text-tertiary);
          padding: 8px 16px;
        }

        .notfound-btn-ghost:hover {
          color: var(--text-primary);
        }

        .notfound-btn:active {
          transform: scale(0.97);
        }

        /* Footer links */
        .notfound-footer-links {
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          font-size: 12px;
        }

        .notfound-footer-links button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          font-size: 12px;
        }

        .notfound-footer-links button:hover {
          color: var(--burgundy-400);
        }

        .dot-sep {
          color: var(--text-muted);
          opacity: 0.4;
        }

        @media (max-width: 480px) {
          .notfound-card-wrap {
            padding: var(--space-6) var(--space-4);
            border-radius: 20px;
          }

          .notfound-actions-group {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

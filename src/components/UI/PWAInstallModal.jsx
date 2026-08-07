import React, { useState, useEffect } from 'react';
import { DownloadSimple, X, Sparkle, ShieldCheck, Lightning } from '@phosphor-icons/react';
import velvetHeartLogo from '../../assets/velvet-heart-logo.png';

const PROMPT_STORAGE_KEY = 'vh_pwa_install_prompt_dismissed';

export const PWAInstallModal = ({ isLoggedIn, isOnboarded }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const hasBeenPrompted = localStorage.getItem(PROMPT_STORAGE_KEY);
      if (!hasBeenPrompted && isLoggedIn && isOnboarded) {
        // Delay slightly for smooth post-login UX
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isLoggedIn, isOnboarded]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    localStorage.setItem(PROMPT_STORAGE_KEY, 'true');
    setDeferredPrompt(null);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen || !deferredPrompt) return null;

  return (
    <div className="pwa-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="pwa-modal-card animate-scale-up font-ui">
        <button
          type="button"
          className="pwa-modal-close-btn"
          onClick={handleDismiss}
          aria-label="Close install prompt"
        >
          <X size={18} />
        </button>

        <div className="pwa-modal-header">
          <div className="pwa-logo-badge">
            <img src={velvetHeartLogo} alt="Velvet Hearts" className="pwa-logo-img" />
          </div>
          <h2 className="pwa-modal-title font-display">Install Velvet Hearts</h2>
          <p className="pwa-modal-subtitle">
            Get the full app experience right on your home screen with instant match alerts and faster access.
          </p>
        </div>

        <div className="pwa-features-list">
          <div className="pwa-feature-item">
            <Lightning size={18} weight="fill" className="pwa-feature-icon" />
            <span>Instant push notifications for new messages & matches</span>
          </div>
          <div className="pwa-feature-item">
            <Sparkle size={18} weight="fill" className="pwa-feature-icon" />
            <span>Full-screen experience with smooth animations</span>
          </div>
          <div className="pwa-feature-item">
            <ShieldCheck size={18} weight="fill" className="pwa-feature-icon" />
            <span>Quick 1-tap access from your home screen</span>
          </div>
        </div>

        <div className="pwa-modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-md pwa-install-btn"
            onClick={handleInstallClick}
          >
            <DownloadSimple size={18} weight="bold" />
            Install App
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-md pwa-dismiss-btn"
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>

      <style>{`
        .pwa-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(13, 9, 11, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .pwa-modal-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface-elevated, #1a1417);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 24px;
          padding: 28px 24px 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(184, 67, 106, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .pwa-modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-secondary, #e2d9dc);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .pwa-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .pwa-logo-badge {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(184, 67, 106, 0.25) 0%, rgba(30, 20, 25, 0.8) 100%);
          border: 1px solid rgba(184, 67, 106, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 20px rgba(184, 67, 106, 0.25);
        }

        .pwa-logo-img {
          width: 44px;
          height: auto;
        }

        .pwa-modal-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary, #fff);
          margin-bottom: 6px;
        }

        .pwa-modal-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
          line-height: 1.45;
          margin-bottom: 20px;
        }

        .pwa-features-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 12px 14px;
          margin-bottom: 22px;
          text-align: left;
        }

        .pwa-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: var(--text-secondary, #e2d9dc);
          font-weight: 500;
        }

        .pwa-feature-icon {
          color: var(--burgundy-400, #d95b83);
          flex-shrink: 0;
        }

        .pwa-modal-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pwa-install-btn {
          width: 100%;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.4);
        }

        .pwa-dismiss-btn {
          width: 100%;
          justify-content: center;
          background: transparent;
          border-color: transparent;
          color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
        }

        .pwa-dismiss-btn:hover {
          color: var(--text-primary, #fff);
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </div>
  );
};

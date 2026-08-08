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
            className="pwa-dismiss-btn font-ui"
            onClick={handleDismiss}
          >
            Not Now
          </button>
          <button
            type="button"
            className="pwa-install-btn font-ui"
            onClick={handleInstallClick}
          >
            <DownloadSimple size={18} weight="bold" />
            Install App
          </button>
        </div>
      </div>

      <style>{`
        .pwa-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(13, 9, 11, 0.82);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .pwa-modal-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: #191216;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 28px 24px 24px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(184, 67, 106, 0.25);
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
          color: #e2d9dc;
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
          background: linear-gradient(135deg, rgba(184, 67, 106, 0.3) 0%, rgba(30, 20, 25, 0.9) 100%);
          border: 1px solid rgba(184, 67, 106, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 20px rgba(184, 67, 106, 0.3);
        }

        .pwa-logo-img {
          width: 44px;
          height: auto;
        }

        .pwa-modal-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .pwa-modal-subtitle {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.45;
          margin-bottom: 20px;
        }

        .pwa-features-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 22px;
          text-align: left;
        }

        .pwa-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #e2d9dc;
          font-weight: 500;
        }

        .pwa-feature-icon {
          color: #F3C68F;
          flex-shrink: 0;
        }

        .pwa-modal-actions {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pwa-install-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 46px;
          padding: 0 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #B8436A 0%, #E86B93 100%);
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .pwa-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(184, 67, 106, 0.6);
          filter: brightness(1.08);
        }

        .pwa-install-btn:active {
          transform: translateY(0);
        }

        .pwa-dismiss-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 46px;
          padding: 0 18px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2d9dc;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pwa-dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

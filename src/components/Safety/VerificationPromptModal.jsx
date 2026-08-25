import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkle, X, CheckCircle, Clock } from '@phosphor-icons/react';
import { Button } from '../UI/Button';
import { VerifiedBadge } from '../UI/VerifiedBadge';
import { PhotoVerificationModal } from './PhotoVerificationModal';

const SNOOZE_KEY = 'vh_verification_snoozed_until';
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export const VerificationPromptModal = () => {
  const { userProfile, isLoggedIn, isOnboarded, setUserProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotoVerifyOpen, setIsPhotoVerifyOpen] = useState(false);

  useEffect(() => {
    // Only check for logged-in, onboarded users
    if (!isLoggedIn || !isOnboarded || !userProfile) {
      setIsOpen(false);
      return;
    }

    // If already verified, never show again
    if (userProfile.verified) {
      setIsOpen(false);
      try {
        localStorage.removeItem(SNOOZE_KEY);
      } catch (_) {}
      return;
    }

    // Check if snoozed
    try {
      const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
      if (snoozedUntil && Date.now() < Number(snoozedUntil)) {
        setIsOpen(false);
        return;
      }
    } catch (_) {}

    // Gentle delay after loading so it feels natural and smooth
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isOnboarded, userProfile?.verified]);

  const handleMaybeLater = () => {
    try {
      const snoozeTarget = Date.now() + FORTY_EIGHT_HOURS_MS;
      localStorage.setItem(SNOOZE_KEY, String(snoozeTarget));
    } catch (_) {}
    setIsOpen(false);
  };

  const handleVerifyNow = () => {
    setIsOpen(false);
    setIsPhotoVerifyOpen(true);
  };

  const handleVerifiedSuccess = () => {
    try {
      localStorage.removeItem(SNOOZE_KEY);
    } catch (_) {}
    setIsPhotoVerifyOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="vh-modal-overlay verify-prompt-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-prompt-title"
        >
          <div className="verify-prompt-card font-ui">
            {/* Close / Snooze top button */}
            <button
              type="button"
              className="verify-prompt-close-btn"
              onClick={handleMaybeLater}
              aria-label="Dismiss for 48 hours"
              title="Maybe Later (remind in 48 hrs)"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Glowing Icon Header */}
            <div className="verify-prompt-hero">
              <div className="verify-prompt-shield-glow">
                <ShieldCheck size={44} weight="fill" color="#D4AD6A" />
                <div className="verify-prompt-sparkle-tag">
                  <Sparkle size={14} weight="fill" color="#FFFFFF" />
                </div>
              </div>
            </div>

            {/* Title & Badge Preview */}
            <div className="verify-prompt-body">
              <div className="verify-prompt-badge-preview">
                <VerifiedBadge variant="pill" size="md" interactive={false} />
              </div>

              <h2 id="verify-prompt-title" className="verify-prompt-title font-display">
                Get Your Verified Badge
              </h2>

              <p className="verify-prompt-subtitle font-body">
                Confirm your authenticity with a quick 10-second live selfie check to earn the official rosette badge on your profile.
              </p>

              {/* Perks List */}
              <div className="verify-prompt-perks">
                <div className="verify-prompt-perk-item">
                  <CheckCircle size={18} weight="fill" color="#22C55E" />
                  <span><strong>3x More Connection Matches</strong> — Members connect faster with verified profiles.</span>
                </div>
                <div className="verify-prompt-perk-item">
                  <CheckCircle size={18} weight="fill" color="#22C55E" />
                  <span><strong>Instant 10-Second Pose Check</strong> — Simple 1-handed live gesture check.</span>
                </div>
                <div className="verify-prompt-perk-item">
                  <CheckCircle size={18} weight="fill" color="#22C55E" />
                  <span><strong>100% Private</strong> — Verification selfie is never shown publicly.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="verify-prompt-actions">
                <Button
                  variant="primary"
                  className="verify-prompt-btn-primary"
                  onClick={handleVerifyNow}
                >
                  <ShieldCheck size={18} weight="fill" />
                  <span>Verify Now (10s)</span>
                </Button>

                <button
                  type="button"
                  className="verify-prompt-btn-later font-ui"
                  onClick={handleMaybeLater}
                >
                  <Clock size={15} />
                  <span>Maybe Later (Remind in 48h)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Live Pose Verification Modal */}
      <PhotoVerificationModal
        isOpen={isPhotoVerifyOpen}
        onClose={() => setIsPhotoVerifyOpen(false)}
        primaryPhotoUrl={userProfile?.photos?.[0] || null}
        onVerified={handleVerifiedSuccess}
      />
    </>
  );
};

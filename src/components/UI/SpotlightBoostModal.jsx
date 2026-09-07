import React from 'react';
import { createPortal } from 'react-dom';
import { Lightning, Clock, Sparkle, X, CheckCircle, ShieldCheck, Flame } from '@phosphor-icons/react';
import { Button } from './Button';

export const SpotlightBoostModal = ({
  isOpen,
  onClose,
  boostState = {},
  onActivate
}) => {
  if (!isOpen) return null;

  const {
    isBoosting = false,
    isOnCooldown = false,
    boostSecondsLeft = 0,
    cooldownSecondsLeft = 0
  } = boostState;

  // Format 30 min timer: MM:SS
  const formatBoostTimer = (totalSec) => {
    const m = Math.floor(Math.max(0, totalSec) / 60);
    const s = Math.max(0, totalSec) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format 2-day cooldown timer: X days Y hrs or X hrs Y mins
  const formatCooldownTimer = (totalSec) => {
    const sec = Math.max(0, totalSec);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // 30 min progress (1800s total)
  const percentElapsed = isBoosting
    ? Math.min(100, Math.max(0, Math.round(((1800 - boostSecondsLeft) / 1800) * 100)))
    : 0;

  return createPortal(
    <div
      className="vh-modal-overlay spotlight-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="spotlight-modal-card font-ui page-enter">
        {/* Close Button */}
        <button
          type="button"
          className="spotlight-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} weight="bold" />
        </button>

        {/* STATE 1: ACTIVE BOOSTING (30 Mins Live Countdown) */}
        {isBoosting && (
          <div className="spotlight-content spotlight-content-active">
            <div className="spotlight-hero-badge is-active">
              <div className="spotlight-pulse-ring ring-1" />
              <div className="spotlight-pulse-ring ring-2" />
              <div className="spotlight-icon-circle is-active">
                <Lightning size={36} weight="fill" color="#FFFFFF" />
              </div>
            </div>

            <div className="spotlight-status-tag font-ui">
              <span className="pulsing-live-dot" />
              <span>BOOST ACTIVE NOW</span>
            </div>

            <h2 className="spotlight-title font-display">Spotlight Profile Boost</h2>
            <p className="spotlight-desc font-body">
              Your profile is currently prioritized at the top of candidate decks for active members near you.
            </p>

            {/* Big Countdown Display */}
            <div className="spotlight-timer-box">
              <div className="spotlight-timer-number font-display">
                {formatBoostTimer(boostSecondsLeft)}
              </div>
              <div className="spotlight-timer-label font-ui">Time Remaining in 30-Min Boost</div>

              <div className="spotlight-progress-bar-track">
                <div
                  className="spotlight-progress-bar-fill"
                  style={{ width: `${100 - percentElapsed}%` }}
                />
              </div>
            </div>

            <div className="spotlight-notice-pill font-ui">
              <span>⏳ Boosting stops automatically when the countdown reaches 00:00.</span>
            </div>

            <div className="spotlight-actions">
              <Button
                variant="primary"
                onClick={onClose}
                className="spotlight-btn-full"
              >
                Got It, Keep Browsing
              </Button>
            </div>
          </div>
        )}

        {/* STATE 2: ON COOLDOWN (2 Days) */}
        {!isBoosting && isOnCooldown && (
          <div className="spotlight-content spotlight-content-cooldown">
            <div className="spotlight-hero-badge is-cooldown">
              <div className="spotlight-icon-circle is-cooldown">
                <Clock size={36} weight="fill" color="#D4AD6A" />
              </div>
            </div>

            <div className="spotlight-status-tag is-cooldown font-ui">
              <span>2-DAY COOLDOWN ACTIVE</span>
            </div>

            <h2 className="spotlight-title font-display">Boost on Cooldown</h2>
            <p className="spotlight-desc font-body">
              To give every member a fair spotlight, each profile can be boosted once every <strong>2 days</strong> (48 hours).
            </p>

            <div className="spotlight-cooldown-box">
              <div className="cooldown-subhead font-ui">Next Free Boost Available In:</div>
              <div className="cooldown-timer font-display">
                {formatCooldownTimer(cooldownSecondsLeft)}
              </div>
            </div>

            <div className="spotlight-actions">
              <Button
                variant="secondary"
                onClick={onClose}
                className="spotlight-btn-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* STATE 3: READY TO ACTIVATE BOOST */}
        {!isBoosting && !isOnCooldown && (
          <div className="spotlight-content spotlight-content-ready">
            <div className="spotlight-hero-badge is-ready">
              <div className="spotlight-pulse-ring ring-1" />
              <div className="spotlight-icon-circle is-ready">
                <Lightning size={36} weight="fill" color="#FFFFFF" />
              </div>
            </div>

            <h2 className="spotlight-title font-display">Spotlight Profile Boost</h2>
            <p className="spotlight-desc font-body">
              Instantly jump to the front of discovery feeds and be seen by up to <strong>5x more people</strong> in your area.
            </p>

            {/* Feature Perks List */}
            <div className="spotlight-perks-list font-ui">
              <div className="spotlight-perk-item">
                <div className="perk-icon-wrap">
                  <Lightning size={19} weight="fill" color="var(--burgundy-500, #B8436A)" />
                </div>
                <div>
                  <strong>Top Priority Placement</strong>
                  <span>Your card appears right at the top for people nearby</span>
                </div>
              </div>

              <div className="spotlight-perk-item">
                <div className="perk-icon-wrap">
                  <Clock size={19} weight="fill" color="var(--gold-primary, #D4AD6A)" />
                </div>
                <div>
                  <strong>30 Minutes Active Duration</strong>
                  <span>Automatic countdown with live visibility acceleration</span>
                </div>
              </div>

              <div className="spotlight-perk-item">
                <div className="perk-icon-wrap">
                  <ShieldCheck size={19} weight="fill" color="var(--success, #10B981)" />
                </div>
                <div>
                  <strong>Fair Discovery (2-Day Cooldown)</strong>
                  <span>Free boost replenishes once every 48 hours</span>
                </div>
              </div>
            </div>

            <div className="spotlight-actions">
              <Button
                variant="primary"
                onClick={onActivate}
                className="spotlight-btn-full btn-boost-launch"
              >
                <Lightning size={18} weight="fill" />
                <span>Activate Boost (30 Mins)</span>
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
                className="spotlight-btn-full spotlight-btn-secondary"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        )}

        <style>{`
          /* ============================================================
             VELVET HEARTS SPOTLIGHT BOOST MODAL — THEME ADAPTIVE
             ============================================================ */
          .spotlight-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(10, 8, 9, 0.78);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          [data-theme="light"] .spotlight-modal-overlay {
            background: rgba(45, 25, 32, 0.45);
          }

          .spotlight-modal-card {
            position: relative;
            width: 100%;
            max-width: 440px;
            background: linear-gradient(165deg, rgba(28, 20, 24, 0.98) 0%, rgba(18, 14, 16, 0.99) 100%);
            border: 1px solid rgba(184, 67, 106, 0.3);
            border-radius: 28px;
            padding: 32px 28px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 35px rgba(184, 67, 106, 0.18);
            color: #FFFFFF;
            text-align: center;
            transition: all var(--duration-normal) var(--ease-out-smooth);
          }

          [data-theme="light"] .spotlight-modal-card {
            background: linear-gradient(165deg, #FFFFFF 0%, #FFF8F6 100%);
            border: 1px solid rgba(184, 67, 106, 0.22);
            box-shadow: 0 24px 64px rgba(58, 14, 26, 0.14), 0 0 30px rgba(184, 67, 106, 0.1);
            color: var(--charcoal-900, #1A1517);
          }

          .spotlight-close-btn {
            position: absolute;
            top: 18px;
            right: 18px;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .spotlight-close-btn:hover {
            background: rgba(255, 255, 255, 0.18);
            color: #FFFFFF;
          }

          [data-theme="light"] .spotlight-close-btn {
            background: rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.08);
            color: var(--charcoal-600, #6B5E62);
          }

          [data-theme="light"] .spotlight-close-btn:hover {
            background: rgba(184, 67, 106, 0.1);
            color: var(--burgundy-600, #9E3256);
          }

          .spotlight-hero-badge {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .spotlight-icon-circle {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
          }

          .spotlight-icon-circle.is-ready,
          .spotlight-icon-circle.is-active {
            background: linear-gradient(135deg, var(--burgundy-500, #B8436A) 0%, var(--gold-primary, #D4AD6A) 100%);
            box-shadow: 0 8px 24px rgba(184, 67, 106, 0.45);
          }

          [data-theme="light"] .spotlight-icon-circle.is-ready,
          [data-theme="light"] .spotlight-icon-circle.is-active {
            box-shadow: 0 8px 24px rgba(184, 67, 106, 0.35);
          }

          .spotlight-icon-circle.is-cooldown {
            background: rgba(36, 28, 32, 0.9);
            border: 1.5px solid rgba(212, 173, 106, 0.4);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          }

          [data-theme="light"] .spotlight-icon-circle.is-cooldown {
            background: #FFFDF9;
            border: 1.5px solid rgba(212, 173, 106, 0.5);
            box-shadow: 0 6px 18px rgba(58, 14, 26, 0.1);
          }

          .spotlight-pulse-ring {
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            border: 1.5px solid rgba(184, 67, 106, 0.4);
            animation: pulseRadar 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          }

          .spotlight-pulse-ring.ring-2 {
            inset: -18px;
            animation-delay: 0.6s;
            opacity: 0.6;
          }

          @keyframes pulseRadar {
            0% { transform: scale(0.85); opacity: 0.8; }
            100% { transform: scale(1.35); opacity: 0; }
          }

          .spotlight-status-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            background: rgba(184, 67, 106, 0.16);
            border: 1px solid rgba(184, 67, 106, 0.35);
            color: #FFAEC5;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            margin-bottom: 12px;
          }

          [data-theme="light"] .spotlight-status-tag {
            background: rgba(184, 67, 106, 0.1);
            border-color: rgba(184, 67, 106, 0.28);
            color: var(--burgundy-600, #9E3256);
          }

          .spotlight-status-tag.is-cooldown {
            background: rgba(212, 173, 106, 0.14);
            border-color: rgba(212, 173, 106, 0.35);
            color: #F8E7D8;
          }

          [data-theme="light"] .spotlight-status-tag.is-cooldown {
            background: rgba(212, 173, 106, 0.12);
            border-color: rgba(212, 173, 106, 0.4);
            color: var(--gold-800, #7A5B28);
          }

          .pulsing-live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: var(--burgundy-500, #B8436A);
            box-shadow: 0 0 8px var(--burgundy-400, #D0607F);
            animation: liveDotPulse 1.4s infinite;
          }

          @keyframes liveDotPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
          }

          .spotlight-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #FAF5F0;
            margin: 0 0 8px;
          }

          [data-theme="light"] .spotlight-title {
            color: var(--charcoal-900, #1A1517);
          }

          .spotlight-desc {
            font-size: 0.92rem;
            line-height: 1.48;
            color: rgba(255, 255, 255, 0.76);
            margin: 0 0 20px;
          }

          [data-theme="light"] .spotlight-desc {
            color: var(--charcoal-600, #6B5E62);
          }

          /* Timer Box */
          .spotlight-timer-box {
            background: rgba(12, 9, 11, 0.65);
            border: 1px solid rgba(184, 67, 106, 0.25);
            border-radius: 20px;
            padding: 20px 16px;
            margin-bottom: 16px;
          }

          [data-theme="light"] .spotlight-timer-box {
            background: #FFFFFF;
            border: 1px solid rgba(184, 67, 106, 0.18);
            box-shadow: 0 4px 18px rgba(58, 14, 26, 0.06);
          }

          .spotlight-timer-number {
            font-size: 2.75rem;
            font-weight: 800;
            letter-spacing: 0.03em;
            color: #FFFFFF;
            text-shadow: 0 0 20px rgba(184, 67, 106, 0.5);
            margin-bottom: 4px;
            font-variant-numeric: tabular-nums;
          }

          [data-theme="light"] .spotlight-timer-number {
            color: var(--burgundy-700, #7A223E);
            text-shadow: 0 0 16px rgba(184, 67, 106, 0.15);
          }

          .spotlight-timer-label {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 14px;
          }

          [data-theme="light"] .spotlight-timer-label {
            color: var(--charcoal-500, #8A7B80);
          }

          .spotlight-progress-bar-track {
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            width: 80%;
            margin: 0 auto;
          }

          [data-theme="light"] .spotlight-progress-bar-track {
            background: rgba(0, 0, 0, 0.08);
          }

          .spotlight-progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #B8436A 0%, #D4AD6A 100%);
            border-radius: 3px;
            transition: width 1s linear;
          }

          .spotlight-notice-pill {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 22px;
          }

          [data-theme="light"] .spotlight-notice-pill {
            color: var(--charcoal-600, #6B5E62);
          }

          /* Cooldown Box */
          .spotlight-cooldown-box {
            background: rgba(14, 11, 13, 0.65);
            border: 1px solid rgba(212, 173, 106, 0.25);
            border-radius: 20px;
            padding: 22px 18px;
            margin-bottom: 24px;
          }

          [data-theme="light"] .spotlight-cooldown-box {
            background: #FFFDF9;
            border: 1px solid rgba(212, 173, 106, 0.35);
            box-shadow: 0 4px 18px rgba(58, 14, 26, 0.06);
          }

          .cooldown-subhead {
            font-size: 0.82rem;
            color: var(--gold-primary, #D4AD6A);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            margin-bottom: 6px;
          }

          [data-theme="light"] .cooldown-subhead {
            color: var(--gold-800, #7A5B28);
          }

          .cooldown-timer {
            font-size: 1.8rem;
            font-weight: 700;
            color: #FAF5F0;
          }

          [data-theme="light"] .cooldown-timer {
            color: var(--charcoal-900, #1A1517);
          }

          /* Perks List */
          .spotlight-perks-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: left;
            margin-bottom: 24px;
            background: rgba(12, 9, 11, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 16px;
          }

          [data-theme="light"] .spotlight-perks-list {
            background: #FFFFFF;
            border: 1px solid rgba(184, 67, 106, 0.16);
            box-shadow: 0 4px 16px rgba(58, 14, 26, 0.05);
          }

          .spotlight-perk-item {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .perk-icon-wrap {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          [data-theme="light"] .perk-icon-wrap {
            background: rgba(184, 67, 106, 0.08);
          }

          .spotlight-perk-item strong {
            display: block;
            font-size: 0.88rem;
            color: #FFFFFF;
          }

          [data-theme="light"] .spotlight-perk-item strong {
            color: var(--charcoal-900, #1A1517);
          }

          .spotlight-perk-item span {
            display: block;
            font-size: 0.78rem;
            color: rgba(255, 255, 255, 0.6);
          }

          [data-theme="light"] .spotlight-perk-item span {
            color: var(--charcoal-600, #6B5E62);
          }

          /* Actions */
          .spotlight-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .spotlight-btn-full {
            width: 100% !important;
            justify-content: center;
            padding: 12px 16px !important;
            border-radius: 14px !important;
            font-weight: 600 !important;
          }

          .btn-boost-launch {
            background: linear-gradient(135deg, var(--burgundy-500, #B8436A) 0%, var(--gold-primary, #D4AD6A) 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            color: #FFFFFF !important;
            box-shadow: 0 4px 20px rgba(184, 67, 106, 0.45) !important;
          }

          [data-theme="light"] .btn-boost-launch {
            border: none !important;
            box-shadow: 0 4px 20px rgba(184, 67, 106, 0.35) !important;
          }

          .btn-boost-launch:hover {
            filter: brightness(1.1) !important;
            transform: translateY(-1px);
          }

          [data-theme="light"] .spotlight-btn-secondary {
            background: rgba(0, 0, 0, 0.04) !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            color: var(--charcoal-700, #4A3E42) !important;
          }

          [data-theme="light"] .spotlight-btn-secondary:hover {
            background: rgba(184, 67, 106, 0.08) !important;
            color: var(--burgundy-600, #9E3256) !important;
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

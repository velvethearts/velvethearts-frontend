import React from 'react';
import { Modal } from './Modal';
import { MapPin, ShieldCheck, Compass, X } from '@phosphor-icons/react';

export const LocationPermissionModal = ({
  isOpen,
  onClose,
  onEnableLocation,
  isLocationLoading = false
}) => {
  if (!isOpen) return null;

  const handleAllow = () => {
    try {
      localStorage.setItem('vh_location_permission_prompted', 'true');
    } catch (e) {}
    onEnableLocation();
    onClose();
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('vh_location_permission_prompted', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} variant="center">
      <div className="location-permission-modal font-ui">
        {/* Glowing Icon Header */}
        <div className="location-modal-icon-wrap">
          <div className="location-modal-icon-glow" />
          <div className="location-modal-icon-inner">
            <Compass size={36} weight="fill" color="#FFFFFF" />
          </div>
        </div>

        <div className="location-modal-header">
          <h2 className="location-modal-title">Find Matches Near You</h2>
          <p className="location-modal-subtitle">
            See real-time distances to potential matches around your area, campus, or city.
          </p>
        </div>

        {/* Privacy & Feature Highlights */}
        <div className="location-modal-perks">
          <div className="perk-item">
            <div className="perk-icon-wrap">
              <MapPin size={18} weight="fill" color="var(--burgundy-500, #B8436A)" />
            </div>
            <div className="perk-text">
              <strong>Exact Real-Time Distance</strong>
              <span>See proximity in kilometers (e.g. 2.4 km away) instead of state estimates.</span>
            </div>
          </div>

          <div className="perk-item">
            <div className="perk-icon-wrap">
              <ShieldCheck size={18} weight="fill" color="#10B981" />
            </div>
            <div className="perk-text">
              <strong>100% Privacy Protected</strong>
              <span>Your exact address and live GPS coordinates are NEVER displayed to other users.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="location-modal-actions">
          <button
            type="button"
            className="location-modal-btn allow font-ui"
            onClick={handleAllow}
            disabled={isLocationLoading}
          >
            <MapPin size={18} weight="bold" />
            <span>{isLocationLoading ? 'Enabling...' : 'Enable Location'}</span>
          </button>

          <button
            type="button"
            className="location-modal-btn dismiss font-ui"
            onClick={handleDismiss}
          >
            Not Now, Use Profile City
          </button>
        </div>
      </div>

      <style>{`
        .location-permission-modal {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-4) var(--space-2);
          max-width: 380px;
          margin: 0 auto;
        }

        .location-modal-icon-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .location-modal-icon-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184, 67, 106, 0.45) 0%, rgba(138, 21, 56, 0) 70%);
          filter: blur(8px);
          animation: pulseGlow 2.5s ease-in-out infinite alternate;
        }

        .location-modal-icon-inner {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--burgundy-500, #8A1538), var(--burgundy-600, #5C0E24));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(138, 21, 56, 0.4);
        }

        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        .location-modal-header {
          margin-bottom: var(--space-5);
        }

        .location-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary, #FFFFFF);
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }

        [data-theme="light"] .location-modal-title {
          color: var(--charcoal-900, #1A1517);
        }

        .location-modal-subtitle {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
          margin: 0;
        }

        [data-theme="light"] .location-modal-subtitle {
          color: var(--charcoal-600, #6B5E62);
        }

        .location-modal-perks {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg, 16px);
          padding: 14px;
          margin-bottom: var(--space-6);
        }

        [data-theme="light"] .location-modal-perks {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.06);
        }

        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .perk-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        [data-theme="light"] .perk-icon-wrap {
          background: rgba(0, 0, 0, 0.05);
        }

        .perk-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .perk-text strong {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #FFFFFF);
        }

        [data-theme="light"] .perk-text strong {
          color: var(--charcoal-900, #1A1517);
        }

        .perk-text span {
          font-size: 11.5px;
          line-height: 1.4;
          color: var(--text-secondary, rgba(255, 255, 255, 0.65));
        }

        [data-theme="light"] .perk-text span {
          color: var(--charcoal-600, #6B5E62);
        }

        .location-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .location-modal-btn {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-full, 999px);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .location-modal-btn.allow {
          background: linear-gradient(135deg, var(--burgundy-500, #8A1538), var(--burgundy-600, #5C0E24));
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(138, 21, 56, 0.35);
        }

        .location-modal-btn.allow:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(138, 21, 56, 0.5);
        }

        .location-modal-btn.allow:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .location-modal-btn.dismiss {
          background: transparent;
          color: var(--text-secondary, rgba(255, 255, 255, 0.6));
        }

        .location-modal-btn.dismiss:hover {
          color: var(--text-primary, #FFFFFF);
          background: rgba(255, 255, 255, 0.05);
        }

        [data-theme="light"] .location-modal-btn.dismiss {
          color: var(--charcoal-600, #6B5E62);
        }

        [data-theme="light"] .location-modal-btn.dismiss:hover {
          color: var(--charcoal-900, #1A1517);
          background: rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </Modal>
  );
};

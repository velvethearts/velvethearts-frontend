import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  CheckCircle,
  Warning,
  XCircle,
  Info,
  ShieldCheck,
} from '@phosphor-icons/react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  title = 'Confirmation',
  message,
  okText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  variant = 'notice', // 'notice' | 'success' | 'warning' | 'error' | 'info'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={32} weight="fill" />;
      case 'warning':
        return <Warning size={32} weight="fill" />;
      case 'error':
        return <XCircle size={32} weight="fill" />;
      case 'info':
        return <Info size={32} weight="fill" />;
      case 'notice':
      default:
        return <ShieldCheck size={32} weight="fill" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} variant="center">
      <div className={`vh-alert-modal-container vh-alert-variant-${variant}`}>
        {/* Glowing Icon Crest */}
        <div className="vh-alert-icon-wrap">
          <div className="vh-alert-icon-ring">
            {getVariantIcon()}
          </div>
        </div>

        {/* Title & Message */}
        <div className="vh-alert-text-content">
          <h3 className="vh-alert-title font-display">{title}</h3>
          <p className="vh-alert-message font-ui">{message}</p>
        </div>

        {/* Actions */}
        <div className="vh-alert-actions font-ui">
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="vh-alert-btn-cancel"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`vh-alert-btn-confirm vh-confirm-variant-${variant}`}
          >
            {okText}
          </button>
        </div>
      </div>

      <style>{`
        .vh-alert-modal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8px 4px 12px;
          gap: 18px;
        }

        .vh-alert-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }

        .vh-alert-icon-ring {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        /* Variant Icon Styling */
        .vh-alert-variant-success .vh-alert-icon-ring {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          box-shadow: 0 0 24px rgba(16, 185, 129, 0.2);
        }

        .vh-alert-variant-warning .vh-alert-icon-ring {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.2);
        }

        .vh-alert-variant-error .vh-alert-icon-ring {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
          box-shadow: 0 0 24px rgba(239, 68, 68, 0.2);
        }

        .vh-alert-variant-info .vh-alert-icon-ring {
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38bdf8;
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.2);
        }

        .vh-alert-variant-notice .vh-alert-icon-ring {
          background: rgba(184, 67, 106, 0.14);
          border: 1px solid rgba(212, 173, 106, 0.35);
          color: #D4AD6A;
          box-shadow: 0 0 24px rgba(184, 67, 106, 0.25);
        }

        .vh-alert-text-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 400px;
        }

        .vh-alert-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .vh-alert-message {
          font-size: 14px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.75));
          line-height: 1.6;
          margin: 0;
        }

        .vh-alert-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          margin-top: 8px;
        }

        .vh-alert-btn-cancel {
          flex: 1;
          max-width: 160px;
          padding: 11px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.75);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vh-alert-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .vh-alert-btn-confirm {
          flex: 1;
          max-width: 180px;
          padding: 11px 22px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .vh-confirm-variant-notice {
          background: linear-gradient(135deg, #B8436A 0%, #8A2548 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.4);
          border-color: rgba(212, 173, 106, 0.3);
        }

        .vh-confirm-variant-notice:hover {
          background: linear-gradient(135deg, #CA5078 0%, #9C2E54 100%);
          transform: translateY(-1px);
        }

        .vh-confirm-variant-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
        }

        .vh-confirm-variant-success:hover {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          transform: translateY(-1px);
        }

        .vh-confirm-variant-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #1a1209;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
        }

        .vh-confirm-variant-warning:hover {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          transform: translateY(-1px);
        }

        .vh-confirm-variant-error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
        }

        .vh-confirm-variant-error:hover {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          transform: translateY(-1px);
        }

        .vh-confirm-variant-info {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35);
        }

        .vh-confirm-variant-info:hover {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .vh-alert-actions {
            flex-direction: column-reverse;
          }
          .vh-alert-btn-cancel,
          .vh-alert-btn-confirm {
            max-width: 100%;
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
};

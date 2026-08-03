import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmModal = ({
  isOpen,
  onClose,
  title = 'Confirmation',
  message,
  okText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true
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

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} variant="center">
      <div className="confirm-modal-body font-ui">
        <p className="confirm-modal-message font-body">{message}</p>
        <div className="confirm-modal-actions">
          {showCancel && (
            <Button variant="secondary" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button variant="primary" onClick={handleConfirm}>
            {okText}
          </Button>
        </div>
      </div>

      <style>{`
        .confirm-modal-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          padding-top: var(--space-2);
        }

        .confirm-modal-message {
          font-size: var(--text-body);
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }

        .confirm-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        @media (max-width: 480px) {
          .confirm-modal-actions {
            flex-direction: column-reverse;
          }
          .confirm-modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
};

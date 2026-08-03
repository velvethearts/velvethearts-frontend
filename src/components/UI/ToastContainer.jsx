import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatCircleText, X } from '@phosphor-icons/react';

export const ToastContainer = () => {
  const { toastNotifications, removeToast, setActiveTab, setDeepLinkConversationId } = useApp();

  if (!toastNotifications || toastNotifications.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toastNotifications.map((toast) => (
        <div 
          key={toast.id} 
          className="toast-card page-enter"
          onClick={() => {
            if (toast.partnerId) {
              setDeepLinkConversationId(toast.partnerId);
            }
            setActiveTab('chat');
            removeToast(toast.id);
          }}
        >
          <div className="toast-avatar-wrap">
            {toast.photo ? (
              <img src={toast.photo} alt={toast.title} className="toast-avatar" />
            ) : (
              <div className="toast-icon-placeholder">
                <ChatCircleText size={22} weight="fill" />
              </div>
            )}
          </div>

          <div className="toast-content">
            <h4 className="toast-title font-ui">{toast.title}</h4>
            <p className="toast-body font-body">{toast.message}</p>
          </div>

          <button 
            className="toast-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          top: var(--space-4);
          right: var(--space-4);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          max-width: 380px;
          width: calc(100vw - var(--space-8));
          pointer-events: none;
        }

        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          transition: transform var(--duration-fast), box-shadow var(--duration-fast);
          backdrop-filter: blur(12px);
        }

        .toast-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
        }

        .toast-avatar-wrap {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .toast-icon-placeholder {
          color: var(--text-accent);
        }

        .toast-content {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toast-body {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin: 2px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toast-close-btn {
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color var(--duration-fast);
        }

        .toast-close-btn:hover {
          color: var(--text-primary);
        }

        @media (max-width: 767px) {
          .toast-container {
            top: var(--space-3);
            left: var(--space-4);
            right: var(--space-4);
            width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

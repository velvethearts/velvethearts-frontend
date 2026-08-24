import React, { useState, useEffect } from 'react';
import {
  EnvelopeSimple,
  EnvelopeOpen,
  LockKey,
  Quotes,
  Heart,
  X,
  Clock,
  PencilSimple,
  CalendarBlank,
  PaperPlaneTilt
} from '@phosphor-icons/react';

export const RewindLetterVaultModal = ({
  isOpen,
  onClose,
  partner,
  letterStatus,
  deliveredLetter,
  onOpenCompose,
  onOpenReschedule
}) => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  // Default to 'sent' if no received letter exists but sent letter does
  useEffect(() => {
    if (isOpen) {
      if (!deliveredLetter && letterStatus?.receivedLetter?.status !== 'SEALED' && letterStatus?.myLetter) {
        setActiveTab('sent');
      } else {
        setActiveTab('received');
      }
    }
  }, [isOpen, deliveredLetter, letterStatus]);

  // Handle ESC key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const partnerName = partner?.name || 'Your Match';
  const partnerPhoto = partner?.photo || partner?.photos?.[0]?.url;
  const matchDate = partner?.createdAt
    ? new Date(partner.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const myLetter = letterStatus?.myLetter;
  const receivedLetter = deliveredLetter || (letterStatus?.receivedLetter?.status === 'SEALED' ? letterStatus.receivedLetter : null);

  const formatDeliveredDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWrittenDate = (dateStr) => {
    if (!dateStr) return 'on connection';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="rewind-vault-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rewind-vault-card">
        {/* Modal Header */}
        <div className="rewind-vault-header">
          <div className="rewind-vault-header-title-box">
            <div className="rewind-vault-icon">
              <EnvelopeOpen size={22} weight="duotone" />
            </div>
            <div>
              <h3 id="vault-modal-title" className="rewind-vault-title font-display">
                Rewind Letters Vault
              </h3>
              <p className="rewind-vault-subtitle font-ui">
                Private time capsules preserved between you and {partnerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rewind-vault-close-btn"
            onClick={onClose}
            aria-label="Close Rewind Letters Vault"
          >
            <X size={18} />
          </button>
        </div>

        {/* Partner Connection Bar */}
        <div className="rewind-vault-partner-bar">
          <img
            src={partnerPhoto || '/assets/default-avatar.png'}
            alt={partnerName}
            className="rewind-vault-partner-img"
          />
          <div className="rewind-vault-partner-info">
            <span className="rewind-vault-partner-name font-ui">{partnerName}</span>
            <span className="rewind-vault-partner-meta font-body">
              <CalendarBlank size={13} weight="fill" />
              <span>Matched on {matchDate}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="rewind-vault-tabs font-ui" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'received'}
            className={`rewind-vault-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <span>From {partnerName}</span>
            {deliveredLetter ? (
              <span className="rewind-vault-tab-pill delivered">Delivered</span>
            ) : letterStatus?.receivedLetter?.status === 'SEALED' ? (
              <span className="rewind-vault-tab-pill sealed">Sealed 🔒</span>
            ) : null}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sent'}
            className={`rewind-vault-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <span>Sent by You</span>
            {myLetter?.status === 'DELIVERED' ? (
              <span className="rewind-vault-tab-pill delivered">Delivered</span>
            ) : myLetter?.status === 'SEALED' ? (
              <span className="rewind-vault-tab-pill sealed">Sealed 🔒</span>
            ) : null}
          </button>
        </div>

        {/* Tab Body */}
        <div className="rewind-vault-body">
          {/* RECEIVED TAB */}
          {activeTab === 'received' && (
            <div className="rewind-vault-content-section animate-fade">
              {deliveredLetter ? (
                <div className="rewind-vault-letter-card">
                  <div className="rewind-vault-letter-meta-row font-ui">
                    <div>
                      <span className="rewind-vault-letter-author font-display">From {partnerName}</span>
                      <span className="rewind-vault-letter-date font-body">
                        Written {formatWrittenDate(deliveredLetter.createdAt)} • Delivered {formatDeliveredDate(deliveredLetter.deliveredAt)}
                      </span>
                    </div>
                    <div className="rewind-vault-wax-seal" title="Authentic Velvet Hearts Seal">
                      <Heart size={16} weight="fill" />
                    </div>
                  </div>

                  <div className="rewind-vault-quote-body">
                    <Quotes size={24} weight="fill" className="rewind-vault-quote-icon" />
                    <p className="rewind-vault-letter-text font-body">
                      {deliveredLetter.content}
                    </p>
                  </div>

                  <div className="rewind-vault-letter-footer font-ui">
                    <span>A private memory preserved from when you first connected.</span>
                  </div>
                </div>
              ) : letterStatus?.receivedLetter?.status === 'SEALED' ? (
                <div className="rewind-vault-sealed-card">
                  <div className="rewind-vault-sealed-icon-box">
                    <LockKey size={32} weight="duotone" />
                  </div>
                  <h4 className="rewind-vault-sealed-title font-display">
                    {partnerName} Sealed a Rewind Letter
                  </h4>
                  <p className="rewind-vault-sealed-desc font-body">
                    This time-capsule letter was written when you first connected. It is safely encrypted in the Velvet Hearts vault and will automatically unlock after the scheduled timeframe or 50 messages.
                  </p>
                  <div className="rewind-vault-sealed-hint font-ui">
                    🔒 Keep chatting to unlock this letter sooner!
                  </div>
                </div>
              ) : (
                <div className="rewind-vault-empty-state font-ui">
                  <EnvelopeSimple size={36} weight="duotone" className="rewind-vault-empty-icon" />
                  <p className="rewind-vault-empty-text font-body">
                    {partnerName} has not written a Rewind Letter yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SENT TAB */}
          {activeTab === 'sent' && (
            <div className="rewind-vault-content-section animate-fade">
              {myLetter ? (
                <div className="rewind-vault-letter-card">
                  <div className="rewind-vault-letter-meta-row font-ui">
                    <div>
                      <span className="rewind-vault-letter-author font-display">Your Note for {partnerName}</span>
                      <span className="rewind-vault-letter-date font-body">
                        {myLetter.status === 'DELIVERED'
                          ? `Delivered on ${formatDeliveredDate(myLetter.deliveredAt)}`
                          : `Sealed on ${formatWrittenDate(myLetter.createdAt)}`}
                      </span>
                    </div>
                    <span className={`rewind-vault-status-pill ${myLetter.status === 'DELIVERED' ? 'delivered' : 'sealed'} font-ui`}>
                      {myLetter.status === 'DELIVERED' ? 'Delivered' : 'Sealed 🔒'}
                    </span>
                  </div>

                  <div className="rewind-vault-quote-body">
                    <Quotes size={24} weight="fill" className="rewind-vault-quote-icon" />
                    <p className="rewind-vault-letter-text font-body">
                      {myLetter.content || 'Your private sealed letter is safely stored.'}
                    </p>
                  </div>

                  {myLetter.status === 'SEALED' && (
                    <div className="rewind-vault-reschedule-banner">
                      <div className="rewind-vault-reschedule-info">
                        <Clock size={16} weight="duotone" />
                        <span className="font-ui">
                          Unlocks on {formatDeliveredDate(myLetter.deliverAfter)} (or 50 messages)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="rewind-vault-reschedule-btn font-ui"
                        onClick={() => {
                          onClose();
                          if (onOpenReschedule) onOpenReschedule();
                        }}
                      >
                        <PencilSimple size={14} weight="bold" />
                        <span>Adjust Days</span>
                      </button>
                    </div>
                  )}

                  <div className="rewind-vault-letter-footer font-ui">
                    <span>
                      {myLetter.status === 'DELIVERED'
                        ? `Delivered to ${partnerName}'s chat and vault.`
                        : `Safely locked until delivery criteria are met.`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rewind-vault-empty-state font-ui">
                  <PaperPlaneTilt size={36} weight="duotone" className="rewind-vault-empty-icon" />
                  <p className="rewind-vault-empty-text font-body">
                    You haven't written a Rewind Letter for {partnerName} yet. Capture your first impressions in a private time capsule!
                  </p>
                  <button
                    type="button"
                    className="rewind-vault-cta-btn font-ui"
                    onClick={() => {
                      onClose();
                      if (onOpenCompose) onOpenCompose();
                    }}
                  >
                    <EnvelopeSimple size={18} weight="bold" />
                    <span>Write Rewind Letter</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

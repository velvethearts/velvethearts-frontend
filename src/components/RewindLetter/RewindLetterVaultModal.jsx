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
  PaperPlaneTilt,
  Trash,
  Plus
} from '@phosphor-icons/react';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export const RewindLetterVaultModal = ({
  isOpen,
  onClose,
  partner,
  letterStatus,
  deliveredLetter,
  onOpenCompose,
  onOpenEdit,
  onOpenReschedule,
  onDeleteLetter,
}) => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'

  // Extract arrays from letterStatus or fallbacks
  const myLetter = letterStatus?.myLetter;
  const receivedLetter = deliveredLetter || (letterStatus?.receivedLetter?.status === 'SEALED' ? letterStatus.receivedLetter : null);

  const sentLetters = Array.isArray(letterStatus?.sentLetters) && letterStatus.sentLetters.length > 0
    ? letterStatus.sentLetters
    : (myLetter ? [myLetter] : []);

  const receivedLetters = Array.isArray(letterStatus?.receivedLetters) && letterStatus.receivedLetters.length > 0
    ? letterStatus.receivedLetters
    : (deliveredLetter
        ? [{ ...deliveredLetter, status: 'DELIVERED' }]
        : (receivedLetter ? [receivedLetter] : []));

  const hasSealedSentLetter = sentLetters.some(l => l.status === 'SEALED');

  // Default to 'sent' if no received letter exists but sent letter does
  useEffect(() => {
    if (isOpen) {
      if (receivedLetters.length === 0 && sentLetters.length > 0) {
        setActiveTab('sent');
      } else {
        setActiveTab('received');
      }
    }
  }, [isOpen]);

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
            <span className="rewind-vault-tab-count">
              {receivedLetters.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sent'}
            className={`rewind-vault-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <span>Sent by You</span>
            <span className="rewind-vault-tab-count">
              {sentLetters.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="rewind-vault-body">
          {/* RECEIVED TAB */}
          {activeTab === 'received' && (
            <div className="rewind-vault-content-section animate-fade">
              {receivedLetters.length > 0 ? (
                <div className="rewind-vault-letters-list">
                  {receivedLetters.map((letter) => (
                    <div key={letter.id} className="rewind-vault-letter-item">
                      {letter.status === 'DELIVERED' && letter.content ? (
                        <div className="rewind-vault-letter-card">
                          <div className="rewind-vault-letter-meta-row font-ui">
                            <div>
                              <span className="rewind-vault-letter-author font-display">From {partnerName}</span>
                              <span className="rewind-vault-letter-date font-body">
                                Delivered on {formatDeliveredDate(letter.deliveredAt)}
                              </span>
                            </div>
                            <div className="rewind-vault-wax-seal" title="Authentic Velvet Hearts Seal">
                              <Heart size={16} weight="fill" />
                            </div>
                          </div>

                          <div className="rewind-vault-quote-body">
                            <Quotes size={24} weight="fill" className="rewind-vault-quote-icon" />
                            <p className="rewind-vault-letter-text font-body">
                              {letter.content}
                            </p>

                            {/* Aesthetic Letter Signature */}
                            <div className="rewind-letter-signature">
                              <div className="rewind-signature-divider" />
                              <div className="rewind-signature-content">
                                <span className="rewind-signature-date font-ui">
                                  Written on {formatWrittenDate(letter.createdAt)}
                                </span>
                                <span className="rewind-signature-author font-display">
                                  Sent with care, {partnerName} <span className="rewind-signature-heart">❤️</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="rewind-vault-letter-footer font-ui" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>A private memory preserved from when you first connected.</span>
                            <button
                              type="button"
                              className="rewind-vault-delete-btn font-ui"
                              title="Delete Letter from Vault"
                              onClick={() => {
                                if (onDeleteLetter) onDeleteLetter(letter.id);
                              }}
                            >
                              <Trash size={14} weight="bold" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rewind-vault-sealed-card">
                          <div className="rewind-vault-sealed-icon-box">
                            <LockKey size={32} weight="duotone" />
                          </div>
                          <h4 className="rewind-vault-sealed-title font-display">
                            {partnerName} Sealed a Rewind Letter
                          </h4>
                          <p className="rewind-vault-sealed-desc font-body">
                            This time-capsule letter was written by {partnerName}. It is safely encrypted in the Velvet Hearts vault and will automatically unlock on its scheduled delivery date.
                          </p>
                          <div className="rewind-vault-sealed-hint font-ui">
                            🔒 Scheduled to unlock: {formatDeliveredDate(letter.deliverAfter)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
              {/* If no sealed letter is pending, show button to write a new one */}
              {!hasSealedSentLetter && (
                <div className="rewind-vault-write-bar">
                  <button
                    type="button"
                    className="rewind-vault-write-action-btn font-ui"
                    onClick={() => {
                      onClose();
                      if (onOpenCompose) onOpenCompose();
                    }}
                  >
                    <Plus size={16} weight="bold" />
                    <span>Write Another Rewind Letter</span>
                  </button>
                </div>
              )}

              {sentLetters.length > 0 ? (
                <div className="rewind-vault-letters-list">
                  {sentLetters.map((letter) => {
                    const isLetterEditable = letter.status === 'SEALED' && letter.createdAt
                      ? (Date.now() - new Date(letter.createdAt).getTime()) <= FORTY_EIGHT_HOURS_MS
                      : false;

                    return (
                      <div key={letter.id} className="rewind-vault-letter-item">
                        <div className="rewind-vault-letter-card">
                          <div className="rewind-vault-letter-meta-row font-ui">
                            <div>
                              <span className="rewind-vault-letter-author font-display">Your Note for {partnerName}</span>
                              <span className="rewind-vault-letter-date font-body">
                                {letter.status === 'DELIVERED'
                                  ? `Delivered on ${formatDeliveredDate(letter.deliveredAt)}`
                                  : `Sealed on ${formatWrittenDate(letter.createdAt)}`}
                              </span>
                            </div>
                            <span className={`rewind-vault-status-pill ${letter.status === 'DELIVERED' ? 'delivered' : 'sealed'} font-ui`}>
                              {letter.status === 'DELIVERED' ? 'Delivered' : 'Sealed 🔒'}
                            </span>
                          </div>

                          <div className="rewind-vault-quote-body">
                            <Quotes size={24} weight="fill" className="rewind-vault-quote-icon" />
                            <p className="rewind-vault-letter-text font-body">
                              {letter.content || 'Your private sealed letter is safely stored.'}
                            </p>

                            {/* Aesthetic Letter Signature */}
                            <div className="rewind-letter-signature">
                              <div className="rewind-signature-divider" />
                              <div className="rewind-signature-content">
                                <span className="rewind-signature-date font-ui">
                                  Written on {formatWrittenDate(letter.createdAt)}
                                </span>
                                <span className="rewind-signature-author font-display">
                                  Sent with care, You <span className="rewind-signature-heart">❤️</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {letter.status === 'SEALED' && (
                            <div className="rewind-vault-reschedule-banner">
                              <div className="rewind-vault-reschedule-info">
                                <Clock size={16} weight="duotone" />
                                <span className="font-ui">
                                  Unlocks on {formatDeliveredDate(letter.deliverAfter)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isLetterEditable ? (
                                  <button
                                    type="button"
                                    className="rewind-vault-reschedule-btn font-ui"
                                    onClick={() => {
                                      onClose();
                                      if (onOpenEdit) onOpenEdit(letter);
                                    }}
                                  >
                                    <PencilSimple size={14} weight="bold" />
                                    <span>Edit Note</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="rewind-vault-reschedule-btn font-ui"
                                    onClick={() => {
                                      onClose();
                                      if (onOpenReschedule) onOpenReschedule(letter);
                                    }}
                                  >
                                    <Clock size={14} weight="bold" />
                                    <span>Adjust Days</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="rewind-vault-delete-btn font-ui"
                                  title="Delete / Unsend Letter"
                                  onClick={() => {
                                    if (onDeleteLetter) onDeleteLetter(letter.id);
                                  }}
                                >
                                  <Trash size={14} weight="bold" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="rewind-vault-letter-footer font-ui" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                              {letter.status === 'DELIVERED'
                                ? `Delivered to ${partnerName}'s chat and vault.`
                                : isLetterEditable
                                ? `48-hour edit window active. You can edit or delete this letter.`
                                : `Content locked in vault. Delivery timeframe can still be adjusted.`}
                            </span>
                            {letter.status === 'DELIVERED' && (
                              <button
                                type="button"
                                className="rewind-vault-delete-btn font-ui"
                                title="Delete Letter"
                                onClick={() => {
                                  if (onDeleteLetter) onDeleteLetter(letter.id);
                                }}
                              >
                                <Trash size={14} weight="bold" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rewind-vault-empty-state font-ui">
                  <PaperPlaneTilt size={36} weight="duotone" className="rewind-vault-empty-icon" />
                  <p className="rewind-vault-empty-text font-body">
                    You haven't written a Rewind Letter for {partnerName} yet. Capture your impressions in a private time capsule!
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

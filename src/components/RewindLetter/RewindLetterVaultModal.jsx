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
  Plus,
  CaretLeft,
  CaretRight,
  BookOpen,
  ArrowRight
} from '@phosphor-icons/react';
import { RewindLetterReaderModal } from './RewindLetterReaderModal';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const LETTERS_PER_PAGE = 2;

const getLetterSnippet = (text, maxWords = 14) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

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
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [readingLetter, setReadingLetter] = useState(null);
  const [isReadingSentByMe, setIsReadingSentByMe] = useState(false);

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

  // Pagination calculations (2 letters per page)
  const totalReceivedPages = Math.ceil(receivedLetters.length / LETTERS_PER_PAGE) || 1;
  const paginatedReceivedLetters = receivedLetters.slice(
    (receivedPage - 1) * LETTERS_PER_PAGE,
    receivedPage * LETTERS_PER_PAGE
  );

  const totalSentPages = Math.ceil(sentLetters.length / LETTERS_PER_PAGE) || 1;
  const paginatedSentLetters = sentLetters.slice(
    (sentPage - 1) * LETTERS_PER_PAGE,
    sentPage * LETTERS_PER_PAGE
  );

  // Default to 'sent' if no received letter exists but sent letter does
  useEffect(() => {
    if (isOpen) {
      setReceivedPage(1);
      setSentPage(1);
      setReadingLetter(null);
      if (receivedLetters.length === 0 && sentLetters.length > 0) {
        setActiveTab('sent');
      } else {
        setActiveTab('received');
      }
    }
  }, [isOpen]);

  // Adjust current page if items are deleted
  useEffect(() => {
    if (receivedPage > totalReceivedPages) {
      setReceivedPage(Math.max(1, totalReceivedPages));
    }
  }, [receivedLetters.length, totalReceivedPages, receivedPage]);

  useEffect(() => {
    if (sentPage > totalSentPages) {
      setSentPage(Math.max(1, totalSentPages));
    }
  }, [sentLetters.length, totalSentPages, sentPage]);

  // Handle ESC key dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !readingLetter) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, readingLetter, onClose]);

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

  const handleOpenReader = (letter, isSent) => {
    setIsReadingSentByMe(isSent);
    setReadingLetter(letter);
  };

  return (
    <>
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
                  <>
                    <div className="rewind-vault-letters-list">
                      {paginatedReceivedLetters.map((letter) => (
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

                              <div
                                className="rewind-vault-quote-body clickable"
                                onClick={() => handleOpenReader(letter, false)}
                                title="Click to read full letter"
                              >
                                <Quotes size={22} weight="fill" className="rewind-vault-quote-icon" />
                                <p className="rewind-vault-letter-text font-body">
                                  {getLetterSnippet(letter.content, 14)}
                                </p>

                                <div className="rewind-vault-read-action font-ui">
                                  <button
                                    type="button"
                                    className="rewind-vault-read-link font-ui"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReader(letter, false);
                                    }}
                                  >
                                    <BookOpen size={14} weight="bold" />
                                    <span>Read Full Letter</span>
                                    <ArrowRight size={13} weight="bold" />
                                  </button>
                                </div>
                              </div>

                              <div className="rewind-vault-letter-footer font-ui" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>A private memory preserved from when you first connected.</span>
                                <button
                                  type="button"
                                  className="rewind-vault-delete-icon-btn font-ui"
                                  title="Delete Letter from Vault"
                                  aria-label="Delete Letter"
                                  onClick={() => {
                                    if (onDeleteLetter) onDeleteLetter(letter.id);
                                  }}
                                >
                                  <Trash size={16} weight="bold" />
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

                    {/* Pagination Controls */}
                    {totalReceivedPages > 1 && (
                      <div className="rewind-vault-pagination font-ui">
                        <button
                          type="button"
                          className="rewind-vault-page-btn"
                          disabled={receivedPage === 1}
                          onClick={() => setReceivedPage(p => Math.max(1, p - 1))}
                          aria-label="Previous Page"
                        >
                          <CaretLeft size={14} weight="bold" />
                          <span>Previous</span>
                        </button>

                        <span className="rewind-vault-page-indicator">
                          Page {receivedPage} of {totalReceivedPages}
                        </span>

                        <button
                          type="button"
                          className="rewind-vault-page-btn"
                          disabled={receivedPage === totalReceivedPages}
                          onClick={() => setReceivedPage(p => Math.min(totalReceivedPages, p + 1))}
                          aria-label="Next Page"
                        >
                          <span>Next</span>
                          <CaretRight size={14} weight="bold" />
                        </button>
                      </div>
                    )}
                  </>
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
                  <>
                    <div className="rewind-vault-letters-list">
                      {paginatedSentLetters.map((letter) => {
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

                              <div
                                className="rewind-vault-quote-body clickable"
                                onClick={() => handleOpenReader(letter, true)}
                                title="Click to read full letter"
                              >
                                <Quotes size={22} weight="fill" className="rewind-vault-quote-icon" />
                                <p className="rewind-vault-letter-text font-body">
                                  {getLetterSnippet(letter.content, 14)}
                                </p>

                                <div className="rewind-vault-read-action font-ui">
                                  <button
                                    type="button"
                                    className="rewind-vault-read-link font-ui"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenReader(letter, true);
                                    }}
                                  >
                                    <BookOpen size={14} weight="bold" />
                                    <span>Read Full Letter</span>
                                    <ArrowRight size={13} weight="bold" />
                                  </button>
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
                                  <div className="rewind-vault-reschedule-actions">
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
                                      className="rewind-vault-delete-icon-btn font-ui"
                                      title="Delete / Unsend Letter"
                                      aria-label="Delete Letter"
                                      onClick={() => {
                                        if (onDeleteLetter) onDeleteLetter(letter.id);
                                      }}
                                    >
                                      <Trash size={16} weight="bold" />
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
                                    className="rewind-vault-delete-icon-btn font-ui"
                                    title="Delete Letter"
                                    aria-label="Delete Letter"
                                    onClick={() => {
                                      if (onDeleteLetter) onDeleteLetter(letter.id);
                                    }}
                                  >
                                    <Trash size={16} weight="bold" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalSentPages > 1 && (
                      <div className="rewind-vault-pagination font-ui">
                        <button
                          type="button"
                          className="rewind-vault-page-btn"
                          disabled={sentPage === 1}
                          onClick={() => setSentPage(p => Math.max(1, p - 1))}
                          aria-label="Previous Page"
                        >
                          <CaretLeft size={14} weight="bold" />
                          <span>Previous</span>
                        </button>

                        <span className="rewind-vault-page-indicator">
                          Page {sentPage} of {totalSentPages}
                        </span>

                        <button
                          type="button"
                          className="rewind-vault-page-btn"
                          disabled={sentPage === totalSentPages}
                          onClick={() => setSentPage(p => Math.min(totalSentPages, p + 1))}
                          aria-label="Next Page"
                        >
                          <span>Next</span>
                          <CaretRight size={14} weight="bold" />
                        </button>
                      </div>
                    )}
                  </>
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

      {/* Aesthetic Full Letter Reader Modal */}
      {readingLetter && (
        <RewindLetterReaderModal
          isOpen={!!readingLetter}
          letter={readingLetter}
          isSentByMe={isReadingSentByMe}
          partnerName={partnerName}
          onClose={() => setReadingLetter(null)}
          onDeleteLetter={onDeleteLetter}
        />
      )}
    </>
  );
};


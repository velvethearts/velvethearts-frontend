import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { 
  Heart, 
  Star, 
  Warning, 
  ShieldCheck, 
  Ghost, 
  Coffee, 
  MapPin, 
  Wrench, 
  ChatCircleText,
  PauseCircle,
  Check
} from '@phosphor-icons/react';

export const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  onPauseProfile,
  isPaused = false,
  isDeleting = false
}) => {
  const [reason, setReason] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [step, setStep] = useState(1); // 1: Honest Survey, 2: Final Confirmation

  if (!isOpen) return null;

  // Emotional, human reasons for leaving
  const reasonsList = [
    { 
      id: 'found_love', 
      label: 'I found someone special', 
      icon: Heart, 
      desc: 'Met a partner on or off the app',
      chips: [
        'Met on Velvet Hearts! 🎉',
        'Met on another app',
        'Met offline / through friends',
        'Decided to become exclusive'
      ]
    },
    { 
      id: 'conversations_fizzle', 
      label: 'Tired of ghosting & dead chats', 
      icon: Ghost, 
      desc: 'Conversations fizzle out or people stop replying',
      chips: [
        'People stop replying after a few texts',
        'Small talk gets repetitive & boring',
        'Hard to break the ice / awkward starters',
        'Matches rarely take the initiative to meet'
      ]
    },
    { 
      id: 'dating_fatigue', 
      label: 'Dating apps feel exhausting', 
      icon: Coffee, 
      desc: 'Burnt out from swiping, taking a mental break',
      chips: [
        'Need a digital detox / mental break',
        'Too busy with work, study, or life',
        'Prefer to meet naturally in person',
        'Not looking for romance right now'
      ]
    },
    { 
      id: 'not_enough_matches', 
      label: 'Not enough matches in my area', 
      icon: MapPin, 
      desc: 'Ran out of profiles or few people near me',
      chips: [
        'Few active users in my city',
        'People didn\'t match my vibe or intent',
        'Age or interest filters were too narrow',
        'Sent sparks but got few responses'
      ]
    },
    { 
      id: 'privacy_safety', 
      label: 'Privacy or trust concerns', 
      icon: ShieldCheck, 
      desc: 'Worried about photo safety or uncomfortable experiences',
      chips: [
        'Concerned about photo privacy & screenshots',
        'Encountered suspicious or inactive profiles',
        'Had an uncomfortable interaction',
        'Prefer not to have a public profile'
      ]
    },
    { 
      id: 'app_glitches', 
      label: 'App felt buggy or confusing', 
      icon: Wrench, 
      desc: 'Experienced technical issues or difficult navigation',
      chips: [
        'Voice recording didn\'t work smoothly',
        'Chat was slow or notifications failed',
        'Onboarding or editing profile felt tedious',
        'Navigation was confusing'
      ]
    },
    { 
      id: 'other', 
      label: 'Something else', 
      icon: ChatCircleText, 
      desc: 'A personal reason not listed above',
      chips: [
        'Just trying it out for a few days',
        'Cleaning up unused accounts',
        'Prefer not to say'
      ]
    }
  ];

  const currentCategory = reasonsList.find(r => r.label === reason);

  const handleReasonClick = (categoryLabel) => {
    setReason(categoryLabel);
    setSelectedChips([]); // Reset chips when changing primary category
  };

  const handleChipToggle = (chip) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip) 
        : [...prev, chip]
    );
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!reason) return;
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    const metOnApp = selectedChips.includes('Met on Velvet Hearts! 🎉')
      ? true
      : selectedChips.some(c => c.includes('another app') || c.includes('offline'))
      ? false
      : null;

    const feedbackPayload = {
      reason,
      detailedReason: selectedChips.join(' | ') || null,
      metPartnerOnApp: metOnApp,
      rating: rating > 0 ? rating : null,
      feedbackText: feedbackText.trim() || null
    };

    await onConfirmDelete(feedbackPayload);
  };

  const resetAndClose = () => {
    setStep(1);
    setReason('');
    setSelectedChips([]);
    setRating(0);
    setFeedbackText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={step === 1 ? 'We’re Sad to See You Go 💔' : 'Confirm Account Deletion'}
      size="md"
    >
      <div className="delete-account-flow font-ui">
        {step === 1 && (
          <form onSubmit={handleProceedToConfirm} className="delete-feedback-form">
            {/* 100% Anonymous Trust Guarantee */}
            <div className="anonymous-trust-banner">
              <ShieldCheck size={20} weight="fill" className="trust-icon" />
              <div className="trust-text">
                <span className="trust-title">100% Anonymous & Confidential</span>
                <span className="trust-sub">Your answers are completely detached from your personal identity and help us make dating more genuine for everyone.</span>
              </div>
            </div>

            {/* Optional Pause Profile Alternative */}
            <div className={`pause-alternative-card ${isPaused ? 'is-paused-state' : ''}`}>
              <div className="pause-icon-wrap">
                <PauseCircle size={24} weight="duotone" className="pause-icon" />
              </div>
              <div className="pause-content">
                <span className="pause-title">
                  {isPaused ? 'Your profile is currently paused ⏸️' : 'Need a quick break instead?'}
                </span>
                <span className="pause-sub">
                  {isPaused 
                    ? 'You are already taking a break and hidden from Discover. Ready to resume?' 
                    : 'You can pause your profile to hide from Discover while keeping your existing chats safe.'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (onPauseProfile) onPauseProfile();
                  resetAndClose();
                }}
                className={`pause-action-btn font-ui ${isPaused ? 'unpause' : ''}`}
              >
                {isPaused ? 'Unpause Profile' : 'Pause Profile Instead'}
              </button>
            </div>

            {/* Primary Emotion-Driven Reasons */}
            <div className="delete-form-group">
              <label className="delete-group-label font-ui">
                What best describes why you're leaving? <span className="req-star">*</span>
              </label>
              <div className="delete-reasons-grid">
                {reasonsList.map(r => {
                  const Icon = r.icon;
                  const isSelected = reason === r.label;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleReasonClick(r.label)}
                      className={`delete-reason-pill ${isSelected ? 'active' : ''}`}
                    >
                      <div className="reason-pill-header">
                        <Icon size={18} weight={isSelected ? 'fill' : 'regular'} className="reason-icon" />
                        <span className="reason-label">{r.label}</span>
                      </div>
                      <span className="reason-desc">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic 1-Tap Micro-Chips */}
            {currentCategory && currentCategory.chips?.length > 0 && (
              <div className="delete-microchips-section page-enter">
                <label className="delete-group-label font-ui">
                  Tap anything that applies <span className="optional-tag">(1-Tap Selection)</span>
                </label>
                <div className="microchips-cloud">
                  {currentCategory.chips.map(chip => {
                    const isChipSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipToggle(chip)}
                        className={`microchip-btn font-ui ${isChipSelected ? 'selected' : ''}`}
                      >
                        {isChipSelected && <Check size={14} weight="bold" className="chip-check" />}
                        <span>{chip}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1-5 Star Experience Rating */}
            <div className="delete-form-group">
              <label className="delete-group-label font-ui">
                Overall experience with Velvet Hearts:
              </label>
              <div className="delete-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="delete-star-btn"
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={28}
                      weight={star <= rating ? 'fill' : 'regular'}
                      color={star <= rating ? '#E4C88E' : 'var(--charcoal-400)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Suggestions */}
            <div className="delete-form-group">
              <label className="delete-group-label font-ui" htmlFor="delete-feedback-text">
                Any specific thoughts or advice for our team? <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="delete-feedback-text"
                rows={2}
                placeholder="Be completely honest — we take your feedback seriously..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="delete-textarea font-ui"
                maxLength={400}
              />
            </div>

            <div className="delete-modal-actions">
              <Button type="button" variant="ghost" onClick={resetAndClose}>
                Keep My Account
              </Button>
              <Button type="submit" variant="danger" disabled={!reason}>
                Continue to Delete →
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="delete-confirmation-step page-enter">
            <div className="delete-warning-banner">
              <Warning size={32} weight="fill" color="var(--error)" />
              <div className="warning-content">
                <h4 className="warning-title font-ui">Irreversible Action</h4>
                <p className="warning-desc font-body">
                  Deleting your profile will permanently erase your photos, active chats, match histories, and vibe scores. You will not be able to recover this account.
                </p>
              </div>
            </div>

            <div className="delete-modal-actions confirm-actions">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isDeleting}>
                ← Back to Feedback
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleFinalSubmit}
                loading={isDeleting}
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .delete-account-flow {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .anonymous-trust-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          background-color: rgba(67, 160, 71, 0.08);
          border: 1px solid rgba(67, 160, 71, 0.25);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .trust-icon {
          color: #43A047;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .trust-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-bottom: 2px;
        }

        .trust-sub {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          display: block;
        }

        .pause-alternative-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .pause-icon {
          color: var(--burgundy-500);
        }

        .pause-content {
          flex: 1;
        }

        .pause-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
        }

        .pause-sub {
          font-size: 11px;
          color: var(--text-muted);
          display: block;
          line-height: 1.3;
        }

        .pause-action-btn {
          background-color: transparent;
          border: 1.5px solid var(--burgundy-400);
          color: var(--burgundy-500);
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--duration-fast);
        }

        .pause-action-btn:hover {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .delete-form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .delete-group-label {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .optional-tag {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-muted);
        }

        .req-star {
          color: var(--error);
        }

        .delete-reasons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-2);
        }

        .delete-reason-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: var(--space-3);
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-default);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .delete-reason-pill:hover {
          border-color: var(--burgundy-400);
          background-color: var(--bg-accent-subtle);
        }

        .delete-reason-pill.active {
          border-color: var(--burgundy-500);
          background-color: var(--bg-accent-subtle);
          box-shadow: 0 0 0 2px var(--burgundy-200);
        }

        .reason-pill-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .reason-icon {
          color: var(--burgundy-500);
        }

        .reason-label {
          font-size: var(--text-body-sm);
          font-weight: 600;
        }

        .reason-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .delete-microchips-section {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .microchips-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .microchip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-default);
          color: var(--text-primary);
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .microchip-btn:hover {
          border-color: var(--burgundy-400);
          background-color: var(--bg-accent-subtle);
        }

        .microchip-btn.selected {
          border-color: var(--burgundy-500);
          background-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .chip-check {
          color: #FFFFFF;
        }

        .delete-stars-row {
          display: flex;
          gap: var(--space-2);
        }

        .delete-star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform var(--duration-fast);
        }

        .delete-star-btn:hover {
          transform: scale(1.15);
        }

        .delete-textarea {
          width: 100%;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          background-color: var(--bg-input);
          color: var(--text-primary);
          outline: none;
          resize: vertical;
          font-size: var(--text-body-sm);
        }

        .delete-textarea:focus {
          border-color: var(--border-focus);
          background-color: var(--bg-surface);
        }

        .delete-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-subtle);
        }

        .delete-warning-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          background-color: var(--error-light);
          border: 1px solid rgba(196, 90, 90, 0.4);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          margin-bottom: var(--space-4);
        }

        .warning-title {
          font-size: var(--text-body);
          font-weight: 700;
          color: var(--error);
          margin-bottom: 4px;
        }

        .warning-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }
      `}</style>
    </Modal>
  );
};

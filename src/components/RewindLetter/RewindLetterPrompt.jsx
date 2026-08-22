import React from 'react';
import { EnvelopeSimple, X } from '@phosphor-icons/react';

export const RewindLetterPrompt = ({ onCompose, onDismiss, partnerName }) => {
  return (
    <div className="rewind-letter-prompt" role="region" aria-label="Rewind Letter Prompt">
      <div className="rewind-prompt-icon-wrapper">
        <EnvelopeSimple size={22} weight="duotone" className="rewind-prompt-icon" />
      </div>
      <div className="rewind-prompt-content">
        <div className="rewind-prompt-title">
          Write a Rewind Letter for {partnerName || 'your match'}
        </div>
        <div className="rewind-prompt-desc">
          Capture your first impressions in a private time capsule. It stays sealed and unlocks after 7 days or 50 messages.
        </div>
        <div className="rewind-prompt-actions">
          <button
            type="button"
            className="rewind-prompt-btn-write"
            onClick={onCompose}
          >
            Write a Letter
          </button>
          <button
            type="button"
            className="rewind-prompt-btn-dismiss"
            onClick={onDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>
      <button
        type="button"
        className="rewind-prompt-close"
        onClick={onDismiss}
        aria-label="Dismiss prompt"
      >
        <X size={16} />
      </button>
    </div>
  );
};

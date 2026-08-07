import React, { useState } from 'react';
import { PaperPlaneRight, X, Heart, ChatCircleText, Sparkle } from '@phosphor-icons/react';
import { Button } from './Button';
import { playHapticSound, triggerHaptic } from '../../utils/haptics';

export const PromptReactionModal = ({
  isOpen,
  onClose,
  profileName,
  targetType = 'photo', // 'photo' | 'story' | 'interest'
  targetContent = '',
  onSendReaction
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    triggerHaptic('medium');
    playHapticSound('spark');

    setTimeout(() => {
      onSendReaction({
        comment: comment.trim(),
        targetType,
        targetContent
      });
      setIsSubmitting(false);
      setComment('');
      onClose();
    }, 200);
  };

  const getTargetTitle = () => {
    switch (targetType) {
      case 'story':
        return `Reacting to ${profileName}'s Story`;
      case 'interest':
        return `Shared Interest: ${targetContent}`;
      case 'photo':
      default:
        return `Commenting on ${profileName}'s Photo`;
    }
  };

  return (
    <div className="prompt-reaction-overlay" role="dialog" aria-modal="true">
      <div className="prompt-reaction-card page-enter">
        <div className="prompt-reaction-header">
          <div className="reaction-header-left font-ui">
            <Sparkle size={18} color="var(--gold-400)" weight="fill" />
            <span className="reaction-header-title">{getTargetTitle()}</span>
          </div>
          <button 
            type="button" 
            className="reaction-close-btn" 
            onClick={onClose}
            aria-label="Close comment dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlighted context container */}
        <div className="reaction-context-box">
          {targetType === 'story' && (
            <p className="context-quote-text font-body italic">&ldquo;{targetContent}&rdquo;</p>
          )}
          {targetType === 'interest' && (
            <span className="context-interest-pill font-ui">✨ {targetContent}</span>
          )}
          {targetType === 'photo' && targetContent && (
            <div className="context-photo-preview">
              <img src={targetContent} alt="Target photo" />
            </div>
          )}
        </div>

        {/* Comment form */}
        <form onSubmit={handleSubmit} className="prompt-reaction-form font-ui">
          <label htmlFor="reaction-comment-input" className="reaction-input-label">
            Add a personal note with your interest (optional):
          </label>
          <textarea
            id="reaction-comment-input"
            className="reaction-textarea font-body"
            placeholder={`Say something nice to ${profileName}... (e.g. "I love this spot too!")`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={250}
            rows={3}
            autoFocus
          />

          <div className="reaction-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="reaction-cancel-btn font-ui"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="reaction-send-btn font-ui"
            >
              <Heart size={16} weight="fill" />
              <span>{comment.trim() ? 'Send Note & Interest' : 'Send Interest Only'}</span>
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        .prompt-reaction-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(26, 21, 23, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: var(--space-4);
        }

        .prompt-reaction-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .prompt-reaction-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reaction-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 600;
          font-size: var(--text-body-sm);
          color: var(--text-primary);
        }

        .reaction-close-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
        }

        .reaction-close-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-warm);
        }

        .reaction-context-box {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          max-height: 120px;
          overflow: hidden;
        }

        .context-quote-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        .context-interest-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--burgundy-50);
          color: var(--burgundy-600);
          border: 1px solid var(--burgundy-200);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
        }

        .context-photo-preview {
          width: 100%;
          height: 90px;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .context-photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reaction-input-label {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: var(--space-2);
          display: block;
        }

        .reaction-textarea {
          width: 100%;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          background-color: var(--bg-input);
          outline: none;
          color: var(--text-primary);
          resize: none;
          transition: all var(--duration-fast);
        }

        .reaction-textarea:focus {
          border-color: var(--burgundy-400);
          background-color: var(--bg-surface);
          box-shadow: 0 0 0 3px var(--burgundy-100);
        }

        .reaction-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }

        .reaction-cancel-btn {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
        }

        .reaction-send-btn {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
      `}</style>
    </div>
  );
};

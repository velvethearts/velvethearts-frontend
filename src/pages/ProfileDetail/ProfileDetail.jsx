import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Heart, ShieldWarning, Prohibit, X } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';

export const ProfileDetail = ({ profile, onBack }) => {
  const { interestsSent, sendInterest, reportUser, blockUser } = useApp();
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isInterestSent = interestsSent.includes(profile.id);

  const handleReportSubmit = (e) => {
    if (e) e.preventDefault();
    if (!reportReason) return;
    
    reportUser(profile.id, reportReason, reportComment);
    setReportSubmitted(true);
    
    setTimeout(() => {
      setShowReportSheet(false);
      setReportSubmitted(false);
      setReportReason('');
      setReportComment('');
      onBack(); // Go back since user is blocked/removed
    }, 2200);
  };

  const handleBlockOnly = () => {
    if (window.confirm(`Are you sure you want to remove ${profile.name}? you won't see them again.`)) {
      blockUser(profile.id);
      onBack();
    }
  };

  const reportReasons = [
    'Inappropriate messages',
    'Harassment or bullying',
    'Fake profile or scam',
    'Hate speech or discrimination',
    'Underage user',
    'Something else'
  ];

  return (
    <div className="profile-detail-page page-enter">
      {/* Aligned PageHeader */}
      <PageHeader
        title={profile.name}
        subtitle={`${profile.city} · ${profile.pronouns || ''}`}
        onBack={onBack}
        actions={
          <div className="detail-header-actions">
            <Button variant="ghost" onClick={handleBlockOnly}>
              Remove
            </Button>
            <Button variant="ghost" onClick={() => setShowReportSheet(true)} className="danger">
              Report
            </Button>
          </div>
        }
      />

      <div className="detail-content-container">
        {/* Asymmetric Profile Structure */}
        <div className="detail-image-panel">
          <img 
            src={profile.photo || profile.photos?.[0]} 
            alt={profile.name} 
            className="detail-hero-img" 
          />
          <div className="detail-img-badges">
            {profile.verified && (
              <span className="badge-verified font-ui">
                <CheckCircle size={12} weight="fill" />
                Verified
              </span>
            )}
            {profile.isPremium && (
              <span className="badge-premium font-ui">Premium</span>
            )}
          </div>
        </div>

        <div className="detail-info-panel font-ui">
          {/* Core Intentions */}
          <div className="detail-intent-card">
            <span className="detail-intent-label">Seeking</span>
            <p className="detail-intent-value font-display">{profile.relationshipIntent}</p>
            <p className="detail-intent-status font-body">Current Status: {profile.relationshipStatus}</p>
          </div>

          {/* Story biography */}
          <div className="detail-story-section">
            <h3 className="detail-section-title">Their Story</h3>
            <blockquote className="detail-story-quote font-body">
              "{profile.story}"
            </blockquote>
          </div>

          {/* Identity details */}
          <div className="detail-identity-section border-top">
            <h3 className="detail-section-title">Identity</h3>
            <div className="detail-identity-badges">
              <div className="identity-badge">
                <span className="badge-label">Gender</span>
                <span className="badge-value">{profile.gender}</span>
              </div>
              <div className="identity-badge">
                <span className="badge-label">Orientation</span>
                <span className="badge-value">{profile.orientation}</span>
              </div>
            </div>
          </div>

          {/* Disability declaration if visible */}
          {profile.hasDisability && profile.showDisability && (
            <div className="detail-disability-card page-enter">
              <div className="disability-title">♿ Disability Info</div>
              <p className="disability-desc font-body">{profile.disabilityInfo}</p>
            </div>
          )}

          {/* Interests */}
          <div className="detail-interests-section border-top">
            <h3 className="detail-section-title">Interests & Hobbies</h3>
            <div className="detail-interests-grid">
              {profile.interests.map(interest => (
                <span key={interest} className="detail-interest-pill">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Sticky Bottom Action */}
      <div className="detail-action-footer">
        <Button 
          variant="primary"
          onClick={() => sendInterest(profile.id)}
          className={`detail-heart-action-btn ${isInterestSent ? 'sent' : ''}`}
        >
          <Heart size={24} weight={isInterestSent ? 'fill' : 'regular'} className={isInterestSent ? 'heart-beat-active' : ''} />
          <span>
            {isInterestSent ? 'Interest Sent' : 'Send Interest'}
          </span>
        </Button>
      </div>

      {/* Report User Modal Wrapper */}
      <Modal
        isOpen={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        title={`Report ${profile.name}`}
      >
        {reportSubmitted ? (
          <div className="report-success-state page-enter">
            <div className="report-success-check">✓</div>
            <h3 className="report-success-title font-display">Report Submitted</h3>
            <p className="report-success-desc font-body">
              We'll review this report within 24 hours. Thank you for helping keep Velvet Hearts safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="report-form font-ui">
            <p className="report-form-intro font-body">
              We take all safety concerns seriously. Your report is completely confidential.
            </p>

            <div className="report-reasons-grid">
              <span className="report-group-label">What happened?</span>
              {reportReasons.map(reason => (
                <label key={reason} className="report-radio-label">
                  <input 
                    type="radio" 
                    name="report-reason" 
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    required
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="report-comment-group">
              <label htmlFor="report-comments" className="report-group-label">Tell us more (optional)</label>
              <textarea 
                id="report-comments"
                placeholder="Provide details of your experience..." 
                value={reportComment}
                onChange={(e) => setReportComment(e.target.value)}
                className="report-textarea font-body"
                maxLength={200}
              />
            </div>

            <Button type="submit" variant="danger" className="report-submit-btn">
              Submit Report
            </Button>
          </form>
        )}
      </Modal>

      <style>{`
        .profile-detail-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4) 100px;
        }

        .detail-header-actions {
          display: flex;
          gap: var(--space-2);
        }

        /* Content Container Split */
        .detail-content-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .detail-content-container {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }

        .detail-image-panel {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .detail-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-img-badges {
          position: absolute;
          top: var(--space-4);
          left: var(--space-4);
          display: flex;
          gap: var(--space-2);
        }

        .detail-info-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        /* Intent Card */
        .detail-intent-card {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-5);
        }

        .detail-intent-label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
        }

        .detail-intent-value {
          font-size: var(--text-heading);
          color: var(--text-accent);
          margin-top: 2px;
          margin-bottom: var(--space-1);
        }

        .detail-intent-status {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        /* Story */
        .detail-section-title {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-3);
        }

        .detail-story-quote {
          font-size: var(--text-body-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          border-left: 3px solid var(--burgundy-300);
          padding-left: var(--space-4);
          font-style: italic;
        }

        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        /* Identity */
        .detail-identity-badges {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .identity-badge {
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .badge-label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .badge-value {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Disability */
        .detail-disability-card {
          background-color: var(--success-light);
          border: 1.5px solid rgba(92, 154, 110, 0.25);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .disability-title {
          font-size: var(--text-body-sm);
          font-weight: bold;
          color: var(--success);
        }

        .disability-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        /* Interests */
        .detail-interests-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .detail-interest-pill {
          background-color: var(--burgundy-50);
          color: var(--burgundy-600);
          border: 1px solid var(--burgundy-200);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
        }

        /* Bottom Footer Action */
        .detail-action-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          padding: var(--space-4) var(--space-6);
          display: flex;
          justify-content: center;
          z-index: 200;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .detail-action-footer {
            padding-left: calc(var(--sidebar-width) + var(--space-6));
          }
        }

        .detail-heart-action-btn {
          width: 100%;
          max-width: 450px;
          border: 2px solid var(--burgundy-500);
          background-color: transparent;
          color: var(--burgundy-600);
        }

        .detail-heart-action-btn.sent {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          border-color: var(--burgundy-500);
        }

        .detail-heart-action-btn.sent:hover {
          background-color: var(--burgundy-400);
          border-color: var(--burgundy-400);
        }

        .heart-beat-active {
          animation: heartbeat 1s ease-out;
        }

        /* Report Form */
        .report-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .report-form-intro {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .report-reasons-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .report-group-label {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-2);
        }

        .report-radio-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          transition: background-color var(--duration-fast);
        }

        .report-radio-label:hover {
          background-color: var(--bg-surface-warm);
        }

        .report-radio-label input[type="radio"] {
          accent-color: var(--error);
          width: 16px;
          height: 16px;
        }

        .report-comment-group {
          display: flex;
          flex-direction: column;
        }

        .report-textarea {
          width: 100%;
          height: 80px;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-2) var(--space-3);
          background-color: var(--bg-input);
          outline: none;
          color: var(--text-primary);
          resize: none;
        }

        .report-textarea:focus {
          border-color: var(--border-error);
          background-color: #FFFFFF;
        }

        .report-submit-btn {
          width: 100%;
        }

        /* Success State */
        .report-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-6) 0;
          gap: var(--space-3);
        }

        .report-success-check {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--success);
          color: #FFFFFF;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 0.4s var(--ease-spring);
        }

        .report-success-title {
          font-size: var(--text-subheading);
          color: var(--text-primary);
        }

        .report-success-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

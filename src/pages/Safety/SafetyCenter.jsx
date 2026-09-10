import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import { ShieldCheck, Users, Info, HandWaving, EnvelopeSimple, Camera, Clock } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { PhotoVerificationModal } from '../../components/Safety/PhotoVerificationModal';
import { VerifiedBadge } from '../../components/UI/VerifiedBadge';

export const SafetyCenter = () => {
  const { blockedUsers, unblockUser, reportedUsers, submitSupportTicket, setActiveTab, profiles, showAlert, userProfile } = useApp();
  const [unblockingId, setUnblockingId] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Support Form State
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportText, setSupportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    const resolvedName = userProfile?.name || auth?.currentUser?.displayName || '';
    const resolvedEmail = userProfile?.email || auth?.currentUser?.email || '';

    if (resolvedName && !supportName) {
      setSupportName(resolvedName);
    }
    if (resolvedEmail && !supportEmail) {
      setSupportEmail(resolvedEmail);
    }
  }, [userProfile]);

  const handleUnblock = async (id) => {
    try {
      setUnblockingId(id);
      await unblockUser(id);
    } catch (err) {
      await showAlert({ title: 'Unblock Failed', message: 'Failed to unblock user. Please try again.' });
    } finally {
      setUnblockingId(null);
    }
  };

  const handleSupportSubmit = (e) => {
    if (e) e.preventDefault();
    const name = (supportName || userProfile?.name || auth?.currentUser?.displayName || '').trim();
    const email = (supportEmail || userProfile?.email || auth?.currentUser?.email || '').trim();
    const subjectText = (supportSubject || 'General Inquiry').trim();
    const message = (supportText || '').trim();

    if (!name || !email || !message) return;

    setIsSubmitting(true);
    try {
      // 1. Record support ticket in AppContext / state
      submitSupportTicket(name, email, subjectText, message);

      // 2. Prepare pre-filled email parameters
      const emailSubject = encodeURIComponent(`[Velvet Hearts Support] ${subjectText}`);
      const emailBody = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`
      );

      // 3. Save submitted details
      const mailtoUrl = `mailto:velvethearts.in@gmail.com?subject=${emailSubject}&body=${emailBody}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com&su=${emailSubject}&body=${emailBody}`;

      setSubmittedData({
        name,
        email,
        subject: subjectText,
        message,
        mailtoUrl,
        gmailUrl
      });

      // 4. Open email client with mailto
      window.location.href = mailtoUrl;

      // 5. Update UI to success state
      setSupportSubmitted(true);
    } catch (err) {
      console.error('Support submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSupportSubject('');
    setSupportText('');
    setSubmittedData(null);
    setSupportSubmitted(false);
  };

  return (
    <div className="safety-page page-enter">
      <PageHeader
        title="Safety Center"
        subtitle="Your comfort and safety are our highest priorities."
        onBack={() => setActiveTab('profile')}
      />

      <div className="safety-container font-ui">
        {/* Identity & Photo Verification Section */}
        <section className="safety-section">
          <h2 className="section-title">
            <ShieldCheck size={20} className="section-title-icon font-success" />
            <span>Identity &amp; Photo Verification</span>
          </h2>
          <Card className="safety-verify-card">
            <div className="safety-verify-content">
              <div className="safety-verify-icon-badge">
                <ShieldCheck size={32} weight="fill" color="#B8436A" />
              </div>
              <div className="safety-verify-info">
                <div className="safety-verify-header-row">
                  <h3 className="safety-verify-title font-display">Profile Authenticity</h3>
                  {userProfile?.verified ? (
                    <VerifiedBadge variant="pill" size="md" />
                  ) : (userProfile?.verificationStatus === 'PENDING' || localStorage.getItem('vh_manual_verification_pending') === 'true') ? (
                    <span className="safety-pending-tag font-ui" style={{ fontSize: '11px', background: 'rgba(212, 173, 106, 0.15)', color: '#D4AD6A', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid rgba(212, 173, 106, 0.3)' }}>⏳ Under Review</span>
                  ) : userProfile?.verificationStatus === 'REJECTED' ? (
                    <span className="safety-rejected-tag font-ui" style={{ fontSize: '11px', background: 'rgba(208, 48, 80, 0.12)', color: '#D03050', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid rgba(208, 48, 80, 0.3)' }}>⚠️ Not Approved</span>
                  ) : (
                    <span className="safety-unverified-tag font-ui">Not Verified</span>
                  )}
                </div>
                <p className="safety-verify-desc font-body">
                  {userProfile?.verified
                    ? 'Your identity is confirmed with a verified live pose selfie. Your profile displays the official Verified Badge to all matches.'
                    : (userProfile?.verificationStatus === 'PENDING' || localStorage.getItem('vh_manual_verification_pending') === 'true')
                    ? 'Your manual verification request has been submitted and is currently being processed by our moderation team.'
                    : userProfile?.verificationStatus === 'REJECTED'
                    ? 'Your previous verification was not approved. Tap below to retake your face scan.'
                    : 'Prevent catfishing and get up to 3x more meaningful connections by verifying your identity with a quick one-handed selfie gesture.'}
                </p>
              </div>
            </div>
            {!userProfile?.verified && (
              <div className="safety-verify-action">
                <Button variant="primary" onClick={() => {
                  const isPending = Boolean(
                    userProfile?.verificationStatus === 'PENDING' ||
                    localStorage.getItem('vh_manual_verification_pending') === 'true'
                  );
                  if (isPending) {
                    showAlert?.({
                      title: 'Verification Under Review',
                      message: 'Your photo verification has already been sent for manual review. Our team is currently reviewing your profile. Please wait.',
                    });
                  }
                  setIsVerifyModalOpen(true);
                }}>
                  {(userProfile?.verificationStatus === 'PENDING' || localStorage.getItem('vh_manual_verification_pending') === 'true') ? (
                    <>
                      <Clock size={18} weight="bold" />
                      <span>Check Verification Status</span>
                    </>
                  ) : userProfile?.verificationStatus === 'REJECTED' ? (
                    <>
                      <Camera size={18} weight="bold" />
                      <span>Retake Face Scan</span>
                    </>
                  ) : (
                    <>
                      <Camera size={18} weight="bold" />
                      <span>Verify Profile Now</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Guidelines */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <HandWaving size={20} className="section-title-icon" />
            <span>Community Guidelines</span>
          </h2>
          <Card className="guidelines-card font-body">
            <p>Velvet Hearts is built on mutual respect and intentional connection. We hold all members to these values:</p>
            <ul>
              <li><strong>Be Kind:</strong> Harassment, bullying, or hate speech of any kind is strictly prohibited and results in immediate ban.</li>
              <li><strong>Be Authentic:</strong> No catfishing, fake profiles, or spamming. Represent yourself honestly.</li>
              <li><strong>Be Respectful:</strong> Consent is mandatory. Respect boundaries, pronouns, and preferences.</li>
            </ul>
          </Card>
        </section>

        {/* Safety Tips */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <ShieldCheck size={20} className="section-title-icon font-success" />
            <span>Safety Tips for Dating</span>
          </h2>
          <div className="tips-grid">
            <div className="tip-box">
              <h4>Control your pace</h4>
              <p className="font-body">Take your time getting to know people. You are never obligated to share phone numbers, social media, or meet in person.</p>
            </div>
            <div className="tip-box">
              <h4>Meet in public</h4>
              <p className="font-body">Always meet in well-lit, populated public spaces for your first few dates. Never agree to meet at private residences.</p>
            </div>
            <div className="tip-box">
              <h4>Tell a friend</h4>
              <p className="font-body">Let someone you trust know where you are going, who you are meeting, and when you plan to return home.</p>
            </div>
            <div className="tip-box">
              <h4>Trust your gut</h4>
              <p className="font-body">If someone makes you feel uncomfortable, block or report them immediately. We are here to support you.</p>
            </div>
          </div>
        </section>

        {/* Blocked Profiles */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <Users size={20} className="section-title-icon" />
            <span>Blocked &amp; Removed Profiles</span>
          </h2>

          <div className="blocked-list-wrapper">
            {blockedUsers && blockedUsers.length > 0 ? (
              <div className="blocked-items-list">
                {blockedUsers.map(item => {
                  const blockedId = typeof item === 'string' ? item : (item.blockedUserId || item.id || item.blockedId);
                  const blockedProfile = profiles.find(p => p.id === blockedId || p.userId === blockedId);
                  const name = typeof item === 'object' && item.name
                    ? item.name
                    : (item.blocked?.profile?.name || (blockedProfile ? blockedProfile.name : 'Blocked User'));
                  const avatar = typeof item === 'object' && item.avatar
                    ? item.avatar
                    : (item.blocked?.profile?.photos?.[0]?.secureUrl || blockedProfile?.photos?.[0] || null);

                  return (
                    <div key={blockedId} className="blocked-item-row">
                      <div className="blocked-user-details">
                        {avatar ? (
                          <img src={avatar} alt={name} className="blocked-avatar" />
                        ) : (
                          <div className="blocked-avatar-placeholder">
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="blocked-user-info">
                          <span className="blocked-name">{name}</span>
                          <span className="blocked-status-badge">Blocked</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleUnblock(blockedId)}
                        disabled={unblockingId === blockedId}
                        className="unblock-btn-refactored"
                      >
                        {unblockingId === blockedId ? 'Unblocking...' : 'Unblock'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No blocked users"
                desc="You haven't blocked or removed anyone yet."
                icon={<Info size={28} />}
              />
            )}
          </div>
        </section>

        {/* Report Log History */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <ShieldCheck size={20} className="section-title-icon" />
            <span>Your Report History</span>
          </h2>
          <div className="report-history-wrapper">
            {reportedUsers && reportedUsers.length > 0 ? (
              <div className="report-history-list">
                {reportedUsers.map(report => {
                  const reportedProfile = profiles.find(p => p.id === report.profileId);
                  const name = reportedProfile ? reportedProfile.name : report.profileId;
                  return (
                    <Card key={report.id} className="report-history-item font-ui">
                      <div className="report-history-header">
                        <strong>Reported: {name}</strong>
                        <span className="report-history-date">{report.date}</span>
                      </div>
                      <p className="report-history-reason">Reason: {report.reason}</p>
                      {report.comment && <p className="report-history-comments font-body">Details: "{report.comment}"</p>}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="no-reports-text font-body">You have not submitted any safety reports.</p>
            )}
          </div>
        </section>

        {/* Support Request Form */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <EnvelopeSimple size={20} className="section-title-icon" />
            <span>Contact Support</span>
          </h2>

          <Card className="support-card">
            {supportSubmitted ? (
              <div className="support-success-state page-enter font-ui">
                <div className="support-success-check">✓</div>
                <h3>Message Sent</h3>
                <p className="font-body">
                  We've recorded your request and opened your email client. Our team will review and get back to you shortly.
                </p>
                <div className="support-success-actions">
                  <Button
                    variant="secondary"
                    onClick={handleSendAnother}
                    className="support-another-btn"
                  >
                    Send Another Message
                  </Button>
                  <a
                    href={submittedData?.gmailUrl || 'https://mail.google.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-gmail-link font-ui"
                  >
                    Open in Gmail Web ↗
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="support-form">
                <Input
                  id="support-name"
                  label="Your Name"
                  placeholder="Name"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  required
                />

                <Input
                  id="support-email"
                  label="Your Email"
                  type="email"
                  placeholder="email@example.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                />

                <Input
                  id="support-subject"
                  label="Subject"
                  placeholder="How can we help?"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  required
                />

                <Textarea
                  id="support-message"
                  label="Describe your concern"
                  placeholder="Write details of your issue here..."
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="support-submit-btn"
                >
                  Submit Request
                </Button>
              </form>
            )}
          </Card>
        </section>
      </div>

      <style>{`
        .safety-page {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .safety-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .safety-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-title-icon {
          color: var(--text-accent);
        }

        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        /* Guidelines */
        .guidelines-card {
          line-height: var(--leading-relaxed);
          color: var(--text-secondary);
        }

        .guidelines-card p {
          margin-bottom: var(--space-3);
        }

        .guidelines-card ul {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          list-style: none;
        }

        .guidelines-card li {
          border-left: 2px solid var(--burgundy-300);
          padding-left: var(--space-3);
        }

        /* Tips */
        .tips-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .tips-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .tip-box {
          background-color: var(--bg-surface-warm);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .tip-box h4 {
          font-size: var(--text-body-sm);
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .tip-box p {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        /* Blocked List */
        .blocked-list-wrapper {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .blocked-items-list {
          display: flex;
          flex-direction: column;
        }

        .blocked-item-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          align-items: center;
        }

        .blocked-item-row:last-child {
          border-bottom: none;
        }

        .blocked-user-details {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .blocked-user-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .blocked-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
        }

        .blocked-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--burgundy-100, #f3e5e8);
          color: var(--burgundy-700, #7a1c31);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .blocked-status-badge {
          background-color: var(--error-light);
          color: var(--error);
          font-size: 10px;
          font-weight: bold;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .unblock-btn-refactored {
          padding: var(--space-1) var(--space-3) !important;
          font-size: var(--text-caption) !important;
        }

        /* Report History */
        .report-history-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .report-history-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .report-history-header {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-body-sm);
        }

        .report-history-date {
          color: var(--text-muted);
          font-size: 11px;
        }

        .report-history-reason {
          font-size: var(--text-body-sm);
          font-weight: 500;
        }

        .report-history-comments {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          border-left: 2px solid var(--border-focus);
          padding-left: var(--space-2);
        }

        .no-reports-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Support */
        .support-card {
          padding: var(--space-6);
        }

        .support-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .support-submit-btn {
          width: 100%;
          margin-top: var(--space-2);
        }

        .support-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-2);
        }

        .support-success-check {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--success);
          color: #FFFFFF;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-2);
        }

        .support-success-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-4);
          width: 100%;
        }

        .support-another-btn {
          width: 100%;
          max-width: 240px;
        }

        .support-gmail-link {
          color: var(--burgundy-400, #D0607F);
          font-size: var(--text-body-sm);
          text-decoration: underline;
          transition: color 0.2s ease;
          padding: var(--space-1) var(--space-2);
        }

        .support-gmail-link:hover {
          color: var(--rose-400, #F0A0AD);
        }
      `}</style>

      <PhotoVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        primaryPhotoUrl={userProfile?.photos?.[0] || null}
        onVerified={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
};

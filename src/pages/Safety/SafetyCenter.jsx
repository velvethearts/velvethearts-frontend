import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import {
  ShieldCheck,
  Users,
  Info,
  HandWaving,
  EnvelopeSimple,
  Camera,
  Clock,
  LockKey,
  Siren,
  HeartStraight,
  CaretRight,
  UserCheck,
  Sparkle,
  PhoneCall,
} from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { PhotoVerificationModal } from '../../components/Safety/PhotoVerificationModal';
import { VerifiedBadge } from '../../components/UI/VerifiedBadge';

export const SafetyCenter = ({ onSignIn, onGetStarted }) => {
  const {
    blockedUsers,
    unblockUser,
    reportedUsers,
    submitSupportTicket,
    setActiveTab,
    profiles,
    showAlert,
    userProfile,
    isLoggedIn,
  } = useApp();

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
    const subjectText = (supportSubject || 'Safety & Support Inquiry').trim();
    const message = (supportText || '').trim();

    if (!name || !email || !message) return;

    setIsSubmitting(true);
    try {
      // 1. Record support ticket in AppContext / state
      submitSupportTicket(name, email, subjectText, message);

      // 2. Prepare pre-filled email parameters
      const emailSubject = encodeURIComponent(`[Velvet Hearts Safety] ${subjectText}`);
      const emailBody = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `User Status: ${isLoggedIn ? 'Active Member' : 'Public Visitor'}\n\n` +
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
        gmailUrl,
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
        subtitle={
          isLoggedIn
            ? 'Manage your personal verification, privacy controls, and safety tools.'
            : 'Our uncompromising commitment to trust, authenticity, and member safety.'
        }
        onBack={() => {
          if (isLoggedIn) {
            setActiveTab('profile');
            try { window.history.pushState({}, '', '/profile'); } catch (_) {}
          } else {
            setActiveTab('discover');
            try { window.history.pushState({}, '', '/'); } catch (_) {}
          }
        }}
      />

      <div className="safety-container font-ui">
        {/* ================================================================== */}
        {/* 1. AUTH-SPECIFIC CONTENT                                           */}
        {/* ================================================================== */}
        {isLoggedIn ? (
          <>
            {/* Authenticated: Member Identity & Verification */}
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
                        <span className="safety-pending-tag font-ui" style={{ fontSize: '11px', background: 'rgba(212, 173, 106, 0.15)', color: '#D4AD6A', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid rgba(212, 173, 106, 0.3)' }}>
                          ⏳ Under Review
                        </span>
                      ) : userProfile?.verificationStatus === 'REJECTED' ? (
                        <span className="safety-rejected-tag font-ui" style={{ fontSize: '11px', background: 'rgba(208, 48, 80, 0.12)', color: '#D03050', padding: '3px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid rgba(208, 48, 80, 0.3)' }}>
                          ⚠️ Not Approved
                        </span>
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
                        : 'Prevent catfishing and get up to 3x more meaningful connections by verifying your identity with a quick live selfie gesture.'}
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

            {/* Authenticated: Blocked & Removed Profiles */}
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

            {/* Authenticated: Your Report History */}
            <section className="safety-section border-top">
              <h2 className="section-title">
                <ShieldCheck size={20} className="section-title-icon" />
                <span>Your Incident Report History</span>
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
                          {report.comment && <p className="report-history-comments font-body">Details: &ldquo;{report.comment}&rdquo;</p>}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-reports-text font-body">You have not submitted any safety reports.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* ============================================================== */}
            {/* PUBLIC VISITOR: TRUST & INTEGRITY MANIFESTO                    */}
            {/* ============================================================== */}
            <section className="safety-section">
              <div className="safety-hero-card">
                <div className="safety-hero-badge">
                  <ShieldCheck size={16} weight="fill" />
                  <span>Trust &amp; Safety Standard</span>
                </div>
                <h2 className="safety-hero-title font-display">
                  A Safer Standard for Romantic Discovery
                </h2>
                <p className="safety-hero-desc font-body">
                  Velvet Hearts is engineered from the ground up for intentional, respectful dating across India. We believe genuine romance requires uncompromising safety, strict real-identity verification, and complete privacy preservation.
                </p>
              </div>

              {/* 4 Safety Pillars */}
              <div className="safety-pillars-grid">
                <div className="safety-pillar-box">
                  <div className="pillar-icon-wrap">
                    <Camera size={20} weight="bold" />
                  </div>
                  <h3 className="pillar-title">100% Face Verification</h3>
                  <p className="pillar-desc font-body">
                    We eliminate catfishing, fake accounts, and AI bots. Every member completes live selfie anti-spoofing verification before initiating connections.
                  </p>
                </div>

                <div className="safety-pillar-box">
                  <div className="pillar-icon-wrap">
                    <LockKey size={20} weight="bold" />
                  </div>
                  <h3 className="pillar-title">Zero Phone Sharing</h3>
                  <p className="pillar-desc font-body">
                    Your personal phone number is never required, requested, or shared. Connect and chat without exposing your sensitive private contact details.
                  </p>
                </div>

                <div className="safety-pillar-box">
                  <div className="pillar-icon-wrap">
                    <ShieldCheck size={20} weight="bold" />
                  </div>
                  <h3 className="pillar-title">Zero-Tolerance Policy</h3>
                  <p className="pillar-desc font-body">
                    Harassment, financial solicitation, hate speech, or non-consensual conduct triggers an immediate device-level permanent ban under Indian law.
                  </p>
                </div>

                <div className="safety-pillar-box">
                  <div className="pillar-icon-wrap">
                    <HeartStraight size={20} weight="bold" />
                  </div>
                  <h3 className="pillar-title">Intentional Courtship</h3>
                  <p className="pillar-desc font-body">
                    No superficial swiping gamification. Thoughtful voice intros and paced matches encourage genuine courtship without aggressive spam.
                  </p>
                </div>
              </div>
            </section>

            {/* Member Safety Console Call-To-Action */}
            <section className="safety-section border-top">
              <div className="safety-auth-cta-card">
                <div className="cta-content">
                  <div className="flex items-center gap-2">
                    <Sparkle size={18} weight="fill" className="text-[#e27396]" />
                    <h3 className="cta-title font-display">Looking to Access Your Safety Dashboard?</h3>
                  </div>
                  <p className="cta-desc font-body">
                    Sign in to manage your active verification badge, blocked profile list, and personal incident report history. Not yet a member? Join Velvet Hearts to experience safer dating.
                  </p>
                  <div className="cta-btn-group">
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (onGetStarted) {
                          onGetStarted();
                        } else {
                          setActiveTab('discover');
                          try { window.history.pushState({}, '', '/'); } catch (_) {}
                        }
                      }}
                      className="cta-primary-btn"
                    >
                      Join Velvet Hearts
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (onSignIn) {
                          onSignIn();
                        } else {
                          setActiveTab('discover');
                          try { window.history.pushState({}, '', '/'); } catch (_) {}
                        }
                      }}
                      className="cta-secondary-btn"
                    >
                      Sign In to Your Account
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================================================================== */}
        {/* 2. STATUTORY EMERGENCY HELPLINES (Pan-India)                        */}
        {/* ================================================================== */}
        <section className="safety-section border-top">
          <div className="section-title-wrap flex items-center justify-between">
            <h2 className="section-title">
              <Siren size={20} className="section-title-icon text-[#d03050]" weight="fill" />
              <span>Emergency Helplines (India)</span>
            </h2>
            <span className="emergency-badge font-mono text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
              24/7 TOLL-FREE
            </span>
          </div>
          <div className="helplines-grid">
            <a href="tel:112" className="helpline-card" title="Call Pan-India Emergency Service">
              <div className="helpline-dial-col">
                <PhoneCall size={18} className="helpline-phone-icon" weight="fill" />
                <span className="helpline-number font-display">112</span>
              </div>
              <div className="helpline-info">
                <strong className="helpline-name">National Emergency</strong>
                <span className="helpline-desc font-body">Police, Fire, Ambulance (All India)</span>
              </div>
            </a>

            <a href="tel:1091" className="helpline-card" title="Call Women Safety Helpline">
              <div className="helpline-dial-col">
                <PhoneCall size={18} className="helpline-phone-icon" weight="fill" />
                <span className="helpline-number font-display">1091</span>
              </div>
              <div className="helpline-info">
                <strong className="helpline-name">Women Helpline</strong>
                <span className="helpline-desc font-body">24/7 Immediate distress assistance</span>
              </div>
            </a>

            <a href="tel:1930" className="helpline-card" title="Call Cyber Crime Reporting Portal">
              <div className="helpline-dial-col">
                <PhoneCall size={18} className="helpline-phone-icon" weight="fill" />
                <span className="helpline-number font-display">1930</span>
              </div>
              <div className="helpline-info">
                <strong className="helpline-name">Cyber Crime Helpline</strong>
                <span className="helpline-desc font-body">Financial fraud &amp; online extortion</span>
              </div>
            </a>

            <a href="tel:18005990019" className="helpline-card" title="Call Mental Health Helpline">
              <div className="helpline-dial-col">
                <PhoneCall size={18} className="helpline-phone-icon" weight="fill" />
                <span className="helpline-number font-display text-sm font-bold">1800-599-0019</span>
              </div>
              <div className="helpline-info">
                <strong className="helpline-name">KIRAN Mental Health</strong>
                <span className="helpline-desc font-body">Confidential emotional counselling</span>
              </div>
            </a>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 3. DATING SAFETY TIPS                                              */}
        {/* ================================================================== */}
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
              <h4>Never send money</h4>
              <p className="font-body">Never wire funds, transfer crypto, or share banking PINs with anyone you met online, regardless of their circumstance.</p>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 4. OFFICIAL STANDARDS & REDRESSAL LINKS                            */}
        {/* ================================================================== */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <HandWaving size={20} className="section-title-icon" />
            <span>Community Guidelines &amp; Redressal</span>
          </h2>
          <div className="safety-links-grid">
            <button
              type="button"
              onClick={() => {
                setActiveTab('guidelines');
                try { window.history.pushState({}, '', '/guidelines'); } catch (_) {}
              }}
              className="safety-nav-card"
            >
              <div className="safety-nav-info">
                <strong>Community Guidelines</strong>
                <span>Rules for respectful communication, photo standards &amp; sanctions</span>
              </div>
              <CaretRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('privacy');
                try { window.history.pushState({}, '', '/privacy'); } catch (_) {}
              }}
              className="safety-nav-card"
            >
              <div className="safety-nav-info">
                <strong>Privacy &amp; DPDP Governance</strong>
                <span>How biometric vectors and chat logs are processed and protected</span>
              </div>
              <CaretRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('terms');
                try { window.history.pushState({}, '', '/terms'); } catch (_) {}
              }}
              className="safety-nav-card"
            >
              <div className="safety-nav-info">
                <strong>Terms of Service &amp; Grievance SLA</strong>
                <span>Statutory redressal officer, BNS criminal statutes &amp; liability caps</span>
              </div>
              <CaretRight size={16} />
            </button>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 5. CONTACT SAFETY & SUPPORT DESK                                   */}
        {/* ================================================================== */}
        <section className="safety-section border-top">
          <h2 className="section-title">
            <EnvelopeSimple size={20} className="section-title-icon" />
            <span>Contact Safety &amp; Trust Desk</span>
          </h2>

          <Card className="support-card">
            {supportSubmitted ? (
              <div className="support-success-state page-enter font-ui">
                <div className="support-success-check">✓</div>
                <h3>Message Sent</h3>
                <p className="font-body">
                  We&apos;ve recorded your inquiry and opened your email client. Our Trust &amp; Safety team will review and respond shortly.
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
                  placeholder="Full name"
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
                  label="Describe your concern or report"
                  placeholder="Write details of your safety concern, report, or general inquiry here..."
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
                  Submit Inquiry
                </Button>
              </form>
            )}
          </Card>
        </section>
      </div>

      <style>{`
        .safety-page {
          max-width: 680px;
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

        /* Hero presentation for Public Visitors */
        .safety-hero-card {
          padding: var(--space-6);
          border-radius: var(--radius-lg, 16px);
          background: var(--bg-surface-warm);
          border: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
        }

        .safety-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(184, 67, 106, 0.12);
          color: var(--burgundy-500, #b8436a);
          align-self: flex-start;
        }

        .safety-hero-title {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .safety-hero-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .safety-pillars-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }

        @media (min-width: 576px) {
          .safety-pillars-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .safety-pillar-box {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 12px);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .safety-pillar-box:hover {
          border-color: rgba(184, 67, 106, 0.4);
        }

        .pillar-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(184, 67, 106, 0.12);
          color: #b8436a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }

        .pillar-title {
          font-size: var(--text-body-sm);
          font-weight: 700;
          color: var(--text-primary);
        }

        .pillar-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Helplines */
        .helplines-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }

        @media (min-width: 576px) {
          .helplines-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .helpline-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 12px);
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .helpline-card:hover {
          border-color: #d03050;
          background: rgba(208, 48, 80, 0.04);
          transform: translateY(-1px);
        }

        .helpline-dial-col {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(208, 48, 80, 0.1);
          color: #d03050;
          border-radius: 8px;
        }

        .helpline-phone-icon {
          flex-shrink: 0;
        }

        .helpline-number {
          font-size: 1.1rem;
          font-weight: 800;
          color: #d03050;
        }

        .helpline-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .helpline-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .helpline-desc {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .emergency-badge {
          background: rgba(208, 48, 80, 0.12);
          color: #d03050;
          border: 1px solid rgba(208, 48, 80, 0.25);
        }

        /* Member Auth CTA */
        .safety-auth-cta-card {
          padding: var(--space-6);
          border-radius: var(--radius-lg, 16px);
          background: linear-gradient(135deg, rgba(184, 67, 106, 0.08) 0%, rgba(212, 173, 106, 0.08) 100%);
          border: 1px solid rgba(184, 67, 106, 0.25);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .cta-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .cta-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cta-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .cta-btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        /* Safety Links Card */
        .safety-links-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .safety-nav-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 12px);
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
          width: 100%;
        }

        .safety-nav-card:hover {
          border-color: var(--burgundy-300, #b8436a);
          background: var(--bg-surface-warm);
        }

        .safety-nav-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .safety-nav-info strong {
          font-size: var(--text-body-sm);
          color: var(--text-primary);
        }

        .safety-nav-info span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Tips */
        .tips-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
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
          font-size: 12px;
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        /* Verification Card */
        .safety-verify-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-5);
        }

        .safety-verify-content {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .safety-verify-icon-badge {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(184, 67, 106, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .safety-verify-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }

        .safety-verify-header-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .safety-verify-title {
          font-size: var(--text-body);
          font-weight: 700;
          color: var(--text-primary);
        }

        .safety-verify-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        .safety-unverified-tag {
          font-size: 11px;
          background: rgba(184, 67, 106, 0.1);
          color: var(--burgundy-500, #b8436a);
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid rgba(184, 67, 106, 0.25);
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
          background-color: var(--error-light, rgba(208, 48, 80, 0.1));
          color: var(--error, #d03050);
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
          background-color: var(--success, #2e7d32);
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

      {isLoggedIn && (
        <PhotoVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          primaryPhotoUrl={userProfile?.photos?.[0] || null}
          onVerified={() => setIsVerifyModalOpen(false)}
        />
      )}
    </div>
  );
};

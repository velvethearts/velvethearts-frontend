import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Cpu,
  LockKey,
  Scales,
  UserCheck,
  Eye,
  Trash,
  CheckCircle,
  WarningCircle,
  ArrowLeft,
  EnvelopeSimple,
  MapPin,
  Clock,
  Sparkle,
  Fingerprint,
  ChatCircleText,
  Microphone,
  HardDrive
} from '@phosphor-icons/react';
import logo from '../../assets/velvet-heart-logo.png';

export const LegalPage = ({ initialTab = 'privacy', onBack }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'privacy' | 'terms'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="legal-page-container font-ui page-enter">
      {/* Top Banner Navigation */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-header-brand">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="legal-back-btn"
                aria-label="Go back"
              >
                <ArrowLeft size={18} weight="bold" />
                <span>Back</span>
              </button>
            )}
            <img src={logo} alt="Velvet Hearts" className="legal-logo" />
            <div className="legal-header-titles">
              <span className="legal-brand-title font-display">Velvet Hearts</span>
              <span className="legal-brand-sub">Legal &amp; Trust Compliance Center</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="legal-tab-switcher" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'privacy'}
              className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <ShieldCheck size={18} weight={activeTab === 'privacy' ? 'fill' : 'regular'} />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'terms'}
              className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              <Scales size={18} weight={activeTab === 'terms' ? 'fill' : 'regular'} />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="legal-main">
        {activeTab === 'privacy' ? (
          <PrivacyPolicyContent />
        ) : (
          <TermsOfServiceContent />
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <p className="legal-footer-note">
            &copy; {new Date().getFullYear()} Velvet Hearts India. Compliant with the Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        .legal-page-container {
          min-height: 100vh;
          background-color: var(--bg-page, #120e11);
          color: var(--text-primary, #f5edf0);
          display: flex;
          flex-direction: column;
        }

        .legal-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(18, 14, 17, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle, rgba(184, 67, 106, 0.2));
        }

        .legal-header-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .legal-header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legal-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--text-secondary, #d4adb7);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .legal-back-btn:hover {
          background: rgba(184, 67, 106, 0.18);
          color: #ffffff;
          border-color: rgba(184, 67, 106, 0.4);
        }

        .legal-logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }

        .legal-header-titles {
          display: flex;
          flex-direction: column;
        }

        .legal-brand-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--gold-400, #d4ad6a);
          line-height: 1.2;
        }

        .legal-brand-sub {
          font-size: 0.72rem;
          color: var(--text-muted, #9e858d);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .legal-tab-switcher {
          display: flex;
          background: rgba(0, 0, 0, 0.35);
          padding: 0.25rem;
          border-radius: 999px;
          border: 1px solid rgba(184, 67, 106, 0.2);
        }

        .legal-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-secondary, #c7aeb7);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .legal-tab-btn.active {
          background: linear-gradient(135deg, #b8436a 0%, #8e2b4f 100%);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(184, 67, 106, 0.35);
        }

        .legal-main {
          flex: 1;
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
          padding: 2.5rem 1.25rem 4rem;
        }

        .legal-doc-hero {
          text-align: center;
          margin-bottom: 2.75rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(184, 67, 106, 0.18);
        }

        .legal-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: rgba(212, 173, 106, 0.12);
          border: 1px solid rgba(212, 173, 106, 0.3);
          color: var(--gold-400, #d4ad6a);
          margin-bottom: 1rem;
        }

        .legal-doc-title {
          font-size: 2.35rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .legal-doc-meta {
          font-size: 0.85rem;
          color: var(--text-muted, #a88d96);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .legal-doc-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        /* AI Disclosure Banner */
        .ai-disclosure-banner {
          background: linear-gradient(135deg, rgba(82, 33, 56, 0.45) 0%, rgba(20, 16, 22, 0.7) 100%);
          border: 1px solid rgba(212, 173, 106, 0.35);
          border-radius: 16px;
          padding: 1.35rem 1.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .ai-icon-wrap {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(212, 173, 106, 0.15);
          border: 1px solid rgba(212, 173, 106, 0.4);
          color: var(--gold-400, #d4ad6a);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-banner-content h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--gold-400, #d4ad6a);
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .ai-banner-content p {
          font-size: 0.88rem;
          line-height: 1.55;
          color: var(--text-secondary, #d9c5cc);
          margin: 0;
        }

        /* Section Cards */
        .legal-section-card {
          background: rgba(25, 20, 24, 0.6);
          border: 1px solid rgba(184, 67, 106, 0.16);
          border-radius: 16px;
          padding: 1.85rem;
          margin-bottom: 1.75rem;
          transition: border-color 0.2s ease;
        }

        .legal-section-card:hover {
          border-color: rgba(184, 67, 106, 0.3);
        }

        .legal-section-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .legal-section-icon {
          color: var(--burgundy-400, #e0608b);
        }

        .legal-p {
          font-size: 0.92rem;
          line-height: 1.68;
          color: var(--text-secondary, #d9c5cc);
          margin-bottom: 1rem;
        }

        .legal-p:last-child {
          margin-bottom: 0;
        }

        /* Data Storage Grid */
        .data-category-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin: 1.25rem 0;
        }

        @media (min-width: 640px) {
          .data-category-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .data-cat-item {
          background: rgba(14, 11, 13, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem 1.15rem;
        }

        .data-cat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--gold-400, #d4ad6a);
          margin-bottom: 0.45rem;
        }

        .data-cat-item ul {
          margin: 0;
          padding-left: 1.2rem;
          font-size: 0.84rem;
          line-height: 1.55;
          color: var(--text-secondary, #c7aeb7);
        }

        .data-cat-item li {
          margin-bottom: 0.25rem;
        }

        /* Highlight Boxes */
        .legal-callout-box {
          background: rgba(212, 173, 106, 0.08);
          border-left: 3px solid var(--gold-400, #d4ad6a);
          border-radius: 0 10px 10px 0;
          padding: 1rem 1.25rem;
          margin: 1.25rem 0;
          font-size: 0.88rem;
          line-height: 1.6;
          color: #fce8ee;
        }

        .legal-callout-box strong {
          color: var(--gold-400, #d4ad6a);
        }

        /* Grievance Card */
        .grievance-card {
          background: linear-gradient(135deg, rgba(30, 22, 28, 0.8) 0%, rgba(18, 14, 17, 0.9) 100%);
          border: 1px solid rgba(212, 173, 106, 0.3);
          border-radius: 14px;
          padding: 1.5rem;
          margin-top: 1.25rem;
        }

        .grievance-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 0.85rem;
        }

        .grievance-detail {
          display: flex;
          flex-direction: column;
          font-size: 0.86rem;
        }

        .grievance-label {
          color: var(--text-muted, #9e858d);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.2rem;
        }

        .grievance-val {
          color: #ffffff;
          font-weight: 600;
        }

        .legal-footer {
          border-top: 1px solid var(--border-subtle, rgba(184, 67, 106, 0.2));
          padding: 2rem 1.25rem;
          text-align: center;
          background: rgba(14, 11, 13, 0.8);
        }

        .legal-footer-note {
          font-size: 0.8rem;
          color: var(--text-muted, #8f7780);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PRIVACY POLICY CONTENT (INDIAN DPDP ACT 2023 & IT ACT 2000 COMPLIANT)     */
/* -------------------------------------------------------------------------- */
const PrivacyPolicyContent = () => {
  return (
    <div className="legal-content-doc">
      {/* Hero Header */}
      <div className="legal-doc-hero">
        <div className="legal-tag-badge">
          <ShieldCheck size={14} weight="bold" />
          <span>DPDPA 2023 &amp; IT Act 2000 Compliant</span>
        </div>
        <h1 className="legal-doc-title font-display">Privacy Policy</h1>
        <div className="legal-doc-meta">
          <span className="legal-doc-meta-item">
            <Clock size={14} /> Effective: September 10, 2026
          </span>
          <span className="legal-doc-meta-item">
            <MapPin size={14} /> Jurisdiction: Republic of India
          </span>
          <span className="legal-doc-meta-item">
            <UserCheck size={14} /> Data Fiduciary: Velvet Hearts Dating Platforms
          </span>
        </div>
      </div>

      {/* AI Codebase & Systems Disclosure */}
      <div className="ai-disclosure-banner">
        <div className="ai-icon-wrap">
          <Cpu size={26} weight="duotone" />
        </div>
        <div className="ai-banner-content">
          <h4>
            <span>AI-Authored Platform &amp; Algorithmic Transparency Disclosure</span>
            <Sparkle size={16} weight="fill" />
          </h4>
          <p>
            Velvet Hearts takes transparency seriously. The application codebase, architecture, recommendation algorithms, and interface systems have been <strong>authored and synthesized utilizing Advanced Agentic Artificial Intelligence (Google DeepMind Antigravity AI Systems)</strong> under rigorous human engineering supervision and peer-review. AI models are applied strictly for vibe matchmaking, real-time photo aspect validation, and safety moderation, operating in complete compliance with the <strong>Digital Personal Data Protection Act, 2023</strong>.
          </p>
        </div>
      </div>

      {/* 1. Introduction & Regulatory Framework */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <FileText size={22} className="legal-section-icon" />
          <span>1. Introduction &amp; Legal Framework</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates an intentional relationship platform tailored for authentic connections in India. This Privacy Policy outlines how we collect, store, encrypt, process, and safeguard your personal data.
        </p>
        <p className="legal-p">
          This document is published in accordance with the provisions of:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li><strong>The Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong>, under which Velvet Hearts functions as a <em>Data Fiduciary</em> and you act as a <em>Data Principal</em>.</li>
          <li><strong>The Information Technology Act, 2000</strong> and <strong>The Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.</li>
          <li><strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.</li>
        </ul>
      </section>

      {/* 2. Exhaustive Data Storage Disclosure */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <HardDrive size={22} className="legal-section-icon" />
          <span>2. Data Stored &amp; Processing Activities</span>
        </h2>
        <p className="legal-p">
          In strict compliance with Section 5 and Section 6 of the DPDP Act 2023, we only collect data essential for providing genuine matching services and maintaining female-first and user physical safety. Below is the full inventory of data stored:
        </p>

        <div className="data-category-grid">
          <div className="data-cat-item">
            <div className="data-cat-header">
              <UserCheck size={18} />
              <span>Identity &amp; Authentication Data</span>
            </div>
            <ul>
              <li><strong>Phone Number:</strong> Verified via Firebase SMS One-Time Password (OTP).</li>
              <li><strong>Email Address:</strong> Optional social/OAuth profile contact.</li>
              <li><strong>Name &amp; Age:</strong> Full display name and date of birth (enforces mandatory 18+ requirement).</li>
              <li><strong>Gender &amp; Orientation:</strong> Declared gender and romantic orientation for discover filtering.</li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <Fingerprint size={18} />
              <span>Biometric &amp; Photo Authenticity</span>
            </div>
            <ul>
              <li><strong>Profile Photos:</strong> Up to 6 curated lifestyle images (hosted on Cloudinary CDN).</li>
              <li><strong>Verification Selfie:</strong> Real-time pose verification photo used solely to confirm authenticity and prevent catfishing.</li>
              <li><strong>Face Geometry Vectors:</strong> Mathematical hash descriptors to match verification selfies against profile photos. Raw biometric templates are never sold or shared.</li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <ChatCircleText size={18} />
              <span>Encrypted Communications</span>
            </div>
            <ul>
              <li><strong>Direct Messages:</strong> Chat text stored with AES-256 encryption at rest.</li>
              <li><strong>Voice Notes:</strong> Temporary audio voice recordings shared between mutual connections.</li>
              <li><strong>Rewind Letters:</strong> Sealed digital letters with cryptographically scheduled delivery dates.</li>
              <li><strong>Our Diary:</strong> Mutual scrapbook memories and photos between matched partners.</li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <LockKey size={18} />
              <span>Technical &amp; Safety Records</span>
            </div>
            <ul>
              <li><strong>Device &amp; Session Identifiers:</strong> Anonymous browser fingerprint and device token for anti-account hijacking.</li>
              <li><strong>City &amp; State:</strong> Regional location data for distance calculations; precise GPS is only collected upon explicit user consent.</li>
              <li><strong>Safety &amp; Block Records:</strong> User block lists, report tickets, compliance warnings, and moderation audit trails.</li>
            </ul>
          </div>
        </div>

        <div className="legal-callout-box">
          <strong>Zero Sale of Data:</strong> Velvet Hearts does <strong>not sell, lease, or monetize</strong> your personal data or photos to third-party data brokers, ad networks, or external AI training aggregators.
        </div>
      </section>

      {/* 3. Consent & Purpose Limitation */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <CheckCircle size={22} className="legal-section-icon" />
          <span>3. Lawful Consent Architecture</span>
        </h2>
        <p className="legal-p">
          Processing of personal data is grounded in <strong>freely given, specific, informed, and unambiguous consent</strong> under Section 6 of the DPDP Act 2023. You have the right to withdraw consent at any time through your Profile &amp; Account Settings. Withdrawal of consent does not affect the legality of processing prior to such withdrawal.
        </p>
      </section>

      {/* 4. Data Principal Rights (Under DPDP Act 2023) */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Scales size={22} className="legal-section-icon" />
          <span>4. Your Rights as a Data Principal</span>
        </h2>
        <p className="legal-p">
          As a registered citizen or resident of India, the DPDP Act 2023 guarantees you the following statutory rights:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li><strong>Right to Access:</strong> You may request a complete summary of personal data held about you and any third-party sharing.</li>
          <li><strong>Right to Correction &amp; Updation:</strong> You can edit and rectify inaccurate, incomplete, or out-of-date personal data directly in the app.</li>
          <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> When you delete your account via Settings, all profile data, photos, diary entries, and matching algorithms are permanently purged within 30 days.</li>
          <li><strong>Right to Nominate:</strong> You have the right to designate an individual who may exercise your rights in the event of death or incapacity.</li>
          <li><strong>Right of Grievance Redressal:</strong> A statutory mechanism to resolve privacy disputes promptly via our designated Grievance Officer.</li>
        </ul>
      </section>

      {/* 5. Age Restriction & Child Safety */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <WarningCircle size={22} className="legal-section-icon" />
          <span>5. Strict 18+ Age Requirement</span>
        </h2>
        <p className="legal-p">
          In accordance with Section 9 of the DPDP Act 2023 (Processing of personal data of children), <strong>Velvet Hearts strictly prohibits individuals under 18 years of age</strong> from creating an account or using the platform. We do not knowingly track or process personal data belonging to minors. Any account found to belong to a minor is terminated immediately.
        </p>
      </section>

      {/* 6. Statutory Grievance Officer */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <EnvelopeSimple size={22} className="legal-section-icon" />
          <span>6. Statutory Grievance Redressal Officer</span>
        </h2>
        <p className="legal-p">
          In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the DPDP Act 2023, the details of our designated Grievance Officer are as follows:
        </p>

        <div className="grievance-card">
          <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
            Grievance &amp; Data Protection Officer
          </h4>
          <div className="grievance-row">
            <div className="grievance-detail">
              <span className="grievance-label">Designated Officer</span>
              <span className="grievance-val">Aditya Sharma (Head of Trust &amp; Safety)</span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Official Email</span>
              <span className="grievance-val">grievance-officer@velvethearts.in</span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Statutory Response Time</span>
              <span className="grievance-val">Acknowledgment within 24h &bull; Redressal within 15 days</span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Physical Address</span>
              <span className="grievance-val">Velvet Hearts Trust Office, Cyber City, Gurugram, Haryana 122002, India</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TERMS OF SERVICE CONTENT (INDIAN IT ACT 2000 & INTERMEDIARY RULES 2021)   */
/* -------------------------------------------------------------------------- */
const TermsOfServiceContent = () => {
  return (
    <div className="legal-content-doc">
      {/* Hero Header */}
      <div className="legal-doc-hero">
        <div className="legal-tag-badge">
          <Scales size={14} weight="bold" />
          <span>IT Act 2000 &amp; Contract Act 1872 Compliant</span>
        </div>
        <h1 className="legal-doc-title font-display">Terms of Service</h1>
        <div className="legal-doc-meta">
          <span className="legal-doc-meta-item">
            <Clock size={14} /> Effective: September 10, 2026
          </span>
          <span className="legal-doc-meta-item">
            <MapPin size={14} /> Jurisdiction: Courts of New Delhi, India
          </span>
          <span className="legal-doc-meta-item">
            <ShieldCheck size={14} /> Governed by Indian Law
          </span>
        </div>
      </div>

      {/* AI Codebase Transparency Banner */}
      <div className="ai-disclosure-banner">
        <div className="ai-icon-wrap">
          <Cpu size={26} weight="duotone" />
        </div>
        <div className="ai-banner-content">
          <h4>
            <span>AI-Driven Software Notice &amp; Platform Architecture</span>
            <Sparkle size={16} weight="fill" />
          </h4>
          <p>
            Users acknowledge that Velvet Hearts software, backend infrastructure, compatibility metrics, and user safety monitors are <strong>architected and written utilizing Advanced AI Systems (Google DeepMind Antigravity AI)</strong> under ongoing human oversight. While our autonomous systems strive for 99.9% uptime and zero-bias matching, you agree to engage with care, common sense, and personal discretion.
          </p>
        </div>
      </div>

      {/* 1. Binding Agreement */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <FileText size={22} className="legal-section-icon" />
          <span>1. Acceptance of Terms</span>
        </h2>
        <p className="legal-p">
          By creating an account, browsing profiles, or accessing Velvet Hearts (&ldquo;App&rdquo; or &ldquo;Service&rdquo;), you enter into a legally binding contract under the <strong>Indian Contract Act, 1872</strong> with Velvet Hearts Dating Technologies India Private Limited.
        </p>
        <p className="legal-p">
          If you do not agree to these Terms, you must immediately cease using the platform and delete your account.
        </p>
      </section>

      {/* 2. Eligibility & 18+ Verification */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <UserCheck size={22} className="legal-section-icon" />
          <span>2. Eligibility Criteria</span>
        </h2>
        <p className="legal-p">
          To register for or use Velvet Hearts, you represent and warrant that:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li>You are at least <strong>18 (eighteen) years of age</strong> as of the date of registration.</li>
          <li>You are legally competent to enter into a binding contract under Indian law.</li>
          <li>You have never been convicted of an offence involving violence, harassment, sexual misconduct, or financial fraud under the <strong>Bharatiya Nyaya Sanhita, 2023 (BNS)</strong> or equivalent penal statutes.</li>
          <li>You do not have more than one active account on Velvet Hearts.</li>
        </ul>
      </section>

      {/* 3. Prohibited Conduct (Rule 3(1)(b) IT Rules 2021) */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <WarningCircle size={22} className="legal-section-icon" />
          <span>3. User Conduct &amp; Prohibited Activities</span>
        </h2>
        <p className="legal-p">
          In compliance with Rule 3(1)(b) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, you agree not to host, display, upload, modify, publish, transmit, or share any information that:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li>Belongs to another person without authorization (impersonation, catfishing, fake credentials).</li>
          <li>Is defamatory, obscene, pornographic, paedophilic, invasive of another&rsquo;s privacy, or bodily privacy (including non-consensual sexual images).</li>
          <li>Harasses, intimidates, stalks, or causes harm to women, men, or LGBTQ+ individuals.</li>
          <li>Promotes commercial solicitation, prostitution, human trafficking, escort services, or fraudulent financial requests.</li>
          <li>Infringes any patent, trademark, copyright, or other proprietary rights.</li>
          <li>Deceives or misleads the addressee about the origin of messages or contains software viruses or malicious code.</li>
          <li>Threatens the unity, integrity, defence, security or sovereignty of India.</li>
        </ul>

        <div className="legal-callout-box">
          <strong>Zero Tolerance for Abuse:</strong> Violations of conduct result in immediate permanent account suspension, reporting to law enforcement authorities where applicable, and device-level blacklisting.
        </div>
      </section>

      {/* 4. Safety & Offline Encounters */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <ShieldCheck size={22} className="legal-section-icon" />
          <span>4. Real-World Safety &amp; Disclaimers</span>
        </h2>
        <p className="legal-p">
          While Velvet Hearts mandates selfie verification and biometric authenticity checks, <strong>we do not conduct criminal background checks</strong> on every user. You are solely responsible for your interactions with other members. Always follow our safety guidelines: meet in public spaces, notify a trusted friend, and never send money or financial credentials to anyone you meet online.
        </p>
      </section>

      {/* 5. Intellectual Property & AI Generation */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Cpu size={22} className="legal-section-icon" />
          <span>5. Intellectual Property &amp; AI Authorship</span>
        </h2>
        <p className="legal-p">
          All trademarks, logos, visual aesthetics, UI assets, and AI-synthesized software code comprising the Velvet Hearts platform are the proprietary intellectual property of Velvet Hearts. Users retain copyright in the photos and text they submit, but grant Velvet Hearts a non-exclusive, royalty-free license to host, display, and format content exclusively for operating the platform.
        </p>
      </section>

      {/* 6. Intermediary Status & Safe Harbor */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <LockKey size={22} className="legal-section-icon" />
          <span>6. Intermediary Status (Section 79, IT Act 2000)</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts operates as an <em>intermediary</em> under Section 2(1)(w) of the Information Technology Act, 2000. Under Section 79 of the IT Act, Velvet Hearts is not liable for third-party information, data, or communication links made available by users, provided due diligence obligations under the IT Rules 2021 are observed.
        </p>
      </section>

      {/* 7. Dispute Resolution & Governing Jurisdiction */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Scales size={22} className="legal-section-icon" />
          <span>7. Dispute Resolution &amp; Jurisdiction</span>
        </h2>
        <p className="legal-p">
          These Terms are governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>. Any dispute, claim, or controversy arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent civil courts located in <strong>New Delhi, India</strong>.
        </p>
      </section>
    </div>
  );
};

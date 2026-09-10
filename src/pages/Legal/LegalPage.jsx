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
import { ThemeToggle } from '../../components/UI/ThemeToggle';

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
    <div className="legal-page-container font-ui">
      {/* Top Sticky Header */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <div className="legal-header-brand">
            {onBack && (
              <button
                onClick={onBack}
                className="legal-back-btn"
                aria-label="Back to settings"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <img src={logo} alt="Velvet Hearts" className="legal-logo" />
            <div className="legal-header-titles">
              <span className="legal-brand-title font-display">Velvet Hearts</span>
              <span className="legal-brand-sub">Legal &amp; Trust Compliance Center</span>
            </div>
          </div>

          {/* Controls: Tab Switcher & Theme Toggle */}
          <div className="legal-header-controls">
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
            <ThemeToggle />
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
          background-color: #0b080a;
          color: #f7eff3;
          display: flex;
          flex-direction: column;
        }

        /* Solid Luxury Header (No Glassmorphism) */
        .legal-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: #120b10;
          border-bottom: 1px solid rgba(212, 173, 106, 0.22);
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
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
          background-color: #1a1016;
          border: 1px solid rgba(212, 173, 106, 0.25);
          color: #d4adb7;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .legal-back-btn:hover {
          background-color: #8e2b4f;
          color: #ffffff;
          border-color: #d4ad6a;
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
          color: #d4ad6a;
          line-height: 1.2;
        }

        .legal-brand-sub {
          font-size: 0.72rem;
          color: #a89098;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .legal-header-controls {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        /* Solid Matte Tab Switcher */
        .legal-tab-switcher {
          display: flex;
          background-color: #160e14;
          padding: 0.3rem;
          border-radius: 999px;
          border: 1px solid rgba(212, 173, 106, 0.25);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .legal-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1.15rem;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #c7aeb7;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .legal-tab-btn.active {
          background: linear-gradient(135deg, #b8436a 0%, #7c2242 100%);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
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
          border-bottom: 1px solid rgba(212, 173, 106, 0.2);
        }

        .legal-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.95rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background-color: #1b1218;
          border: 1px solid #d4ad6a;
          color: #d4ad6a;
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
          color: #b39aa3;
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

        /* Solid AI Disclosure Card (No Transparency) */
        .ai-disclosure-banner {
          background-color: #190f15;
          border: 1.5px solid #d4ad6a;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1.15rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
        }

        .ai-icon-wrap {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background-color: #271420;
          border: 1px solid rgba(212, 173, 106, 0.45);
          color: #d4ad6a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-banner-content h4 {
          font-size: 1.02rem;
          font-weight: 700;
          color: #d4ad6a;
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .ai-banner-content p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #e6d3db;
          margin: 0;
        }

        /* Solid Matte Section Cards */
        .legal-section-card {
          background-color: #140d12;
          border: 1px solid #2d1824;
          border-radius: 16px;
          padding: 1.85rem;
          margin-bottom: 1.75rem;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .legal-section-card:hover {
          border-color: rgba(212, 173, 106, 0.35);
          transform: translateY(-1px);
        }

        .legal-section-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          border-bottom: 1px solid #22121c;
          padding-bottom: 0.75rem;
        }

        .legal-section-icon {
          color: #e0608b;
        }

        .legal-p {
          font-size: 0.92rem;
          line-height: 1.7;
          color: #d9c5cc;
          margin-bottom: 1rem;
        }

        .legal-p:last-child {
          margin-bottom: 0;
        }

        /* Solid Data Category Tiles */
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
          background-color: #0e080b;
          border: 1px solid #26141f;
          border-radius: 12px;
          padding: 1.15rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .data-cat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.92rem;
          color: #d4ad6a;
          margin-bottom: 0.55rem;
        }

        .data-cat-item ul {
          margin: 0;
          padding-left: 1.2rem;
          font-size: 0.85rem;
          line-height: 1.6;
          color: #cbb2bc;
        }

        .data-cat-item li {
          margin-bottom: 0.35rem;
        }

        /* Solid Callouts */
        .legal-callout-box {
          background-color: #170e14;
          border-left: 4px solid #d4ad6a;
          border-radius: 0 10px 10px 0;
          padding: 1.15rem 1.35rem;
          margin: 1.35rem 0;
          font-size: 0.9rem;
          line-height: 1.65;
          color: #fce8ee;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .legal-callout-box strong {
          color: #d4ad6a;
        }

        /* Solid Emergency Redressal Banner */
        .legal-callout-emergency {
          background-color: #1e0910;
          border: 1.5px solid #d9385d;
          border-left: 5px solid #e24b74;
          border-radius: 12px;
          padding: 1.25rem 1.45rem;
          margin: 1.75rem 0;
          font-size: 0.9rem;
          line-height: 1.7;
          color: #ffe6ec;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .legal-callout-emergency strong {
          color: #ff99b3;
        }

        /* Solid Escalation Steps */
        .escalation-steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 1.25rem;
        }

        @media (min-width: 768px) {
          .escalation-steps {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .escalation-step {
          background-color: #0e080b;
          border: 1px solid #281521;
          border-radius: 12px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .escalation-step-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #d4ad6a;
        }

        .escalation-step-title {
          font-size: 0.94rem;
          font-weight: 600;
          color: #ffffff;
        }

        .escalation-step-desc {
          font-size: 0.83rem;
          color: #c7aeb7;
          line-height: 1.5;
          margin: 0;
        }

        .email-link {
          color: #d4ad6a;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 600;
          word-break: break-all;
          transition: color 0.18s ease;
        }

        .email-link:hover {
          color: #ffffff;
        }

        /* Solid Grievance Card */
        .grievance-card {
          background-color: #100a0e;
          border: 1.5px solid rgba(212, 173, 106, 0.35);
          border-radius: 14px;
          padding: 1.6rem;
          margin-top: 1.25rem;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
        }

        .grievance-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .grievance-detail {
          display: flex;
          flex-direction: column;
          font-size: 0.88rem;
        }

        .grievance-label {
          color: #9e858d;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .grievance-val {
          color: #ffffff;
          font-weight: 600;
        }

        .legal-footer {
          border-top: 1px solid rgba(212, 173, 106, 0.2);
          padding: 2.25rem 1.25rem;
          text-align: center;
          background-color: #0c0709;
        }

        .legal-footer-note {
          font-size: 0.82rem;
          color: #8f7780;
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.55;
        }

        /* ============================================================
           LIGHT MODE ADAPTATION FOR LEGAL PAGE
           ============================================================ */
        [data-theme="light"] .legal-page-container {
          background-color: #FAF7F9;
          color: #2C2426;
        }

        [data-theme="light"] .legal-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid #EAD8E0;
          box-shadow: 0 2px 14px rgba(90, 20, 45, 0.06);
        }

        [data-theme="light"] .legal-back-btn {
          background-color: #F8EDF1;
          border-color: #E2CCD6;
          color: #7A2842;
        }

        [data-theme="light"] .legal-back-btn:hover {
          background-color: #B8436A;
          color: #FFFFFF;
          border-color: #7A2842;
        }

        [data-theme="light"] .legal-brand-title {
          color: #9B3456;
        }

        [data-theme="light"] .legal-brand-sub {
          color: #7A6E70;
        }

        [data-theme="light"] .legal-tab-switcher {
          background-color: #F3E6EC;
          border-color: #E2CCD6;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        [data-theme="light"] .legal-tab-btn {
          color: #6A555D;
        }

        [data-theme="light"] .legal-tab-btn.active {
          background: linear-gradient(135deg, #B8436A 0%, #7A2842 100%);
          color: #FFFFFF;
        }

        [data-theme="light"] .legal-doc-hero {
          border-bottom-color: #EAD8E0;
        }

        [data-theme="light"] .legal-tag-badge {
          background-color: #FFF8FA;
          border-color: #C4964A;
          color: #A07228;
        }

        [data-theme="light"] .legal-doc-title {
          color: #1A1517;
        }

        [data-theme="light"] .legal-doc-meta {
          color: #7A6E70;
        }

        [data-theme="light"] .ai-disclosure-banner {
          background-color: #FFFDF9;
          border-color: #C4964A;
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.05);
        }

        [data-theme="light"] .ai-icon-wrap {
          background-color: #FAEEE0;
          border-color: rgba(196, 150, 74, 0.4);
          color: #B88232;
        }

        [data-theme="light"] .ai-banner-content h4 {
          color: #9E742E;
        }

        [data-theme="light"] .ai-banner-content p {
          color: #3D3335;
        }

        [data-theme="light"] .legal-section-card {
          background-color: #FFFFFF;
          border-color: #EFE4EA;
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.04);
        }

        [data-theme="light"] .legal-section-card:hover {
          border-color: rgba(184, 67, 106, 0.35);
        }

        [data-theme="light"] .legal-section-title {
          color: #2A0812;
          border-bottom-color: #F3E8EE;
        }

        [data-theme="light"] .legal-section-icon {
          color: #B8436A;
        }

        [data-theme="light"] .legal-p {
          color: #4A3C42;
        }

        [data-theme="light"] .data-cat-item {
          background-color: #FAF7F9;
          border-color: #ECDCE4;
        }

        [data-theme="light"] .data-cat-header {
          color: #9E742E;
        }

        [data-theme="light"] .data-cat-item ul {
          color: #5A4E50;
        }

        [data-theme="light"] .legal-callout-box {
          background-color: #FFF9F2;
          border-left-color: #C4964A;
          color: #3D3335;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        [data-theme="light"] .legal-callout-box strong {
          color: #9E742E;
        }

        [data-theme="light"] .legal-callout-emergency {
          background-color: #FFF2F5;
          border-color: #E87A9A;
          border-left-color: #D03B64;
          color: #4A1424;
          box-shadow: 0 4px 18px rgba(184, 67, 106, 0.08);
        }

        [data-theme="light"] .legal-callout-emergency h4 {
          color: #7A1D36 !important;
        }

        [data-theme="light"] .legal-callout-emergency strong {
          color: #A31E44;
        }

        [data-theme="light"] .escalation-step {
          background-color: #FAF7F9;
          border-color: #ECDCE4;
        }

        [data-theme="light"] .escalation-step-badge {
          color: #9E742E;
        }

        [data-theme="light"] .escalation-step-title {
          color: #2A0812;
        }

        [data-theme="light"] .escalation-step-desc {
          color: #5A4E50;
        }

        [data-theme="light"] .email-link {
          color: #B8436A;
        }

        [data-theme="light"] .email-link:hover {
          color: #7A2842;
        }

        [data-theme="light"] .grievance-card {
          background-color: #FFFFFF;
          border-color: rgba(196, 150, 74, 0.45);
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.05);
        }

        [data-theme="light"] .grievance-card h4 {
          color: #2A0812 !important;
        }

        [data-theme="light"] .grievance-label {
          color: #8A737B;
        }

        [data-theme="light"] .grievance-val {
          color: #2C2426;
        }

        [data-theme="light"] .legal-footer {
          border-top-color: #EAD8E0;
          background-color: #F7EFF2;
        }

        [data-theme="light"] .legal-footer-note {
          color: #7A6E70;
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
          <span>DPDPA 2023 &bull; IT Rules 2021 &bull; CERT-In Compliant</span>
        </div>
        <h1 className="legal-doc-title font-display">Privacy Policy &amp; Data Notice</h1>
        <div className="legal-doc-meta">
          <span className="legal-doc-meta-item">
            <Clock size={14} /> Effective Date: September 11, 2026
          </span>
          <span className="legal-doc-meta-item">
            <MapPin size={14} /> Jurisdiction: Republic of India
          </span>
          <span className="legal-doc-meta-item">
            <UserCheck size={14} /> Data Fiduciary: Velvet Hearts (Founder: Indrani Roy)
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
          </h4>
          <p>
            Velvet Hearts operates with total technical transparency. The software application codebase, database architecture, communication schemas, and algorithmic matching mechanisms have been <strong>authored, generated, and synthesized utilizing Advanced Artificial Intelligence (Google DeepMind Antigravity AI Systems)</strong> under continuous human architectural supervision and validation. AI algorithms are deployed strictly for vibe affinity matching, biometric anti-spoofing verification, and safety moderation, operating in complete compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
          </p>
        </div>
      </div>

      {/* Emergency Rule 3(2)(b) Takedown Notice */}
      <div className="legal-callout-emergency">
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <WarningCircle size={18} weight="fill" />
          <span>Emergency 24-Hour Non-Consensual Sexual / Impersonation Material Removal</span>
        </h4>
        <p style={{ margin: 0 }}>
          Under <strong>Rule 3(2)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, if you or someone you represent discovers any content on Velvet Hearts that depicts private areas, partial/full nudity, sexual conduct, or impersonation/deepfake imagery without consent, report it immediately to our Grievance Officer at{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com&su=%5BEMERGENCY%20RULE%203(2)(b)%20TAKEDOWN%5D"
            target="_blank"
            rel="noopener noreferrer"
            className="email-link"
          >
            velvethearts.in@gmail.com
          </a>{" "}
          with subject line <strong>&ldquo;[EMERGENCY RULE 3(2)(b) TAKEDOWN]&rdquo;</strong>. Velvet Hearts will take all reasonable and practicable measures to remove or disable access to such material <strong>within 24 hours of receiving the notice</strong>.
        </p>
      </div>

      {/* 1. Introduction & Regulatory Framework */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <FileText size={22} className="legal-section-icon" />
          <span>1. Regulatory Framework &amp; Data Notice</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates an intentional relationship and discovery platform tailored for authentic connections across India. This Privacy Policy is published in strict compliance with Section 5 of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong> and Rule 3(1) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
        </p>
        <p className="legal-p">
          Under Indian law:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li><strong>Velvet Hearts (founded by Indrani Roy)</strong> serves as the <strong>Data Fiduciary</strong> determining the purpose and means of processing personal data.</li>
          <li>You, as the registered member and citizen/resident of India, are the <strong>Data Principal</strong> entitled to constitutional and statutory privacy rights.</li>
          <li>Our cloud infrastructure and transmission adhere to the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> and <strong>CERT-In Cyber Security Directions 2022</strong>.</li>
        </ul>
      </section>

      {/* 2. Exhaustive Data Storage Disclosure */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <HardDrive size={22} className="legal-section-icon" />
          <span>2. Exhaustive Disclosure of Data Stored &amp; Processed</span>
        </h2>
        <p className="legal-p">
          In strict compliance with Section 5(1) of the DPDP Act 2023, we provide Data Principals with an explicit, itemized inventory of all personal data collected and stored:
        </p>

        <div className="data-category-grid">
          <div className="data-cat-item">
            <div className="data-cat-header">
              <UserCheck size={18} />
              <span>Identity &amp; Authentication Data</span>
            </div>
            <ul>
              <li><strong>Account Credentials &amp; Email:</strong> Authentication conducted via Google Sign-In or verified account credentials with Firebase Auth. <em>(Note: Velvet Hearts does NOT ask for, require, or store your mobile phone number).</em></li>
              <li><strong>Unique Identifiers:</strong> Randomly generated alphanumeric Firebase User ID (UID).</li>
              <li><strong>Legal Name &amp; Date of Birth:</strong> Enforces the mandatory 18+ age threshold under Section 9 of the DPDP Act 2023.</li>
              <li><strong>Gender &amp; Romantic Preferences:</strong> Declared voluntarily to facilitate reciprocal discovery filters.</li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <Fingerprint size={18} />
              <span>Biometric &amp; Photo Authenticity</span>
            </div>
            <ul>
              <li><strong>Curated Profile Photos:</strong> Up to 6 lifestyle pictures stored on SOC2-certified Cloudinary CDN.</li>
              <li><strong>Real-Time Verification Selfie:</strong> Live pose selfie captured solely to verify user authenticity and prevent catfishing.</li>
              <li><strong>16-Zone Face Geometry Descriptors:</strong> Mathematical coordinate vectors used to compare the verification selfie against profile pictures. <em>Raw facial biometric templates are never sold, leased, or exported to external parties.</em></li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <ChatCircleText size={18} />
              <span>In-App Messages &amp; Communications</span>
            </div>
            <ul>
              <li><strong>Direct Messages:</strong> Text chats exchanged between mutually matched users. <em>(Notice: Messages are transmitted over secure HTTPS/TLS network connections, but are NOT end-to-end encrypted or encrypted at rest on the database).</em></li>
              <li><strong>Voice Intros &amp; Audio Notes:</strong> 2-minute voice intros and audio recordings shared with mutual matches.</li>
              <li><strong>Rewind Letters:</strong> Time-locked digital correspondence scheduled for future delivery between connections.</li>
              <li><strong>Our Diary:</strong> Private scrapbook moments, photos, and milestones created mutually between matched couples.</li>
            </ul>
          </div>

          <div className="data-cat-item">
            <div className="data-cat-header">
              <LockKey size={18} />
              <span>Technical, Location &amp; Safety Logs</span>
            </div>
            <ul>
              <li><strong>Device Telemetry:</strong> Device model, OS version, and browser fingerprint to detect unauthorized account takeovers.</li>
              <li><strong>City, State &amp; Distance Radius:</strong> Approximate location for distance matching. Precise GPS is only retrieved upon explicit device permission.</li>
              <li><strong>Safety Audit Logs:</strong> Timestamped block lists, report tickets, dispute notes, and suspension records for law enforcement compliance.</li>
            </ul>
          </div>
        </div>

        <div className="legal-callout-box">
          <strong>Zero Monetization of Data:</strong> Velvet Hearts does <strong>not sell, rent, monetize, or trade</strong> your personal data, biometric vectors, photos, or private communications to data aggregators, advertising brokers, or external AI model training consortiums.
        </div>
      </section>

      {/* 3. Consent Architecture & Purpose Limitation */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <CheckCircle size={22} className="legal-section-icon" />
          <span>3. Lawful Consent Architecture (Section 6, DPDP Act 2023)</span>
        </h2>
        <p className="legal-p">
          All data processing is grounded in <strong>freely given, specific, informed, unconditional, and unambiguous consent</strong> with clear affirmative action. You retain the unconditional right to withdraw consent at any time through Account Settings or by contacting our Grievance Officer. Withdrawal of consent results in immediate cessation of processing and initiation of profile erasure, without impacting lawful processing carried out prior to withdrawal.
        </p>
      </section>

      {/* 4. Statutory Rights of the Data Principal */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Scales size={22} className="legal-section-icon" />
          <span>4. Statutory Rights of Data Principals</span>
        </h2>
        <p className="legal-p">
          Under Sections 11, 12, 13, and 14 of the DPDP Act 2023, you are endowed with enforceable statutory rights:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li><strong>Right to Access Information (Section 11):</strong> Request a summary of personal data being processed, processing activities conducted, and third-party recipients.</li>
          <li><strong>Right to Correction &amp; Updation (Section 12):</strong> Rectify misleading, inaccurate, or incomplete personal data via the in-app Edit Profile suite.</li>
          <li><strong>Right to Erasure (Section 12):</strong> Request permanent deletion of your account and personal data (&ldquo;Right to be Forgotten&rdquo;) via Settings or email.</li>
          <li><strong>Right of Grievance Redressal (Section 13):</strong> Access to rapid, time-bound statutory redressal through our designated Grievance Officer.</li>
          <li><strong>Right to Nominate (Section 14):</strong> Designate a representative who may exercise your privacy rights in the event of death or physical/mental incapacity.</li>
        </ul>
      </section>

      {/* 5. Statutory 180-Day Data Retention */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Clock size={22} className="legal-section-icon" />
          <span>5. Data Retention &amp; Mandatory 180-Day Regulatory Storage</span>
        </h2>
        <p className="legal-p">
          When you delete your account, your profile, photos, voice intros, and matching entries are immediately deactivated and hidden from all users.
        </p>
        <p className="legal-p">
          However, in mandatory compliance with <strong>Rule 3(1)(h) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> and the <strong>CERT-In Cyber Security Directions 2022 (under Section 70B of the IT Act, 2000)</strong>, Velvet Hearts preserves account registration details, authentication timestamps, and transaction logs in secure encrypted cold storage for a minimum statutory period of <strong>180 (one hundred eighty) days</strong> following account deletion, or longer where ordered by a competent court of law or lawful investigative agency. Following expiration of this statutory retention period, all remaining records are permanently expunged.
        </p>
      </section>

      {/* 6. Cybersecurity, Breach Notification & CERT-In */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <LockKey size={22} className="legal-section-icon" />
          <span>6. Cybersecurity Safeguards &amp; Breach Protocol</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts implements industry-standard security practices under Section 8(5) of the DPDP Act 2023 and the SPDI Rules 2011, including TLS 1.3 network transit encryption, strict database access controls, API rate-limiting, and injection mitigations. As disclosed in Section 2, in-app direct messages and voice notes are stored on access-controlled cloud database servers and are not end-to-end encrypted.
        </p>
        <p className="legal-p">
          In the event of an identified personal data breach, Velvet Hearts will formally notify the <strong>Data Protection Board of India (DPBI)</strong> and each affected Data Principal without undue delay, in accordance with <strong>Section 8(6) of the DPDP Act 2023</strong>. Furthermore, relevant cybersecurity incidents will be reported to <strong>CERT-In</strong> within statutory timeframes (within 6 hours of discovery).
        </p>
      </section>

      {/* 7. Cross-Border Data Processing */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <MapPin size={22} className="legal-section-icon" />
          <span>7. Cross-Border Data Processing (Section 16, DPDP Act 2023)</span>
        </h2>
        <p className="legal-p">
          Personal data may be hosted on secure cloud infrastructure provided by Google Firebase (Google Cloud Platform) and Cloudinary CDN. In compliance with <strong>Section 16 of the DPDP Act 2023</strong>, Velvet Hearts only transfers data to countries and territories that are not restricted by the Central Government of India, ensuring equivalent or superior security safeguards.
        </p>
      </section>

      {/* 8. Child Safety & Absolute Minor Ban */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <WarningCircle size={22} className="legal-section-icon" />
          <span>8. Child Protection &amp; Strict 18+ Prohibition (Section 9, DPDP Act)</span>
        </h2>
        <p className="legal-p">
          Under Section 9 of the DPDP Act 2023, Velvet Hearts enforces a <strong>strict, absolute prohibition on users under 18 years of age</strong>. We do not knowingly track, process, or monitor children. Any account found to be operated by an individual under 18 will be permanently terminated with immediate effect and all associated records purged.
        </p>
      </section>

      {/* 9. Statutory Grievance Redressal & Point of Contact */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <EnvelopeSimple size={22} className="legal-section-icon" />
          <span>9. Statutory Grievance Redressal Officer &amp; Escalation Mechanism</span>
        </h2>
        <p className="legal-p">
          In compliance with Rule 3(2)(a) of the IT Rules 2021 and Section 13 of the DPDP Act 2023, Velvet Hearts has appointed a designated Grievance &amp; Data Protection Officer:
        </p>

        <div className="grievance-card">
          <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
            Grievance Redressal &amp; Data Protection Officer
          </h4>
          <div className="grievance-row">
            <div className="grievance-detail">
              <span className="grievance-label">Designated Officer</span>
              <span className="grievance-val">Indrani Roy (Founder &amp; Designated Grievance Officer)</span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Official Grievance Email</span>
              <span className="grievance-val">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="email-link"
                >
                  velvethearts.in@gmail.com
                </a>
              </span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Statutory Response SLA</span>
              <span className="grievance-val">Acknowledged in 24h &bull; Resolved in 15 days (24h for Rule 3(2)(b))</span>
            </div>
          </div>
        </div>

        <p className="legal-p" style={{ marginTop: '1.5rem' }}>
          <strong>3-Tier Grievance Escalation Hierarchy:</strong>
        </p>
        <div className="escalation-steps">
          <div className="escalation-step">
            <span className="escalation-step-badge">Tier 1 &bull; Internal</span>
            <span className="escalation-step-title">Grievance Officer</span>
            <p className="escalation-step-desc">
              Submit your complaint directly to{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="email-link"
              >
                velvethearts.in@gmail.com
              </a>
              . Acknowledgment guaranteed within 24 hours.
            </p>
          </div>
          <div className="escalation-step">
            <span className="escalation-step-badge">Tier 2 &bull; IT Rules 2021</span>
            <span className="escalation-step-title">Grievance Appellate Committee (GAC)</span>
            <p className="escalation-step-desc">
              If dissatisfied with our resolution, appeal to the Central Government&rsquo;s GAC at <a href="https://gac.gov.in" target="_blank" rel="noopener noreferrer" className="email-link">https://gac.gov.in</a> within 30 days under Rule 3A.
            </p>
          </div>
          <div className="escalation-step">
            <span className="escalation-step-badge">Tier 3 &bull; DPDP Act 2023</span>
            <span className="escalation-step-title">Data Protection Board of India</span>
            <p className="escalation-step-desc">
              Data Principals may lodge formal complaints alleging statutory privacy non-compliance directly with the <strong>Data Protection Board of India (DPBI)</strong>.
            </p>
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
          <span>IT Act 2000 &bull; IT Rules 2021 &bull; Contract Act 1872 Compliant</span>
        </div>
        <h1 className="legal-doc-title font-display">Terms of Service &amp; User Agreement</h1>
        <div className="legal-doc-meta">
          <span className="legal-doc-meta-item">
            <Clock size={14} /> Effective Date: September 11, 2026
          </span>
          <span className="legal-doc-meta-item">
            <MapPin size={14} /> Jurisdiction: Courts of New Delhi, India
          </span>
          <span className="legal-doc-meta-item">
            <ShieldCheck size={14} /> Governed by the Laws of India
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
            <span>AI-Authored Software Architecture &amp; Algorithmic Heuristics Notice</span>
          </h4>
          <p>
            Users acknowledge that Velvet Hearts software, backend infrastructure, compatibility metrics, and user safety monitors are <strong>authored, generated, and synthesized utilizing Advanced Artificial Intelligence (Google DeepMind Antigravity AI Systems)</strong> under ongoing human oversight. Compatibility percentages are entertaining affinity suggestions and do not constitute character endorsements, background verifications, or relationship warranties. The service is provided strictly on an &ldquo;AS-IS&rdquo; and &ldquo;AS-AVAILABLE&rdquo; basis.
          </p>
        </div>
      </div>

      {/* Emergency Rule 3(2)(b) Banner */}
      <div className="legal-callout-emergency">
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <WarningCircle size={18} weight="fill" />
          <span>Rule 3(2)(b) Emergency Takedown Mechanism (24-Hour SLA)</span>
        </h4>
        <p style={{ margin: 0 }}>
          If any user uploads non-consensual sexual material, nudity, intimate content, or impersonated/morphed media of you, email our Grievance Officer immediately at{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com&su=%5BEMERGENCY%20RULE%203(2)(b)%20TAKEDOWN%5D"
            target="_blank"
            rel="noopener noreferrer"
            className="email-link"
          >
            velvethearts.in@gmail.com
          </a>
          . Velvet Hearts enforces a zero-tolerance policy and guarantees access removal <strong>within 24 hours of complaint receipt</strong>.
        </p>
      </div>

      {/* 1. Acceptance of Terms */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <FileText size={22} className="legal-section-icon" />
          <span>1. Acceptance of Terms &amp; Binding Contract</span>
        </h2>
        <p className="legal-p">
          By downloading, installing, registering, or accessing Velvet Hearts (&ldquo;App&rdquo; or &ldquo;Platform&rdquo;), you enter into a legally enforceable contract under the <strong>Indian Contract Act, 1872</strong> with Velvet Hearts (founded by Indrani Roy). If you do not accept all terms of this User Agreement, you are not authorized to use the Service and must delete your account immediately.
        </p>
      </section>

      {/* 2. Eligibility & 18+ Verification */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <UserCheck size={22} className="legal-section-icon" />
          <span>2. Eligibility &amp; Statutory Disqualifications</span>
        </h2>
        <p className="legal-p">
          By creating an account, you solemnly represent, warrant, and covenant that:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li>You are at least <strong>18 (eighteen) years of age</strong> as of the registration date.</li>
          <li>You have the legal capacity to enter into a valid contract under Indian law.</li>
          <li>You have never been convicted of any sexual offense, violent crime, cyber harassment, or moral turpitude under the <strong>Bharatiya Nyaya Sanhita, 2023 (BNS)</strong>, <strong>Protection of Children from Sexual Offences (POCSO) Act, 2012</strong>, or equivalent criminal statutes.</li>
          <li>You are not barred from using communications services under the laws of India.</li>
          <li>You will maintain only one verified personal account on the Platform.</li>
        </ul>
      </section>

      {/* 3. Comprehensive Rule 3(1)(b) Prohibited Conduct */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <WarningCircle size={22} className="legal-section-icon" />
          <span>3. User Conduct &amp; Prohibited Content (Rule 3(1)(b) IT Rules 2021)</span>
        </h2>
        <p className="legal-p">
          In mandatory adherence to <strong>Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, as amended, you covenant that you shall NOT host, display, upload, modify, publish, transmit, store, update, or share any information that:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li>Belongs to another person and to which you do not have any right.</li>
          <li>Is obscene, pornographic, paedophilic, invasive of another&rsquo;s bodily privacy, insulting or harassing on the basis of gender, racially or ethnically objectionable, or relating to or encouraging money laundering or gambling.</li>
          <li>Is harmful to child or minor in any manner whatsoever.</li>
          <li>Infringes any patent, trademark, copyright, or other proprietary rights of any third party.</li>
          <li>Deceives or misleads the addressee about the origin of the message or knowingly transmits any information which is patently false or misleading in nature.</li>
          <li>Impersonates another person (including creating fraudulent catfish profiles or sharing someone else&rsquo;s photos/identity).</li>
          <li>Threatens the unity, integrity, defence, security, or sovereignty of India, friendly relations with foreign states, or public order, or causes incitement to the commission of any cognisable offence or prevents investigation of any offence.</li>
          <li>Contains software virus or any other computer code, file, or program designed to interrupt, destroy, or limit the functionality of any computer resource.</li>
          <li>Is in the nature of an online game that is not verified as a permissible online game, or involves real-money gambling.</li>
          <li>Is patently false, untrue, or misleading in nature with intent to deceive or harass any person or entity.</li>
        </ul>

        <div className="legal-callout-box">
          <strong>Zero Tolerance &amp; Law Enforcement Reporting:</strong> Any violation of Rule 3(1)(b) results in immediate, non-appealable account ban, device fingerprint blacklisting, and where deemed necessary, proactive transmission of records to law enforcement authorities.
        </div>
      </section>

      {/* 4. Criminal Liabilities & Penal Provisions */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Scales size={22} className="legal-section-icon" />
          <span>4. Criminal Liabilities under Bharatiya Nyaya Sanhita &amp; IT Act</span>
        </h2>
        <p className="legal-p">
          Users are formally cautioned that engaging in harassment, non-consensual recordings, identity theft, or extortion on Velvet Hearts triggers severe criminal liabilities under Indian law:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li><strong>Section 66E, IT Act 2000:</strong> Capturing or transmitting images of private body areas without consent (imprisonment up to 3 years or fine up to ₹2,00,000).</li>
          <li><strong>Section 67 &amp; 67A, IT Act 2000:</strong> Transmitting obscene or sexually explicit material in electronic form (rigorous imprisonment up to 5 years / 7 years).</li>
          <li><strong>Section 67B, IT Act 2000:</strong> Depicting children in sexually explicit acts (rigorous imprisonment up to 7 years).</li>
          <li><strong>Sections 75, 78 &amp; 79, Bharatiya Nyaya Sanhita 2023 (BNS):</strong> Sexual harassment, cyber stalking, and assault or criminal force to outrage the modesty of a woman.</li>
          <li><strong>Sections 318 &amp; 319, BNS:</strong> Cheating by personation (catfishing and romance fraud).</li>
          <li><strong>Section 308, BNS:</strong> Extortion, sextortion, and coercion.</li>
        </ul>
        <p className="legal-p">
          Velvet Hearts cooperates fully with Cyber Crime Cells and Indian Law Enforcement Agencies (LEAs) under <strong>Section 94 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)</strong> / Section 91 CrPC upon receiving lawful notices.
        </p>
      </section>

      {/* 5. Intermediary Status & Safe Harbor (Section 79) */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <LockKey size={22} className="legal-section-icon" />
          <span>5. Intermediary Status &amp; Safe Harbor (Section 79, IT Act 2000)</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts qualifies as an <em>intermediary</em> under Section 2(1)(w) of the Information Technology Act, 2000. In accordance with Section 79 of the IT Act, Velvet Hearts provides a platform for user interactions and is not responsible or liable for user-generated content, chats, voice notes, or off-platform physical interactions, provided due diligence obligations under the IT Rules 2021 are maintained.
        </p>
      </section>

      {/* 6. Offline Dating & Real-World Encounters */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <ShieldCheck size={22} className="legal-section-icon" />
          <span>6. Offline Safety &amp; Assumption of Risk</span>
        </h2>
        <p className="legal-p">
          Velvet Hearts does <strong>not conduct criminal background checks</strong> on its members. You agree that you are solely and exclusively responsible for your interactions with other users. You acknowledge the inherent risks in online dating and agree to exercise personal caution: always meet in public locations, inform trusted friends or family, and never transfer money, UPI payments, cryptocurrency, or banking OTPs to anyone met on the Platform.
        </p>
      </section>

      {/* 7. Limitation of Liability & Disclaimers */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <WarningCircle size={22} className="legal-section-icon" />
          <span>7. Comprehensive Limitation of Liability &amp; Disclaimers</span>
        </h2>
        <p className="legal-p">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INDIAN LAW, VELVET HEARTS, ITS CREATORS, DEVELOPERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, ARISING OUT OF:
        </p>
        <ul className="legal-p" style={{ paddingLeft: '1.4rem' }}>
          <li>YOUR ACCESS TO, USE OF, OR INABILITY TO ACCESS THE SERVICE;</li>
          <li>THE CONDUCT OR CONTENT OF ANY USER OR THIRD PARTY ON THE SERVICE;</li>
          <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT OR DATA;</li>
          <li>OFFLINE IN-PERSON DATING ENCOUNTERS, PHYSICAL DISPUTES, OR FINANCIAL TRANSACTIONS BETWEEN USERS.</li>
        </ul>
      </section>

      {/* 8. Intellectual Property & AI Codebase License */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Cpu size={22} className="legal-section-icon" />
          <span>8. Intellectual Property &amp; User Content License</span>
        </h2>
        <p className="legal-p">
          All proprietary trademarks, logos, visual designs, and AI-synthesized software code comprising Velvet Hearts remain the exclusive property of Velvet Hearts Technologies. You retain copyright in the photos and prompts you submit; however, by uploading content, you grant Velvet Hearts a non-exclusive, royalty-free, worldwide license to host, display, and format your content solely for operating the platform.
        </p>
      </section>

      {/* 9. Grievance Redressal & Point of Contact */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <EnvelopeSimple size={22} className="legal-section-icon" />
          <span>9. Grievance Redressal &amp; Point of Contact</span>
        </h2>
        <p className="legal-p">
          For any legal inquiries, rule violations, or technical grievances, contact our Grievance Officer:
        </p>
        <div className="grievance-card">
          <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
            Statutory Grievance Officer
          </h4>
          <div className="grievance-row">
            <div className="grievance-detail">
              <span className="grievance-label">Designated Officer</span>
              <span className="grievance-val">Indrani Roy (Founder &amp; Designated Grievance Officer)</span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Official Contact Email</span>
              <span className="grievance-val">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="email-link"
                >
                  velvethearts.in@gmail.com
                </a>
              </span>
            </div>
            <div className="grievance-detail">
              <span className="grievance-label">Statutory Redressal SLA</span>
              <span className="grievance-val">24h Acknowledgment &bull; 15 Days Resolution (24h for Rule 3(2)(b))</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Governing Law & Dispute Resolution */}
      <section className="legal-section-card">
        <h2 className="legal-section-title font-display">
          <Scales size={22} className="legal-section-icon" />
          <span>10. Governing Law &amp; Exclusive Jurisdiction</span>
        </h2>
        <p className="legal-p">
          These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>, without regard to conflict of law principles. Any dispute, litigation, or legal proceeding arising out of these Terms shall be subject to the <strong>exclusive jurisdiction of the competent civil courts located in New Delhi, India</strong>.
        </p>
      </section>
    </div>
  );
};

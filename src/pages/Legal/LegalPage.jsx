import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  Cpu,
  LockKey,
  Scales,
  UserCheck,
  Eye,
  CheckCircle,
  WarningCircle,
  ArrowLeft,
  EnvelopeSimple,
  MapPin,
  Clock,
  Sparkle,
  Fingerprint,
  ChatCircleText,
  HardDrive,
  MagnifyingGlass,
  ArrowUpRight,
  HandHeart,
  Prohibit,
  Warning,
  Article,
  ShareNetwork,
  Printer,
  X,
  CaretRight,
  Info
} from '@phosphor-icons/react';
import logo from '../../assets/velvet-heart-logo.png';
import { ThemeToggle } from '../../components/UI/ThemeToggle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LegalPage = ({ initialTab = 'privacy', onBack }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'privacy' | 'terms' | 'guidelines'
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingSectionIds, setMatchingSectionIds] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const bentoRef = useRef(null);
  const contentRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (initialTab && ['privacy', 'terms', 'guidelines'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Push URL state when tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchQuery('');
    try {
      window.history.pushState({}, '', `/${newTab}`);
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle detail card explanation
  const toggleDetail = (key) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy clause permalink to clipboard
  const copyClauseLink = (id) => {
    const url = `${window.location.origin}/${activeTab}#${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  // GSAP Entrance & Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        '.legal-hero-elem',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      // Bento cards reveal
      gsap.fromTo(
        '.legal-bento-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power2.out',
          delay: 0.25,
        }
      );

      // ScrollTrigger for sections
      const sections = document.querySelectorAll('.legal-doc-section');
      sections.forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 35%',
          end: 'bottom 35%',
          onEnter: () => setActiveSection(sec.id),
          onEnterBack: () => setActiveSection(sec.id),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Real-time Provision Search Filtering
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      const sections = document.querySelectorAll('.legal-doc-section');
      sections.forEach((sec) => {
        sec.style.display = '';
        sec.classList.remove('legal-search-match');
      });
      setMatchingSectionIds(null);
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const sections = document.querySelectorAll('.legal-doc-section');
    const matched = new Set();

    sections.forEach((sec) => {
      const text = (sec.textContent || sec.innerText || '').toLowerCase();
      if (text.includes(query)) {
        sec.style.display = '';
        sec.classList.add('legal-search-match');
        matched.add(sec.id);
      } else {
        sec.style.display = 'none';
        sec.classList.remove('legal-search-match');
      }
    });

    setMatchingSectionIds(matched);
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, [searchQuery, activeTab]);

  // Current tab metadata
  const tabDetails = {
    privacy: {
      badge: 'DPDPA 2023 • IT Rules 2021 • CERT-In Compliant',
      title: 'Privacy & Data Governance Architecture',
      subtitle: 'Complete transparency on stored biometric vectors, zero data monetization, and algorithmic privacy under the Digital Personal Data Protection Act, 2023.',
      date: 'September 11, 2026',
      jurisdiction: 'Republic of India',
      fiduciary: 'Velvet Hearts (Founder: Indrani Roy)',
    },
    terms: {
      badge: 'IT Act 2000 • IT Rules 2021 • Contract Act 1872 Compliant',
      title: 'User Agreement & Intermediary Terms of Service',
      subtitle: 'Legally enforceable covenant governing platform access, prohibited conduct under Rule 3(1)(b), criminal liabilities under BNS 2023, and intermediary safe harbor.',
      date: 'September 11, 2026',
      jurisdiction: 'Courts of New Delhi, India',
      fiduciary: 'Velvet Hearts Technologies',
    },
    guidelines: {
      badge: 'Honor & Safety Code • Zero Tolerance Anti-Harassment',
      title: 'Community Integrity Code & Conduct Standards',
      subtitle: 'Our shared commitment to authentic human connection, mutual consent, verified identity, zero catfishing, and transparent accountability.',
      date: 'September 11, 2026',
      jurisdiction: 'Worldwide Community Standards',
      fiduciary: 'Velvet Hearts Safety Board',
    },
  }[activeTab];

  return (
    <div ref={containerRef} className="legal-universe font-ui overflow-x-hidden min-h-screen">
      {/* Dynamic Ambient Background Glows */}
      <div className="legal-ambient-glow legal-ambient-primary" aria-hidden="true" />
      <div className="legal-ambient-glow legal-ambient-secondary" aria-hidden="true" />
      <div className="legal-grid-mesh" aria-hidden="true" />

      {/* Top Floating Glass Navigation Header */}
      <header className="legal-nav-bar">
        <div className="legal-nav-inner">
          <div className="legal-nav-left">
            {onBack && (
              <button
                onClick={onBack}
                className="legal-action-btn back-btn"
                aria-label="Navigate back"
              >
                <ArrowLeft size={16} weight="bold" />
                <span>Back</span>
              </button>
            )}
            <div className="legal-brand-pill">
              <img src={logo} alt="Velvet Hearts" className="legal-nav-logo" />
              <div className="legal-brand-text">
                <span className="legal-nav-brand font-display">Velvet Hearts</span>
                <span className="legal-nav-status">Legal &amp; Trust Node</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <nav className="legal-tab-track" role="tablist" aria-label="Legal document selection">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'privacy'}
              className={`legal-tab-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => handleTabChange('privacy')}
            >
              <ShieldCheck size={16} weight={activeTab === 'privacy' ? 'fill' : 'regular'} />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'terms'}
              className={`legal-tab-item ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => handleTabChange('terms')}
            >
              <Scales size={16} weight={activeTab === 'terms' ? 'fill' : 'regular'} />
              <span>Terms of Service</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'guidelines'}
              className={`legal-tab-item ${activeTab === 'guidelines' ? 'active' : ''}`}
              onClick={() => handleTabChange('guidelines')}
            >
              <HandHeart size={16} weight={activeTab === 'guidelines' ? 'fill' : 'regular'} />
              <span>Community Guidelines</span>
            </button>
          </nav>

          {/* Right Controls: Search, Print, Theme */}
          <div className="legal-nav-right">
            <div className="legal-search-wrap">
              <MagnifyingGlass size={15} className="legal-search-icon" />
              <input
                type="text"
                placeholder="Search provisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="legal-search-input"
                aria-label="Search legal provisions"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="legal-search-clear"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="legal-action-btn icon-only"
              title="Print or Export PDF"
              aria-label="Print legal document"
            >
              <Printer size={16} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="legal-main-wrap max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32">
        {/* ATTENTION: Ultra-Wide Cinematic Hero Section */}
        <section ref={heroRef} className="legal-hero py-12 md:py-16 text-center">
          <div className="legal-hero-elem inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border legal-badge-pill mb-6">
            <Sparkle size={14} weight="fill" className="legal-badge-icon" />
            <span>{tabDetails.badge}</span>
          </div>

          <h1 className="legal-hero-elem legal-hero-title font-display text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
            {tabDetails.title}
          </h1>

          <p className="legal-hero-elem legal-hero-subtitle font-ui text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            {tabDetails.subtitle}
          </p>

          <div className="legal-hero-elem legal-hero-meta flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="legal-accent-icon" /> Effective: {tabDetails.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="legal-accent-icon" /> Jurisdiction: {tabDetails.jurisdiction}
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck size={15} className="legal-accent-icon" /> Fiduciary: {tabDetails.fiduciary}
            </span>
          </div>
        </section>

        {/* AI Systems & Algorithmic Transparency Beacon Card */}
        <div className="legal-ai-beacon-card mb-10 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="legal-ai-beacon-icon flex-shrink-0">
                <Cpu size={28} weight="duotone" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="legal-beacon-title text-base font-bold tracking-wide">
                    Autonomous Codebase &amp; Algorithmic Safety Notice
                  </h2>
                  <span className="legal-live-indicator" title="Continuously Audited">
                    <span className="legal-live-dot" />
                    <span>Audited</span>
                  </span>
                </div>
                <p className="legal-beacon-text text-sm leading-relaxed">
                  The Velvet Hearts software systems, communication protocols, database schemas, and discovery affinity matching heuristics are <strong>authored, generated, and synthesized utilizing Advanced Artificial Intelligence (Google DeepMind Antigravity AI Systems)</strong> under human supervisory stewardship. All data processing operates strictly in compliance with Indian IT Rules and the Digital Personal Data Protection Act, 2023.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 self-end sm:self-center">
              <a
                href="#takedown-notice"
                className="legal-takedown-quick-link inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                <span>Emergency 24h Takedown</span>
                <ArrowUpRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </div>

        {/* INTEREST: Gapless Bento Grid of Foundational Pillars */}
        <section ref={bentoRef} className="legal-bento-section mb-16">
          <div className="legal-bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-4">
            {/* Card 1: Biometric Vector Isolation (Span 2 cols) */}
            <div className="legal-bento-card col-span-1 md:col-span-2 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bento-badge-tag mb-3">
                  <Fingerprint size={16} className="text-[#e27396]" />
                  <span>Biometric Protection</span>
                </div>
                <h3 className="legal-bento-title text-lg font-bold mb-2 font-display">
                  16-Zone Facial Coordinate Descriptors
                </h3>
                <p className="legal-bento-text text-sm leading-relaxed">
                  Real-time selfie verification extracts temporary geometric spatial coordinates to mathematically verify profile authenticity against catfishing. Raw facial biometrics are strictly isolated and <strong>never exported, sold, or trained into third-party commercial AI models</strong>.
                </p>
              </div>
              <div className="legal-bento-footer mt-4 pt-3 flex items-center justify-between text-xs">
                <span>DPDPA Section 8(5) Compliant</span>
                <span className="legal-accent-tag font-medium">Encrypted Cold Isolation</span>
              </div>
            </div>

            {/* Card 2: Emergency Rule 3(2)(b) SLA (Span 2 cols on desktop) */}
            <div id="takedown-notice" className="legal-bento-card emergency-card col-span-1 md:col-span-2 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bento-badge-tag emergency mb-3">
                  <WarningCircle size={16} weight="fill" className="emergency-icon" />
                  <span>Statutory Emergency Takedown</span>
                </div>
                <h3 className="emergency-title text-lg font-bold mb-2 font-display">
                  Rule 3(2)(b) 24-Hour Removal Protocol
                </h3>
                <p className="emergency-text text-sm leading-relaxed">
                  If non-consensual intimate imagery, nudity, deepfakes, or impersonation content appears, report directly to our Grievance Officer. Velvet Hearts guarantees access deactivation <strong>within 24 hours of notice receipt</strong>.
                </p>
              </div>
              <div className="emergency-footer mt-4 pt-3 flex items-center justify-between">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com&su=%5BEMERGENCY%20RULE%203(2)(b)%20TAKEDOWN%5D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="emergency-action-btn inline-flex items-center gap-2 text-xs font-bold"
                >
                  <EnvelopeSimple size={15} weight="bold" />
                  <span>velvethearts.in@gmail.com</span>
                </a>
                <span className="emergency-sla text-xs font-mono font-semibold">SLA: &lt; 24h</span>
              </div>
            </div>

            {/* Card 3: Zero Data Commercialization */}
            <div className="legal-bento-card col-span-1 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bento-badge-tag mb-3">
                  <LockKey size={16} className="legal-accent-icon" />
                  <span>Privacy Pledge</span>
                </div>
                <h3 className="legal-bento-title text-base font-bold mb-2 font-display">
                  Zero Data Monetization
                </h3>
                <p className="legal-bento-text text-xs leading-relaxed">
                  We never sell, rent, or trade your personal conversations, phone numbers, or match history to ad brokers, data aggregators, or credit bureaus.
                </p>
              </div>
              <div className="legal-bento-footer mt-4 pt-3 text-xs legal-accent-tag font-medium">
                No Ad Trackers
              </div>
            </div>

            {/* Card 4: Statutory 180-Day Regulatory Retention */}
            <div className="legal-bento-card col-span-1 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bento-badge-tag mb-3">
                  <HardDrive size={16} className="text-[#a78bfa]" />
                  <span>Statutory Retention</span>
                </div>
                <h3 className="legal-bento-title text-base font-bold mb-2 font-display">
                  180-Day CERT-In Retention
                </h3>
                <p className="legal-bento-text text-xs leading-relaxed">
                  Per Rule 3(1)(h) IT Rules 2021, deleted account metadata is preserved in cold encrypted isolation for 180 days for statutory investigative agencies before permanent deletion.
                </p>
              </div>
              <div className="legal-bento-footer mt-4 pt-3 text-xs font-medium text-[#a78bfa]">
                Cryptographic Purge
              </div>
            </div>

            {/* Card 5: Criminal Penalties under BNS 2023 (Span 2 cols) */}
            <div className="legal-bento-card col-span-1 md:col-span-2 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="bento-badge-tag mb-3">
                  <Scales size={16} className="text-[#e27396]" />
                  <span>Criminal Liabilities</span>
                </div>
                <h3 className="legal-bento-title text-lg font-bold mb-2 font-display">
                  Bharatiya Nyaya Sanhita (BNS) Enforcement
                </h3>
                <p className="legal-bento-text text-sm leading-relaxed">
                  Cyberstalking, romance scamming, sextortion, and non-consensual recordings attract severe criminal punishment under Sections 75, 78, 308, 318 of BNS 2023 and Section 66E of the IT Act. Full investigative cooperation is rendered to law enforcement.
                </p>
              </div>
              <div className="legal-bento-footer mt-4 pt-3 flex items-center justify-between text-xs">
                <span>Sec 94 BNSS Legal Cooperation</span>
                <span className="legal-accent-rose-tag font-medium">Zero Tolerance</span>
              </div>
            </div>
          </div>
        </section>

        {/* DESIRE: Interactive Reading Architecture with Pinned TOC */}
        <div ref={contentRef} className="legal-doc-layout grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pinned Table of Contents */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block">
            <div className="legal-toc-card p-5 rounded-2xl">
              <div className="legal-toc-header flex items-center justify-between mb-4 pb-3">
                <span className="legal-toc-title text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Article size={16} className="legal-accent-icon" />
                  <span>Table of Contents</span>
                </span>
                <span className="legal-toc-badge text-[11px] font-mono">
                  {activeTab.toUpperCase()}
                </span>
              </div>

              <nav className="legal-toc-list space-y-1">
                {activeTab === 'privacy' && (
                  <>
                    <TocLink id="priv-sec-1" title="1. Regulatory Notice & Data Fiduciary" active={activeSection === 'priv-sec-1'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-1')} />
                    <TocLink id="priv-sec-2" title="2. Personal Data Stored & Processed" active={activeSection === 'priv-sec-2'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-2')} />
                    <TocLink id="priv-sec-3" title="3. Lawful Consent Architecture" active={activeSection === 'priv-sec-3'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-3')} />
                    <TocLink id="priv-sec-4" title="4. Statutory Rights of Data Principal" active={activeSection === 'priv-sec-4'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-4')} />
                    <TocLink id="priv-sec-5" title="5. 180-Day Regulatory Retention" active={activeSection === 'priv-sec-5'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-5')} />
                    <TocLink id="priv-sec-6" title="6. Cybersecurity & CERT-In Incident SLA" active={activeSection === 'priv-sec-6'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-6')} />
                    <TocLink id="priv-sec-7" title="7. Cross-Border Cloud Safeguards" active={activeSection === 'priv-sec-7'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-7')} />
                    <TocLink id="priv-sec-8" title="8. Absolute Minor Prohibition (18+)" active={activeSection === 'priv-sec-8'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-8')} />
                    <TocLink id="priv-sec-9" title="9. Grievance Officer & Escalation" active={activeSection === 'priv-sec-9'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('priv-sec-9')} />
                  </>
                )}

                {activeTab === 'terms' && (
                  <>
                    <TocLink id="terms-sec-1" title="1. Acceptance & Binding Contract" active={activeSection === 'terms-sec-1'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-1')} />
                    <TocLink id="terms-sec-2" title="2. Eligibility & Disqualifications" active={activeSection === 'terms-sec-2'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-2')} />
                    <TocLink id="terms-sec-3" title="3. Prohibited Conduct (Rule 3(1)(b))" active={activeSection === 'terms-sec-3'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-3')} />
                    <TocLink id="terms-sec-4" title="4. Criminal Penalties (BNS & IT Act)" active={activeSection === 'terms-sec-4'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-4')} />
                    <TocLink id="terms-sec-5" title="5. Intermediary Safe Harbor (Sec 79)" active={activeSection === 'terms-sec-5'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-5')} />
                    <TocLink id="terms-sec-6" title="6. Offline Dating & Risk Assumption" active={activeSection === 'terms-sec-6'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-6')} />
                    <TocLink id="terms-sec-7" title="7. Disclaimers & Liability Caps" active={activeSection === 'terms-sec-7'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-7')} />
                    <TocLink id="terms-sec-8" title="8. Intellectual Property & AI Codebase" active={activeSection === 'terms-sec-8'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-8')} />
                    <TocLink id="terms-sec-9" title="9. Grievance Redressal SLA" active={activeSection === 'terms-sec-9'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-9')} />
                    <TocLink id="terms-sec-10" title="10. Governing Law & Jurisdiction" active={activeSection === 'terms-sec-10'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('terms-sec-10')} />
                  </>
                )}

                {activeTab === 'guidelines' && (
                  <>
                    <TocLink id="guide-sec-1" title="1. Core Philosophy of Intentional Discovery" active={activeSection === 'guide-sec-1'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-1')} />
                    <TocLink id="guide-sec-2" title="2. Identity Authenticity & Photo Standards" active={activeSection === 'guide-sec-2'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-2')} />
                    <TocLink id="guide-sec-3" title="3. Respectful Communication & Audio Notes" active={activeSection === 'guide-sec-3'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-3')} />
                    <TocLink id="guide-sec-4" title="4. Zero Tolerance for Harassment & Abuse" active={activeSection === 'guide-sec-4'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-4')} />
                    <TocLink id="guide-sec-5" title="5. Financial Safety & Anti-Scam Rules" active={activeSection === 'guide-sec-5'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-5')} />
                    <TocLink id="guide-sec-6" title="6. Real-World Date Protocol" active={activeSection === 'guide-sec-6'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-6')} />
                    <TocLink id="guide-sec-7" title="7. Reporting, Triaging & Dispute Channels" active={activeSection === 'guide-sec-7'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-7')} />
                    <TocLink id="guide-sec-8" title="8. Three-Strike Account Sanctions" active={activeSection === 'guide-sec-8'} isHidden={matchingSectionIds !== null && !matchingSectionIds.has('guide-sec-8')} />
                  </>
                )}

                {matchingSectionIds !== null && matchingSectionIds.size === 0 && (
                  <div className="py-4 text-xs opacity-60 text-center font-ui">
                    No matching provisions in this document
                  </div>
                )}
              </nav>

              <div className="legal-toc-footer mt-6 pt-4 flex items-center justify-between text-xs">
                <span>Need immediate help?</span>
                <a
                  href="mailto:velvethearts.in@gmail.com"
                  className="legal-accent-link font-semibold"
                >
                  Contact Trust Desk
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Exhaustive Legal Clauses */}
          <div className="lg:col-span-8 space-y-8">
            {searchQuery && (
              <div className="legal-search-banner flex items-center justify-between p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <MagnifyingGlass size={14} className="text-[#e27396]" />
                  <span>
                    Found <strong>{matchingSectionIds !== null ? matchingSectionIds.size : 0}</strong>{' '}
                    {matchingSectionIds?.size === 1 ? 'provision' : 'provisions'} matching{' '}
                    <strong>&ldquo;{searchQuery}&rdquo;</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="legal-search-reset underline font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

            {searchQuery && matchingSectionIds !== null && matchingSectionIds.size === 0 && (
              <div className="legal-no-results p-8 text-center rounded-2xl border my-4 bg-[var(--legal-card-bg)] border-[var(--legal-border)]">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-[#e27396]/10 text-[#e27396]">
                  <MagnifyingGlass size={22} weight="bold" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">No matching provisions found</h3>
                <p className="text-sm opacity-70 max-w-md mx-auto mb-5 font-ui">
                  We couldn&apos;t find any clauses matching &ldquo;{searchQuery}&rdquo; in the {tabDetails.title}. Try searching these common regulatory terms:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {['Biometrics', 'DPDP Act', 'Retention', 'CERT-In', 'Consent', 'Minor (18+)', 'Grievance', 'BNS'].map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSearchQuery(topic)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--legal-border)] hover:border-[#e27396] transition-colors cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#e27396] text-white hover:bg-[#d05c80] transition-colors cursor-pointer"
                >
                  Reset Search Filter
                </button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <PrivacyClauses
                searchQuery={searchQuery}
                onCopy={copyClauseLink}
                copiedId={copiedId}
                expandedDetails={expandedDetails}
                toggleDetail={toggleDetail}
              />
            )}
            {activeTab === 'terms' && (
              <TermsClauses
                searchQuery={searchQuery}
                onCopy={copyClauseLink}
                copiedId={copiedId}
                expandedDetails={expandedDetails}
                toggleDetail={toggleDetail}
              />
            )}
            {activeTab === 'guidelines' && (
              <GuidelinesClauses
                searchQuery={searchQuery}
                onCopy={copyClauseLink}
                copiedId={copiedId}
                expandedDetails={expandedDetails}
                toggleDetail={toggleDetail}
              />
            )}
          </div>
        </div>

        {/* ACTION: Statutory Grievance Redressal & Escalation Terminal */}
        <section className="legal-grievance-terminal mt-20 p-8 rounded-3xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="max-w-xl">
              <div className="legal-terminal-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Scales size={14} weight="bold" />
                <span>Statutory Dispute Escalation Node</span>
              </div>
              <h2 className="legal-terminal-title text-2xl font-bold font-display mb-3">
                Three-Tier Redressal Hierarchy (IT Rules 2021 &amp; DPDPA 2023)
              </h2>
              <p className="legal-terminal-desc text-sm leading-relaxed mb-6">
                Under Rule 3(2)(a) of the Information Technology Rules 2021 and Section 13 of the Digital Personal Data Protection Act 2023, Data Principals possess an enforceable right to rapid grievance resolution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="legal-terminal-subcard p-4 rounded-xl">
                  <span className="legal-tier-badge text-[11px] font-bold uppercase tracking-wider block mb-1">
                    Tier 1 • Internal
                  </span>
                  <p className="legal-tier-title text-xs font-semibold mb-1">Grievance Officer</p>
                  <p className="legal-tier-desc text-[11px]">
                    Acknowledged within 24 hours. Resolved within 15 days.
                  </p>
                </div>
                <div className="legal-terminal-subcard p-4 rounded-xl">
                  <span className="legal-tier-badge text-[11px] font-bold uppercase tracking-wider block mb-1">
                    Tier 2 • Ministry
                  </span>
                  <p className="legal-tier-title text-xs font-semibold mb-1">Grievance Appellate</p>
                  <p className="legal-tier-desc text-[11px]">
                    Appeal to GAC via <a href="https://gac.gov.in" target="_blank" rel="noopener noreferrer" className="legal-accent-link underline">gac.gov.in</a> within 30 days.
                  </p>
                </div>
                <div className="legal-terminal-subcard p-4 rounded-xl">
                  <span className="legal-tier-badge text-[11px] font-bold uppercase tracking-wider block mb-1">
                    Tier 3 • Statutory
                  </span>
                  <p className="legal-tier-title text-xs font-semibold mb-1">Data Protection Board</p>
                  <p className="legal-tier-desc text-[11px]">
                    Formal complaints directly to the Data Protection Board of India.
                  </p>
                </div>
              </div>
            </div>

            {/* Officer Details Card */}
            <div className="legal-officer-card w-full md:w-80 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="legal-officer-sub text-[11px] uppercase tracking-wider font-semibold block mb-1">
                  Designated Grievance Officer
                </span>
                <h4 className="legal-officer-name text-base font-bold mb-4">
                  Indrani Roy
                  <span className="legal-officer-role text-xs font-normal block">Founder &amp; Legal Compliance Head</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="legal-officer-label text-[11px] block">Direct Redressal Email</span>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="legal-officer-email font-mono hover:underline font-semibold"
                    >
                      velvethearts.in@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="legal-officer-label text-[11px] block">Emergency Takedown SLA</span>
                    <span className="legal-officer-val font-medium">Within 24 Hours (Rule 3(2)(b))</span>
                  </div>
                  <div>
                    <span className="legal-officer-label text-[11px] block">Corporate Jurisdiction</span>
                    <span className="legal-officer-val font-medium">New Delhi &bull; Republic of India</span>
                  </div>
                </div>
              </div>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=velvethearts.in@gmail.com&su=Legal%20Grievance%20Notice"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-officer-btn mt-6 w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs text-center transition-opacity"
              >
                File Formal Grievance
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Disclaimer & Legal Attributes */}
      <footer className="legal-doc-footer py-10 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <div className="legal-footer-links flex flex-wrap items-center justify-center gap-6 mb-4 text-xs">
            <button onClick={() => handleTabChange('privacy')} className="legal-footer-btn transition-colors">Privacy Policy</button>
            <span>&bull;</span>
            <button onClick={() => handleTabChange('terms')} className="legal-footer-btn transition-colors">Terms of Service</button>
            <span>&bull;</span>
            <button onClick={() => handleTabChange('guidelines')} className="legal-footer-btn transition-colors">Community Guidelines</button>
            <span>&bull;</span>
            <a href="mailto:velvethearts.in@gmail.com" className="legal-footer-btn transition-colors">Contact Legal Desk</a>
          </div>
          <p className="legal-footer-copy text-xs max-w-2xl mx-auto leading-relaxed">
            &copy; {new Date().getFullYear()} Velvet Hearts India. Fully compliant with the Digital Personal Data Protection Act, 2023 (DPDPA), the Information Technology Act, 2000, and the Information Technology Rules, 2021. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Styled Component CSS with Complete Light and Dark Mode Color Engine */}
      <style>{`
        /* ==========================================================
           COLOR ENGINE & DESIGN TOKENS
           ========================================================== */
        .legal-universe {
          --legal-bg: #0b070a;
          --legal-text-primary: #ffffff;
          --legal-text-body: #d6c1ca;
          --legal-text-muted: #a8909b;
          --legal-text-subtle: #8e7681;
          --legal-card-bg: #140c11;
          --legal-card-border: #2a1522;
          --legal-subcard-bg: #180e15;
          --legal-subcard-border: #2d1824;
          --legal-subcard-title: #d4ad6a;
          --legal-subcard-text: #cebac4;
          --legal-danger-bg: #200912;
          --legal-danger-border: #d9385d;
          --legal-danger-title: #ff99b3;
          --legal-danger-text: #ffe1ea;
          --legal-highlight-bg: #190f16;
          --legal-highlight-text: #f7e6ec;
          --legal-highlight-border: #d4ad6a;
          --legal-terminal-bg: linear-gradient(135deg, #190c14 0%, #0e070c 100%);
          --legal-terminal-border: rgba(212, 173, 106, 0.35);
          --legal-terminal-subcard-bg: #140b11;
          --legal-terminal-subcard-border: #2b1623;
          --legal-officer-bg: #160c13;
          --legal-officer-border: rgba(212, 173, 106, 0.3);
          --legal-accent-gold: #d4ad6a;
          --legal-accent-rose: #e27396;
          --legal-nav-bg: rgba(15, 9, 13, 0.88);
          --legal-nav-border: rgba(212, 173, 106, 0.18);
          --legal-tab-track-bg: #140b10;
          --legal-tab-item-color: #cbb2bc;
          --legal-action-btn-bg: #190f15;
          --legal-action-btn-color: #d4adb7;
          --legal-search-bg: #160e13;
          --legal-search-border: rgba(212, 173, 106, 0.2);
          --legal-search-text: #ffffff;
          --legal-badge-bg: rgba(212, 173, 106, 0.08);
          --legal-badge-border: rgba(212, 173, 106, 0.4);
          --legal-badge-text: #d4ad6a;
          --legal-takedown-bg: #25121b;
          --legal-takedown-border: #d9385d;
          --legal-takedown-color: #ff99b3;
          --legal-plain-box-bg: #12090f;
          --legal-plain-box-border: rgba(212, 173, 106, 0.35);
          --legal-plain-box-text: #f3dfa2;
          --legal-footer-border: #2a1320;
          --legal-footer-text: #7e6772;

          background-color: var(--legal-bg);
          color: var(--legal-text-body);
          position: relative;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* LIGHT MODE COMPLETE ADAPTATION */
        [data-theme="light"] .legal-universe {
          --legal-bg: #FAF5F8;
          --legal-text-primary: #1C0D15;
          --legal-text-body: #3A2631;
          --legal-text-muted: #6B525E;
          --legal-text-subtle: #7A626F;
          --legal-card-bg: #FFFFFF;
          --legal-card-border: #E8D3DF;
          --legal-subcard-bg: #FDF4F8;
          --legal-subcard-border: #E8D3DF;
          --legal-subcard-title: #8A2444;
          --legal-subcard-text: #3A2631;
          --legal-danger-bg: #FFF3F6;
          --legal-danger-border: #F09CB0;
          --legal-danger-title: #991636;
          --legal-danger-text: #4D1623;
          --legal-highlight-bg: #FFF9EE;
          --legal-highlight-text: #422D10;
          --legal-highlight-border: #C4964A;
          --legal-terminal-bg: #FFFFFF;
          --legal-terminal-border: #C4964A;
          --legal-terminal-subcard-bg: #FBF0F5;
          --legal-terminal-subcard-border: #E5CDDB;
          --legal-officer-bg: #FFFFFF;
          --legal-officer-border: #C4964A;
          --legal-accent-gold: #9E742E;
          --legal-accent-rose: #B8436A;
          --legal-nav-bg: rgba(255, 255, 255, 0.94);
          --legal-nav-border: #EAD8E2;
          --legal-tab-track-bg: #F4E5ED;
          --legal-tab-item-color: #644F59;
          --legal-action-btn-bg: #F7EBF1;
          --legal-action-btn-color: #7A2842;
          --legal-search-bg: #FFFFFF;
          --legal-search-border: #E2CCD7;
          --legal-search-text: #1C0D15;
          --legal-badge-bg: #FFF7FA;
          --legal-badge-border: #C4964A;
          --legal-badge-text: #9E742E;
          --legal-takedown-bg: #FFF0F4;
          --legal-takedown-border: #E87A9A;
          --legal-takedown-color: #991636;
          --legal-plain-box-bg: #FFFDF7;
          --legal-plain-box-border: #C4964A;
          --legal-plain-box-text: #422D10;
          --legal-footer-border: #EAD8E2;
          --legal-footer-text: #705864;
        }

        .legal-ambient-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.15;
        }

        [data-theme="light"] .legal-ambient-glow {
          opacity: 0.08;
        }

        .legal-ambient-primary {
          top: -150px;
          left: -100px;
          background: radial-gradient(circle, #b8436a 0%, transparent 70%);
        }

        .legal-ambient-secondary {
          top: 30%;
          right: -150px;
          background: radial-gradient(circle, #d4ad6a 0%, transparent 70%);
          opacity: 0.08;
        }

        .legal-grid-mesh {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(212, 173, 106, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212, 173, 106, 0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 0;
        }

        [data-theme="light"] .legal-grid-mesh {
          background-image: linear-gradient(rgba(184, 67, 106, 0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(184, 67, 106, 0.035) 1px, transparent 1px);
        }

        /* Sticky Navigation Bar */
        .legal-nav-bar {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: var(--legal-nav-bg);
          border-bottom: 1px solid var(--legal-nav-border);
          box-shadow: 0 2px 14px rgba(90, 20, 45, 0.04);
        }

        .legal-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .legal-nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legal-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: var(--legal-action-btn-bg);
          border: 1px solid var(--legal-card-border);
          color: var(--legal-action-btn-color);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .legal-action-btn:hover {
          background: #8e2b4f;
          color: #ffffff;
          border-color: #d4ad6a;
        }

        .legal-action-btn.icon-only {
          padding: 0.5rem;
        }

        .legal-brand-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .legal-nav-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .legal-brand-text {
          display: flex;
          flex-direction: column;
        }

        .legal-nav-brand {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--legal-accent-gold);
          line-height: 1.1;
        }

        .legal-nav-status {
          font-size: 0.68rem;
          color: var(--legal-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .legal-tab-track {
          display: flex;
          align-items: center;
          background: var(--legal-tab-track-bg);
          border: 1px solid var(--legal-card-border);
          border-radius: 999px;
          padding: 0.25rem;
          gap: 0.2rem;
        }

        .legal-tab-item {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--legal-tab-item-color);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .legal-tab-item:hover {
          color: var(--legal-text-primary);
        }

        .legal-tab-item.active {
          background: linear-gradient(135deg, #b8436a 0%, #7c2242 100%);
          color: #ffffff !important;
          box-shadow: 0 2px 10px rgba(184, 67, 106, 0.35);
        }

        .legal-nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .legal-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .legal-search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--legal-text-muted);
          pointer-events: none;
        }

        .legal-search-input {
          background: var(--legal-search-bg);
          border: 1px solid var(--legal-search-border);
          border-radius: 999px;
          padding: 0.45rem 1.8rem 0.45rem 2.2rem;
          font-size: 0.8rem;
          color: var(--legal-search-text);
          width: 170px;
          transition: all 0.25s ease;
        }

        .legal-search-input:focus {
          outline: none;
          width: 220px;
          border-color: var(--legal-accent-gold);
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.15);
        }

        .legal-search-clear {
          position: absolute;
          right: 0.6rem;
          background: transparent;
          border: none;
          color: var(--legal-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Hero Typography & Elements */
        .legal-badge-pill {
          background: var(--legal-badge-bg);
          border-color: var(--legal-badge-border);
          color: var(--legal-badge-text);
        }

        .legal-badge-icon {
          color: var(--legal-accent-gold);
        }

        .legal-hero-title {
          color: var(--legal-text-primary);
        }

        .legal-hero-subtitle {
          color: var(--legal-text-body);
        }

        .legal-hero-meta {
          color: var(--legal-text-muted);
        }

        .legal-accent-icon {
          color: var(--legal-accent-gold);
        }

        .legal-accent-link {
          color: var(--legal-accent-rose);
        }

        .legal-accent-tag {
          color: var(--legal-accent-gold);
        }

        .legal-accent-rose-tag {
          color: var(--legal-accent-rose);
        }

        /* AI Systems Beacon Card */
        .legal-ai-beacon-card {
          background: var(--legal-card-bg);
          border: 1.5px solid var(--legal-highlight-border);
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.25);
        }

        [data-theme="light"] .legal-ai-beacon-card {
          box-shadow: 0 4px 20px rgba(90, 20, 45, 0.05);
        }

        .legal-ai-beacon-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--legal-subcard-bg);
          border: 1px solid var(--legal-card-border);
          color: var(--legal-accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legal-beacon-title {
          color: var(--legal-text-primary);
        }

        .legal-beacon-text {
          color: var(--legal-text-body);
        }

        .legal-live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          font-size: 0.68rem;
          font-weight: 700;
          color: #22c55e;
          text-transform: uppercase;
        }

        .legal-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulseDot 2s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }

        .legal-takedown-quick-link {
          background: var(--legal-takedown-bg);
          border: 1px solid var(--legal-takedown-border);
          color: var(--legal-takedown-color);
          transition: all 0.2s ease;
        }

        .legal-takedown-quick-link:hover {
          background: #d9385d;
          color: #ffffff;
        }

        /* Bento Grid */
        .legal-bento-card {
          background: var(--legal-card-bg);
          border: 1px solid var(--legal-card-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        [data-theme="light"] .legal-bento-card {
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.04);
        }

        .legal-bento-card:hover {
          transform: translateY(-2px);
          border-color: var(--legal-accent-gold);
        }

        .legal-bento-title {
          color: var(--legal-text-primary);
        }

        .legal-bento-text {
          color: var(--legal-text-body);
        }

        .legal-bento-footer {
          border-top: 1px solid var(--legal-card-border);
          color: var(--legal-text-muted);
        }

        .legal-bento-card.emergency-card {
          background: var(--legal-danger-bg);
          border-color: var(--legal-danger-border);
        }

        .emergency-title {
          color: var(--legal-danger-title);
        }

        .emergency-text {
          color: var(--legal-danger-text);
        }

        .emergency-icon {
          color: var(--legal-danger-title);
        }

        .emergency-footer {
          border-top: 1px solid var(--legal-danger-border);
        }

        .emergency-sla {
          color: var(--legal-danger-title);
        }

        .emergency-action-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: #d9385d;
          color: #ffffff;
          transition: background 0.2s ease;
        }

        .emergency-action-btn:hover {
          background: #b52848;
        }

        .bento-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          background: var(--legal-subcard-bg);
          border: 1px solid var(--legal-card-border);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--legal-text-muted);
        }

        .bento-badge-tag.emergency {
          background: var(--legal-danger-bg);
          border-color: var(--legal-danger-border);
          color: var(--legal-danger-title);
        }

        /* Table of Contents */
        .legal-toc-card {
          background: var(--legal-card-bg);
          border: 1px solid var(--legal-card-border);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        [data-theme="light"] .legal-toc-card {
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.04);
        }

        .legal-toc-header {
          border-bottom: 1px solid var(--legal-card-border);
        }

        .legal-toc-title {
          color: var(--legal-text-primary);
        }

        .legal-toc-badge {
          color: var(--legal-text-muted);
        }

        .legal-toc-footer {
          border-top: 1px solid var(--legal-card-border);
          color: var(--legal-text-muted);
        }

        .toc-link-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.65rem;
          border-radius: 8px;
          font-size: 0.78rem;
          color: var(--legal-text-muted);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .toc-link-item:hover {
          color: var(--legal-text-primary);
          background: var(--legal-subcard-bg);
        }

        .toc-link-item.active {
          color: var(--legal-accent-gold);
          font-weight: 700;
          background: var(--legal-badge-bg);
          border-left: 2px solid var(--legal-accent-gold);
        }

        /* Document Section Cards */
        .legal-doc-section {
          background: var(--legal-card-bg);
          border: 1px solid var(--legal-card-border);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25);
          transition: border-color 0.3s ease;
        }

        [data-theme="light"] .legal-doc-section {
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.04);
        }

        .legal-doc-section:hover {
          border-color: var(--legal-accent-gold);
        }

        .legal-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--legal-card-border);
        }

        .legal-section-heading {
          font-size: 1.28rem;
          font-weight: 700;
          color: var(--legal-text-primary);
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .clause-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          background: var(--legal-subcard-bg);
          border: 1px solid var(--legal-card-border);
          color: var(--legal-text-muted);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clause-copy-btn:hover {
          color: var(--legal-text-primary);
          border-color: var(--legal-accent-gold);
        }

        .legal-p {
          font-size: 0.92rem;
          line-height: 1.72;
          color: var(--legal-text-body);
          margin-bottom: 1rem;
        }

        .legal-p:last-child {
          margin-bottom: 0;
        }

        .legal-doc-section ul li {
          color: var(--legal-text-body);
        }

        .legal-doc-section strong {
          color: var(--legal-text-primary);
        }

        /* Generic Inner Sub-Cards (DPDPA Rights, Sanction Strikes, etc.) */
        .legal-sub-card {
          background: var(--legal-subcard-bg);
          border: 1px solid var(--legal-subcard-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        [data-theme="light"] .legal-sub-card {
          box-shadow: 0 2px 8px rgba(90, 20, 45, 0.03);
        }

        .legal-subcard-title {
          color: var(--legal-subcard-title);
        }

        .legal-subcard-desc {
          color: var(--legal-subcard-text);
        }

        /* Danger Sub-Cards (Criminal Penalties, Hate Speech, Zero Tolerance) */
        .legal-danger-sub-card {
          background: var(--legal-danger-bg);
          border: 1px solid var(--legal-danger-border);
        }

        .legal-danger-title {
          color: var(--legal-danger-title);
        }

        .legal-danger-desc {
          color: var(--legal-danger-text);
        }

        .legal-highlight-box {
          background: var(--legal-highlight-bg);
          border-left: 4px solid var(--legal-highlight-border);
          border-radius: 0 12px 12px 0;
          padding: 1rem 1.25rem;
          margin: 1.25rem 0;
          font-size: 0.88rem;
          line-height: 1.65;
          color: var(--legal-highlight-text);
        }

        .legal-plain-english-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 1rem;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          background: var(--legal-subcard-bg);
          border: 1px solid var(--legal-card-border);
          color: var(--legal-accent-gold);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .legal-plain-english-toggle:hover {
          background: var(--legal-badge-bg);
        }

        .legal-plain-english-content {
          margin-top: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          background: var(--legal-plain-box-bg);
          border: 1px dashed var(--legal-plain-box-border);
          font-size: 0.85rem;
          color: var(--legal-plain-box-text);
          line-height: 1.6;
        }

        /* Search Filter Banner */
        .legal-search-banner {
          background: var(--legal-badge-bg);
          border: 1px solid var(--legal-badge-border);
          color: var(--legal-accent-gold);
        }

        .legal-search-reset {
          color: var(--legal-text-primary);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        /* Grievance Terminal */
        .legal-grievance-terminal {
          background: var(--legal-terminal-bg);
          border: 1.5px solid var(--legal-terminal-border);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }

        [data-theme="light"] .legal-grievance-terminal {
          box-shadow: 0 6px 28px rgba(90, 20, 45, 0.06);
        }

        .legal-terminal-badge {
          background: var(--legal-badge-bg);
          border: 1px solid var(--legal-badge-border);
          color: var(--legal-accent-gold);
        }

        .legal-terminal-title {
          color: var(--legal-text-primary);
        }

        .legal-terminal-desc {
          color: var(--legal-text-body);
        }

        .legal-terminal-subcard {
          background: var(--legal-terminal-subcard-bg);
          border: 1px solid var(--legal-terminal-subcard-border);
        }

        .legal-tier-badge {
          color: var(--legal-accent-gold);
        }

        .legal-tier-title {
          color: var(--legal-text-primary);
        }

        .legal-tier-desc {
          color: var(--legal-text-muted);
        }

        .legal-officer-card {
          background: var(--legal-officer-bg);
          border: 1.5px solid var(--legal-officer-border);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
        }

        [data-theme="light"] .legal-officer-card {
          box-shadow: 0 4px 18px rgba(90, 20, 45, 0.05);
        }

        .legal-officer-sub {
          color: var(--legal-text-muted);
        }

        .legal-officer-name {
          color: var(--legal-text-primary);
        }

        .legal-officer-role {
          color: var(--legal-accent-gold);
        }

        .legal-officer-label {
          color: var(--legal-text-subtle);
        }

        .legal-officer-email {
          color: var(--legal-accent-gold);
        }

        .legal-officer-val {
          color: var(--legal-text-primary);
        }

        .legal-officer-btn {
          background: linear-gradient(135deg, #b8436a 0%, #7c2242 100%);
        }

        .legal-officer-btn:hover {
          opacity: 0.95;
        }

        /* Footer */
        .legal-doc-footer {
          border-top: 1px solid var(--legal-footer-border);
          background: transparent;
        }

        .legal-footer-links {
          color: var(--legal-text-muted);
        }

        .legal-footer-btn {
          background: transparent;
          border: none;
          color: var(--legal-text-muted);
          cursor: pointer;
        }

        .legal-footer-btn:hover {
          color: var(--legal-text-primary);
        }

        .legal-search-match {
          border-color: rgba(226, 115, 150, 0.65) !important;
          box-shadow: 0 4px 24px -4px rgba(226, 115, 150, 0.25) !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .legal-footer-copy {
          color: var(--legal-footer-text);
        }
      `}</style>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TOC Link Helper Component                                                   */
/* -------------------------------------------------------------------------- */
const TocLink = ({ id, title, active, isHidden }) => {
  if (isHidden) return null;
  return (
    <a
      href={`#${id}`}
      className={`toc-link-item ${active ? 'active' : ''}`}
    >
      <span className="truncate">{title}</span>
      <CaretRight size={12} className={active ? 'opacity-100' : 'opacity-40'} />
    </a>
  );
};

/* -------------------------------------------------------------------------- */
/* PRIVACY POLICY CLAUSES COMPONENT                                           */
/* -------------------------------------------------------------------------- */
const PrivacyClauses = ({ searchQuery, onCopy, copiedId, expandedDetails, toggleDetail }) => {
  return (
    <>
      {/* Chapter 1 */}
      <section id="priv-sec-1" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <FileText size={22} className="text-[#e27396]" />
            <span>1. Regulatory Notice &amp; Data Fiduciary</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-1')}
            className="clause-copy-btn"
            title="Copy clause link"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-1' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts operates an intentional discovery platform designed for verified romantic relationships across India. This Privacy Policy is published in strict conformity with <strong>Section 5 of the Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and Rule 3(1) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
        </p>
        <div className="legal-highlight-box">
          <strong>Designated Data Fiduciary:</strong> Velvet Hearts (founded by Indrani Roy) acts as the Data Fiduciary, determining the purpose and means of data processing. You are the statutory <strong>Data Principal</strong> holding constitutionally guaranteed privacy rights under Indian law.
        </div>
        <button
          type="button"
          onClick={() => toggleDetail('priv1')}
          className="legal-plain-english-toggle"
        >
          <Info size={14} />
          <span>{expandedDetails['priv1'] ? 'Hide Plain Summary' : 'View Plain English Summary'}</span>
        </button>
        {expandedDetails['priv1'] && (
          <div className="legal-plain-english-content">
            We operate fully under Indian privacy law (DPDPA 2023). You control your personal data at all times, and we clearly explain every single reason we ever process information about you.
          </div>
        )}
      </section>

      {/* Chapter 2 */}
      <section id="priv-sec-2" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <HardDrive size={22} className="text-[#e27396]" />
            <span>2. Itemized Inventory of Stored Data</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-2')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-2' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Pursuant to Section 5(1) of the DPDP Act 2023, Data Principals are hereby provided with an exhaustive list of all categories of personal data collected, stored, and processed:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-2">
          <li><strong>Identity &amp; Authentication:</strong> Verified Google Account or email credentials managed securely via Firebase Auth. <em>Notice: Velvet Hearts does NOT ask for, require, or store your mobile phone number.</em></li>
          <li><strong>Mandatory 18+ Age &amp; Gender:</strong> Enforces minor exclusion under Section 9 of the DPDP Act 2023 and facilitates mutual matchmaking filters.</li>
          <li><strong>Biometric Anti-Spoofing Vectors:</strong> Live verification selfie pose vectors. Raw facial images are never distributed to external AI databases.</li>
          <li><strong>Audio Intros &amp; Private Scrapbooks:</strong> 2-minute voice intros, mutual Rewind Letters, and Our Diary scrapbook milestones between matched couples.</li>
          <li><strong>Communications:</strong> Direct text messages exchanged between mutual matches transmitted over TLS 1.3 encryption. (Notice: Messages are access-controlled on cloud databases and are not end-to-end encrypted).</li>
        </ul>
      </section>

      {/* Chapter 3 */}
      <section id="priv-sec-3" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <CheckCircle size={22} className="text-[#e27396]" />
            <span>3. Lawful Consent Architecture (Section 6, DPDP Act)</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-3')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-3' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          All data processing is grounded in <strong>freely given, specific, informed, unconditional, and unambiguous consent</strong> marked by affirmative action. Consent may be revoked unconditionally at any time from your Account Settings suite or via direct written notice to our Grievance Officer.
        </p>
      </section>

      {/* Chapter 4 */}
      <section id="priv-sec-4" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Scales size={22} className="text-[#e27396]" />
            <span>4. Statutory Rights of the Data Principal</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-4')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-4' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Under Sections 11, 12, 13, and 14 of the DPDP Act 2023, you retain fully enforceable legal rights:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="legal-sub-card p-3.5 rounded-xl">
            <h4 className="legal-subcard-title text-xs font-bold uppercase mb-1">Right to Access (Sec 11)</h4>
            <p className="legal-subcard-desc text-xs">Receive a full digital summary of all personal data being processed.</p>
          </div>
          <div className="legal-sub-card p-3.5 rounded-xl">
            <h4 className="legal-subcard-title text-xs font-bold uppercase mb-1">Right to Correction (Sec 12)</h4>
            <p className="legal-subcard-desc text-xs">Update, amend, or correct incomplete, misleading, or outdated personal information.</p>
          </div>
          <div className="legal-sub-card p-3.5 rounded-xl">
            <h4 className="legal-subcard-title text-xs font-bold uppercase mb-1">Right to Erasure (Sec 12)</h4>
            <p className="legal-subcard-desc text-xs">Exercise your &ldquo;Right to be Forgotten&rdquo; and request permanent profile deletion.</p>
          </div>
          <div className="legal-sub-card p-3.5 rounded-xl">
            <h4 className="legal-subcard-title text-xs font-bold uppercase mb-1">Right to Nominate (Sec 14)</h4>
            <p className="legal-subcard-desc text-xs">Designate a trusted legal representative to exercise your privacy rights if incapacitated.</p>
          </div>
        </div>
      </section>

      {/* Chapter 5 */}
      <section id="priv-sec-5" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Clock size={22} className="text-[#e27396]" />
            <span>5. Mandatory 180-Day Regulatory Cold Storage</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-5')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-5' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          When an account is deleted, all profile media, voice introductions, matches, and diary entries are immediately de-indexed from the active discovery matrix.
        </p>
        <p className="legal-p">
          However, in mandatory compliance with <strong>Rule 3(1)(h) of the IT Rules 2021</strong> and the <strong>CERT-In Directions under Section 70B of the IT Act, 2000</strong>, Velvet Hearts retains registration authentication logs and safety transaction records in secure, offline encrypted cold storage for exactly <strong>180 (one hundred eighty) days</strong> to satisfy lawful law enforcement inquiries, following which all records are cryptographically destroyed.
        </p>
      </section>

      {/* Chapter 6 */}
      <section id="priv-sec-6" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <LockKey size={22} className="text-[#e27396]" />
            <span>6. Cybersecurity &amp; CERT-In Incident Protocol</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-6')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-6' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts implements strict technical measures including TLS 1.3 encryption in transit, isolated NoSQL security rules, and granular API rate limiting. Pursuant to <strong>Section 8(6) of the DPDP Act 2023</strong> and CERT-In directions, any verified cybersecurity incident will be formally reported to the <strong>Data Protection Board of India</strong> and CERT-In within statutory SLA limits (within 6 hours of discovery).
        </p>
      </section>

      {/* Chapter 7 */}
      <section id="priv-sec-7" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <MapPin size={22} className="text-[#e27396]" />
            <span>7. Cross-Border Cloud Safeguards (Section 16, DPDP Act)</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-7')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-7' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Cloud servers are hosted with enterprise-grade cloud providers (Google Firebase Cloud Platform and Cloudinary CDN). Data is stored and processed strictly within jurisdictions and territories that are not blacklisted by the Central Government of India under Section 16 of the DPDP Act 2023.
        </p>
      </section>

      {/* Chapter 8 */}
      <section id="priv-sec-8" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <WarningCircle size={22} className="text-[#e27396]" />
            <span>8. Absolute Prohibition on Minors (Section 9, DPDP Act)</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-8')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-8' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts strictly enforces an <strong>absolute ban on individuals under 18 years of age</strong>. We do not knowingly process personal data of children. Any account suspected or discovered to belong to a minor is instantly purged, and associated hardware identifiers are blacklisted.
        </p>
      </section>

      {/* Chapter 9 */}
      <section id="priv-sec-9" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <EnvelopeSimple size={22} className="text-[#e27396]" />
            <span>9. Grievance Officer &amp; Redressal Escalation</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('priv-sec-9')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'priv-sec-9' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Complaints regarding personal data handling, unauthorized processing, or consent revocation should be addressed directly to our Grievance Officer at <a href="mailto:velvethearts.in@gmail.com" className="legal-accent-link underline font-semibold">velvethearts.in@gmail.com</a>. Formal acknowledgments are dispatched within 24 hours.
        </p>
      </section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* TERMS OF SERVICE CLAUSES COMPONENT                                         */
/* -------------------------------------------------------------------------- */
const TermsClauses = ({ searchQuery, onCopy, copiedId, expandedDetails, toggleDetail }) => {
  return (
    <>
      {/* Chapter 1 */}
      <section id="terms-sec-1" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <FileText size={22} className="text-[#e27396]" />
            <span>1. Acceptance of Terms &amp; Binding Contract</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-1')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-1' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          By downloading, accessing, or creating an account on Velvet Hearts, you enter into a legally binding contract under the <strong>Indian Contract Act, 1872</strong> with Velvet Hearts Technologies. If you do not agree to every clause herein, you must immediately terminate your session and cease all access to the platform.
        </p>
      </section>

      {/* Chapter 2 */}
      <section id="terms-sec-2" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <UserCheck size={22} className="text-[#e27396]" />
            <span>2. Eligibility &amp; Statutory Disqualifications</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-2')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-2' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          You represent and warrant that:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li>You are at least <strong>18 years of age</strong> as of the date of account registration.</li>
          <li>You have never been convicted of any sexual offense, violent felony, cyber harassment, or crime of moral turpitude under the <strong>Bharatiya Nyaya Sanhita, 2023 (BNS)</strong> or the <strong>POCSO Act, 2012</strong>.</li>
          <li>You are legally competent to enter into enforceable contractual relations under Indian law.</li>
          <li>You maintain only one active personal account, representing your true, authentic identity.</li>
        </ul>
      </section>

      {/* Chapter 3 */}
      <section id="terms-sec-3" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Prohibit size={22} className="text-[#e27396]" />
            <span>3. Prohibited Conduct (Rule 3(1)(b), IT Rules 2021)</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-3')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-3' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Under <strong>Rule 3(1)(b) of the Information Technology Rules, 2021</strong>, users are strictly prohibited from hosting, displaying, uploading, transmitting, or sharing any information that:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li>Belongs to another individual without lawful entitlement or express authorization;</li>
          <li>Is defamatory, obscene, pornographic, paedophilic, invasive of bodily privacy, or gender-harassing;</li>
          <li>Is harmful to minors in any manner whatsoever;</li>
          <li>Infringes any patent, trademark, copyright, or proprietary trade secrets;</li>
          <li>Impersonates another person or intentionally presents false, deceptive, or catfish profile imagery;</li>
          <li>Threatens the unity, integrity, defense, security, or sovereignty of India or public order;</li>
          <li>Contains malicious scripts, trojans, bots, or unauthorized scraping routines.</li>
        </ul>
      </section>

      {/* Chapter 4 */}
      <section id="terms-sec-4" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Scales size={22} className="text-[#e27396]" />
            <span>4. Criminal Liabilities under Bharatiya Nyaya Sanhita &amp; IT Act</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-4')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-4' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Users are placed on express notice that engaging in cyber abuse, extortion, or romance fraud invokes severe criminal penalties:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Section 66E, IT Act 2000</h4>
            <p className="legal-danger-desc text-xs">Non-consensual capture or distribution of private bodily imagery (imprisonment up to 3 years).</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Section 67 &amp; 67A, IT Act 2000</h4>
            <p className="legal-danger-desc text-xs">Electronic transmission of sexually explicit material (rigorous imprisonment up to 5–7 years).</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Sections 75 &amp; 78, BNS 2023</h4>
            <p className="legal-danger-desc text-xs">Sexual harassment and cyber stalking offenses with cognizable legal liability.</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Sections 318 &amp; 319, BNS 2023</h4>
            <p className="legal-danger-desc text-xs">Cheating by personation, deceptive catfish profiles, and romance extortion.</p>
          </div>
        </div>
      </section>

      {/* Chapter 5 */}
      <section id="terms-sec-5" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <LockKey size={22} className="text-[#e27396]" />
            <span>5. Intermediary Status &amp; Safe Harbor (Section 79, IT Act)</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-5')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-5' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts qualifies as an <em>intermediary</em> under Section 2(1)(w) of the Information Technology Act, 2000. In accordance with Section 79 of the IT Act, Velvet Hearts is not liable for user-generated content, voice recordings, or third-party interactions, provided statutory due diligence under the IT Rules 2021 is diligently fulfilled.
        </p>
      </section>

      {/* Chapter 6 */}
      <section id="terms-sec-6" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <HandHeart size={22} className="text-[#e27396]" />
            <span>6. Offline Dating &amp; Risk Assumption</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-6')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-6' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts does not perform criminal background checks or state registry lookups. You agree that you are exclusively responsible for your interactions with other members. You agree to exercise common sense and prudent caution: always meet in public venues, tell trusted companions your plans, and never send money, wire transfers, UPI payments, or financial credentials to anyone met through the platform.
        </p>
      </section>

      {/* Chapter 7 */}
      <section id="terms-sec-7" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Warning size={22} className="text-[#e27396]" />
            <span>7. Disclaimers &amp; Limitation of Liability</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-7')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-7' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          TO THE FULLEST EXTENT PERMITTED BY INDIAN LAW, THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;. VELVET HEARTS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE, COMPATIBILITY SUCCESS, OR CONTINUOUS UNINTERRUPTED AVAILABILITY. VELVET HEARTS SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, PUNITIVE, OR SPECIAL DAMAGES ARISING FROM USER CONDUCT.
        </p>
      </section>

      {/* Chapter 8 */}
      <section id="terms-sec-8" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Cpu size={22} className="text-[#e27396]" />
            <span>8. Intellectual Property &amp; AI Codebase License</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-8')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-8' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          All proprietary trademarks, graphic logos, and AI-synthesized software comprising Velvet Hearts are the exclusive intellectual property of Velvet Hearts Technologies. You retain ownership in your uploaded photos and audio notes, granting Velvet Hearts a worldwide, non-exclusive license solely for platform transmission and display.
        </p>
      </section>

      {/* Chapter 9 */}
      <section id="terms-sec-9" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <EnvelopeSimple size={22} className="text-[#e27396]" />
            <span>9. Grievance Redressal SLA</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-9')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-9' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Grievances regarding platform terms or safety issues can be submitted to our Grievance Officer, Indrani Roy, at <a href="mailto:velvethearts.in@gmail.com" className="legal-accent-link underline font-semibold">velvethearts.in@gmail.com</a>. All complaints receive formal acknowledgment within 24 hours.
        </p>
      </section>

      {/* Chapter 10 */}
      <section id="terms-sec-10" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Scales size={22} className="text-[#e27396]" />
            <span>10. Governing Law &amp; Exclusive Jurisdiction</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('terms-sec-10')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'terms-sec-10' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          These Terms and any dispute arising hereunder shall be governed by the substantive laws of the <strong>Republic of India</strong>. Any litigation or dispute proceeding shall be subject to the exclusive jurisdiction of the competent courts of <strong>New Delhi, India</strong>.
        </p>
      </section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* COMMUNITY GUIDELINES CLAUSES COMPONENT                                     */
/* -------------------------------------------------------------------------- */
const GuidelinesClauses = ({ searchQuery, onCopy, copiedId, expandedDetails, toggleDetail }) => {
  return (
    <>
      {/* Chapter 1 */}
      <section id="guide-sec-1" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <HandHeart size={22} className="text-[#e27396]" />
            <span>1. Core Philosophy of Intentional Discovery</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-1')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-1' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts was created as an antidote to shallow swipe culture. We celebrate emotional resonance, shared vulnerability, and genuine human warmth. We expect every member to arrive with kindness, integrity, and clear intentions.
        </p>
        <div className="legal-highlight-box">
          <strong>The Golden Principle:</strong> Treat every profile as a whole human being with dignity and emotional depth. Casual cruelty, mocking profiles, or deceitful interactions have zero place in our community.
        </div>
      </section>

      {/* Chapter 2 */}
      <section id="guide-sec-2" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Fingerprint size={22} className="text-[#e27396]" />
            <span>2. Identity Authenticity &amp; Photo Standards</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-2')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-2' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Authenticity is our bedrock covenant. Every profile must represent the living person operating it:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li><strong>Real Photos Required:</strong> Profiles must feature recent, unobstructed photos where your face is clearly identifiable.</li>
          <li><strong>No Impersonation or Catfishing:</strong> Operating an account under someone else&rsquo;s identity or celebrity pictures results in an immediate permanent ban.</li>
          <li><strong>No Synthetic Deepfakes:</strong> Generative AI avatars, heavily manipulated face swaps, or computer-generated personas are strictly banned.</li>
          <li><strong>No Minors:</strong> Photos depicting minors (including your own children or relatives) are forbidden to safeguard child privacy.</li>
        </ul>
      </section>

      {/* Chapter 3 */}
      <section id="guide-sec-3" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <ChatCircleText size={22} className="text-[#e27396]" />
            <span>3. Respectful Communication &amp; Audio Notes</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-3')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-3' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Meaningful dialogue requires consent, boundaries, and mutual respect:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li><strong>Consent-First Interactions:</strong> Do not barrage matches with unsolicited explicit comments, sexual demands, or intrusive interrogations.</li>
          <li><strong>Voice Intro Etiquette:</strong> Voice intros and audio recordings must be original, respectful, and free of background obscenity or hate speech.</li>
          <li><strong>Discontinuing with Grace:</strong> If a connection isn&rsquo;t reciprocal, respect their boundary gracefully. Aggressive responses to unmatching or rejection trigger immediate moderation.</li>
        </ul>
      </section>

      {/* Chapter 4 */}
      <section id="guide-sec-4" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <WarningCircle size={22} className="text-[#e27396]" />
            <span>4. Zero Tolerance for Harassment &amp; Abuse</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-4')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-4' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts maintains absolute zero tolerance for abusive behaviors. Any of the following triggers immediate profile termination and permanent hardware blacklisting:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Unsolicited Sexual Media</h4>
            <p className="legal-danger-desc text-xs">Sharing intimate photos, nudity, or sexually explicit voice notes without prior mutual consent.</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Hate Speech &amp; Slurs</h4>
            <p className="legal-danger-desc text-xs">Any attack or degradation based on caste, religion, gender, sexual orientation, disability, or nationality.</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Doxxing &amp; Extortion</h4>
            <p className="legal-danger-desc text-xs">Publishing a match&rsquo;s phone number, address, workplace, or private messages without their consent.</p>
          </div>
          <div className="legal-danger-sub-card p-3.5 rounded-xl">
            <h4 className="legal-danger-title text-xs font-bold uppercase mb-1">Predatory Stalking</h4>
            <p className="legal-danger-desc text-xs">Tracking a user across social platforms after being unmatched or blocked on Velvet Hearts.</p>
          </div>
        </div>
      </section>

      {/* Chapter 5 */}
      <section id="guide-sec-5" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <LockKey size={22} className="text-[#e27396]" />
            <span>5. Financial Safety &amp; Anti-Scam Rules</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-5')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-5' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Velvet Hearts is strictly for romantic and personal connections. We enforce a zero-tolerance policy against financial solicitation:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li><strong>Never Send Money:</strong> Never transfer funds via UPI, Google Pay, bank wire, crypto, or gift cards to someone met online.</li>
          <li><strong>No Commercial Solicitation:</strong> Accounts advertising escort services, paid modeling, adult content subscriptions (OnlyFans), MLM schemes, or financial investments are terminated instantly.</li>
          <li><strong>Emergency Scams:</strong> Fabricated sob stories regarding sudden hospital bills, travel tickets, or customs fees are common romance scam patterns. Report them immediately.</li>
        </ul>
      </section>

      {/* Chapter 6 */}
      <section id="guide-sec-6" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <MapPin size={22} className="text-[#e27396]" />
            <span>6. Real-World Date Protocol</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-6')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-6' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          When transitioning from digital chats to real-world encounters, prioritize your safety:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li><strong>Meet in Populated Public Spaces:</strong> Coffee shops, busy restaurants, art galleries, or public gardens are ideal for first dates. Never meet in private residences or remote areas.</li>
          <li><strong>Tell a Trusted Friend:</strong> Share your location, who you are meeting, and an agreed check-in time with a friend or family member.</li>
          <li><strong>Control Your Transportation:</strong> Arrange your own ride to and from the venue. Do not let someone you just met pick you up at your home.</li>
          <li><strong>Watch Your Drinks &amp; Belongings:</strong> Keep drinks and personal items in view at all times.</li>
        </ul>
      </section>

      {/* Chapter 7 */}
      <section id="guide-sec-7" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <Eye size={22} className="text-[#e27396]" />
            <span>7. Reporting, Triaging &amp; Dispute Channels</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-7')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-7' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          Every chat screen and user profile contains a persistent &ldquo;Report Profile&rdquo; action. When a report is filed:
        </p>
        <ul className="legal-p list-disc pl-5 space-y-1.5">
          <li>The reported user is immediately muted from interacting with your profile.</li>
          <li>Safety telemetry and relevant messages are frozen in audit isolation.</li>
          <li>Our Trust &amp; Safety team reviews the report with a priority triage queue for urgent harassment flags.</li>
        </ul>
      </section>

      {/* Chapter 8 */}
      <section id="guide-sec-8" className="legal-doc-section">
        <div className="legal-section-header">
          <h2 className="legal-section-heading font-display">
            <WarningCircle size={22} className="text-[#e27396]" />
            <span>8. Three-Strike Account Sanctions</span>
          </h2>
          <button
            type="button"
            onClick={() => onCopy('guide-sec-8')}
            className="clause-copy-btn"
          >
            <ShareNetwork size={13} />
            <span>{copiedId === 'guide-sec-8' ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        <p className="legal-p">
          To maintain fairness, minor infractions follow a transparent progressive sanction framework:
        </p>
        <div className="space-y-2.5 my-4">
          <div className="legal-sub-card p-3 rounded-xl flex items-center justify-between">
            <span className="legal-subcard-title text-xs font-bold">Strike 1 • Formal Warning</span>
            <span className="legal-subcard-desc text-xs">Guideline notification and 24h profile edit requirement</span>
          </div>
          <div className="legal-sub-card p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-[#ea580c] dark:text-[#ffaa48]">Strike 2 • Temporary Cool-Down</span>
            <span className="legal-subcard-desc text-xs">7-day account suspension and match discovery freeze</span>
          </div>
          <div className="legal-danger-sub-card p-3 rounded-xl flex items-center justify-between">
            <span className="legal-danger-title text-xs font-bold">Strike 3 • Permanent Blacklist</span>
            <span className="legal-danger-desc text-xs">Irreversible account termination &amp; hardware device ban</span>
          </div>
        </div>
        <p className="legal-p text-xs opacity-75">
          *Note: Severe violations (intimate media, extortion, hate speech, minor contact) trigger immediate, non-appealable Permanent Blacklisting on first offense.
        </p>
      </section>
    </>
  );
};

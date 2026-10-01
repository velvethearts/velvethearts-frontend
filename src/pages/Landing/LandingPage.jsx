import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  Bookmark, 
  Sparkle, 
  Play, 
  Pause, 
  Waveform, 
  SpeakerHigh, 
  ArrowRight, 
  CheckCircle,
  Microphone,
  LockKey
} from '@phosphor-icons/react';
import logo from "../../assets/velvet-heart-logo.png";
import ananyaPhoto from "../../assets/ananya.png";
import { ThemeToggle } from '../../components/UI/ThemeToggle';
import { triggerCookieBanner } from '../../lib/analytics';

export const LandingPage = ({ onGetStarted, onSignIn, onNavigate }) => {
  const { showAlert = () => { } } = useApp?.() || {};
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(42); // 42 seconds of 120s

  React.useEffect(() => {
    let interval = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 120) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio]);

  const toggleAudio = () => {
    setIsPlayingAudio(prev => !prev);
  };

  const formatAudioTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const faqs = [
    {
      q: 'What makes Velvet Hearts different from traditional dating apps?',
      a: 'Velvet Hearts replaces gamified swiping with intentional story browsing, 2-minute voice intros, real-time vibe match compatibility scoring, and built-in accessibility features.'
    },
    {
      q: 'How do 2-minute voice intros work?',
      a: 'Users can record up to 2 minutes of authentic voice introductions to share their personality, humor, and communication style beyond static photos.'
    },
    {
      q: 'Is Velvet Hearts accessible for users with disabilities?',
      a: 'Yes, Velvet Hearts features customizable font scaling, high-contrast themes, screen reader accessibility, and optional disability disclosure tags.'
    },
    {
      q: 'How does Velvet Hearts protect user safety and privacy?',
      a: 'We combine active 16-zone biometric face verification, community reporting, 2-tap safety controls, and real-time blocking to ensure a respectful environment.'
    }
  ];

  return (
    <div className="landing-container">
      {/* Ambient Gradient Background Glows */}
      <div className="gradient-glow glow-1"></div>
      <div className="gradient-glow glow-2"></div>
      <div className="gradient-glow glow-3"></div>

      {/* Main Header / Navigation */}
      <header className="landing-header">
        <div className="landing-brand">
          <img
            src={logo}
            alt="Velvet Hearts Logo"
            className="landing-brand-logo"
            width="40"
            height="40"
          />
          <div className="landing-brand-text">
            <span className="landing-brand-name font-display">Velvet Hearts</span>
            <span className="landing-brand-badge font-ui">
              <span className="pulse-indicator"></span> Intentional Dating
            </span>
          </div>
        </div>

        <div className="landing-header-actions">
          <ThemeToggle />
          <button 
            onClick={onSignIn} 
            className="sign-in-btn font-ui" 
            aria-label="Sign in to your Velvet Hearts account"
          >
            Sign In
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section — Engineered for Immediate Clarity Above the Fold */}
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-content">
            {/* 1. EYEBROW BADGE — Signals category & intention */}
            <div className="accent-badge font-ui">
              <Sparkle size={15} weight="fill" className="badge-sparkle-icon" />
              <span>A Slower, More Human Dating Space</span>
            </div>

            {/* 2. HERO HEADLINE — What to look at first (Primary Visual Anchor) */}
            <h1 id="hero-heading" className="hero-title font-display">
              Where genuine hearts connect. <br />
              <span className="hero-title-accent">Beyond the superficial swipe.</span>
            </h1>

            {/* 3. VALUE PROPOSITION — Answers WHAT IT IS & WHO IT IS FOR */}
            <p className="hero-description font-body">
              Velvet Hearts is the intentional dating sanctuary for thoughtful singles seeking real emotional resonance.
              Replace burnout-inducing swiping with authentic 2-minute voice intros, rich story profiles, and a verified, safe community.
            </p>

            {/* 4. THREE TRUST PILLARS — Answers WHY IT MATTERS (Above the fold proof) */}
            <div className="hero-trust-pillars font-ui" role="list" aria-label="Key platform features">
              <div className="trust-pillar-pill" role="listitem">
                <ShieldCheck size={18} weight="fill" className="pillar-icon shield" />
                <div className="pillar-text">
                  <strong>16-Zone Biometric Verified</strong>
                  <span>Zero bots or catfish</span>
                </div>
              </div>

              <div className="trust-pillar-pill" role="listitem">
                <Microphone size={18} weight="fill" className="pillar-icon mic" />
                <div className="pillar-text">
                  <strong>2-Minute Voice Intros</strong>
                  <span>Feel authentic laughs & tone</span>
                </div>
              </div>

              <div className="trust-pillar-pill" role="listitem">
                <Bookmark size={18} weight="fill" className="pillar-icon bookmark" />
                <div className="pillar-text">
                  <strong>Story-First Profiles</strong>
                  <span>No rushed checklist matching</span>
                </div>
              </div>
            </div>

            {/* 5. HERO ACTIONS — Answers WHAT TO DO NEXT (Primary CTA Prominence) */}
            <div className="hero-actions-container">
              <div className="hero-actions">
                <button 
                  onClick={onGetStarted} 
                  className="cta-primary font-ui" 
                  aria-label="Begin your journey on Velvet Hearts for free"
                >
                  <span>Begin Your Journey</span>
                  <div className="cta-icon-wrapper">
                    <ArrowRight size={16} weight="bold" />
                  </div>
                </button>
                <button 
                  onClick={onSignIn} 
                  className="cta-ghost font-ui"
                  aria-label="Sign in to existing account"
                >
                  I already have an account
                </button>
              </div>

              {/* Friction-Reducers / Trust Subtext */}
              <div className="hero-subtext font-ui">
                <span className="subtext-item"><CheckCircle size={14} weight="fill" className="subtext-check" /> 100% Free to join</span>
                <span className="subtext-divider">•</span>
                <span className="subtext-item"><LockKey size={14} weight="fill" className="subtext-check" /> Privacy & safety first</span>
                <span className="subtext-divider">•</span>
                <span className="subtext-item">⏱️ Takes 2 mins</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Story Showcase Card — Visually demonstrates "What It Is" */}
          <div className="hero-visual" aria-hidden="false">
            {/* Floating Trust Indicator (Top Left) */}
            <div className="floating-chip chip-top-left font-ui">
              <ShieldCheck size={16} weight="fill" color="var(--gold-400)" />
              <span>Biometric Face Verified</span>
            </div>

            {/* Main Interactive Showcase Card */}
            <div className="showcase-card double-bezel-outer">
              <div className="double-bezel-inner">
                {/* Photo & Match Header */}
                <div className="showcase-photo-container">
                  <img
                    src={ananyaPhoto}
                    alt="Sample verified profile - Ananya"
                    className="showcase-photo"
                    width="420"
                    height="320"
                    loading="eager"
                  />
                  <div className="showcase-photo-overlay"></div>

                  {/* Vibe Score Chip */}
                  <div className="vibe-score-badge font-ui">
                    <Heart size={14} weight="fill" className="heart-pulse-icon" />
                    <span>96% Vibe Match</span>
                  </div>

                  {/* Profile Name & Badges Overlay */}
                  <div className="showcase-identity font-ui">
                    <div className="identity-title-row">
                      <h3 className="identity-name font-display">Ananya, 26</h3>
                      <span className="verified-shield-icon" title="16-zone identity verified">
                        <CheckCircle size={18} weight="fill" />
                      </span>
                    </div>
                    <p className="identity-bio">Documentary Photographer • Bangalore</p>
                  </div>
                </div>

                {/* Interactive Voice Intro Player Component */}
                <div className="showcase-voice-module">
                  <div className="voice-module-header font-ui">
                    <div className="voice-title-row">
                      <SpeakerHigh size={16} weight="fill" className="speaker-icon" />
                      <span className="voice-title">Voice Intro</span>
                    </div>
                    <span className="voice-duration font-mono">
                      {isPlayingAudio ? formatAudioTime(audioProgress) : '0:42'} / 2:00
                    </span>
                  </div>

                  <div className="voice-player-bar">
                    <button 
                      type="button" 
                      onClick={toggleAudio} 
                      className={`voice-play-btn ${isPlayingAudio ? 'is-playing' : ''}`}
                      aria-label={isPlayingAudio ? "Pause sample voice note" : "Play sample voice note"}
                    >
                      {isPlayingAudio ? (
                        <Pause size={14} weight="fill" />
                      ) : (
                        <Play size={14} weight="fill" className="play-triangle-icon" />
                      )}
                    </button>

                    {/* Animated Soundwave Bars */}
                    <div className={`waveform-track ${isPlayingAudio ? 'animating' : ''}`}>
                      {[40, 75, 55, 90, 60, 30, 85, 100, 70, 45, 80, 95, 65, 40, 70, 85, 50, 95, 60, 40, 75, 50].map((h, i) => (
                        <span 
                          key={i} 
                          className="wave-bar" 
                          style={{ 
                            height: `${h}%`,
                            animationDelay: `${(i * 0.06).toFixed(2)}s`
                          }}
                        ></span>
                      ))}
                    </div>
                  </div>

                  <p className="voice-quote font-body">
                    &ldquo;Looking for someone to wander Sunday morning flower markets with and talk about favorite old books.&rdquo;
                  </p>
                </div>

                {/* Story Prompt & Tags */}
                <div className="showcase-tags-row font-ui">
                  <span className="story-pill">📷 Analog Film</span>
                  <span className="story-pill">☕ Pour-over</span>
                  <span className="story-pill">📖 Murakami</span>
                </div>
              </div>
            </div>

            {/* Floating Social Proof Pill (Bottom Right) */}
            <div className="floating-chip chip-bottom-right font-ui">
              <span className="chip-voice-icon">🎙️</span>
              <span>&ldquo;Her voice felt so genuine.&rdquo;</span>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="values-section" aria-labelledby="values-heading">
          <div className="section-header">
            <h2 id="values-heading" className="section-title font-display">Built different, on purpose.</h2>
            <p className="section-subtitle font-body">We redesigned connection from the ground up to respect your humanity.</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-box pink">
                <Users size={28} />
              </div>
              <h3 className="value-card-title font-display">Inclusive by Design</h3>
              <p className="value-card-text font-body">
                Your gender, orientation, and disability identity are celebrated here. We design with and for communities often ignored.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon-box gold">
                <ShieldCheck size={28} />
              </div>
              <h3 className="value-card-title font-display">Safety First</h3>
              <p className="value-card-text font-body">
                Complete control over your experience. Block, report, or limit visibility anytime. Your peace of mind is our foundation.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon-box burgundy">
                <Heart size={28} />
              </div>
              <h3 className="value-card-title font-display">Meaningful Connection</h3>
              <p className="value-card-text font-body">
                Browse detailed stories rather than instant cards. We encourage thoughtful reading and deep emotional resonance.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon-box dark">
                <Bookmark size={28} />
              </div>
              <h3 className="value-card-title font-display">Accessible to All</h3>
              <p className="value-card-text font-body">
                Fully compliant layouts featuring customizable font sizing, high-contrast toggles, and reduced motion capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="section-title font-display text-center">Your journey to connection</h2>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-num font-display">01</div>
              <h3 className="step-title font-ui">Tell Your Story</h3>
              <p className="step-text font-body">
                Share who you are — your identity, interests, and aspirations. Express yourself in details that checklists miss.
              </p>
            </div>

            <div className="step-divider"></div>

            <div className="step-item">
              <div className="step-num font-display">02</div>
              <h3 className="step-title font-ui">Discover Thoughtfully</h3>
              <p className="step-text font-body">
                Browse our profiles like reading a magazine. Explore detailed stories and discover people in a calm, beautiful space.
              </p>
            </div>

            <div className="step-divider"></div>

            <div className="step-item">
              <div className="step-num font-display">03</div>
              <h3 className="step-title font-ui">Connect Meaningfully</h3>
              <p className="step-text font-body">
                Send interest directly to stories. If mutual, connection forms, letting you start a real conversation.
              </p>
            </div>
          </div>
        </section>

        {/* Safety Banner */}
        <section className="safety-banner" aria-labelledby="safety-heading">
          <div className="safety-banner-content">
            <h2 id="safety-heading" className="safety-title font-display">Your safety is our foundation.</h2>
            <p className="safety-subtitle font-body">
              We require active verification, enforce respectful community guidelines, and offer persistent support resources accessible with just two taps.
            </p>
            <ul className="safety-points font-ui">
              <li><span>✓</span> Verified identity systems</li>
              <li><span>✓</span> Respectful community guidelines</li>
              <li><span>✓</span> Phone verification required</li>
              <li><span>✓</span> Accessible Safety Center</li>
            </ul>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="faq-section" aria-labelledby="faq-heading">
          <div className="section-header">
            <h2 id="faq-heading" className="section-title font-display">Frequently Asked Questions</h2>
            <p className="section-subtitle font-body">Everything you need to know about Velvet Hearts and how we match.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question font-ui"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  aria-expanded={openFaqIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div id={`faq-answer-${idx}`} className="faq-answer font-body" role="region" aria-labelledby={`faq-question-${idx}`}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta-section" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="cta-title font-display">Ready to be seen?</h2>
          <button onClick={onGetStarted} className="cta-primary large-cta font-ui" aria-label="Sign up for Velvet Hearts">
            <span>Begin Your Journey</span>
            <div className="cta-icon-wrapper">
              <ArrowRight size={18} weight="bold" />
            </div>
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer font-ui">
        <div className="footer-brand font-display">
          <img src={logo} alt="Velvet Hearts Logo" className="footer-logo-image" width="32" height="32" />
          <span>Velvet Hearts</span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#guidelines" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Community Guidelines', message: 'Be respectful, genuine, and kind.' }); }}>Community Guidelines</a>
          <a href="/safety" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('safety'); else showAlert({ title: 'Safety Center', message: 'Report tools are available directly inside chat and profiles.' }); }}>Safety Center</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('privacy'); else showAlert({ title: 'Privacy Policy', message: 'Your data is secure and never sold.' }); }}>Privacy Policy</a>
          <a href="#cookies" onClick={(e) => { e.preventDefault(); triggerCookieBanner(); }}>Cookie Preferences</a>
          <a href="/terms" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('terms'); else showAlert({ title: 'Terms of Service', message: 'Agree to engage with care.' }); }}>Terms of Service</a>
        </nav>
        <div className="footer-copy">
          Made with care. &copy; 2026 Velvet Hearts. All rights reserved.
        </div>
      </footer>

      <style>{`
        .landing-container {
          min-height: 100vh;
          background-color: var(--bg-page);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
          padding-bottom: 0;
        }

        .gradient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }

        .glow-1 {
          top: -120px;
          right: -80px;
          width: 580px;
          height: 580px;
          background: radial-gradient(circle, rgba(184, 67, 106, 0.22) 0%, transparent 70%);
          animation: gradientDrift 20s infinite alternate;
        }

        .glow-2 {
          top: 480px;
          left: -180px;
          width: 640px;
          height: 640px;
          background: radial-gradient(circle, rgba(212, 173, 106, 0.18) 0%, transparent 70%);
          animation: gradientDrift 25s infinite alternate-reverse;
        }

        .glow-3 {
          bottom: 100px;
          right: 5%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(122, 40, 66, 0.15) 0%, transparent 70%);
          animation: gradientDrift 18s infinite alternate;
        }

        @keyframes gradientDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -40px) scale(1.08); }
        }

        /* --- Header Navigation --- */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-8);
          max-width: 1240px;
          margin: 0 auto;
          position: relative;
          z-index: 20;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          cursor: pointer;
        }

        .landing-brand-logo {
          width: 42px;
          height: 42px;
          object-fit: contain;
          filter: drop-shadow(0 4px 14px rgba(184, 67, 106, 0.35));
          transition: transform var(--duration-fast) var(--ease-spring);
        }

        .landing-brand:hover .landing-brand-logo {
          transform: scale(1.08) rotate(4deg);
        }

        .landing-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .landing-brand-name {
          font-size: 1.45rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--burgundy-900);
          font-family: var(--font-display);
        }

        [data-theme="dark"] .landing-brand-name {
          color: var(--cream-100);
        }

        .landing-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
          display: inline-block;
          animation: pulseDot 2s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .landing-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .sign-in-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-default);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 8px 22px;
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          font-weight: 600;
          transition: all var(--duration-fast) var(--ease-out-smooth);
          cursor: pointer;
        }

        .sign-in-btn:hover {
          background-color: var(--bg-surface-warm);
          border-color: var(--burgundy-400);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        /* --- Hero Section & Above-the-Fold Architecture --- */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-10);
          padding: var(--space-8) var(--space-8) var(--space-16);
          max-width: 1240px;
          margin: 0 auto;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        @media (min-width: 992px) {
          .hero-section {
            grid-template-columns: 1.15fr 0.85fr;
            min-height: calc(100dvh - 84px);
            padding: var(--space-4) var(--space-8) var(--space-8);
            gap: var(--space-10);
          }
        }

        .hero-content {
          max-width: 640px;
          display: flex;
          flex-direction: column;
          animation: fadeInUp var(--duration-slow) var(--ease-out-smooth) both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 1. Eyebrow Badge */
        .accent-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          background: rgba(184, 67, 106, 0.08);
          border: 1px solid rgba(184, 67, 106, 0.22);
          color: var(--burgundy-600);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: var(--space-3);
          box-shadow: 0 2px 8px rgba(184, 67, 106, 0.06);
          transition: transform var(--duration-fast);
        }

        [data-theme="dark"] .accent-badge {
          background: rgba(224, 141, 163, 0.12);
          border-color: rgba(224, 141, 163, 0.25);
          color: var(--burgundy-200);
        }

        .badge-sparkle-icon {
          color: var(--burgundy-500);
          animation: spinPulse 6s infinite ease-in-out;
        }

        @keyframes spinPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(180deg); }
        }

        /* 2. Hero Headline (What to look at first) */
        .hero-title {
          font-size: clamp(2.2rem, 3.8vw + 0.6rem, 3.6rem);
          color: var(--burgundy-950);
          line-height: 1.12;
          letter-spacing: -0.025em;
          margin: 0 0 var(--space-3) 0;
          font-weight: 700;
        }

        [data-theme="dark"] .hero-title {
          color: var(--cream-100);
        }

        .hero-title-accent {
          background: linear-gradient(135deg, var(--burgundy-500) 0%, var(--rose-500) 60%, var(--gold-400) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        /* 3. Value Proposition (What it is & Who it is for) */
        .hero-description {
          font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 var(--space-5) 0;
          max-width: 580px;
        }

        [data-theme="dark"] .hero-description {
          color: var(--charcoal-300);
        }

        /* 4. Above-the-Fold Trust Pillars (Why it matters) */
        .hero-trust-pillars {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-2);
          margin-bottom: var(--space-5);
        }

        @media (min-width: 540px) {
          .hero-trust-pillars {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .trust-pillar-pill {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid var(--border-subtle);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all var(--duration-fast) var(--ease-out-smooth);
        }

        [data-theme="dark"] .trust-pillar-pill {
          background: rgba(44, 36, 38, 0.5);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .trust-pillar-pill:hover {
          transform: translateY(-2px);
          border-color: var(--burgundy-400);
          box-shadow: 0 4px 14px rgba(58, 14, 26, 0.06);
        }

        .pillar-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .pillar-icon.shield { color: var(--gold-500); }
        .pillar-icon.mic { color: var(--burgundy-500); }
        .pillar-icon.bookmark { color: var(--rose-500); }

        .pillar-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .pillar-text strong {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pillar-text span {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        /* 5. CTAs & Friction Reducers (What to do next) */
        .hero-actions-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: stretch;
        }

        @media (min-width: 576px) {
          .hero-actions {
            flex-direction: row;
            align-items: center;
          }
        }

        /* Primary Button with Button-in-Button Trailing Icon */
        .cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--burgundy-600) 0%, var(--burgundy-500) 50%, var(--rose-500) 100%);
          color: #ffffff;
          padding: 8px 10px 8px 26px;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1.025rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.35);
          transition: all var(--duration-fast) var(--ease-spring);
          text-decoration: none;
        }

        .cta-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(184, 67, 106, 0.45);
        }

        .cta-primary:active {
          transform: translateY(0) scale(0.98);
        }

        .cta-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--duration-fast) var(--ease-spring);
        }

        .cta-primary:hover .cta-icon-wrapper {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.32);
        }

        /* Ghost CTA */
        .cta-ghost {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid var(--border-default);
          color: var(--text-primary);
          padding: 14px 26px;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all var(--duration-fast) var(--ease-out-smooth);
          cursor: pointer;
          text-align: center;
        }

        .cta-ghost:hover {
          background-color: var(--bg-surface-warm);
          border-color: var(--burgundy-400);
          transform: translateY(-1px);
        }

        /* Trust Subtext strip */
        .hero-subtext {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 12px;
          font-size: 0.78rem;
          color: var(--text-muted);
          padding-left: 4px;
        }

        .subtext-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .subtext-check {
          color: var(--success);
        }

        .subtext-divider {
          opacity: 0.4;
        }

        /* --- Right Column: Interactive Story Showcase Card --- */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: scaleIn var(--duration-slow) var(--ease-out-smooth) both;
          animation-delay: 0.15s;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(18px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Floating Trust Chips (Overlay) */
        .floating-chip {
          position: absolute;
          z-index: 15;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 25px rgba(42, 8, 18, 0.12);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--charcoal-900);
          animation: floatChip 5s ease-in-out infinite alternate;
        }

        [data-theme="dark"] .floating-chip {
          background: rgba(36, 26, 30, 0.85);
          border-color: rgba(255, 255, 255, 0.12);
          color: var(--cream-100);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        .chip-top-left {
          top: -16px;
          left: -12px;
          animation-delay: 0s;
        }

        .chip-bottom-right {
          bottom: -16px;
          right: -12px;
          animation-delay: 2.5s;
        }

        @keyframes floatChip {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }

        /* Double-Bezel Card Container */
        .double-bezel-outer {
          width: 100%;
          max-width: 410px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 28px;
          padding: 8px;
          box-shadow: 0 20px 50px rgba(58, 14, 26, 0.12), 0 0 30px rgba(184, 67, 106, 0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: transform var(--duration-normal) var(--ease-out-smooth);
        }

        [data-theme="dark"] .double-bezel-outer {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(184, 67, 106, 0.15);
        }

        .double-bezel-outer:hover {
          transform: translateY(-4px);
        }

        .double-bezel-inner {
          background: var(--bg-surface);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
        }

        [data-theme="dark"] .double-bezel-inner {
          background: var(--charcoal-900);
          border-color: rgba(255, 255, 255, 0.06);
        }

        /* Showcase Photo Container */
        .showcase-photo-container {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
        }

        .showcase-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.6s var(--ease-out-smooth);
        }

        .double-bezel-outer:hover .showcase-photo {
          transform: scale(1.04);
        }

        .showcase-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 21, 23, 0.85) 0%, rgba(26, 21, 23, 0.1) 50%, transparent 100%);
          pointer-events: none;
        }

        /* Vibe Score Badge */
        .vibe-score-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(26, 21, 23, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .heart-pulse-icon {
          color: var(--rose-400);
          animation: heartBeat 1.8s infinite;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.28); }
          30% { transform: scale(1); }
          45% { transform: scale(1.18); }
        }

        /* Profile Identity text overlay */
        .showcase-identity {
          position: absolute;
          bottom: 14px;
          left: 18px;
          right: 18px;
          color: #ffffff;
        }

        .identity-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .identity-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .verified-shield-icon {
          color: #4ade80;
          display: inline-flex;
          align-items: center;
          filter: drop-shadow(0 0 6px rgba(74, 222, 128, 0.5));
        }

        .identity-bio {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.82);
          margin: 2px 0 0 0;
        }

        /* Showcase Voice Module */
        .showcase-voice-module {
          padding: 16px 18px;
          background: var(--bg-surface-warm);
          border-bottom: 1px solid var(--border-subtle);
        }

        [data-theme="dark"] .showcase-voice-module {
          background: rgba(30, 24, 26, 0.7);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .voice-module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .voice-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .speaker-icon {
          color: var(--burgundy-500);
        }

        .voice-title {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        .voice-duration {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .voice-player-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .voice-play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--burgundy-500);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--duration-fast) var(--ease-spring);
          box-shadow: 0 2px 8px rgba(184, 67, 106, 0.35);
        }

        .voice-play-btn:hover {
          transform: scale(1.08);
          background: var(--burgundy-400);
        }

        .voice-play-btn.is-playing {
          background: var(--gold-500);
        }

        .play-triangle-icon {
          margin-left: 2px;
        }

        .waveform-track {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 3px;
          height: 28px;
          padding: 0 4px;
        }

        .wave-bar {
          flex: 1;
          background-color: var(--burgundy-300);
          border-radius: 3px;
          min-height: 4px;
          transition: background-color var(--duration-fast);
        }

        [data-theme="dark"] .wave-bar {
          background-color: var(--burgundy-400);
          opacity: 0.6;
        }

        .waveform-track.animating .wave-bar {
          background-color: var(--burgundy-500);
          animation: soundWave 0.8s ease-in-out infinite alternate;
        }

        @keyframes soundWave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.15); }
        }

        .voice-quote {
          font-size: 0.825rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }

        /* Showcase Tag Pills */
        .showcase-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 12px 18px 16px;
        }

        .story-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: rgba(184, 67, 106, 0.08);
          color: var(--text-primary);
          font-size: 0.72rem;
          font-weight: 500;
          border: 1px solid var(--border-subtle);
        }

        [data-theme="dark"] .story-pill {
          background: rgba(255, 255, 255, 0.05);
          color: var(--charcoal-200);
          border-color: rgba(255, 255, 255, 0.08);
        }

        /* Values */
        .values-section {
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: var(--space-16) var(--space-8);
        }

        .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-12);
        }

        .section-title {
          font-size: var(--text-display);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .section-subtitle {
          color: var(--text-secondary);
        }

        .values-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
          max-width: var(--content-max-width);
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .values-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .value-card {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          transition: all var(--duration-fast);
        }

        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--text-accent);
        }

        .value-icon-box {
          display: inline-flex;
          padding: var(--space-3);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .value-icon-box.pink { background-color: var(--burgundy-50); color: var(--burgundy-500); }
        .value-icon-box.gold { background-color: var(--warning-light); color: var(--gold-500); }
        .value-icon-box.burgundy { background-color: rgba(184, 67, 106, 0.15); color: var(--burgundy-600); }
        .value-icon-box.dark { background-color: var(--bg-muted); color: var(--text-primary); }

        .value-card-title {
          font-size: var(--text-subheading);
          margin-bottom: var(--space-2);
        }

        .value-card-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        /* How it Works */
        .how-it-works-section {
          padding: var(--space-16) var(--space-8);
          max-width: var(--content-max-width);
          margin: 0 auto;
        }

        .text-center { text-align: center; }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          margin-top: var(--space-12);
        }

        @media (min-width: 992px) {
          .steps-container {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        .step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .step-num {
          font-size: 54px;
          color: var(--burgundy-200);
          margin-bottom: var(--space-2);
          opacity: 0.7;
        }

        .step-title {
          font-size: var(--text-body-lg);
          font-weight: bold;
          margin-bottom: var(--space-2);
        }

        .step-text {
          color: var(--text-secondary);
          font-size: var(--text-body-sm);
        }

        .step-divider {
          height: 1px;
          background-color: var(--border-subtle);
          align-self: center;
          width: 100%;
          display: none;
        }

        @media (min-width: 992px) {
          .step-divider {
            display: block;
            width: 40px;
            margin-top: var(--space-12);
          }
        }

        /* Safety Banner */
        .safety-banner {
          background-color: var(--burgundy-900);
          color: var(--cream-100);
          padding: var(--space-16) var(--space-8);
          border-top: 1px solid var(--burgundy-950);
        }

        .safety-banner-content {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .safety-title {
          font-size: var(--text-display);
          color: var(--cream-100);
          margin-bottom: var(--space-4);
        }

        .safety-subtitle {
          color: var(--burgundy-100);
          margin-bottom: var(--space-8);
        }

        .safety-points {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-4) var(--space-8);
        }

        .safety-points li {
          font-size: var(--text-body);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .safety-points span {
          color: var(--gold-400);
          font-weight: bold;
        }

        /* FAQ Section */
        .faq-section {
          padding: var(--space-16) var(--space-8);
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .faq-item {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          background-color: var(--bg-surface);
          overflow: hidden;
          transition: border-color var(--duration-fast);
        }

        .faq-item.open {
          border-color: var(--burgundy-400);
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-body-lg);
          font-weight: var(--weight-semibold);
          text-align: left;
          cursor: pointer;
          transition: background-color var(--duration-fast);
        }

        .faq-question:hover {
          background-color: var(--bg-surface-warm);
        }

        .faq-icon {
          font-size: 20px;
          font-weight: 300;
          color: var(--burgundy-500);
        }

        .faq-answer {
          padding: 0 var(--space-6) var(--space-5);
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: 1.6;
        }

        /* Final CTA */
        .final-cta-section {
          padding: var(--space-20) var(--space-8);
          text-align: center;
          background-color: var(--cream-100);
          border-bottom: 1px solid var(--border-subtle);
        }

        [data-theme="dark"] .final-cta-section {
          background-color: var(--charcoal-900);
        }

        .cta-title {
          font-size: var(--text-display);
          margin-bottom: var(--space-8);
        }

        .large-cta {
          padding: var(--space-4) var(--space-12);
          font-size: var(--text-body-lg);
        }

        /* Footer */
        .landing-footer {
          padding: var(--space-10) var(--space-8);
          max-width: var(--content-max-width);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-heading);
          color: var(--text-accent);
          font-weight: bold;
        }

        .footer-logo-image {
          height: 32px;
          width: auto;
          object-fit: contain;
          transition: transform var(--duration-fast);
        }

        .footer-brand:hover .footer-logo-image {
          transform: scale(1.08);
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-4) var(--space-8);
        }

        .footer-links a {
          color: var(--text-secondary);
          font-size: var(--text-body-sm);
        }

        .footer-links a:hover {
          color: var(--text-primary);
        }

        .footer-copy {
          font-size: var(--text-caption);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

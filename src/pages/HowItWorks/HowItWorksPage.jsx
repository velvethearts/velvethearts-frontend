import React from 'react';
import {
  HandHeart,
  ShieldCheck,
  Microphone,
  BookBookmark,
  Sparkle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X
} from '@phosphor-icons/react';
import logo from '../../assets/velvet-heart-logo.png';
import { ThemeToggle } from '../../components/UI/ThemeToggle';

export const HowItWorksPage = ({ onGetStarted, onSignIn, onNavigate }) => {
  return (
    <div className="hiw-universe font-ui">
      {/* Floating Glass Navigation */}
      <header className="hiw-nav">
        <div className="hiw-nav-inner">
          <div
            className="hiw-nav-brand"
            onClick={() => (onNavigate ? onNavigate('') : (window.location.href = '/'))}
            role="button"
            tabIndex={0}
            aria-label="Return to Velvet Hearts home"
          >
            <img src={logo} alt="Velvet Hearts Logo" className="hiw-nav-logo" width="30" height="30" />
            <span className="hiw-nav-wordmark font-display">Velvet Hearts</span>
          </div>

          <div className="hiw-nav-actions">
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('') : (window.location.href = '/'))}
              className="hiw-nav-back-btn font-ui"
              aria-label="Back to home page"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Home</span>
            </button>
            <ThemeToggle />
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="hiw-nav-signin font-ui"
                aria-label="Sign in"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="hiw-main">
        {/* Hero Section */}
        <section className="hiw-hero">
          <div className="hiw-badge">
            <Sparkle size={14} weight="fill" />
            <span>A Different Kind of Dating Space</span>
          </div>
          <h1 className="hiw-hero-title font-display">
            How Velvet Hearts Works
          </h1>
          <p className="hiw-hero-sub font-body">
            Modern dating has become an exhausting loop of rapid photo swiping, ghosting, and unverified profiles.
            Velvet Hearts is built on a simple conviction: genuine relationships begin with stories, authentic voices,
            safety, and mutual respect.
          </p>
        </section>

        {/* Contrast Grid: Swiping vs Intentional */}
        <section className="hiw-card hiw-compare-section">
          <h2 className="hiw-card-title font-display">
            The Shift from Swipe Apps to Intentional Connection
          </h2>
          <p className="hiw-card-sub">
            We designed Velvet Hearts to eliminate the shallow habits that make modern dating frustrating.
          </p>

          <div className="hiw-compare-grid">
            {/* The Old Way */}
            <div className="hiw-compare-col hiw-col-old">
              <h3 className="hiw-compare-header old-header font-ui">
                <X size={18} weight="bold" />
                <span>The Swipe App Paradigm</span>
              </h3>
              <ul className="hiw-compare-list old-list">
                <li>• 0.5-second superficial photo evaluations</li>
                <li>• Ephemeral matches that rarely spark conversations</li>
                <li>• Ghosting as the default exit strategy</li>
                <li>• Unverified accounts, bots, and rampant catfishing</li>
                <li>• Conversations vanish without closure or safety checks</li>
              </ul>
            </div>

            {/* The Velvet Hearts Way */}
            <div className="hiw-compare-col hiw-col-new">
              <h3 className="hiw-compare-header new-header font-ui">
                <Sparkle size={18} weight="fill" />
                <span>The Velvet Hearts Way</span>
              </h3>
              <ul className="hiw-compare-list new-list">
                <li>• <strong>Story-First Profiles</strong> with values, aspirations, and lifestyle depth</li>
                <li>• <strong>2-Minute Voice Intros</strong> to hear laughter, sincerity, and humor</li>
                <li>• <strong>AI-Assisted Photo Verification</strong> to ensure honest, real profiles</li>
                <li>• <strong>Grace Close</strong> for boundary-honoring, respectful closure</li>
                <li>• <strong>Our Diary</strong> to preserve sweet memories as a couple</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4 Differentiating Features */}
        <section className="hiw-features-section">
          <div className="hiw-section-header">
            <h2 className="hiw-section-title font-display">
              Our Core Differentiators
            </h2>
            <p className="hiw-section-sub">
              Four purpose-built features crafted to restore dignity, safety, and heartfelt depth to online dating.
            </p>
          </div>

          <div className="hiw-features-stack">
            {/* Feature 1: Grace Close */}
            <div id="grace-close" className="hiw-card hiw-feature-card">
              <div className="hiw-feature-info">
                <div className="hiw-pill-tag">
                  <HandHeart size={16} weight="duotone" />
                  <span>Boundary-Honoring Closure</span>
                </div>
                <h3 className="hiw-feature-heading font-display">Grace Close</h3>
                <p className="hiw-feature-desc font-body">
                  Ghosting leaves people confused, while abrupt unmatching can feel unnecessarily harsh. In Velvet Hearts,
                  when a connection is not reciprocal, <strong>Grace Close</strong> lets you step back with dignity and respect.
                </p>
                <p className="hiw-feature-desc font-body">
                  Discontinuing a match removes the connection cleanly without a hostile block. Any unread draft messages
                  or sealed time-capsule letters are automatically voided, providing clean emotional closure so both partners
                  can move on peacefully.
                </p>
              </div>

              <div className="hiw-subcard">
                <h4 className="hiw-subcard-title font-ui">Why Grace Close Matters</h4>
                <div className="hiw-checklist">
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>No silent ghosting:</strong> Normalizes stepping away with mutual respect.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>Clean slate:</strong> Automatically voids pending letters and shared diary drafts.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>Rediscovery friendly:</strong> Separates voluntary unmatching from punitive safety blocking.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Date Check-In */}
            <div id="date-check-in" className="hiw-card hiw-feature-card">
              <div className="hiw-feature-info">
                <div className="hiw-pill-tag green-tag">
                  <ShieldCheck size={16} weight="duotone" />
                  <span>Offline Dating Protection</span>
                </div>
                <h3 className="hiw-feature-heading font-display">Date Check-In</h3>
                <p className="hiw-feature-desc font-body">
                  Dating safety should never stop when you transition from messaging to an in-person meeting.
                  Velvet Hearts integrates thoughtful <strong>Date Check-In</strong> guidance to support your real-world dates.
                </p>
                <p className="hiw-feature-desc font-body">
                  Before meeting, members are prompted to share their venue, timing, and date details with a trusted friend or
                  family member. With 2-tap Safety Center access, you always have rapid reporting and emergency resources
                  right on your phone.
                </p>
              </div>

              <div className="hiw-subcard">
                <h4 className="hiw-subcard-title font-ui green-title">Safety Recommendations</h4>
                <div className="hiw-checklist">
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon green-icon" weight="fill" />
                    <span><strong>Pre-date notice:</strong> Share date location and time with a trusted emergency contact.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon green-icon" weight="fill" />
                    <span><strong>Public venues:</strong> Choose well-lit, populated public spots for early dates.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon green-icon" weight="fill" />
                    <span><strong>Two-tap support:</strong> Instant reporting and moderation assistance available in-app.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Blind Spark */}
            <div id="blind-spark" className="hiw-card hiw-feature-card">
              <div className="hiw-feature-info">
                <div className="hiw-pill-tag gold-tag">
                  <Microphone size={16} weight="duotone" />
                  <span>Voice &amp; Personality First</span>
                </div>
                <h3 className="hiw-feature-heading font-display">Blind Spark</h3>
                <p className="hiw-feature-desc font-body">
                  Photos can capture appearance, but they cannot capture character, cadence, warmth, or humor.
                  <strong>Blind Spark</strong> prioritizes voice and authentic storytelling before snap visual filtering takes over.
                </p>
                <p className="hiw-feature-desc font-body">
                  Every member can record a 2-minute voice introduction. By listening to how someone speaks, what they value,
                  and how they laugh, you form impressions based on real human energy rather than filtered static pictures.
                </p>
              </div>

              <div className="hiw-subcard">
                <h4 className="hiw-subcard-title font-ui gold-title">How Blind Spark Works</h4>
                <div className="hiw-checklist">
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon gold-icon" weight="fill" />
                    <span><strong>2-Minute Audio Intros:</strong> Hear authentic tone, thoughts, and communication style.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon gold-icon" weight="fill" />
                    <span><strong>Story Over Snapshots:</strong> Read comprehensive personal stories and values.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon gold-icon" weight="fill" />
                    <span><strong>Vibe Scoring:</strong> Compatibility scored on shared values, intent, and lifestyle.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Our Diary */}
            <div id="our-diary" className="hiw-card hiw-feature-card">
              <div className="hiw-feature-info">
                <div className="hiw-pill-tag">
                  <BookBookmark size={16} weight="duotone" />
                  <span>Shared Couple Journal</span>
                </div>
                <h3 className="hiw-feature-heading font-display">Our Diary</h3>
                <p className="hiw-feature-desc font-body">
                  Most dating apps treat mutual matching as the finish line. Velvet Hearts is built for couples who want to
                  nurture what they started. <strong>Our Diary</strong> is an interactive, dual-entry digital memory book
                  shared exclusively between you and your matched partner.
                </p>
                <p className="hiw-feature-desc font-body">
                  Save favorite messages from your chats, upload memorable photos, write joint reflections, and celebrate
                  milestones page by page in a nostalgic flipbook journal that grows with your relationship.
                </p>
              </div>

              <div className="hiw-subcard">
                <h4 className="hiw-subcard-title font-ui">Inside Our Diary</h4>
                <div className="hiw-checklist">
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>Dual-Entry Collaboration:</strong> Both partners write, edit, and contribute entries.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>Interactive Flipbook:</strong> Turn physical-style book pages of your shared journey.</span>
                  </div>
                  <div className="hiw-check-item">
                    <CheckCircle size={18} className="hiw-check-icon" weight="fill" />
                    <span><strong>Private &amp; Secure:</strong> Strictly isolated to you and your match.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Journey Overview */}
        <section className="hiw-card hiw-journey-section">
          <div className="hiw-section-header">
            <h2 className="hiw-card-title font-display">The 5-Step Velvet Hearts Journey</h2>
            <p className="hiw-card-sub">
              How real connections develop from first impression to shared milestones.
            </p>
          </div>

          <div className="hiw-steps-grid">
            {[
              {
                step: '01',
                title: 'Tell Your Story',
                desc: 'Complete your profile with personal values, relationship intent, lifestyle passions, and a 2-minute voice intro.'
              },
              {
                step: '02',
                title: 'Photo Verification',
                desc: 'AI-assisted face and photo verification ensures every profile represents an authentic, real individual.'
              },
              {
                step: '03',
                title: 'Discover Thoughtfully',
                desc: 'Explore story cards in magazine format. Listen to voice intros and send intentional Sparks or Super Sparks.'
              },
              {
                step: '04',
                title: 'Connect & Chat',
                desc: 'When interest is mutual, a connection forms. Exchange real-time text, voice notes, and 24h Spark Notes.'
              },
              {
                step: '05',
                title: 'Preserve Moments',
                desc: 'Compose future-dated Rewind Letters and build your shared journey page by page in Our Diary.'
              }
            ].map((item, idx) => (
              <div key={idx} className="hiw-step-item">
                <div className="hiw-step-num font-display">{item.step}</div>
                <h3 className="hiw-step-title font-ui">{item.title}</h3>
                <p className="hiw-step-desc font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="hiw-bottom-cta">
          <h2 className="hiw-bottom-cta-title font-display">
            Ready for Dating with Intention?
          </h2>
          <p className="hiw-bottom-cta-sub font-body">
            Step away from mindless swiping and join a community that honors who you are.
          </p>
          <div className="hiw-bottom-cta-actions">
            {onGetStarted && (
              <button
                type="button"
                onClick={onGetStarted}
                className="hiw-btn-primary font-ui"
              >
                <span>Begin Your Journey</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            )}
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('safety') : (window.location.href = '/safety'))}
              className="hiw-btn-ghost font-ui"
            >
              Explore Safety Center
            </button>
          </div>
        </section>
      </main>

      {/* Unified Luxury Footer */}
      <footer className="hiw-footer font-ui">
        <div className="hiw-footer-container">
          <div className="hiw-footer-top">
            <div className="hiw-footer-brand-col">
              <div className="hiw-footer-brand font-display">
                <img src={logo} alt="Velvet Hearts Logo" className="hiw-footer-logo" width="32" height="32" />
                <span>Velvet Hearts</span>
              </div>
              <p className="hiw-footer-tagline font-body">
                The intentional dating sanctuary for thoughtful singles seeking real emotional resonance.
              </p>
              <div className="hiw-footer-badges">
                <span className="hiw-footer-badge">Photo Verified</span>
                <span className="hiw-footer-dot">·</span>
                <span className="hiw-footer-badge">Voice Intros</span>
                <span className="hiw-footer-dot">·</span>
                <span className="hiw-footer-badge">Zero Ghosting</span>
              </div>
            </div>

            <div className="hiw-footer-nav-grid">
              <div className="hiw-footer-col">
                <h4 className="hiw-footer-col-title font-ui">Platform</h4>
                <ul className="hiw-footer-col-links">
                  <li><a href="/how-it-works" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('how-it-works'); else window.location.href = '/how-it-works'; }}>How It Works</a></li>
                  <li><a href="/blog" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('blog'); else window.location.href = '/blog'; }}>Safety Blog</a></li>
                  {onSignIn && <li><button type="button" onClick={onSignIn} className="hiw-footer-link-btn">Sign In</button></li>}
                  {onGetStarted && <li><button type="button" onClick={onGetStarted} className="hiw-footer-link-btn">Join Sanctuary</button></li>}
                </ul>
              </div>

              <div className="hiw-footer-col">
                <h4 className="hiw-footer-col-title font-ui">Safety &amp; Trust</h4>
                <ul className="hiw-footer-col-links">
                  <li><a href="/safety" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('safety'); else window.location.href = '/safety'; }}>Safety Center</a></li>
                  <li><a href="/guidelines" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('guidelines'); else window.location.href = '/guidelines'; }}>Community Guidelines</a></li>
                  <li><a href="/" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate(''); else window.location.href = '/'; }}>Home Sanctuary</a></li>
                </ul>
              </div>

              <div className="hiw-footer-col">
                <h4 className="hiw-footer-col-title font-ui">Legal</h4>
                <ul className="hiw-footer-col-links">
                  <li><a href="/privacy" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('privacy'); else window.location.href = '/privacy'; }}>Privacy Policy</a></li>
                  <li><a href="/terms" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('terms'); else window.location.href = '/terms'; }}>Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="hiw-footer-bottom">
            <div className="hiw-footer-copy">
              Made with care. &copy; 2026 Velvet Hearts. All rights reserved. Where every heart belongs.
            </div>
          </div>
        </div>
      </footer>

      {/* Styled Scoped CSS Engine */}
      <style>{`
        /* ==========================================================
           COLOR ENGINE & DESIGN TOKENS
           ========================================================== */
        .hiw-universe {
          --hiw-bg: #FAF5F8;
          --hiw-surface: #FFFFFF;
          --hiw-surface-card: #FFFFFF;
          --hiw-surface-subcard: #FDF4F8;
          --hiw-border: #E8D3DF;
          --hiw-border-subtle: #F0E2EC;
          --hiw-text-primary: #1C0D15;
          --hiw-text-body: #3A2631;
          --hiw-text-muted: #6B525E;
          --hiw-accent: #B8436A;
          --hiw-accent-subtle: rgba(184, 67, 106, 0.08);
          --hiw-accent-gold: #9E6B20;
          --hiw-danger-bg: #FFF3F6;
          --hiw-danger-border: #F09CB0;
          --hiw-danger-text: #991636;
          --hiw-nav-bg: rgba(255, 255, 255, 0.75);
          --hiw-nav-border: rgba(0, 0, 0, 0.06);

          background-color: var(--hiw-bg);
          color: var(--hiw-text-body);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        [data-theme="dark"] .hiw-universe {
          --hiw-bg: #0b070a;
          --hiw-surface: #140c11;
          --hiw-surface-card: #180e15;
          --hiw-surface-subcard: #20101a;
          --hiw-border: #2a1522;
          --hiw-border-subtle: #20101a;
          --hiw-text-primary: #ffffff;
          --hiw-text-body: #d6c1ca;
          --hiw-text-muted: #a8909b;
          --hiw-accent: #e27396;
          --hiw-accent-subtle: rgba(226, 115, 150, 0.12);
          --hiw-accent-gold: #d4ad6a;
          --hiw-danger-bg: #200912;
          --hiw-danger-border: rgba(217, 56, 93, 0.35);
          --hiw-danger-text: #ff99b3;
          --hiw-nav-bg: rgba(14, 9, 12, 0.72);
          --hiw-nav-border: rgba(255, 255, 255, 0.08);
        }

        /* ---- Floating Glass Nav ---- */
        .hiw-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 12px 24px;
          transition: all 0.4s ease;
        }

        .hiw-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 24px;
          border-radius: 100px;
          background: var(--hiw-nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--hiw-nav-border);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
        }

        .hiw-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .hiw-nav-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .hiw-nav-wordmark {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--hiw-text-primary);
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .hiw-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .hiw-nav-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--hiw-border);
          color: var(--hiw-text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .hiw-nav-back-btn:hover {
          border-color: var(--hiw-accent);
          color: var(--hiw-accent);
        }

        .hiw-nav-signin {
          padding: 6px 16px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--hiw-border);
          color: var(--hiw-text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .hiw-nav-signin:hover {
          border-color: var(--hiw-accent);
          color: var(--hiw-accent);
        }

        /* ---- Main Layout & Hero ---- */
        .hiw-main {
          max-width: 1060px;
          margin: 0 auto;
          padding: 120px 24px 80px;
        }

        .hiw-hero {
          text-align: center;
          margin-bottom: 56px;
        }

        .hiw-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 100px;
          background: var(--hiw-accent-subtle);
          border: 1px solid rgba(226, 115, 150, 0.25);
          color: var(--hiw-accent);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
        }

        .hiw-hero-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          line-height: 1.12;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--hiw-text-primary);
          margin-bottom: 20px;
        }

        .hiw-hero-sub {
          font-size: clamp(1.05rem, 1.5vw, 1.25rem);
          line-height: 1.65;
          max-width: 760px;
          margin: 0 auto;
          color: var(--hiw-text-body);
        }

        /* ---- Cards & Surfaces ---- */
        .hiw-card {
          background: var(--hiw-surface-card);
          border: 1px solid var(--hiw-border);
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
          margin-bottom: 48px;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .hiw-card-title {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700;
          color: var(--hiw-text-primary);
          margin-bottom: 12px;
          text-align: center;
        }

        .hiw-card-sub {
          text-align: center;
          color: var(--hiw-text-muted);
          max-width: 680px;
          margin: 0 auto 36px;
          font-size: 1.02rem;
          line-height: 1.6;
        }

        /* ---- Compare Grid ---- */
        .hiw-compare-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .hiw-compare-col {
          border-radius: 18px;
          padding: 28px 24px;
        }

        .hiw-col-old {
          background: var(--hiw-danger-bg);
          border: 1px solid var(--hiw-danger-border);
        }

        .hiw-col-new {
          background: var(--hiw-accent-subtle);
          border: 1px solid rgba(226, 115, 150, 0.3);
        }

        .hiw-compare-header {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .old-header {
          color: var(--hiw-danger-text);
        }

        .new-header {
          color: var(--hiw-accent);
        }

        .hiw-compare-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.94rem;
          line-height: 1.55;
        }

        .old-list {
          color: var(--hiw-text-muted);
        }

        .new-list {
          color: var(--hiw-text-primary);
        }

        /* ---- Core Differentiators Section ---- */
        .hiw-features-section {
          margin-bottom: 56px;
        }

        .hiw-section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .hiw-section-title {
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 700;
          color: var(--hiw-text-primary);
          margin-bottom: 12px;
        }

        .hiw-section-sub {
          color: var(--hiw-text-muted);
          max-width: 640px;
          margin: 0 auto;
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .hiw-features-stack {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .hiw-feature-card {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 36px;
          align-items: center;
        }

        .hiw-feature-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hiw-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 100px;
          background: var(--hiw-accent-subtle);
          color: var(--hiw-accent);
          font-size: 0.82rem;
          font-weight: 600;
          align-self: flex-start;
        }

        .green-tag {
          background: rgba(40, 167, 69, 0.12);
          color: #28a745;
        }

        .gold-tag {
          background: rgba(212, 173, 106, 0.14);
          color: var(--hiw-accent-gold);
        }

        .hiw-feature-heading {
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--hiw-text-primary);
          margin: 0;
        }

        .hiw-feature-desc {
          color: var(--hiw-text-body);
          font-size: 1rem;
          line-height: 1.68;
          margin: 0;
        }

        .hiw-subcard {
          background: var(--hiw-surface-subcard);
          border: 1px solid var(--hiw-border);
          border-radius: 18px;
          padding: 26px 24px;
        }

        .hiw-subcard-title {
          font-size: 0.88rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--hiw-accent);
          margin: 0 0 14px 0;
        }

        .green-title {
          color: #28a745;
        }

        .gold-title {
          color: var(--hiw-accent-gold);
        }

        .hiw-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.92rem;
          color: var(--hiw-text-primary);
          line-height: 1.5;
        }

        .hiw-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .hiw-check-icon {
          color: var(--hiw-accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .green-icon {
          color: #28a745;
        }

        .gold-icon {
          color: var(--hiw-accent-gold);
        }

        /* ---- 5-Step Journey ---- */
        .hiw-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .hiw-step-item {
          background: var(--hiw-surface-subcard);
          border: 1px solid var(--hiw-border);
          border-radius: 18px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hiw-step-num {
          font-size: 1.9rem;
          font-weight: 700;
          color: var(--hiw-accent);
        }

        .hiw-step-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--hiw-text-primary);
          margin: 0;
        }

        .hiw-step-desc {
          font-size: 0.9rem;
          color: var(--hiw-text-body);
          line-height: 1.55;
          margin: 0;
        }

        /* ---- Bottom CTA ---- */
        .hiw-bottom-cta {
          text-align: center;
          background: linear-gradient(135deg, #FFF0F4 0%, #FFFFFF 100%);
          border: 1px solid var(--hiw-border);
          border-radius: 24px;
          padding: 56px 32px;
          margin-bottom: 24px;
        }

        [data-theme="dark"] .hiw-bottom-cta {
          background: linear-gradient(135deg, rgba(184, 67, 106, 0.22) 0%, rgba(20, 10, 16, 0.9) 100%);
          border-color: rgba(184, 67, 106, 0.3);
        }

        .hiw-bottom-cta-title {
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 700;
          color: var(--hiw-text-primary);
          margin-bottom: 14px;
        }

        .hiw-bottom-cta-sub {
          max-width: 600px;
          margin: 0 auto 28px;
          color: var(--hiw-text-body);
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .hiw-bottom-cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hiw-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 100px;
          background: linear-gradient(135deg, #B8436A 0%, #800020 100%);
          color: #ffffff;
          border: none;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(184, 67, 106, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hiw-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(184, 67, 106, 0.45);
        }

        .hiw-btn-ghost {
          padding: 12px 24px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--hiw-border);
          color: var(--hiw-text-primary);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hiw-btn-ghost:hover {
          border-color: var(--hiw-accent);
          color: var(--hiw-accent);
        }

        /* ---- Footer Revamped ---- */
        .hiw-footer {
          border-top: 1px solid var(--hiw-border);
          background: var(--hiw-surface-card);
          padding: 64px 24px 36px;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .hiw-footer-container {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .hiw-footer-top {
          display: grid;
          grid-template-columns: 1.4fr 2fr;
          gap: 48px;
          align-items: start;
        }

        .hiw-footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hiw-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.35rem;
          color: var(--hiw-text-primary);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .hiw-footer-logo {
          height: 32px;
          width: 32px;
          object-fit: contain;
          border-radius: 50%;
        }

        .hiw-footer-tagline {
          font-size: 0.92rem;
          color: var(--hiw-text-muted);
          line-height: 1.6;
          max-width: 340px;
          margin: 0;
        }

        .hiw-footer-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--hiw-text-muted);
          font-weight: 500;
          flex-wrap: wrap;
        }

        .hiw-footer-dot {
          opacity: 0.5;
        }

        .hiw-footer-nav-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .hiw-footer-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hiw-footer-col-title {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--hiw-accent);
          margin: 0;
        }

        .hiw-footer-col-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hiw-footer-col-links a,
        .hiw-footer-link-btn {
          color: var(--hiw-text-body);
          font-size: 0.88rem;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .hiw-footer-col-links a:hover,
        .hiw-footer-link-btn:hover {
          color: var(--hiw-accent);
          transform: translateX(2px);
        }

        .hiw-footer-bottom {
          display: flex;
          justify-content: center;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid var(--hiw-border-subtle);
          font-size: 0.82rem;
          color: var(--hiw-text-muted);
        }

        /* ---- Responsive Queries ---- */
        @media (max-width: 860px) {
          .hiw-feature-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hiw-footer-top {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .hiw-footer-nav-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px;
          }
        }

        @media (max-width: 768px) {
          .hiw-nav {
            padding: 8px 14px;
          }
          .hiw-nav-inner {
            padding: 6px 14px;
            gap: 10px;
          }
          .hiw-nav-logo {
            width: 26px;
            height: 26px;
          }
          .hiw-nav-wordmark {
            font-size: 1.05rem;
          }
          .hiw-nav-actions {
            gap: 8px;
          }
          .hiw-nav-back-btn {
            padding: 5px 10px;
            font-size: 0.78rem;
          }
          .hiw-nav-signin {
            padding: 5px 12px;
            font-size: 0.8rem;
          }
          .hiw-main {
            padding: 96px 16px 50px;
          }
          .hiw-card {
            padding: 28px 20px;
            border-radius: 20px;
          }
        }

        @media (max-width: 480px) {
          .hiw-nav {
            padding: 6px 10px;
          }
          .hiw-nav-inner {
            padding: 5px 10px;
            gap: 6px;
          }
          .hiw-nav-wordmark {
            font-size: 0.95rem;
          }
          .hiw-nav-back-btn span {
            display: inline;
          }
          .hiw-nav-signin {
            display: none !important;
          }
          .hiw-footer {
            padding: 44px 18px 30px;
          }
          .hiw-footer-container {
            gap: 32px;
          }
          .hiw-footer-nav-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hiw-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorksPage;

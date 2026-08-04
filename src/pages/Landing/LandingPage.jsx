import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldCheck, Users, Bookmark, Sparkle } from '@phosphor-icons/react';
import { ThemeToggle } from '../../components/UI/ThemeToggle';
import logo from "../../assets/velvet-heart-logo.png";

export const LandingPage = ({ onGetStarted, onSignIn }) => {
  const { showAlert } = useApp();
  return (
    <div className="landing-container">
      {/* Decorative Gradient Background Elements */}
      <div className="gradient-glow glow-1"></div>
      <div className="gradient-glow glow-2"></div>

      <header className="landing-header">
        <div className="landing-logo">
        </div>
        <div className="landing-header-actions">
          <ThemeToggle />
          <button onClick={onSignIn} className="sign-in-btn font-ui">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="accent-badge font-ui">
            <Sparkle size={16} weight="fill" />
            <span>A Different Kind of Dating Space</span>
          </div>

          <div className="hero-title-logo-row">
            <h1 className="hero-title font-display">
              Where every<br />heart belongs.
            </h1>
            <img src={logo} alt="Velvet Hearts Logo" className="hero-inline-logo" />
          </div>

          <p className="hero-description font-body">
            A dating experience built on warmth, safety, and the belief that everyone deserves to be seen for who they truly are. No gamified swiping. No superficial checklist matching. Just human connection.
          </p>

          <div className="hero-actions">
            <button onClick={onGetStarted} className="cta-primary font-ui">
              Begin Your Journey &rarr;
            </button>
            <button onClick={onSignIn} className="cta-ghost font-ui">
              I already have an account
            </button>
          </div>
        </div>

        {/* Asymmetric Graphical Display representing intimacy */}
        <div className="hero-visual">
          <div className="visual-card card-main">
            <div className="visual-circle circle-1"></div>
            <div className="visual-circle circle-2"></div>
            <div className="visual-text font-display">Slow down.<br />Discover.</div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="values-section">
        <div className="section-header">
          <h2 className="section-title font-display">Built different, on purpose.</h2>
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
      <section className="how-it-works-section">
        <h2 className="section-title font-display text-center">Your journey to connection</h2>

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
      <section className="safety-banner">
        <div className="safety-banner-content">
          <h2 className="safety-title font-display">Your safety is our foundation.</h2>
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

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2 className="cta-title font-display">Ready to be seen?</h2>
        <button onClick={onGetStarted} className="cta-primary large-cta font-ui">
          Begin Your Journey
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer font-ui">
        <div className="footer-brand font-display">
          <img src={logo} alt="Velvet Hearts Logo" className="footer-logo-image" />
          <span>Velvet Hearts</span>
        </div>
        <div className="footer-links">
          <a href="#guidelines" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Community Guidelines', message: 'Be respectful, genuine, and kind.' }); }}>Community Guidelines</a>
          <a href="#safety" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Safety Center', message: 'Report tools are available directly inside chat and profiles.' }); }}>Safety Center</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Privacy Policy', message: 'Your data is secure and never sold.' }); }}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Terms of Service', message: 'Agree to engage with care.' }); }}>Terms of Service</a>
        </div>
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
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--burgundy-300) 0%, transparent 70%);
          animation: gradientDrift 20s infinite alternate;
        }

        .glow-2 {
          top: 600px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--gold-300) 0%, transparent 70%);
          animation: gradientDrift 25s infinite alternate-reverse;
        }

        /* Header */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6) var(--space-8);
          max-width: var(--content-max-width);
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .landing-logo {
         display: flex;
         align-items: center;
        }

        .landing-logo-image {
          height: 72px;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .landing-logo-image:hover {
          transform: scale(1.03);
        }

        .heart-logo {
          font-family: var(--font-display);
          font-size: var(--text-heading);
          color: var(--text-accent);
          font-weight: bold;
        }

        .sign-in-btn {
          border: 1.5px solid var(--border-default);
          padding: var(--space-2) var(--space-6);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          font-weight: 500;
          transition: all var(--duration-fast);
          cursor: pointer;
        }

        .sign-in-btn:hover {
          background-color: var(--bg-surface-warm);
        }

        .landing-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        /* Hero */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-10);
          padding: var(--space-12) var(--space-8);
          max-width: var(--content-max-width);
          margin: 0 auto;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        @media (min-width: 992px) {
          .hero-section {
            grid-template-columns: 1.2fr 0.8fr;
            min-height: calc(100vh - 120px);
            padding: var(--space-6) var(--space-8);
          }
        }

        .hero-content {
          max-width: 620px;
          animation: fadeInUp var(--duration-slow) var(--ease-out-smooth) both;
        }

        .accent-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--bg-accent-subtle);
          color: var(--text-accent);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-caption);
          font-weight: 600;
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-6);
        }

        .hero-title-logo-row {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-4);
        }

        .hero-title {
          font-size: var(--text-hero);
          color: var(--burgundy-900);
          margin-bottom: 0;
          line-height: 1.15;
          flex: 1 1 auto;
        }

        .hero-inline-logo {
          width: 220px;
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
          margin: 0;
          padding: 0;
          filter: drop-shadow(0 10px 28px rgba(184, 67, 106, 0.3));
          transition: transform 0.3s ease;
          animation: floatLogo 4s ease-in-out infinite alternate;
        }

        .hero-inline-logo:hover {
          transform: scale(1.08) rotate(3deg);
        }

        @keyframes floatLogo {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-6px) rotate(2deg); }
        }

        @media (max-width: 991px) {
          .hero-inline-logo {
            width: 180px;
          }
        }

        @media (max-width: 576px) {
          .hero-title-logo-row {
            gap: var(--space-3);
          }
          .hero-inline-logo {
            width: 150px;
          }
        }

        [data-theme="dark"] .hero-title {
          color: var(--cream-100);
        }

        .hero-description {
          font-size: var(--text-body-lg);
          color: var(--text-secondary);
          margin-bottom: var(--space-8);
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .hero-actions {
            flex-direction: row;
          }
        }

        .cta-primary {
          background-color: var(--bg-accent);
          color: var(--text-on-accent);
          padding: var(--space-4) var(--space-8);
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: var(--text-body);
          box-shadow: var(--shadow-sm);
          transition: all var(--duration-fast);
        }

        .cta-primary:hover {
          background-color: var(--bg-accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .cta-ghost {
          border: 1.5px solid var(--border-default);
          color: var(--text-primary);
          padding: var(--space-4) var(--space-8);
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: var(--text-body);
          transition: all var(--duration-fast);
        }

        .cta-ghost:hover {
          background-color: var(--bg-surface-warm);
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: scaleIn var(--duration-slow) var(--ease-out-smooth) both;
          animation-delay: 0.2s;
        }

        @media (max-width: 991px) {
          .hero-visual {
            display: none;
          }
        }

        .visual-card {
          width: 280px;
          height: 360px;
          background: linear-gradient(135deg, var(--burgundy-900) 0%, var(--burgundy-800) 100%);
          border-radius: var(--radius-xl);
          position: relative;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: var(--space-6);
        }

        .visual-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          top: -50px;
          left: -50px;
          background: radial-gradient(circle, rgba(184, 67, 106, 0.3) 0%, transparent 70%);
        }

        .circle-2 {
          width: 250px;
          height: 250px;
          bottom: -80px;
          right: -80px;
          background: radial-gradient(circle, rgba(212, 173, 106, 0.25) 0%, transparent 70%);
        }

        .visual-text {
          color: var(--cream-200);
          font-size: var(--text-subheading);
          z-index: 10;
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

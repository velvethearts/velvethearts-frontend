import React from 'react';
import {
  ShieldCheck,
  WarningCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';
import logo from '../../assets/velvet-heart-logo.png';
import { ThemeToggle } from '../../components/UI/ThemeToggle';

export const BlogPage = ({ onGetStarted, onSignIn, onNavigate }) => {
  return (
    <div className="blog-universe font-ui">
      {/* Floating Glass Navigation */}
      <header className="blog-nav">
        <div className="blog-nav-inner">
          <div
            className="blog-nav-brand"
            onClick={() => (onNavigate ? onNavigate('') : (window.location.href = '/'))}
            role="button"
            tabIndex={0}
            aria-label="Return to Velvet Hearts home"
          >
            <img src={logo} alt="Velvet Hearts Logo" className="blog-nav-logo" width="30" height="30" />
            <span className="blog-nav-wordmark font-display">Velvet Hearts</span>
          </div>

          <div className="blog-nav-actions">
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('') : (window.location.href = '/'))}
              className="blog-nav-back-btn font-ui"
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
                className="blog-nav-signin font-ui"
                aria-label="Sign in"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="blog-main">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="blog-breadcrumbs">
          <ol>
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('');
                  else window.location.href = '/';
                }}
              >
                Home
              </a>
            </li>
            <li className="sep">/</li>
            <li className="current">Safety Blog</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="blog-article-header">
          <div className="blog-badge font-ui">
            <ShieldCheck size={16} weight="fill" />
            <span>Dating Safety &amp; Trust Guide</span>
          </div>

          <h1 className="blog-title font-display">
            How to Spot and Avoid Catfishing While Dating Online
          </h1>

          <p className="blog-lead font-body">
            A practical, honest guide to identifying deceptive profiles, understanding modern romance scam tactics,
            and protecting your emotional and physical well-being.
          </p>

          <div className="blog-meta font-ui">
            <div className="blog-author">
              <div className="blog-author-avatar">VH</div>
              <span className="blog-author-name">Velvet Hearts Safety Team</span>
            </div>
            <span className="blog-meta-dot">•</span>
            <div className="blog-read-time">
              <Clock size={16} />
              <span>5 min read</span>
            </div>
            <span className="blog-meta-dot">•</span>
            <div className="blog-date">Updated October 2026</div>
          </div>
        </header>

        {/* Article Body */}
        <article className="blog-content font-body">
          {/* Key takeaway callout */}
          <div className="blog-callout">
            <strong>Core Rule:</strong> Real people looking for genuine connection are willing to prove their identity
            early. If someone avoids real-time audio or video, asks for money, or pushes you to abandon safe platforms,
            treat that as an immediate warning.
          </div>

          <h2 className="font-display">1. Understanding Modern Catfishing</h2>
          <p>
            The word &ldquo;catfishing&rdquo; once described someone using an attractive stranger&rsquo;s photos to win affection.
            In recent years, the landscape has changed. With the proliferation of AI-generated portraits, hijacked social media
            accounts, and organized financial romance syndicates, catfishing has evolved from simple insecurity into sophisticated
            social engineering.
          </p>
          <p>
            Whether motivated by loneliness, deceit, or financial fraud, catfishes operate using a predictable playbook:
            they manufacture an ideal persona, create intense emotional intimacy before you have met in person, and systematically
            deflect any request that requires real-time proof of their physical presence.
          </p>

          <h2 className="font-display">2. The 6 Major Red Flags to Watch For</h2>

          <div className="blog-cards-stack">
            {/* Red Flag 1 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>1. Perpetual Excuses to Avoid Voice or Video</span>
              </h3>
              <p className="blog-card-desc">
                This remains the single biggest giveaway. When invited to send a quick voice note, answer a brief audio call,
                or hop on video, they experience sudden &ldquo;camera anxiety,&rdquo; poor cellular service, broken microphones,
                or work restrictions. Someone genuinely interested in you will happily say hello with their real voice.
              </p>
            </div>

            {/* Red Flag 2 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>2. Overly Polished or Inconsistent Photos</span>
              </h3>
              <p className="blog-card-desc">
                Watch out for profiles featuring only hyper-curated, magazine-editorial shots with no casual, candid context.
                Pay close attention to subtle inconsistencies: ear piercings that vanish between photos, varying hand shapes,
                unnatural skin textures characteristic of AI generative models, or photos clearly taken across completely different decades.
              </p>
            </div>

            {/* Red Flag 3 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>3. Love-Bombing &amp; Rushed Intimacy</span>
              </h3>
              <p className="blog-card-desc">
                Catfishes often accelerate relationship milestones unnaturally fast. If someone declares you are their soulmate
                within 48 hours, showers you with poetic devotion before hearing your voice, or pushes you to move conversation
                immediately to unmonitored messaging channels (WhatsApp, Telegram, SMS), pause and evaluate. Emotional pacing
                should match real-life familiarity.
              </p>
            </div>

            {/* Red Flag 4 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>4. Sudden Financial Distress or Investment Offers</span>
              </h3>
              <p className="blog-card-desc">
                No matter how romantic a connection feels, genuine romantic interests will never ask you for money, medical assistance,
                gift card codes, flight fare, or &ldquo;guaranteed&rdquo; cryptocurrency investment platforms. The moment finances
                are introduced, cease communication immediately.
              </p>
            </div>

            {/* Red Flag 5 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>5. Local Disconnect and Vague Answers</span>
              </h3>
              <p className="blog-card-desc">
                If their profile lists your city, but they cannot mention favorite local coffee spots, stumble over neighborhood
                names, or claim to be permanently &ldquo;overseas on a confidential project,&rdquo; their location is likely falsified.
              </p>
            </div>

            {/* Red Flag 6 */}
            <div className="blog-card">
              <h3 className="blog-card-title font-ui">
                <WarningCircle size={20} weight="fill" />
                <span>6. Last-Minute Cancellations for In-Person Dates</span>
              </h3>
              <p className="blog-card-desc">
                They agree enthusiastically to a public coffee date, only to experience an emergency 30 minutes before arrival:
                a flat tire, sudden hospital admission, or sudden business trip. If this happens more than once, you are dealing
                with a fictitious persona.
              </p>
            </div>
          </div>

          <h2 className="font-display">3. Five Practical Steps to Protect Yourself</h2>

          <div className="blog-checklist">
            <div className="blog-check-row">
              <CheckCircle size={22} className="blog-check-icon" weight="fill" />
              <div>
                <strong>Perform a Voice &amp; Video Sanity Check Early:</strong> Do not spend three weeks typing long paragraphs
                to a stranger. Ask for a brief voice intro or 60-second video wave within the first week of conversation.
              </div>
            </div>

            <div className="blog-check-row">
              <CheckCircle size={22} className="blog-check-icon" weight="fill" />
              <div>
                <strong>Reverse Search Profile Images:</strong> Use Google Lens or TinEye on primary profile photos.
                If the portrait belongs to an Instagram influencer from another continent or a stock model, report the account.
              </div>
            </div>

            <div className="blog-check-row">
              <CheckCircle size={22} className="blog-check-icon" weight="fill" />
              <div>
                <strong>Keep Initial Chats on Verified Platforms:</strong> Scammers want you off dating apps because dating apps
                maintain moderation logs and automated fraud detectors. Stay within the app until you have verified their identity.
              </div>
            </div>

            <div className="blog-check-row">
              <CheckCircle size={22} className="blog-check-icon" weight="fill" />
              <div>
                <strong>Enforce a Zero-Financial Policy:</strong> Never wire money, purchase gift cards, or share OTPs.
                Legitimate partners never solicit financial transactions from dating matches.
              </div>
            </div>

            <div className="blog-check-row">
              <CheckCircle size={22} className="blog-check-icon" weight="fill" />
              <div>
                <strong>Follow Date Check-In Protocols:</strong> When you do meet in person, pick a busy public space in daylight,
                provide your trusted friend with venue details, and set a check-in call 45 minutes into the meetup.
              </div>
            </div>
          </div>

          <h2 className="font-display">4. The Velvet Hearts Approach to Community Trust</h2>
          <p>
            When we built Velvet Hearts, eliminating bad-faith actors was a primary architectural objective.
            Here is how we integrate safety into the member experience:
          </p>
          <ul className="blog-list">
            <li>
              <strong>AI-Assisted Photo Verification:</strong> We perform automated multi-point identity checks matching
              selfie submissions against primary profile photos, immediately flagging mismatches.
            </li>
            <li>
              <strong>Mandatory 2-Minute Voice Intros:</strong> You can hear real voices, genuine intonations, and spontaneous
              laughter before committing to connection invites.
            </li>
            <li>
              <strong>Grace Close &amp; Boundary Tools:</strong> Discontinue connections gracefully without awkward confrontation,
              or use two-tap blocking and reporting whenever suspicious behavior occurs.
            </li>
            <li>
              <strong>Active Moderation Team:</strong> User reports are escalated to human moderators for prompt review and account action.
            </li>
          </ul>

          <h2 className="font-display">5. What to Do If You Suspect Deception</h2>
          <p>
            If something feels off, trust your instincts. You do not owe anyone your time, energy, or benefit of the doubt
            when your safety is concerned.
          </p>
          <ol className="blog-ordered-list">
            <li><strong>Cease communication immediately:</strong> Do not argue or attempt to confront them.</li>
            <li><strong>Preserve evidence:</strong> Take screenshots of suspicious messages or claims.</li>
            <li><strong>Report the account:</strong> Use the in-app report tool to alert the platform moderation team.</li>
            <li><strong>Confide in someone you trust:</strong> Deceptive actors rely on isolation; sharing your experience with friends provides clarity.</li>
          </ol>
        </article>

        {/* Author / Safety Resources Box */}
        <section className="blog-commitment-box">
          <div className="blog-commitment-header">
            <div className="blog-commitment-icon">
              <ShieldCheck size={26} weight="duotone" />
            </div>
            <div>
              <h3 className="blog-commitment-title font-ui">
                Velvet Hearts Safety Commitment
              </h3>
              <p className="blog-commitment-desc font-body">
                Dedicated to cultivating intentional, verified, and safe dating spaces.
              </p>
            </div>
          </div>

          <div className="blog-commitment-actions">
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('safety') : (window.location.href = '/safety'))}
              className="blog-btn-primary font-ui"
            >
              Visit Safety Center
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('guidelines') : (window.location.href = '/guidelines'))}
              className="blog-btn-ghost font-ui"
            >
              Community Guidelines
            </button>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('how-it-works') : (window.location.href = '/how-it-works'))}
              className="blog-btn-ghost font-ui"
            >
              How It Works
            </button>
          </div>
        </section>
      </main>

      {/* Unified Luxury Footer */}
      <footer className="blog-footer font-ui">
        <div className="blog-footer-container">
          <div className="blog-footer-top">
            <div className="blog-footer-brand-col">
              <div className="blog-footer-brand font-display">
                <img src={logo} alt="Velvet Hearts Logo" className="blog-footer-logo" width="32" height="32" />
                <span>Velvet Hearts</span>
              </div>
              <p className="blog-footer-tagline font-body">
                The intentional dating sanctuary for thoughtful singles seeking real emotional resonance.
              </p>
              <div className="blog-footer-badges">
                <span className="blog-footer-badge">Photo Verified</span>
                <span className="blog-footer-dot">·</span>
                <span className="blog-footer-badge">Voice Intros</span>
                <span className="blog-footer-dot">·</span>
                <span className="blog-footer-badge">Zero Ghosting</span>
              </div>
            </div>

            <div className="blog-footer-nav-grid">
              <div className="blog-footer-col">
                <h4 className="blog-footer-col-title font-ui">Platform</h4>
                <ul className="blog-footer-col-links">
                  <li><a href="/how-it-works" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('how-it-works'); else window.location.href = '/how-it-works'; }}>How It Works</a></li>
                  <li><a href="/blog" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('blog'); else window.location.href = '/blog'; }}>Safety Blog</a></li>
                  {onSignIn && <li><button type="button" onClick={onSignIn} className="blog-footer-link-btn">Sign In</button></li>}
                  {onGetStarted && <li><button type="button" onClick={onGetStarted} className="blog-footer-link-btn">Join Sanctuary</button></li>}
                </ul>
              </div>

              <div className="blog-footer-col">
                <h4 className="blog-footer-col-title font-ui">Safety &amp; Trust</h4>
                <ul className="blog-footer-col-links">
                  <li><a href="/safety" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('safety'); else window.location.href = '/safety'; }}>Safety Center</a></li>
                  <li><a href="/guidelines" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('guidelines'); else window.location.href = '/guidelines'; }}>Community Guidelines</a></li>
                  <li><a href="/" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate(''); else window.location.href = '/'; }}>Home Sanctuary</a></li>
                </ul>
              </div>

              <div className="blog-footer-col">
                <h4 className="blog-footer-col-title font-ui">Legal</h4>
                <ul className="blog-footer-col-links">
                  <li><a href="/privacy" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('privacy'); else window.location.href = '/privacy'; }}>Privacy Policy</a></li>
                  <li><a href="/terms" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('terms'); else window.location.href = '/terms'; }}>Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="blog-footer-bottom">
            <div className="blog-footer-copy">
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
        .blog-universe {
          --blog-bg: #FAF5F8;
          --blog-surface: #FFFFFF;
          --blog-surface-card: #FFFFFF;
          --blog-surface-subcard: #FDF4F8;
          --blog-border: #E8D3DF;
          --blog-border-subtle: #F0E2EC;
          --blog-text-primary: #1C0D15;
          --blog-text-body: #3A2631;
          --blog-text-muted: #6B525E;
          --blog-accent: #B8436A;
          --blog-accent-subtle: rgba(184, 67, 106, 0.08);
          --blog-callout-bg: #FFF4F7;
          --blog-callout-border: #B8436A;
          --blog-callout-text: #3D101E;
          --blog-danger-bg: #FFF3F6;
          --blog-danger-border: #F09CB0;
          --blog-danger-text: #991636;
          --blog-nav-bg: rgba(255, 255, 255, 0.75);
          --blog-nav-border: rgba(0, 0, 0, 0.06);

          background-color: var(--blog-bg);
          color: var(--blog-text-body);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        [data-theme="dark"] .blog-universe {
          --blog-bg: #0b070a;
          --blog-surface: #140c11;
          --blog-surface-card: #180e15;
          --blog-surface-subcard: #20101a;
          --blog-border: #2a1522;
          --blog-border-subtle: #20101a;
          --blog-text-primary: #ffffff;
          --blog-text-body: #d6c1ca;
          --blog-text-muted: #a8909b;
          --blog-accent: #e27396;
          --blog-accent-subtle: rgba(226, 115, 150, 0.12);
          --blog-callout-bg: #1c0f16;
          --blog-callout-border: #e27396;
          --blog-callout-text: #fcecef;
          --blog-danger-bg: #200912;
          --blog-danger-border: rgba(217, 56, 93, 0.35);
          --blog-danger-text: #ff99b3;
          --blog-nav-bg: rgba(14, 9, 12, 0.72);
          --blog-nav-border: rgba(255, 255, 255, 0.08);
        }

        /* ---- Floating Glass Nav ---- */
        .blog-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 12px 24px;
          transition: all 0.4s ease;
        }

        .blog-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 24px;
          border-radius: 100px;
          background: var(--blog-nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--blog-nav-border);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
        }

        .blog-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .blog-nav-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .blog-nav-wordmark {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--blog-text-primary);
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .blog-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .blog-nav-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--blog-border);
          color: var(--blog-text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .blog-nav-back-btn:hover {
          border-color: var(--blog-accent);
          color: var(--blog-accent);
        }

        .blog-nav-signin {
          padding: 6px 16px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--blog-border);
          color: var(--blog-text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .blog-nav-signin:hover {
          border-color: var(--blog-accent);
          color: var(--blog-accent);
        }

        /* ---- Main Layout ---- */
        .blog-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 120px 24px 80px;
        }

        .blog-breadcrumbs ol {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: var(--blog-text-muted);
        }

        .blog-breadcrumbs a {
          color: var(--blog-text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .blog-breadcrumbs a:hover {
          color: var(--blog-accent);
        }

        .blog-breadcrumbs .sep {
          opacity: 0.4;
        }

        .blog-breadcrumbs .current {
          color: var(--blog-accent);
          font-weight: 600;
        }

        /* ---- Article Header ---- */
        .blog-article-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--blog-border);
          padding-bottom: 32px;
        }

        .blog-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          background: var(--blog-accent-subtle);
          color: var(--blog-accent);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 18px;
        }

        .blog-title {
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          line-height: 1.18;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--blog-text-primary);
          margin-bottom: 18px;
        }

        .blog-lead {
          font-size: clamp(1.05rem, 1.8vw, 1.25rem);
          line-height: 1.65;
          color: var(--blog-text-body);
          margin-bottom: 24px;
        }

        .blog-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 0.88rem;
          color: var(--blog-text-muted);
        }

        .blog-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blog-author-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--blog-accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.78rem;
        }

        .blog-author-name {
          font-weight: 600;
          color: var(--blog-text-primary);
        }

        .blog-meta-dot {
          opacity: 0.4;
        }

        .blog-read-time {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ---- Content Styling ---- */
        .blog-content {
          font-size: 1.06rem;
          line-height: 1.8;
          color: var(--blog-text-body);
        }

        .blog-content h2 {
          font-size: clamp(1.6rem, 3vw, 2.1rem);
          font-weight: 700;
          color: var(--blog-text-primary);
          margin-top: 48px;
          margin-bottom: 18px;
          letter-spacing: -0.02em;
        }

        .blog-content p {
          margin-bottom: 20px;
        }

        /* ---- Callout Quote Box ---- */
        .blog-callout {
          background: var(--blog-callout-bg);
          border-left: 4px solid var(--blog-callout-border);
          border-radius: 0 16px 16px 0;
          padding: 22px 26px;
          margin: 32px 0 40px;
          font-size: 1.02rem;
          line-height: 1.7;
          color: var(--blog-callout-text);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .blog-callout strong {
          color: var(--blog-accent);
        }

        /* ---- Red Flag Cards ---- */
        .blog-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin: 28px 0 40px;
        }

        .blog-card {
          background: var(--blog-surface-card);
          border: 1px solid var(--blog-border);
          border-radius: 18px;
          padding: 22px 26px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .blog-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--blog-accent);
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blog-card-desc {
          margin: 0;
          font-size: 0.96rem;
          line-height: 1.65;
          color: var(--blog-text-body);
        }

        /* ---- Checklist Rows ---- */
        .blog-checklist {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 24px 0 40px;
        }

        .blog-check-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.98rem;
          line-height: 1.6;
          color: var(--blog-text-body);
        }

        .blog-check-row strong {
          color: var(--blog-text-primary);
        }

        .blog-check-icon {
          color: #28a745;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .blog-list {
          padding-left: 24px;
          margin: 16px 0 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          line-height: 1.65;
        }

        .blog-list strong {
          color: var(--blog-text-primary);
        }

        .blog-ordered-list {
          padding-left: 24px;
          margin: 16px 0 36px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          line-height: 1.65;
        }

        .blog-ordered-list strong {
          color: var(--blog-text-primary);
        }

        /* ---- Safety Commitment Box ---- */
        .blog-commitment-box {
          margin-top: 56px;
          padding: 36px 32px;
          border-radius: 20px;
          background: var(--blog-surface-card);
          border: 1px solid var(--blog-border);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .blog-commitment-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .blog-commitment-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--blog-accent-subtle);
          color: var(--blog-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .blog-commitment-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--blog-text-primary);
        }

        .blog-commitment-desc {
          margin: 4px 0 0;
          font-size: 0.92rem;
          color: var(--blog-text-muted);
        }

        .blog-commitment-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .blog-btn-primary {
          padding: 10px 20px;
          border-radius: 100px;
          background: var(--blog-accent-subtle);
          border: 1.5px solid rgba(226, 115, 150, 0.3);
          color: var(--blog-accent);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .blog-btn-primary:hover {
          background: var(--blog-accent);
          color: #ffffff;
        }

        .blog-btn-ghost {
          padding: 10px 18px;
          border-radius: 100px;
          background: transparent;
          border: 1.5px solid var(--blog-border);
          color: var(--blog-text-primary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .blog-btn-ghost:hover {
          border-color: var(--blog-accent);
          color: var(--blog-accent);
        }

        /* ---- Footer Revamped ---- */
        .blog-footer {
          border-top: 1px solid var(--blog-border);
          background: var(--blog-surface-card);
          padding: 64px 24px 36px;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .blog-footer-container {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .blog-footer-top {
          display: grid;
          grid-template-columns: 1.4fr 2fr;
          gap: 48px;
          align-items: start;
        }

        .blog-footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .blog-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.35rem;
          color: var(--blog-text-primary);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .blog-footer-logo {
          height: 32px;
          width: 32px;
          object-fit: contain;
          border-radius: 50%;
        }

        .blog-footer-tagline {
          font-size: 0.92rem;
          color: var(--blog-text-muted);
          line-height: 1.6;
          max-width: 340px;
          margin: 0;
        }

        .blog-footer-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--blog-text-muted);
          font-weight: 500;
          flex-wrap: wrap;
        }

        .blog-footer-dot {
          opacity: 0.5;
        }

        .blog-footer-nav-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .blog-footer-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .blog-footer-col-title {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--blog-accent);
          margin: 0;
        }

        .blog-footer-col-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .blog-footer-col-links a,
        .blog-footer-link-btn {
          color: var(--blog-text-body);
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

        .blog-footer-col-links a:hover,
        .blog-footer-link-btn:hover {
          color: var(--blog-accent);
          transform: translateX(2px);
        }

        .blog-footer-bottom {
          display: flex;
          justify-content: center;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid var(--blog-border-subtle);
          font-size: 0.82rem;
          color: var(--blog-text-muted);
        }

        /* ---- Responsive Queries ---- */
        @media (max-width: 860px) {
          .blog-footer-top {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .blog-footer-nav-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px;
          }
        }

        @media (max-width: 768px) {
          .blog-nav {
            padding: 8px 14px;
          }
          .blog-nav-inner {
            padding: 6px 14px;
            gap: 10px;
          }
          .blog-nav-logo {
            width: 26px;
            height: 26px;
          }
          .blog-nav-wordmark {
            font-size: 1.05rem;
          }
          .blog-nav-actions {
            gap: 8px;
          }
          .blog-nav-back-btn {
            padding: 5px 10px;
            font-size: 0.78rem;
          }
          .blog-nav-signin {
            padding: 5px 12px;
            font-size: 0.8rem;
          }
          .blog-main {
            padding: 96px 16px 50px;
          }
          .blog-commitment-box {
            padding: 24px 20px;
          }
        }

        @media (max-width: 480px) {
          .blog-nav {
            padding: 6px 10px;
          }
          .blog-nav-inner {
            padding: 5px 10px;
            gap: 6px;
          }
          .blog-nav-wordmark {
            font-size: 0.95rem;
          }
          .blog-nav-back-btn span {
            display: inline;
          }
          .blog-nav-signin {
            display: none !important;
          }
          .blog-footer {
            padding: 44px 18px 30px;
          }
          .blog-footer-container {
            gap: 32px;
          }
          .blog-footer-nav-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .blog-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogPage;

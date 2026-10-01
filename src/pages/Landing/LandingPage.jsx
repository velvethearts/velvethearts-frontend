import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  ShieldCheck,
  Users,
  Bookmark,
  Sparkle,
  Play,
  Pause,
  SpeakerHigh,
  ArrowRight,
  CheckCircle,
  Microphone,
  LockKey,
  ArrowDown,
  Quotes,
  Eye,
  HandHeart,
  Star
} from '@phosphor-icons/react';
import logo from "../../assets/velvet-heart-logo.png";
import heroPortrait from "../../assets/real-portrait-1.jpg";
import { ThemeToggle } from '../../components/UI/ThemeToggle';
import { triggerCookieBanner } from '../../lib/analytics';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   VELVET HEARTS — Fey-Inspired Landing Page
   Scroll-driven animations, cinematic hero, sticky reveals
   ============================================================ */

export const LandingPage = ({ onGetStarted, onSignIn, onNavigate }) => {
  const { showAlert = () => { } } = useApp?.() || {};
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(42);
  const [navScrolled, setNavScrolled] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroCTARef = useRef(null);
  const heroCardRef = useRef(null);
  const valuesSectionRef = useRef(null);
  const valuesCardsRef = useRef([]);
  const stepsSectionRef = useRef(null);
  const stepsLeftRef = useRef(null);
  const stepsRightRef = useRef(null);
  const textRevealRef = useRef(null);
  const safetyRef = useRef(null);
  const faqSectionRef = useRef(null);
  const finalCtaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  // Audio timer
  useEffect(() => {
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

  // Nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Scroll Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // --- Hero entrance stagger ---
      // Title is ALWAYS visible immediately (no fade-in) — it's the primary visual anchor.
      // Supporting elements animate in around it.
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo(heroSubRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, delay: 0.15 }
        )
        .fromTo(heroCTARef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(heroCardRef.current,
          { opacity: 0, y: 40, rotateY: -6, rotateX: 3, scale: 0.94 },
          { opacity: 1, y: 0, rotateY: 0, rotateX: 0, scale: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.6'
        )
        .fromTo(scrollIndicatorRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        );

      // --- Hero parallax on scroll ---
      gsap.to(heroTitleRef.current, {
        y: -60,
        opacity: 0.3,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        }
      });

      gsap.to(heroCardRef.current, {
        y: -40,
        scale: 0.94,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'center top',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      // --- Scroll indicator bounce ---
      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // --- Values cards stagger in ---
      valuesCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });

      // --- Sticky pinned steps section ---
      if (window.innerWidth >= 992) {
        ScrollTrigger.create({
          trigger: stepsSectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: stepsLeftRef.current,
          pinSpacing: false,
        });
      }

      // --- Word-by-word text reveal ---
      const revealEl = textRevealRef.current;
      if (revealEl) {
        const words = revealEl.querySelectorAll('.reveal-word');
        gsap.fromTo(words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.08,
            scrollTrigger: {
              trigger: revealEl,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 1,
            }
          }
        );
      }

      // --- Safety section slide up ---
      gsap.fromTo(safetyRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1, y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: safetyRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // --- FAQ fade in ---
      gsap.fromTo(faqSectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          scrollTrigger: {
            trigger: faqSectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // --- Final CTA scale in ---
      gsap.fromTo(finalCtaRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1,
          duration: 0.9,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: finalCtaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleAudio = () => setIsPlayingAudio(prev => !prev);

  const formatAudioTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const revealText = "We believe connection should feel like coming home — safe, warm, and honest. No games, no algorithms that exploit loneliness. Just real people sharing real stories.";
  const revealWords = revealText.split(' ');

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

  const features = [
    {
      num: '01',
      title: 'Tell Your Story',
      desc: 'Share who you are — your identity, interests, and aspirations. Express yourself in details that checklists miss.',
      icon: <Bookmark size={28} weight="duotone" />
    },
    {
      num: '02',
      title: 'Hear Their Voice',
      desc: 'Listen to 2-minute voice intros before you connect. Feel their warmth, humor, and sincerity before a single word is typed.',
      icon: <Microphone size={28} weight="duotone" />
    },
    {
      num: '03',
      title: 'Connect Meaningfully',
      desc: 'Send interest directly to stories. If mutual, connection forms, letting you start a real conversation built on genuine understanding.',
      icon: <HandHeart size={28} weight="duotone" />
    }
  ];

  return (
    <div className="fey-landing" ref={containerRef}>

      {/* ============ Floating Glass Nav ============ */}
      <header className={`fey-nav ${navScrolled ? 'scrolled' : ''}`}>
        <div className="fey-nav-inner">
          <div className="fey-nav-brand">
            <img src={logo} alt="Velvet Hearts" className="fey-nav-logo" width="36" height="36" />
            <span className="fey-nav-wordmark font-display">Velvet Hearts</span>
          </div>
          <div className="fey-nav-actions">
            <ThemeToggle />
            <button onClick={onSignIn} className="fey-nav-signin font-ui" aria-label="Sign in to your Velvet Hearts account">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ============ HERO — Cinematic Full Viewport ============ */}
        <section className="fey-hero" ref={heroRef} aria-labelledby="hero-heading">
          {/* Ambient depth layers */}
          <div className="fey-hero-glow glow-a"></div>
          <div className="fey-hero-glow glow-b"></div>

          <div className="fey-hero-grid">
            {/* Left: Content Stack */}
            <div className="fey-hero-content">
              <div ref={heroTitleRef}>
                <h1 id="hero-heading" className="fey-hero-title font-display">
                  Where genuine hearts
                  <span className="fey-hero-title-accent"> find each other.</span>
                </h1>
              </div>

              <div ref={heroSubRef} className="fey-hero-sub-stack">
                <p className="fey-hero-desc font-body">
                  The intentional dating sanctuary for thoughtful singles seeking real emotional resonance.
                  Replace burnout-inducing swiping with authentic voice intros, rich story profiles, and a verified safe community.
                </p>

                {/* Trust Indicators */}
                <div className="fey-hero-trust font-ui" role="list" aria-label="Platform trust indicators">
                  <div className="fey-trust-pill" role="listitem">
                    <ShieldCheck size={16} weight="fill" className="trust-icon-shield" />
                    <span>Biometric Verified</span>
                  </div>
                  <div className="fey-trust-pill" role="listitem">
                    <Microphone size={16} weight="fill" className="trust-icon-mic" />
                    <span>Voice Intros</span>
                  </div>
                  <div className="fey-trust-pill" role="listitem">
                    <Bookmark size={16} weight="fill" className="trust-icon-book" />
                    <span>Story Profiles</span>
                  </div>
                </div>
              </div>

              <div ref={heroCTARef} className="fey-hero-cta-block">
                <div className="fey-hero-actions">
                  <button
                    onClick={onGetStarted}
                    className="fey-cta-primary font-ui"
                    aria-label="Begin your journey on Velvet Hearts for free"
                  >
                    <span>Begin Your Journey</span>
                    <div className="fey-cta-arrow">
                      <ArrowRight size={16} weight="bold" />
                    </div>
                  </button>
                  <button
                    onClick={onSignIn}
                    className="fey-cta-ghost font-ui"
                    aria-label="Sign in to existing account"
                  >
                    I already have an account
                  </button>
                </div>
                <div className="fey-hero-proof font-ui">
                  <span className="fey-proof-item"><CheckCircle size={14} weight="fill" className="proof-check" /> Free to join</span>
                  <span className="fey-proof-dot">·</span>
                  <span className="fey-proof-item"><LockKey size={14} weight="fill" className="proof-check" /> Privacy first</span>
                  <span className="fey-proof-dot">·</span>
                  <span className="fey-proof-item">Takes 2 mins</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Showcase Card with 3D entrance */}
            <div className="fey-hero-visual" ref={heroCardRef}>
              {/* Floating badge: top-left */}
              <div className="fey-float-chip chip-tl font-ui">
                <ShieldCheck size={15} weight="fill" style={{ color: 'var(--gold-400)' }} />
                <span>Verified Identity</span>
              </div>

              <div className="fey-showcase">
                <div className="fey-showcase-inner">
                  {/* Photo */}
                  <div className="fey-showcase-photo-wrap">
                    <img
                      src={heroPortrait}
                      alt="Sample verified profile - Elena"
                      className="fey-showcase-photo"
                      width="420" height="320" loading="eager"
                    />
                    <div className="fey-showcase-photo-gradient"></div>

                    <div className="fey-vibe-badge font-ui">
                      <Heart size={13} weight="fill" className="fey-heart-pulse" />
                      <span>96% Vibe Match</span>
                    </div>

                    <div className="fey-identity font-ui">
                      <div className="fey-identity-row">
                        <h3 className="fey-identity-name font-display">Elena, 26</h3>
                        <CheckCircle size={17} weight="fill" className="fey-verified-icon" />
                      </div>
                      <p className="fey-identity-bio">Sound Artist & Vinyl Collector · San Francisco</p>
                    </div>
                  </div>

                  {/* Voice Module */}
                  <div className="fey-voice-module">
                    <div className="fey-voice-header font-ui">
                      <div className="fey-voice-label">
                        <SpeakerHigh size={15} weight="fill" className="fey-speaker-icon" />
                        <span>Voice Intro</span>
                      </div>
                      <span className="fey-voice-time font-ui">
                        {isPlayingAudio ? formatAudioTime(audioProgress) : '0:42'} / 2:00
                      </span>
                    </div>
                    <div className="fey-voice-bar">
                      <button
                        type="button"
                        onClick={toggleAudio}
                        className={`fey-play-btn ${isPlayingAudio ? 'playing' : ''}`}
                        aria-label={isPlayingAudio ? "Pause sample voice note" : "Play sample voice note"}
                      >
                        {isPlayingAudio ? <Pause size={13} weight="fill" /> : <Play size={13} weight="fill" style={{ marginLeft: '1px' }} />}
                      </button>
                      <div className={`fey-waveform ${isPlayingAudio ? 'active' : ''}`}>
                        {[40, 75, 55, 90, 60, 30, 85, 100, 70, 45, 80, 95, 65, 40, 70, 85, 50, 95, 60, 40].map((h, i) => (
                          <span
                            key={i}
                            className="fey-wave-bar"
                            style={{ height: `${h}%`, animationDelay: `${(i * 0.06).toFixed(2)}s` }}
                          ></span>
                        ))}
                      </div>
                    </div>
                    <p className="fey-voice-quote font-body">
                      &ldquo;Looking for sincere conversations, sharing vinyl records, and finding hidden espresso spots.&rdquo;
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="fey-tags font-ui">
                    <span className="fey-tag">Vinyl Records</span>
                    <span className="fey-tag">Coffee Roasting</span>
                    <span className="fey-tag">Midnight Walks</span>
                  </div>
                </div>
              </div>

              {/* Floating badge: bottom-right */}
              <div className="fey-float-chip chip-br font-ui">
                <Quotes size={14} weight="fill" style={{ color: 'var(--rose-400)', opacity: 0.8 }} />
                <span>&ldquo;Her voice felt so genuine.&rdquo;</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="fey-scroll-cue" ref={scrollIndicatorRef}>
            <ArrowDown size={20} weight="bold" />
          </div>
        </section>

        {/* ============ TEXT REVEAL (Desire — Emotional Hook) ============ */}
        <section className="fey-reveal-section" aria-label="Our philosophy">
          <div className="fey-reveal-container" ref={textRevealRef}>
            <p className="fey-reveal-text font-display">
              {revealWords.map((word, i) => (
                <span key={i} className="reveal-word">{word} </span>
              ))}
            </p>
          </div>
        </section>

        {/* ============ VALUES / Features (Interest — Bento) ============ */}
        <section className="fey-values" ref={valuesSectionRef} aria-labelledby="values-heading">
          <div className="fey-values-header">
            <h2 id="values-heading" className="fey-section-title font-display">Built different, on purpose.</h2>
            <p className="fey-section-sub font-body">We redesigned connection from the ground up to respect your humanity.</p>
          </div>

          <div className="fey-values-grid">
            {[
              { icon: <Users size={28} />, color: 'pink', title: 'Inclusive by Design', text: 'Your gender, orientation, and disability identity are celebrated here. We design with and for communities often ignored.' },
              { icon: <ShieldCheck size={28} />, color: 'gold', title: 'Safety First', text: 'Complete control over your experience. Block, report, or limit visibility anytime. Your peace of mind is our foundation.' },
              { icon: <Heart size={28} />, color: 'burgundy', title: 'Meaningful Connection', text: 'Browse detailed stories rather than instant cards. We encourage thoughtful reading and deep emotional resonance.' },
              { icon: <Eye size={28} />, color: 'dark', title: 'Accessible to All', text: 'Fully compliant layouts featuring customizable font sizing, high-contrast toggles, and reduced motion capabilities.' },
            ].map((v, i) => (
              <div
                key={i}
                className="fey-value-card"
                ref={el => valuesCardsRef.current[i] = el}
              >
                <div className={`fey-value-icon ${v.color}`}>{v.icon}</div>
                <h3 className="fey-value-title font-display">{v.title}</h3>
                <p className="fey-value-text font-body">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ HOW IT WORKS — Sticky Pinned Left + Scroll Right ============ */}
        <section className="fey-steps" ref={stepsSectionRef} aria-labelledby="steps-heading">
          <div className="fey-steps-left" ref={stepsLeftRef}>
            <h2 id="steps-heading" className="fey-section-title font-display">Your journey<br />to connection</h2>
            <p className="fey-section-sub font-body">Three simple steps to finding your person.</p>
          </div>
          <div className="fey-steps-right" ref={stepsRightRef}>
            {features.map((f, i) => (
              <div key={i} className="fey-step-card">
                <div className="fey-step-num font-display">{f.num}</div>
                <div className="fey-step-icon">{f.icon}</div>
                <h3 className="fey-step-title font-ui">{f.title}</h3>
                <p className="fey-step-desc font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Safety Banner ============ */}
        <section className="fey-safety" ref={safetyRef} aria-labelledby="safety-heading">
          <div className="fey-safety-inner">
            <h2 id="safety-heading" className="fey-safety-title font-display">Your safety is our foundation.</h2>
            <p className="fey-safety-sub font-body">
              We require active verification, enforce respectful community guidelines, and offer persistent support resources accessible with just two taps.
            </p>
            <ul className="fey-safety-list font-ui">
              <li><span className="safety-check">✓</span> Verified identity systems</li>
              <li><span className="safety-check">✓</span> Respectful community guidelines</li>
              <li><span className="safety-check">✓</span> Phone verification required</li>
              <li><span className="safety-check">✓</span> Accessible Safety Center</li>
            </ul>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="fey-faq" ref={faqSectionRef} aria-labelledby="faq-heading">
          <div className="fey-faq-header">
            <h2 id="faq-heading" className="fey-section-title font-display">Frequently Asked Questions</h2>
            <p className="fey-section-sub font-body">Everything you need to know about Velvet Hearts.</p>
          </div>
          <div className="fey-faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`fey-faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="fey-faq-q font-ui"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  aria-expanded={openFaqIndex === idx}
                  aria-controls={`faq-a-${idx}`}
                  id={`faq-q-${idx}`}
                >
                  <span>{faq.q}</span>
                  <span className="fey-faq-toggle">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div id={`faq-a-${idx}`} className="fey-faq-a font-body" role="region" aria-labelledby={`faq-q-${idx}`}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============ Final CTA ============ */}
        <section className="fey-final-cta" ref={finalCtaRef} aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="fey-final-title font-display">Ready to be seen?</h2>
          <p className="fey-final-sub font-body">Join a community that values who you are, not how fast you swipe.</p>
          <button onClick={onGetStarted} className="fey-cta-primary large font-ui" aria-label="Sign up for Velvet Hearts">
            <span>Begin Your Journey</span>
            <div className="fey-cta-arrow">
              <ArrowRight size={18} weight="bold" />
            </div>
          </button>
        </section>
      </main>

      {/* ============ Footer ============ */}
      <footer className="fey-footer font-ui">
        <div className="fey-footer-brand font-display">
          <img src={logo} alt="Velvet Hearts Logo" className="fey-footer-logo" width="30" height="30" />
          <span>Velvet Hearts</span>
        </div>
        <nav className="fey-footer-links" aria-label="Footer navigation">
          <a href="#guidelines" onClick={(e) => { e.preventDefault(); showAlert({ title: 'Community Guidelines', message: 'Be respectful, genuine, and kind.' }); }}>Community Guidelines</a>
          <a href="/safety" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('safety'); else showAlert({ title: 'Safety Center', message: 'Report tools are available directly inside chat and profiles.' }); }}>Safety Center</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('privacy'); else showAlert({ title: 'Privacy Policy', message: 'Your data is secure and never sold.' }); }}>Privacy Policy</a>
          <a href="#cookies" onClick={(e) => { e.preventDefault(); triggerCookieBanner(); }}>Cookie Preferences</a>
          <a href="/terms" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('terms'); else showAlert({ title: 'Terms of Service', message: 'Agree to engage with care.' }); }}>Terms of Service</a>
        </nav>
        <div className="fey-footer-copy">
          Made with care. &copy; 2026 Velvet Hearts. All rights reserved.
        </div>
      </footer>

      {/* ============================================================
          STYLES — Fey-Inspired Scroll Animation Landing Page
          ============================================================ */}
      <style>{`
        /* ---- Reset & Container ---- */
        .fey-landing {
          min-height: 100vh;
          background-color: var(--bg-page);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
        }

        /* ---- Floating Glass Nav ---- */
        .fey-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 12px 24px;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fey-nav.scrolled {
          padding: 8px 24px;
        }

        .fey-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 24px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fey-nav.scrolled .fey-nav-inner {
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 8px 40px rgba(58, 14, 26, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
          border-color: rgba(255, 255, 255, 0.7);
        }

        [data-theme="dark"] .fey-nav-inner {
          background: rgba(26, 21, 23, 0.5);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
        }

        [data-theme="dark"] .fey-nav.scrolled .fey-nav-inner {
          background: rgba(26, 21, 23, 0.85);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
        }

        .fey-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fey-nav-logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(184, 67, 106, 0.25));
          transition: transform 0.3s ease;
        }

        .fey-nav-brand:hover .fey-nav-logo {
          transform: scale(1.06) rotate(3deg);
        }

        .fey-nav-wordmark {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--burgundy-900);
          letter-spacing: -0.01em;
        }

        [data-theme="dark"] .fey-nav-wordmark {
          color: var(--cream-100);
        }

        .fey-nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .fey-nav-signin {
          background: transparent;
          border: 1.5px solid var(--border-default);
          padding: 7px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .fey-nav-signin:hover {
          background: var(--bg-surface-warm);
          border-color: var(--burgundy-400);
          transform: translateY(-1px);
        }

        /* ---- Hero Section ---- */
        .fey-hero {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 32px 40px;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .fey-hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 1;
        }

        .glow-a {
          top: -100px;
          right: -60px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(184, 67, 106, 0.18) 0%, transparent 70%);
          animation: glowDrift 22s infinite alternate;
        }

        .glow-b {
          bottom: 0;
          left: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(212, 173, 106, 0.14) 0%, transparent 70%);
          animation: glowDrift 28s infinite alternate-reverse;
        }

        @keyframes glowDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(25px, -30px) scale(1.06); }
        }

        .fey-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        @media (min-width: 992px) {
          .fey-hero-grid {
            grid-template-columns: 1.1fr 0.9fr;
            gap: 56px;
          }
        }

        /* ---- Hero Content ---- */
        .fey-hero-content {
          display: flex;
          flex-direction: column;
          max-width: 640px;
        }

        .fey-hero-title {
          font-size: clamp(2.4rem, 4.5vw + 0.8rem, 4.2rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--burgundy-950);
          margin: 0 0 20px 0;
          font-weight: 700;
        }

        [data-theme="dark"] .fey-hero-title {
          color: var(--cream-100);
        }

        .fey-hero-title-accent {
          background: linear-gradient(135deg, var(--burgundy-500) 0%, var(--rose-500) 50%, var(--gold-400) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline;
        }

        .fey-hero-sub-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .fey-hero-desc {
          font-size: clamp(1rem, 0.3vw + 0.95rem, 1.15rem);
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 0;
          max-width: 560px;
        }

        [data-theme="dark"] .fey-hero-desc {
          color: var(--charcoal-300);
        }

        /* Trust Pills */
        .fey-hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 4px;
        }

        .fey-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        [data-theme="dark"] .fey-trust-pill {
          background: rgba(44, 36, 38, 0.5);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .fey-trust-pill:hover {
          transform: translateY(-1px);
          border-color: var(--burgundy-300);
          box-shadow: 0 4px 12px rgba(184, 67, 106, 0.08);
        }

        .trust-icon-shield { color: var(--gold-500); }
        .trust-icon-mic { color: var(--burgundy-500); }
        .trust-icon-book { color: var(--rose-500); }

        /* CTA Block */
        .fey-hero-cta-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .fey-hero-actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (min-width: 576px) {
          .fey-hero-actions {
            flex-direction: row;
            align-items: center;
          }
        }

        .fey-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--burgundy-600) 0%, var(--burgundy-500) 40%, var(--rose-500) 100%);
          color: #ffffff;
          padding: 10px 12px 10px 28px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1.025rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(184, 67, 106, 0.3);
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .fey-cta-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .fey-cta-primary:hover::before {
          opacity: 1;
        }

        .fey-cta-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 36px rgba(184, 67, 106, 0.4);
        }

        .fey-cta-primary:active {
          transform: translateY(0) scale(0.98);
        }

        .fey-cta-primary.large {
          padding: 14px 16px 14px 34px;
          font-size: 1.1rem;
        }

        .fey-cta-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fey-cta-primary:hover .fey-cta-arrow {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.3);
        }

        .fey-cta-ghost {
          background: transparent;
          border: 1.5px solid var(--border-default);
          color: var(--text-primary);
          padding: 13px 26px;
          border-radius: 100px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .fey-cta-ghost:hover {
          background: var(--bg-surface-warm);
          border-color: var(--burgundy-400);
          transform: translateY(-1px);
        }

        .fey-hero-proof {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px 10px;
          font-size: 0.78rem;
          color: var(--text-muted);
          padding-left: 2px;
        }

        .proof-check { color: var(--success); }
        .fey-proof-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .fey-proof-dot { opacity: 0.35; }

        /* ---- Hero Visual / Showcase Card ---- */
        .fey-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1200px;
        }

        .fey-float-chip {
          position: absolute;
          z-index: 15;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow: 0 8px 24px rgba(42, 8, 18, 0.1);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--charcoal-900);
          animation: chipFloat 5s ease-in-out infinite alternate;
        }

        [data-theme="dark"] .fey-float-chip {
          background: rgba(36, 26, 30, 0.88);
          border-color: rgba(255, 255, 255, 0.1);
          color: var(--cream-100);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .chip-tl { top: -12px; left: -8px; }
        .chip-br { bottom: -12px; right: -8px; animation-delay: 2.5s; }

        @keyframes chipFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-7px); }
        }

        .fey-showcase {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 24px;
          padding: 7px;
          box-shadow:
            0 20px 60px rgba(58, 14, 26, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.3),
            0 0 40px rgba(184, 67, 106, 0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        [data-theme="dark"] .fey-showcase {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(184, 67, 106, 0.12);
        }

        .fey-showcase:hover {
          transform: translateY(-4px);
        }

        .fey-showcase-inner {
          background: var(--bg-surface);
          border-radius: 19px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
        }

        [data-theme="dark"] .fey-showcase-inner {
          background: var(--charcoal-900);
          border-color: rgba(255, 255, 255, 0.06);
        }

        /* Photo */
        .fey-showcase-photo-wrap {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
        }

        .fey-showcase-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fey-showcase:hover .fey-showcase-photo {
          transform: scale(1.04);
        }

        .fey-showcase-photo-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26, 21, 23, 0.82) 0%, rgba(26, 21, 23, 0.08) 50%, transparent 100%);
          pointer-events: none;
        }

        .fey-vibe-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(26, 21, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          padding: 5px 11px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .fey-heart-pulse {
          color: var(--rose-400);
          animation: heartPulse 1.8s infinite;
        }

        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.25); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
        }

        .fey-identity {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 16px;
          color: #fff;
        }

        .fey-identity-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .fey-identity-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .fey-verified-icon {
          color: #4ade80;
          filter: drop-shadow(0 0 5px rgba(74, 222, 128, 0.5));
        }

        .fey-identity-bio {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 2px 0 0;
        }

        /* Voice Module */
        .fey-voice-module {
          padding: 14px 16px;
          background: var(--bg-surface-warm);
          border-bottom: 1px solid var(--border-subtle);
        }

        [data-theme="dark"] .fey-voice-module {
          background: rgba(30, 24, 26, 0.7);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .fey-voice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .fey-voice-label {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .fey-speaker-icon { color: var(--burgundy-500); }

        .fey-voice-label span {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        .fey-voice-time {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .fey-voice-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .fey-play-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--burgundy-500);
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(184, 67, 106, 0.3);
        }

        .fey-play-btn:hover { transform: scale(1.08); background: var(--burgundy-400); }
        .fey-play-btn.playing { background: var(--gold-500); }

        .fey-waveform {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 26px;
        }

        .fey-wave-bar {
          flex: 1;
          background: var(--burgundy-300);
          border-radius: 2px;
          min-height: 3px;
          transition: background-color 0.3s;
        }

        [data-theme="dark"] .fey-wave-bar {
          background: var(--burgundy-400);
          opacity: 0.6;
        }

        .fey-waveform.active .fey-wave-bar {
          background: var(--burgundy-500);
          animation: waveAnim 0.8s ease-in-out infinite alternate;
        }

        @keyframes waveAnim {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.15); }
        }

        .fey-voice-quote {
          font-size: 0.8rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Tags */
        .fey-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 10px 16px 14px;
        }

        .fey-tag {
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(184, 67, 106, 0.07);
          color: var(--text-primary);
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid var(--border-subtle);
          transition: all 0.2s ease;
        }

        .fey-tag:hover {
          background: rgba(184, 67, 106, 0.14);
          border-color: var(--burgundy-300);
        }

        [data-theme="dark"] .fey-tag {
          background: rgba(255, 255, 255, 0.05);
          color: var(--charcoal-200);
          border-color: rgba(255, 255, 255, 0.08);
        }

        /* Scroll Indicator */
        .fey-scroll-cue {
          display: flex;
          justify-content: center;
          margin-top: 28px;
          color: var(--text-muted);
          opacity: 0.5;
          z-index: 10;
          position: relative;
        }

        /* ---- Text Reveal Section ---- */
        .fey-reveal-section {
          padding: 120px 32px 140px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .fey-reveal-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .fey-reveal-text {
          font-size: clamp(1.6rem, 2.5vw + 0.5rem, 2.8rem);
          line-height: 1.35;
          letter-spacing: -0.02em;
          color: var(--burgundy-950);
          margin: 0;
        }

        [data-theme="dark"] .fey-reveal-text {
          color: var(--cream-100);
        }

        .reveal-word {
          display: inline;
          transition: opacity 0.1s ease;
        }

        /* ---- Values Section ---- */
        .fey-values {
          padding: 120px 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .fey-values-header,
        .fey-faq-header {
          text-align: center;
          max-width: 560px;
          margin: 0 auto 64px;
        }

        .fey-section-title {
          font-size: var(--text-display);
          color: var(--text-primary);
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .fey-section-sub {
          color: var(--text-secondary);
          font-size: var(--text-body);
          margin: 0;
          line-height: 1.6;
        }

        .fey-values-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .fey-values-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .fey-value-card {
          padding: 32px;
          border-radius: 20px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fey-value-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(58, 14, 26, 0.08);
          border-color: var(--burgundy-300);
        }

        [data-theme="dark"] .fey-value-card:hover {
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .fey-value-icon {
          display: inline-flex;
          padding: 12px;
          border-radius: 14px;
          margin-bottom: 16px;
        }

        .fey-value-icon.pink { background: var(--burgundy-50); color: var(--burgundy-500); }
        .fey-value-icon.gold { background: var(--warning-light); color: var(--gold-500); }
        .fey-value-icon.burgundy { background: rgba(184, 67, 106, 0.12); color: var(--burgundy-600); }
        .fey-value-icon.dark { background: var(--bg-muted); color: var(--text-primary); }

        .fey-value-title {
          font-size: var(--text-subheading);
          margin: 0 0 8px;
        }

        .fey-value-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        /* ---- Steps — Sticky Pinned ---- */
        .fey-steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          padding: 100px 32px;
          max-width: 1200px;
          margin: 0 auto;
          min-height: auto;
        }

        @media (min-width: 992px) {
          .fey-steps {
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            min-height: 180vh;
            padding: 120px 32px;
          }
        }

        .fey-steps-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 40px;
        }

        @media (min-width: 992px) {
          .fey-steps-left {
            position: sticky;
            top: 120px;
            height: fit-content;
            padding-top: 0;
          }
        }

        .fey-steps-right {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .fey-step-card {
          padding: 36px;
          border-radius: 20px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }

        .fey-step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(58, 14, 26, 0.08);
          border-color: var(--burgundy-300);
        }

        [data-theme="dark"] .fey-step-card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .fey-step-num {
          font-size: 48px;
          color: var(--burgundy-200);
          opacity: 0.6;
          margin-bottom: 8px;
          line-height: 1;
        }

        .fey-step-icon {
          display: inline-flex;
          padding: 10px;
          border-radius: 12px;
          background: rgba(184, 67, 106, 0.08);
          color: var(--burgundy-500);
          margin-bottom: 14px;
        }

        .fey-step-title {
          font-size: var(--text-body-lg);
          font-weight: 700;
          margin: 0 0 8px;
        }

        .fey-step-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        /* ---- Safety Banner ---- */
        .fey-safety {
          background: var(--burgundy-900);
          color: var(--cream-100);
          padding: 100px 32px;
          border-top: 1px solid var(--burgundy-950);
        }

        .fey-safety-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }

        .fey-safety-title {
          font-size: var(--text-display);
          color: var(--cream-100);
          margin: 0 0 16px;
        }

        .fey-safety-sub {
          color: var(--burgundy-100);
          margin: 0 0 36px;
          line-height: 1.6;
        }

        .fey-safety-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px 32px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .fey-safety-list li {
          font-size: var(--text-body);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .safety-check {
          color: var(--gold-400);
          font-weight: 700;
        }

        /* ---- FAQ ---- */
        .fey-faq {
          padding: 100px 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .fey-faq-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .fey-faq-item {
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          background: var(--bg-surface);
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .fey-faq-item.open {
          border-color: var(--burgundy-400);
        }

        .fey-faq-q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-body-lg);
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          gap: 16px;
        }

        .fey-faq-q:hover {
          background: var(--bg-surface-warm);
        }

        .fey-faq-toggle {
          font-size: 20px;
          font-weight: 300;
          color: var(--burgundy-500);
          flex-shrink: 0;
        }

        .fey-faq-a {
          padding: 0 24px 20px;
          color: var(--text-secondary);
          font-size: var(--text-body);
          line-height: 1.65;
        }

        /* ---- Final CTA ---- */
        .fey-final-cta {
          padding: 120px 32px;
          text-align: center;
          background: var(--cream-100);
          border-bottom: 1px solid var(--border-subtle);
        }

        [data-theme="dark"] .fey-final-cta {
          background: var(--charcoal-900);
        }

        .fey-final-title {
          font-size: clamp(2rem, 3vw + 0.5rem, 3.2rem);
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .fey-final-sub {
          color: var(--text-secondary);
          font-size: var(--text-body-lg);
          margin: 0 0 36px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* ---- Footer ---- */
        .fey-footer {
          padding: 48px 32px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .fey-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: var(--text-heading);
          color: var(--text-accent);
          font-weight: 700;
        }

        .fey-footer-logo {
          height: 30px;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .fey-footer-brand:hover .fey-footer-logo {
          transform: scale(1.06);
        }

        .fey-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px 28px;
        }

        .fey-footer-links a {
          color: var(--text-secondary);
          font-size: var(--text-body-sm);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .fey-footer-links a:hover {
          color: var(--text-primary);
        }

        .fey-footer-copy {
          font-size: var(--text-caption);
          color: var(--text-muted);
        }

        /* ---- Responsive ---- */
        @media (max-width: 768px) {
          .fey-hero {
            padding: 90px 20px 30px;
          }

          .fey-reveal-section {
            padding: 80px 20px 100px;
          }

          .fey-values,
          .fey-faq {
            padding: 80px 20px;
          }

          .fey-steps {
            padding: 80px 20px;
          }

          .fey-safety {
            padding: 80px 20px;
          }

          .fey-final-cta {
            padding: 80px 20px;
          }

          .chip-tl { top: -8px; left: 4px; }
          .chip-br { bottom: -8px; right: 4px; }
        }
      `}</style>
    </div>
  );
};

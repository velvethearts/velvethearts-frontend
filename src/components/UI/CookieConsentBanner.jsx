import React, { useState, useEffect } from 'react';
import { getStoredConsent, setConsent, ConsentStatus } from '../../lib/analytics';
import './CookieConsentBanner.css';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentChoice, setCurrentChoice] = useState(null);

  useEffect(() => {
    // Check stored choice on mount
    const saved = getStoredConsent();
    setCurrentChoice(saved);

    if (!saved) {
      // Small graceful entrance delay for smooth UX
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listener to re-open banner from Settings or Footer
    const handleReopen = () => {
      setCurrentChoice(getStoredConsent());
      setShowDetails(true);
      setVisible(true);
    };

    window.addEventListener('vh-reopen-cookie-banner', handleReopen);
    return () => {
      window.removeEventListener('vh-reopen-cookie-banner', handleReopen);
    };
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setCurrentChoice(ConsentStatus.ACCEPTED);
    setVisible(false);
  };

  const handleReject = () => {
    setConsent(false);
    setCurrentChoice(ConsentStatus.REJECTED);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="vh-cookie-banner-overlay" role="region" aria-label="Cookie and Privacy Consent">
      <div className="vh-cookie-banner-card">
        <div className="vh-cookie-banner-header">
          <div className="vh-cookie-icon-wrapper" aria-hidden="true">
            🍪
          </div>
          <div className="vh-cookie-title-area">
            <h3 className="vh-cookie-title">Your Privacy &amp; Cookies</h3>
            <p className="vh-cookie-subtitle">
              We respect your boundaries. We only use essential local storage for authentication and security. With your permission, we also collect anonymized analytics to measure and improve our matchmaking experience.
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="vh-cookie-details-panel">
            <div className="vh-cookie-category">
              <div className="vh-cookie-category-info">
                <strong>Strictly Necessary (Always Active)</strong>
                <p>Authentication tokens, device verification, safe session state, and user theme preferences. Cannot be disabled as the app cannot function without them.</p>
              </div>
              <span className="vh-cookie-badge-active">Required</span>
            </div>

            <div className="vh-cookie-category">
              <div className="vh-cookie-category-info">
                <strong>Analytics &amp; Performance (Optional)</strong>
                <p>Google Analytics 4 with Google Consent Mode v2 and IP anonymization. Helps us discover app errors and refine match algorithms. Never sells data or profiles you across external websites.</p>
              </div>
              <span className="vh-cookie-badge-optional">Optional</span>
            </div>
          </div>
        )}

        <div className="vh-cookie-banner-actions">
          <button
            type="button"
            className="vh-cookie-link-btn"
            onClick={() => setShowDetails(prev => !prev)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Hide Details' : 'Manage Preferences'}
          </button>

          <div className="vh-cookie-btn-group">
            <button
              type="button"
              id="cookie-reject-btn"
              className="vh-cookie-btn vh-cookie-btn-reject"
              onClick={handleReject}
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              id="cookie-accept-btn"
              className="vh-cookie-btn vh-cookie-btn-accept"
              onClick={handleAccept}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

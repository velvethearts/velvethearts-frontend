/**
 * Velvet Hearts Google Analytics 4 & Consent Mode v2 Service
 *
 * Implements privacy-first analytics conforming to GDPR, ePrivacy, and DPDP rules.
 * Analytics cookies & storage remain completely blocked ('denied') until explicit consent.
 */

export const COOKIE_CONSENT_KEY = 'vh-cookie-consent';

export const ConsentStatus = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

/**
 * Reads user consent status from localStorage.
 * @returns {'accepted' | 'rejected' | null}
 */
export function getStoredConsent() {
  try {
    const val = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (val === ConsentStatus.ACCEPTED || val === ConsentStatus.REJECTED) {
      return val;
    }
  } catch (err) {
    console.warn('[Analytics] Failed to read consent from localStorage:', err);
  }
  return null;
}

/**
 * Helper to push commands to Google Tag dataLayer.
 */
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

/**
 * Initializes Google Tag Manager / gtag.js and Google Consent Mode v2.
 */
export function initGA() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = gtag;
  }

  const currentConsent = getStoredConsent();
  const isAccepted = currentConsent === ConsentStatus.ACCEPTED;

  // 1. Establish Consent Mode v2 defaults BEFORE any script loads
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: isAccepted ? 'granted' : 'denied',
    wait_for_update: 500,
  });

  if (!measurementId) {
    // Measurement ID not configured yet; run in dummy/safe mode
    return;
  }

  // 2. Inject gtag script dynamically if not present
  const existingScript = document.getElementById('ga-gtag');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
    });
  } else if (isAccepted) {
    // If script already exists and consent was just accepted, update consent
    updateConsent(true);
  }
}

/**
 * Updates Google Tag consent state and persists user preference.
 * @param {boolean} granted
 */
export function setConsent(granted) {
  const status = granted ? ConsentStatus.ACCEPTED : ConsentStatus.REJECTED;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
  } catch (err) {
    console.warn('[Analytics] Failed to save consent in localStorage:', err);
  }

  updateConsent(granted);
}

/**
 * Pushes consent update to gtag.
 * @param {boolean} granted
 */
export function updateConsent(granted) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }

  // If newly granted and GA script is not loaded yet, initialize it
  if (granted) {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
    if (measurementId && !document.getElementById('ga-gtag')) {
      initGA();
    }
  }
}

/**
 * Tracks custom event in Google Analytics (safe if rejected or not configured).
 * @param {string} eventName
 * @param {Record<string, any>} [params]
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  } catch (e) {
    // Silently ignore telemetry failure
  }
}

/**
 * Fires an event to prompt the Cookie Banner to re-appear (e.g. from Settings).
 */
export function triggerCookieBanner() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vh-reopen-cookie-banner'));
  }
}

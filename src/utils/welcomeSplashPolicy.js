/**
 * Velvet Hearts — Welcome Splash Screen Policy & Edge-Case Manager
 *
 * Dictates precisely when the immersive rocket splash screen should play,
 * when it must be suppressed, and how it handles edge cases (deep links, auth,
 * reduced motion, session caching, and administrative routes).
 */

export const SPLASH_SESSION_KEY = 'vh-seen-welcome-splash';

/**
 * Checks whether the welcome splash screen should be triggered.
 *
 * @returns {{ shouldPlay: boolean, reason: string }}
 */
export function evaluateSplashEligibility() {
  try {
    const params = new URLSearchParams(window.location.search);

    // 1. Explicit Dev / QA Query Override (Always plays)
    if (
      params.get('splash') === '1' ||
      params.get('splash') === 'true' ||
      params.get('welcome') === '1'
    ) {
      return { shouldPlay: true, reason: 'explicit_query_param' };
    }

    // 2. Explicit Suppression Query Override (Never plays)
    if (params.get('nosplash') === '1' || params.get('skipSplash') === '1') {
      return { shouldPlay: false, reason: 'explicit_skip_param' };
    }

    // 3. Search Engine Crawlers & Social Preview Bots (never block crawlers)
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|twitterbot/i.test(
        navigator.userAgent
      );
      if (isBot) {
        return { shouldPlay: false, reason: 'search_crawler_bypass' };
      }
    }

    // 4. Session Frequency: Already seen or skipped in this browser session
    if (sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true') {
      return { shouldPlay: false, reason: 'already_seen_in_session' };
    }

    // 5. Deep Links — Target Navigation Intent
    // If a user clicks a shared profile, direct chat, or invite link, do not trap them behind a splash
    if (
      params.has('profile') ||
      params.has('chat') ||
      params.has('tab') ||
      params.has('invite') ||
      params.has('code') ||
      params.has('ref')
    ) {
      return { shouldPlay: false, reason: 'deep_link_query' };
    }

    // Auth Action Links (password reset, email verification, OAuth return)
    if (params.has('mode') || params.has('oobCode') || params.has('apiKey')) {
      return { shouldPlay: false, reason: 'auth_action_link' };
    }

    // 6. Pathname Deep Links (e.g., /chat, /discover, /admin, /reset-password)
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const bypassPaths = [
      'discover',
      'matches',
      'chat',
      'notifications',
      'profile',
      'settings',
      'safety',
      'admin',
      'reset-password',
      'login',
      'signup',
      '404',
    ];
    if (cleanPath && bypassPaths.includes(cleanPath)) {
      return { shouldPlay: false, reason: `deep_link_path_${cleanPath}` };
    }

    // 7. Returning Authenticated Users with stored credentials
    // Logged in users need immediate access to their inbox / feed
    const hasStoredAuth = Boolean(
      localStorage.getItem('vh-firebase-token') ||
      localStorage.getItem('vh-user-profile')
    );
    if (hasStoredAuth) {
      return { shouldPlay: false, reason: 'returning_authenticated_user' };
    }

    // 8. Passed all checks: Eligible first-time landing visitor in a fresh session
    return { shouldPlay: true, reason: 'eligible_fresh_visitor' };
  } catch (err) {
    console.warn('SPLASH_EVALUATION_FALLBACK:', err);
    return { shouldPlay: false, reason: 'error_fallback_safe' };
  }
}

/**
 * Mark the splash as seen in the current session.
 */
export function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
  } catch (_) {}
}

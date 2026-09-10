/**
 * Velvet Hearts — Welcome Splash Screen Policy & Edge-Case Manager
 *
 * Requirements:
 * 1. Play every time the user opens the app (new session / tab / reopening after exit).
 * 2. Once completed (or skipped) and on the landing page, refreshing the page (F5/reload)
 *    must NOT show the welcome screen again.
 * 3. If the user exits the app (closes tab/window) and opens it again, SHOW IT.
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

    // 1. Explicit Dev / QA Query Override (Forces splash to play)
    if (
      params.get('splash') === '1' ||
      params.get('splash') === 'true' ||
      params.get('welcome') === '1'
    ) {
      return { shouldPlay: true, reason: 'explicit_query_param' };
    }

    // 2. Explicit Suppression Query Override (Forces splash to be skipped)
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

    // 4. Session Persistence (Refresh Guard):
    // If the user already completed or skipped the splash in this browsing tab/session,
    // refreshing the landing page must NOT show the splash again.
    if (sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true') {
      return { shouldPlay: false, reason: 'already_seen_in_current_session_refresh' };
    }

    // 5. Deep Links — Target Navigation Intent
    // If a user clicks a direct link to a shared profile, chat, or invite, do not delay them
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

    // 7. Fresh App Open: User opened the app in a new tab/session -> SHOW IT!
    return { shouldPlay: true, reason: 'fresh_app_open' };
  } catch (err) {
    console.warn('SPLASH_EVALUATION_FALLBACK:', err);
    return { shouldPlay: true, reason: 'fallback_open' };
  }
}

/**
 * Mark the splash as seen in the current session and clean URL.
 * When the user is on the landing page, removing ?splash=... ensures that
 * hitting refresh (F5) will NOT replay the splash screen.
 */
export function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');

    // Clean up ?splash / ?welcome query parameters from the address bar
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('splash') || url.searchParams.has('welcome')) {
        url.searchParams.delete('splash');
        url.searchParams.delete('welcome');
        const newSearch = url.searchParams.toString();
        const newUrl = `${url.pathname}${newSearch ? `?${newSearch}` : ''}${url.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  } catch (_) {}
}

/**
 * Frontend Error Sanitizer & Formatter
 * Logs technical diagnostics to console and provides empathetic, user-friendly messages.
 */

export function sanitizeUserErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again after a while.'
) {
  if (!error) return fallback;

  // Always log the actual raw technical error to the console for developer debugging
  console.error('[Diagnostic Error Log]:', error);

  const rawMessage = typeof error === 'string' ? error : (error.message || '');
  const lower = rawMessage.toLowerCase();

  // Patterns that indicate internal/server/database/network crashes
  const isTechnical =
    lower.includes('prisma') ||
    lower.includes('database') ||
    lower.includes('can\'t reach') ||
    lower.includes('quota') ||
    lower.includes('connect') ||
    lower.includes('connection') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('enotfound') ||
    lower.includes('sql') ||
    lower.includes('postgres') ||
    lower.includes('internal server error') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('invalid invocation') ||
    lower.includes('load failed') ||
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    lower.includes('typeerror') ||
    lower.includes('referenceerror') ||
    lower.includes('cannot read properties') ||
    lower.includes('undefined is not');

  if (isTechnical) {
    return 'We are having trouble connecting right now. Please try again in a few moments.';
  }

  return rawMessage || fallback;
}

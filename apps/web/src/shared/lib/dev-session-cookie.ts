const PRODUCTION_SESSION_PREFIX = '__Host-storymee_session='
const DEVELOPMENT_SESSION_PREFIX = 'storymee_session='

/**
 * HTTPS Hub responses use a __Host- Secure cookie. Browsers correctly reject
 * that cookie when the response is proxied through the HTTP Vite dev server.
 * Rewrite only the local proxy copy; production responses remain untouched.
 */
export function rewriteDevSessionCookie(cookie: string): string {
  return cookie
    .replace(PRODUCTION_SESSION_PREFIX, DEVELOPMENT_SESSION_PREFIX)
    .replace(/;\s*Secure/gi, '')
}


/**
 * auth.ts — Client-side session management
 *
 * Stores the JWT and basic user data in localStorage to persist the session
 * across page reloads. sessionStorage is intentionally avoided because it
 * is cleared when the tab is closed, forcing the user to log in every time.
 *
 * localStorage keys:
 *   lc_token — JWT signed by the backend (HMAC-SHA256)
 *   lc_user  — JSON with { username, role } of the authenticated user
 */

/** Represents the authenticated user as returned by the backend login response. */
export interface AuthUser {
  username: string;
  role: 'ADMIN' | 'USER';
}

const TOKEN_KEY = 'lc_token';
const USER_KEY  = 'lc_user';

/**
 * Persists the JWT and user info after a successful login.
 * Called once after receiving a 200 response from POST /api/auth/login.
 */
export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Returns the stored JWT, or null if there is no active session.
 * The typeof window guard prevents crashes during Next.js SSR,
 * where localStorage does not exist.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Returns the authenticated user data, or null if there is no active session.
 * Same SSR guard as getToken.
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

/**
 * Removes the JWT and user data from localStorage (logout).
 * Does not invalidate the token on the server side; the JWT simply
 * expires according to APP_JWT_EXPIRATION configured in the backend.
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

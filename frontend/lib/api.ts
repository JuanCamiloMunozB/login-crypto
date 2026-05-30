/**
 * api.ts — HTTP client for the login-crypto backend
 *
 * Centralises all REST calls to the Spring Boot backend. Each group of
 * endpoints is exported as a typed object so components never have to
 * repeat the base URL or common headers.
 *
 * Base URL is configured via the environment variable:
 *   NEXT_PUBLIC_API_URL  (e.g. http://localhost:8080 for local development)
 *
 * Authentication: all protected endpoints send the JWT in the
 * Authorization header as a Bearer token, as required by the backend.
 */

/** Backend base URL. The NEXT_PUBLIC_ prefix exposes it to the browser bundle. */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081';

/**
 * Low-level fetch wrapper with error handling.
 * Extracts the error message from the backend JSON body (fields "error",
 * "message" or "detail") so that meaningful messages are shown to the user
 * without leaking stack traces.
 *
 * @throws Error with the backend's error message if the response is not 2xx.
 */
async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let msg = body;
    try {
      // Backend returns errors as { "error": "message" }
      const json = JSON.parse(body);
      msg = json.message ?? json.error ?? json.detail ?? body;
    } catch { /* body is plain text, use as-is */ }
    throw new Error(msg || `Error ${res.status}`);
  }

  // Some endpoints return 200 with no body (e.g. DELETE, PUT password)
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Builds the Authorization header from the authenticated user's JWT. */
const bearer = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

// ─── Public endpoints (/api/auth) ────────────────────────────────────────────

/**
 * authApi — Endpoints that do not require prior authentication.
 * Correspond to the backend SecurityConfig: .requestMatchers("/api/auth/**").permitAll()
 */
export const authApi = {
  /**
   * Authenticates a user and returns the JWT together with their role.
   * The backend validates the credentials, verifies the PBKDF2 hash and
   * updates the session timestamps (lastLogin / currentLogin).
   */
  login: (username: string, password: string) =>
    req<{ token: string; username: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Registers a new user with role USER (never ADMIN).
   * The backend applies the password policy before hashing with PBKDF2.
   */
  register: (username: string, password: string) =>
    req<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// ─── Regular user endpoints (/api/user) ──────────────────────────────────────

/**
 * userApi — Endpoints for users with role USER.
 * Require a valid JWT; protected by hasRole(Role.USER) in the backend.
 */
export const userApi = {
  /**
   * Returns the date/time of the previous login (before the current session).
   * The backend maintains two timestamps: lastLogin (previous) and
   * currentLogin (present), rotated on every successful login.
   * Returns null on the very first login.
   */
  lastLogin: (token: string) =>
    req<{ lastLogin: string | null }>('/api/user/me/last-login', {
      headers: bearer(token),
    }),

  /**
   * Updates the password of the authenticated user.
   * The backend re-hashes with PBKDF2 using a fresh random salt, so the
   * previous hash and salt are completely replaced in the database.
   */
  changePassword: (token: string, newPassword: string) =>
    req<void>('/api/user/me/password', {
      method: 'PUT',
      headers: bearer(token),
      body: JSON.stringify({ newPassword }),
    }),
};

// ─── Admin endpoints (/api/admin) ─────────────────────────────────────────────

/**
 * adminApi — Endpoints exclusive to the ADMIN role.
 * Require a valid JWT with role ADMIN; any other role receives HTTP 403.
 */
export const adminApi = {
  /** Returns the list of usernames of all registered accounts. */
  listUsers: (token: string) =>
    req<string[]>('/api/admin/users', { headers: bearer(token) }),

  /**
   * Permanently deletes a user account.
   * The backend prevents deleting the admin account.
   * encodeURIComponent handles usernames with special characters.
   */
  deleteUser: (token: string, username: string) =>
    req<void>(`/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: bearer(token),
    }),

  /**
   * Clears a user's credentials (hash, salt and iterations are set to NULL
   * in the database). The user is locked out until the admin manages their
   * account, since login requires a valid hash to authenticate.
   */
  clearPassword: (token: string, username: string) =>
    req<void>(`/api/admin/users/${encodeURIComponent(username)}/clear-password`, {
      method: 'PUT',
      headers: bearer(token),
    }),
};

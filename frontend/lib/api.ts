const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081';

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
      const json = JSON.parse(body);
      msg = json.message ?? json.error ?? json.detail ?? body;
    } catch { /* body is plain text */ }
    throw new Error(msg || `Error ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const bearer = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

export const authApi = {
  login: (username: string, password: string) =>
    req<{ token: string; username: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    req<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const userApi = {
  lastLogin: (token: string) =>
    req<{ lastLogin: string | null }>('/api/user/me/last-login', {
      headers: bearer(token),
    }),

  changePassword: (token: string, newPassword: string) =>
    req<void>('/api/user/me/password', {
      method: 'PUT',
      headers: bearer(token),
      body: JSON.stringify({ newPassword }),
    }),
};

export const adminApi = {
  listUsers: (token: string) =>
    req<string[]>('/api/admin/users', { headers: bearer(token) }),

  deleteUser: (token: string, username: string) =>
    req<void>(`/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: bearer(token),
    }),

  clearPassword: (token: string, username: string) =>
    req<void>(`/api/admin/users/${encodeURIComponent(username)}/clear-password`, {
      method: 'PUT',
      headers: bearer(token),
    }),
};

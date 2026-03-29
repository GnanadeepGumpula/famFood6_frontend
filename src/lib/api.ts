const defaultApiBase = (() => {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

  if (isLocalHost) return 'http://localhost:3000';

  return `${protocol}//${hostname}:3000`;
})();

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : defaultApiBase);

function buildApiUrl(path: string): string {
  const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Prevent accidental /api/api duplication when base and path both include /api.
  const finalPath = normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api/')
    ? normalizedPath.slice(4)
    : normalizedPath;

  return `${normalizedBase}${finalPath}`;
}

export const getToken = (): string | null => localStorage.getItem('auth_token');
export const setToken = (t: string): void => { localStorage.setItem('auth_token', t); };
export const clearToken = (): void => { localStorage.removeItem('auth_token'); };

/** Decode a JWT payload without verifying the signature (server still verifies). */
export function parseJwt(token: string): { userId: string; mobileNumber: string; role: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Central fetch helper that attaches the stored JWT as a Bearer token.
 * Throws on non-2xx status or `success: false` from server.
 */
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildApiUrl(path), { ...options, headers });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data.data as T;
}

/**
 * Unified API Client for My Student Academia
 * Automatically adapts between local development (Vite proxy /api)
 * and production cloud deployments (Cloudflare / Firebase / Render / Cloud Run).
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || '/api';

/**
 * Standard fetch helper that prepends the configured API base URL
 */
export async function apiFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  let url = endpoint;
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = API_BASE_URL.replace(/\/+$/, '');
    
    // Avoid double '/api' if base ends with '/api' and endpoint already starts with '/api/'
    if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      url = `${base}${cleanEndpoint.slice(4)}`;
    } else if (cleanEndpoint.startsWith(base)) {
      url = cleanEndpoint;
    } else {
      url = `${base}${cleanEndpoint}`;
    }
  }

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

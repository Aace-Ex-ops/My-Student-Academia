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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}/${cleanEndpoint}`;

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/* ===========================================================================
   AI ENGINEERING COPILOT - API CLIENT UTILITIES
   =========================================================================== */

// Centralized fetch wrapper that automatically includes the user's
// Supabase access token (if present) in the Authorization header.

import { state } from '../state.js';

/**
 * Build the auth headers for outgoing requests.
 * Logs token presence (without revealing the actual token) and whether the
 * Authorization header will be attached.
 */
export function getAuthHeaders() {
  const token = state.session?.access_token;
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // Log that a token exists – do NOT print the token itself.
    console.log('🔐 Auth token present – Authorization header will be attached');
  } else {
    console.warn('⚠️ No auth token available – request will be sent without Authorization');
  }
  return headers;
}

/**
 * Reusable wrapper around fetch that:
 *   • Prepends the backend base URL from state.backendUrl
 *   • Merges any caller‑provided headers with the auth headers
 *   • Logs request details for debugging
 */
export async function apiFetch(path, init = {}) {
  if (!state.backendUrl) {
    throw new Error('Backend URL is not configured – ensure .env is loaded before making API calls');
  }

  const url = `${state.backendUrl}${path}`;
  const authHeaders = getAuthHeaders();
  const mergedHeaders = { ...(init.headers || {}), ...authHeaders };

  const fetchOptions = {
    ...init,
    headers: mergedHeaders,
  };

  console.log(`🛰️  API request → ${fetchOptions.method || 'GET'} ${url}`);
  return fetch(url, fetchOptions);
}

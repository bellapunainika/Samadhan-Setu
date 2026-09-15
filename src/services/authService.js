/**
 * src/services/authService.js
 *
 * Authentication API calls — login, register, logout, restoreSession.
 * All calls go through the axios instance in api.js.
 *
 * Token storage:
 *   samadhan_token  — JWT string
 *   samadhan_user   — JSON-serialised user object { id, email, full_name, role }
 */
import api from './api';

const TOKEN_KEY = 'samadhan_token';
const USER_KEY  = 'samadhan_user';

// ── Token helpers ────────────────────────────────────────────────────────────

export function saveSession(tokenResponse) {
  sessionStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify({
    id:        tokenResponse.user_id,
    email:     tokenResponse.email,
    full_name: tokenResponse.full_name,
    role:      tokenResponse.role,
  }));
  // Clean up legacy localStorage keys
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasToken() {
  return !!sessionStorage.getItem(TOKEN_KEY);
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * On success, saves token + user to localStorage.
 * @returns {TokenResponse} the full response from /api/auth/login
 */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  saveSession(data);
  return data;
}

/**
 * Register a new citizen / university / industry account.
 * Does NOT auto-login after registration.
 * @returns {UserOut} the created user object
 */
export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

/**
 * Fetch the current user's profile using the stored JWT.
 * Used on app startup to restore session after page refresh.
 * Returns null if no valid token exists.
 */
export async function fetchMe() {
  if (!hasToken()) return null;
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Logout — clears localStorage session.
 * (No backend call needed for JWT-based auth in this MVP.)
 */
export function logout() {
  clearSession();
}

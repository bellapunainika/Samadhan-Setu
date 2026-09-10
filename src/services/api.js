/**
 * src/services/api.js
 * 
 * Axios base instance for all Samadhan Setu API calls.
 * 
 * - Reads the JWT from localStorage and attaches it to every request.
 * - On 401 responses, clears the token and redirects to home (forces re-login).
 * - All requests go to /api/* which Vite proxies to http://localhost:8000.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('samadhan_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle auth errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session
      localStorage.removeItem('samadhan_token');
      localStorage.removeItem('samadhan_user');
      // Redirect to home so LoginModal appears on next action
      window.location.hash = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

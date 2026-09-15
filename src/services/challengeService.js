/**
 * src/services/challengeService.js
 *
 * API calls for challenge creation, file evidence upload, user submission retrieval, and citizen stats.
 * All calls go through the axios instance in api.js (attaches JWT automatically).
 */
import api from './api';

/**
 * Fetch all public challenges (no auth required) — powers the citizen "All Challenges" feed.
 */
export async function getPublicChallenges(limit = 100) {
  const { data } = await api.get('/challenges', { params: { limit } });
  return data;
}

/**
 * Submit a new grassroots challenge to FastAPI backend.
 * Returns created challenge object with AI prediction output.
 */
export async function createChallenge(challengeData) {
  const { data } = await api.post('/challenges/', challengeData);
  return data;
}

/**
 * Upload an evidence image file for a challenge.
 */
export async function uploadEvidence(challengeId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post(`/uploads/evidence/${challengeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

/**
 * Fetch challenges submitted by the logged-in user.
 */
export async function getMyChallenges() {
  const { data } = await api.get('/challenges/my');
  return data;
}

/**
 * Fetch details of a specific challenge by ID or short_id.
 */
export async function getChallengeDetail(id) {
  const { data } = await api.get(`/challenges/${id}`);
  return data;
}

/**
 * Fetch real database citizen dashboard metrics.
 */
export async function getCitizenStats() {
  const { data } = await api.get('/challenges/stats/citizen');
  return data;
}

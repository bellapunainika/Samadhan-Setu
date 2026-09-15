/**
 * src/services/universityService.js
 *
 * Frontend API service for Stage 3 University Discovery & Assignment endpoints.
 */
import api from './api';

export async function getAvailableChallenges() {
  const { data } = await api.get('/universities/available-challenges');
  return data;
}

export async function getMyAssignments() {
  const { data } = await api.get('/universities/my-assignments');
  return data;
}

export async function startProject(challengeId) {
  const { data } = await api.post(`/universities/challenges/${challengeId}/start`);
  return data;
}

export async function postProgressUpdate(challengeId, payload) {
  const { data } = await api.post(`/universities/challenges/${challengeId}/progress`, payload);
  return data;
}

export async function submitSolution(challengeId, payload) {
  const { data } = await api.post(`/universities/challenges/${challengeId}/submit-solution`, payload);
  return data;
}

export async function getUniversityStats() {
  const { data } = await api.get('/universities/stats');
  return data;
}

export async function configureTeam(challengeId, payload) {
  const { data } = await api.post(`/universities/challenges/${challengeId}/team`, payload);
  return data;
}

/**
 * University action: signals this validated solution is seeking industry funding.
 * Sets ChallengeStatus → INDUSTRY_SUPPORT_REQUESTED on the backend.
 * Does NOT create an IndustryInterest record — that only happens when
 * a real Industry user calls expressInterest().
 */
export async function seekIndustrySupport(challengeId) {
  const { data } = await api.post(`/universities/challenges/${challengeId}/seek-industry-support`);
  return data;
}

export async function getUniversityIndustryInterests() {
  const { data } = await api.get('/universities/industry-interests');
  return data;
}

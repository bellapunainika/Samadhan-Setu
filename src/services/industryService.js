/**
 * src/services/industryService.js
 *
 * Frontend API service for Stage 3 Industry Partnership endpoints.
 */
import api from './api';

export async function getIndustryOpportunities() {
  const { data } = await api.get('/industry/opportunities');
  return data;
}

export async function expressInterest(challengeId, payload) {
  const { data } = await api.post(`/industry/opportunities/${challengeId}/express-interest`, payload);
  return data;
}

export async function getMyInterests() {
  const { data } = await api.get('/industry/my-interests');
  return data;
}

export async function getIndustryStats() {
  const { data } = await api.get('/industry/stats');
  return data;
}

export async function getIndustryHistory() {
  const { data } = await api.get('/industry/history');
  return data;
}

export async function updateProposalStatus(requestId, payload) {
  const { data } = await api.post(`/industry/proposals/${requestId}/update-status`, payload);
  return data;
}

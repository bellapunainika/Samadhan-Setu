/**
 * src/services/industryService.js
 *
 * Frontend API service for Industry Partnership endpoints.
 *
 * Flow:
 *   1. getIndustryOpportunities()  → INDUSTRY_SUPPORT_REQUESTED challenges only
 *   2. expressInterest()           → Creates ONE real IndustryInterest record
 *   3. getMyInterests()            → INTEREST_EXPRESSED / PROPOSAL_* (active negotiations)
 *   4. getActiveFunding()          → SUPPORT_CONFIRMED / FUNDING_CONFIRMED
 *   5. getIndustryHistory()        → PROJECT_FUNDED (completed)
 *   6. updateProposalStatus()      → Role-gated transitions (backend enforces rules)
 */
import api from './api';

/** Returns validated solutions where the University is actively seeking industry support. */
export async function getIndustryOpportunities() {
  const { data } = await api.get('/industry/opportunities');
  return data;
}

/** Express interest in a validated solution. Challenge must be INDUSTRY_SUPPORT_REQUESTED. */
export async function expressInterest(challengeId, payload) {
  const { data } = await api.post(`/industry/opportunities/${challengeId}/express-interest`, payload);
  return data;
}

/** Get active funding interests (INTEREST_EXPRESSED, PROPOSAL_INITIATED, PROPOSAL_UNDER_DISCUSSION). */
export async function getMyInterests() {
  const { data } = await api.get('/industry/my-interests');
  return data;
}

/** Get confirmed partnerships (SUPPORT_CONFIRMED, FUNDING_CONFIRMED). */
export async function getActiveFunding() {
  const { data } = await api.get('/industry/active-funding');
  return data;
}

/** Get fully completed/funded project history (PROJECT_FUNDED). */
export async function getIndustryHistory() {
  const { data } = await api.get('/industry/history');
  return data;
}

/** Get industry dashboard stats. */
export async function getIndustryStats() {
  const { data } = await api.get('/industry/stats');
  return data;
}

/**
 * Advance proposal status. Role-gated in backend.
 * University: INTEREST_EXPRESSED→PROPOSAL_INITIATED, →PROPOSAL_UNDER_DISCUSSION, →SUPPORT_CONFIRMED
 * Industry:   INTEREST_EXPRESSED→PROPOSAL_INITIATED, →PROPOSAL_UNDER_DISCUSSION,
 *             SUPPORT_CONFIRMED→FUNDING_CONFIRMED, FUNDING_CONFIRMED→PROJECT_FUNDED
 */
export async function updateProposalStatus(requestId, payload) {
  const { data } = await api.post(`/industry/proposals/${requestId}/update-status`, payload);
  return data;
}

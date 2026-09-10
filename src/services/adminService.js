/**
 * src/services/adminService.js
 *
 * Frontend API service for Stage 3 Admin Governance endpoints.
 */
import api from './api';

export async function getPendingChallenges() {
  const { data } = await api.get('/admin/challenges/pending');
  return data;
}

export async function getApprovedChallenges() {
  const { data } = await api.get('/admin/challenges/approved');
  return data;
}

export async function getAssignedChallenges() {
  const { data } = await api.get('/admin/challenges/assigned');
  return data;
}

export async function getPendingSolutions() {
  const { data } = await api.get('/admin/solutions/pending');
  return data;
}

export async function reviewSolution(id, action, feedback) {
  const { data } = await api.post(`/admin/solutions/${id}/review`, { action, feedback });
  return data;
}

export async function getIndustryRequests() {
  const { data } = await api.get('/admin/industry-requests');
  return data;
}

export async function reviewIndustryRequest(requestId, action, response) {
  const { data } = await api.post(`/admin/industry-requests/${requestId}/review`, { action, response });
  return data;
}

export async function getAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function getChallengeAiDetail(id) {
  const { data } = await api.get(`/admin/challenges/${id}/ai`);
  return data;
}

export async function approveChallenge(id, reason) {
  const { data } = await api.post(`/admin/challenges/${id}/approve`, { reason });
  return data;
}

export async function rejectChallenge(id, reason) {
  const { data } = await api.post(`/admin/challenges/${id}/reject`, { reason });
  return data;
}

export async function overrideAi(id, payload) {
  const { data } = await api.patch(`/admin/challenges/${id}/override-ai`, payload);
  return data;
}

export async function assignUniversity(id, universityId, notes) {
  const { data } = await api.post(`/admin/challenges/${id}/assign`, {
    university_id: universityId,
    notes
  });
  return data;
}

export async function getAuditLogs() {
  const { data } = await api.get('/admin/audit-log');
  return data;
}

export async function getAdminUniversities() {
  const { data } = await api.get('/admin/universities');
  return data;
}

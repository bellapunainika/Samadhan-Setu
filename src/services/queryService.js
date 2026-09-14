/**
 * src/services/queryService.js
 *
 * Frontend API service for Stakeholder Queries.
 */
import api from './api';

export async function createQuery(challenge_id, message, subject = 'Project Query') {
  const { data } = await api.post('/queries/', { challenge_id, message, subject });
  return data;
}

export async function getMyQueries() {
  const { data } = await api.get('/queries/my');
  return data;
}

export async function getAdminQueries() {
  const { data } = await api.get('/queries/admin');
  return data;
}

export async function respondQuery(queryId, response) {
  const { data } = await api.post(`/queries/${queryId}/respond`, { response });
  return data;
}

import apiClient from './apiClient';

/** GET /health -> { status, database, uptime, timestamp } */
export async function getHealth(config = {}) {
  const { data } = await apiClient.get('/health', config);
  return data.data;
}

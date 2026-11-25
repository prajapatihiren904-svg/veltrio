import apiClient from './apiClient';

export const sessionService = {
  async getSessions() {
    const { data } = await apiClient.get('/auth/sessions');

    return data.data.sessions;
  },

  async revokeSession(sessionId) {
    const { data } = await apiClient.delete(
      `/auth/sessions/${sessionId}`
    );

    return data;
  },

  async revokeOtherSessions() {
    const { data } = await apiClient.post(
      '/auth/sessions/revoke-others'
    );

    return data;
  },

  async revokeAllSessions() {
    const { data } = await apiClient.post(
      '/auth/sessions/revoke-all'
    );

    return data;
  },
};
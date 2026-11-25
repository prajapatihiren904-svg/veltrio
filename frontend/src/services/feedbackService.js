import apiClient from './apiClient';

export const feedbackService = {
  async create(payload) {
    const { data } = await apiClient.post('/feedback', payload);
    return data.data.feedback;
  },

  async listMine() {
    const { data } = await apiClient.get('/feedback/mine');
    return data.data.feedback;
  },
};
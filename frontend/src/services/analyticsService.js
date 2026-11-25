import apiClient from './apiClient';

export const analyticsService = {
  async report(month) {
    const { data } = await apiClient.get('/analytics', { params: { month } });
    return data.data.report;
  },
};

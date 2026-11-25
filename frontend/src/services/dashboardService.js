import apiClient from './apiClient';

export const dashboardService = {
  async summary() {
    const { data } = await apiClient.get('/dashboard/summary');
    return data.data.summary;
  },
};

import apiClient from './apiClient';

export const budgetService = {
  async list(month) {
    const { data } = await apiClient.get('/budgets', { params: { month } });
    return data.data;
  },
  async save(payload) {
    const { data } = await apiClient.put('/budgets', payload);
    return data.data.budget;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/budgets/${id}`);
    return data.data;
  },
};

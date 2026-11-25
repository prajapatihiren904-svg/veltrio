import apiClient from './apiClient';

export const goalService = {
  async list() {
    const { data } = await apiClient.get('/goals');
    return data.data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/goals', payload);
    return data.data.goal;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/goals/${id}`, payload);
    return data.data.goal;
  },
  async contribute(id, payload) {
    const { data } = await apiClient.post(`/goals/${id}/contributions`, payload);
    return data.data.goal;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`/goals/${id}`);
    return data.data;
  },
};

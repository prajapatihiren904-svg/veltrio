import apiClient from './apiClient';

export const purchaseService = {
  async list() {
    const { data } = await apiClient.get('/purchases');
    return data.data;
  },

  async create(payload) {
    const { data } = await apiClient.post('/purchases', payload);
    return data.data.purchase;
  },

  async update(id, payload) {
    const { data } = await apiClient.patch(
      `/purchases/${id}`,
      payload
    );

    return data.data.purchase;
  },

  async recordPayment(id, payload) {
    const { data } = await apiClient.post(
      `/purchases/${id}/payments`,
      payload
    );

    return data.data.purchase;
  },

  async remove(id) {
    const { data } = await apiClient.delete(
      `/purchases/${id}`
    );

    return data.data;
  },
};
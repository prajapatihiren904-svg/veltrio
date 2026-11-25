import apiClient from './apiClient';

export const transactionService = {
  async list(params = {}) {
    const { data } = await apiClient.get('/transactions', { params });
    return data.data;
  },

  async get(id) {
    const { data } = await apiClient.get(`/transactions/${id}`);
    return data.data.transaction;
  },

  async create(payload) {
    const { data } = await apiClient.post('/transactions', payload);
    return data.data.transaction;
  },

  async update(id, payload) {
    const { data } = await apiClient.patch(`/transactions/${id}`, payload);
    return data.data.transaction;
  },

  async remove(id) {
    const { data } = await apiClient.delete(`/transactions/${id}`);
    return data.data;
  },

  async categories(type) {
    const { data } = await apiClient.get('/transactions/categories', {
      params: type ? { type } : {},
    });
    return data.data.categories;
  },

  async createCategory(payload) {
    const { data } = await apiClient.post('/transactions/categories', payload);
    return data.data.category;
  },

  async import(transactions) {
  const { data } = await apiClient.post('/transactions/import', {
    transactions,
  });

  return data.data;
},

  // Import Excel / CSV transactions
  async import(transactions) {
    const { data } = await apiClient.post('/transactions/import', {
      transactions,
    });
    return data.data;
  },
};
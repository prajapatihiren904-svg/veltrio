import apiClient from './apiClient';

export const adminService = {

  // Get Admin Dashboard Overview
  async getOverview() {
    const { data } = await apiClient.get('/admin/overview');
    return data.data.overview;
  },

  // Get All Users with Search and Pagination
  async getUsers(params = {}) {
    const { data } = await apiClient.get('/admin/users', {
      params,
    });
    return data.data;
  },

  // Get Single User Details
  async getUser(id) {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data.data;
  },

  // Suspend or Activate User
  async updateUserStatus(id, status) {
    const { data } = await apiClient.patch(
      `/admin/users/${id}/status`,
      { status }
    );
    return data.data.user;
  },

};
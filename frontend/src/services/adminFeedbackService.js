import apiClient from './apiClient';

export const adminFeedbackService = {

  // Get all feedback with filters and pagination
  async list(params = {}) {
    const { data } = await apiClient.get('/admin/feedback', {
      params,
    });

    return data.data;
  },

  // Get feedback statistics
  async getStats() {
    const { data } = await apiClient.get('/admin/feedback/stats');

    return data.data.stats;
  },

  // Update feedback status
  async updateStatus(id, status) {
    const { data } = await apiClient.patch(
      `/admin/feedback/${id}/status`,
      { status }
    );

    return data.data.feedback;
  },

  // Submit admin response
async respond(id, response) {
  const { data } = await apiClient.patch(
    `/admin/feedback/${id}/response`,
    { response }
  );

  return data.data.feedback;
},

};
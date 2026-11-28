import apiClient from './apiClient';

export const authService = {
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  },

  async verifyEmail(payload) {
    const { data } = await apiClient.post('/auth/verify-email', payload);
    return data.data;
  },

  async resendVerificationOtp(email) {
    const { data } = await apiClient.post(
      '/auth/resend-verification',
      { email }
    );
    return data;
  },

  async login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data.data;
  },

  async me() {
    const { data } = await apiClient.get('/auth/me');
    return data.data.user;
  },

  async logout() {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  async forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return data;
  },

  async resetPassword(token, password) {
    const { data } = await apiClient.post(
      `/auth/reset-password/${token}`,
      { password }
    );
    return data;
  },
};
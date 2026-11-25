import apiClient from './apiClient';

export const accountService = {
  async updateProfile(payload) {
    const { data } = await apiClient.patch('/account/profile', payload);
    return data.data.user;
  },

  async updatePreferences(payload) {
    const { data } = await apiClient.patch('/account/preferences', payload);
    return data.data.user;
  },

  async changePassword(payload) {
    const { data } = await apiClient.patch('/account/password', payload);
    return data;
  },

  async deleteAccount(password) {
    const { data } = await apiClient.delete('/account', {
      data: { password },
    });
    return data;
  },

async uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await apiClient.patch(
    '/account/profile/photo',
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    }
  );

  return data.data.user;
},

async removeProfilePhoto() {
  const { data } = await apiClient.delete('/account/profile/photo');
  return data.data.user;
},
};
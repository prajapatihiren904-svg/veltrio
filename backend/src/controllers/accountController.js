import { sendSuccess } from '../utils/apiResponse.js';
import * as accountService from '../services/accountService.js';
import { ApiError } from '../utils/ApiError.js';

export async function updateProfile(req, res) {
  const user = await accountService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, { data: { user }, message: 'Profile updated successfully' });
}
export async function updatePreferences(req, res) {
  const user = await accountService.updatePreferences(req.user.id, req.body);
  return sendSuccess(res, { data: { user }, message: 'Preferences updated successfully' });
}
export async function changePassword(req, res) {
  const result = await accountService.changePassword(req.user.id, req.body);
  return sendSuccess(res, { data: null, message: result.message });
}
export async function deleteAccount(req, res) {
  const result = await accountService.deleteAccount(req.user.id, req.body);
  return sendSuccess(res, { data: null, message: result.message });
}
export async function updateProfilePhoto(req, res) {
  if (!req.file) {
    throw ApiError.badRequest('Please select a profile photo');
  }

  const user = await accountService.updateProfilePhoto(
    req.user.id,
    req.file
  );

  return sendSuccess(res, {
    data: { user },
    message: 'Profile photo updated successfully',
  });
}
export async function removeProfilePhoto(req, res) {
  const user = await accountService.removeProfilePhoto(req.user.id);

  return sendSuccess(res, {
    data: { user },
    message: 'Profile photo removed successfully',
  });
}
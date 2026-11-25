import { sendSuccess } from '../utils/apiResponse.js';
import {
  getAdminOverview,
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
} from '../services/adminService.js';

export async function getOverview(req, res) {
  const overview = await getAdminOverview();

  return sendSuccess(res, {
    data: { overview },
  });
}

export async function getUsers(req, res) {
  const result = await getAdminUsers(req.query);

  return sendSuccess(res, {
    data: result,
  });
}

export async function getUser(req, res) {
  const result = await getAdminUserById(req.params.id);

  return sendSuccess(res, {
    data: result,
  });
}

export async function updateUserStatus(req, res) {
  const user = await updateAdminUserStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );

  return sendSuccess(res, {
    message: 'User status updated successfully',
    data: { user },
  });
}
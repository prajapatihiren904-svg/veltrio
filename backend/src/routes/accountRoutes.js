import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfileRules, updatePreferencesRules, changePasswordRules, deleteAccountRules } from '../validators/accountValidators.js';
import * as controller from '../controllers/accountController.js';
import uploadAvatar from '../middleware/uploadAvatar.js';

const router = Router();
router.use(authenticate);
router.patch('/profile', updateProfileRules, validateRequest, asyncHandler(controller.updateProfile));
router.patch(
  '/profile/photo',
  uploadAvatar.single('avatar'),
  asyncHandler(controller.updateProfilePhoto)
);
router.delete(
  '/profile/photo',
  asyncHandler(controller.removeProfilePhoto)
);
router.patch('/preferences', updatePreferencesRules, validateRequest, asyncHandler(controller.updatePreferences));
router.patch('/password', changePasswordRules, validateRequest, asyncHandler(controller.changePassword));
router.delete('/', deleteAccountRules, validateRequest, asyncHandler(controller.deleteAccount));
export default router;

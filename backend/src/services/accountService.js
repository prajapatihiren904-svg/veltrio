import mongoose from 'mongoose';

import User from '../models/User.js';
import UserSession from '../models/UserSession.js';

import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

import { ApiError } from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';

import { Readable } from 'node:stream';


// ==========================================
// PUBLIC USER DATA
// ==========================================

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  currency: user.currency,
  createdAt: user.createdAt,
  avatarUrl: user.avatarUrl || '',
  avatarPublicId: user.avatarPublicId || '',
});


// ==========================================
// UPDATE PROFILE
// ==========================================

export async function updateProfile(userId, { name }) {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  user.name = name.trim();

  await user.save();

  return publicUser(user);
}


// ==========================================
// UPDATE PREFERENCES
// ==========================================

export async function updatePreferences(userId, { currency }) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: { currency },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  return publicUser(user);
}


// ==========================================
// CHANGE PASSWORD
// ==========================================

export async function changePassword(
  userId,
  { currentPassword, newPassword }
) {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest(
      'Current password is incorrect',
      [
        {
          field: 'currentPassword',
          message: 'Current password is incorrect',
        },
      ]
    );
  }

  // Prevent reusing the current password
  if (currentPassword === newPassword) {
    throw ApiError.badRequest(
      'Choose a password you have not used as your current password'
    );
  }

  // Update password
  user.password = newPassword;

  await user.save();

  // Remove password reset tokens
  await PasswordResetToken.deleteMany({
    user: userId,
  });

  // Revoke every active login session
  await UserSession.deleteMany({
    user: userId,
  });

  return {
    message: 'Password changed successfully. Please sign in again.',
  };
}


// ==========================================
// DELETE ACCOUNT
// ==========================================

export async function deleteAccount(userId, { password }) {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  // Verify password before deleting account
  if (!(await user.comparePassword(password))) {
    throw ApiError.badRequest(
      'Password is incorrect',
      [
        {
          field: 'password',
          message: 'Password is incorrect',
        },
      ]
    );
  }

  // Delete only records owned by this account
  const owner = new mongoose.Types.ObjectId(userId);

  await Promise.all([
    Transaction.deleteMany({ user: owner }),
    Category.deleteMany({ user: owner }),
    Budget.deleteMany({ user: owner }),
    Goal.deleteMany({ user: owner }),
    PasswordResetToken.deleteMany({ user: owner }),
    UserSession.deleteMany({ user: owner }),
  ]);

  // Delete user account
  await User.deleteOne({
    _id: owner,
  });

  return {
    message: 'Account and its personal data have been deleted',
  };
}


// ==========================================
// CLOUDINARY IMAGE UPLOAD
// ==========================================

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'veltrio/profile-photos',
        resource_type: 'image',

        transformation: [
          {
            width: 500,
            height: 500,
            crop: 'limit',
          },
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },

      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}


// ==========================================
// UPDATE PROFILE PHOTO
// ==========================================

export async function updateProfilePhoto(userId, file) {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  const uploaded = await uploadBuffer(file.buffer);

  const oldPublicId = user.avatarPublicId;

  user.avatarUrl = uploaded.secure_url;
  user.avatarPublicId = uploaded.public_id;

  await user.save();

  // Delete previous image
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      console.error(
        'Old profile photo cleanup failed:',
        error.message
      );
    }
  }

  return publicUser(user);
}


// ==========================================
// REMOVE PROFILE PHOTO
// ==========================================

export async function removeProfilePhoto(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User account not found');
  }

  const oldPublicId = user.avatarPublicId;

  user.avatarUrl = '';
  user.avatarPublicId = '';

  await user.save();

  // Delete image from Cloudinary
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      console.error(
        'Profile photo cleanup failed:',
        error.message
      );
    }
  }

  return publicUser(user);
}
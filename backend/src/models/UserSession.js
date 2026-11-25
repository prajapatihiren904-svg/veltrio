import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    device: {
      type: String,
      default: 'Unknown device',
    },

    browser: {
      type: String,
      default: 'Unknown browser',
    },

    operatingSystem: {
      type: String,
      default: 'Unknown OS',
    },

    ipAddress: {
      type: String,
      default: '',
    },

    userAgent: {
      type: String,
      default: '',
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

userSessionSchema.index({
  user: 1,
  revokedAt: 1,
  expiresAt: 1,
});

export default mongoose.model('UserSession', userSessionSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    emailVerified: {
  type: Boolean,
  default: true,
},

emailVerificationCodeHash: {
  type: String,
  default: undefined,
  select: false,
},

emailVerificationExpiresAt: {
  type: Date,
  default: undefined,
  select: false,
},

emailVerificationAttempts: {
  type: Number,
  default: 0,
},

emailVerificationLastSentAt: {
  type: Date,
  default: null,
},
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', immutable: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    currency: { type: String, default: 'INR', uppercase: true, minlength: 3, maxlength: 3 },
    avatarUrl: {
  type: String,
  default: '',
},

avatarPublicId: {
  type: String,
  default: '',
},
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; } } }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};


export default mongoose.model('User', userSchema);

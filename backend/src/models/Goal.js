import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000_000_000,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000_000_000,
    },

    savedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: 'INR',
    },

    targetDate: {
      type: Date,
      required: true,
    },

    contributions: {
      type: [contributionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, targetDate: 1 });
goalSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Goal', goalSchema);
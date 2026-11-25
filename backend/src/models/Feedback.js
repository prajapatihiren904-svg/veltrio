import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['suggestion', 'bug', 'feature'],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
      index: true,
    },
    response: {
  type: String,
  trim: true,
  maxlength: 2000,
  default: '',
},

respondedAt: {
  type: Date,
  default: null,
},

respondedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null,
},
  },
  { timestamps: true }
);

feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);

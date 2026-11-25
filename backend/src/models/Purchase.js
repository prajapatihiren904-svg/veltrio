import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000_000_000,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paidDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ['upcoming', 'paid', 'overdue'],
      default: 'upcoming',
    },

    note: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
  },
  { timestamps: true }
);

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    category: {
      type: String,
      enum: [
        'electronics',
        'home_appliances',
        'vehicle',
        'furniture',
        'clothing',
        'travel',
        'other',
      ],
      default: 'other',
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000_000_000,
    },

    initialPaidAmount: {
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

    paymentFrequency: {
      type: String,
      enum: ['full', 'weekly', 'monthly', 'custom'],
      default: 'full',
    },

    installmentAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    customIntervalDays: {
      type: Number,
      min: 1,
      max: 365,
      default: 30,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    payments: {
      type: [paymentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ user: 1, createdAt: -1 });

purchaseSchema.index({ user: 1, 'payments.dueDate': 1 });

export default mongoose.model('Purchase', purchaseSchema);
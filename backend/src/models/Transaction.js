import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true, index: true },
    amount: { type: Number, required: true, min: 0.01, max: 1_000_000_000_000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    date: { type: Date, required: true, index: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      default: 'other',
    },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3, default: 'INR' },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ user: 1, description: 'text', notes: 'text' });

export default mongoose.model('Transaction', transactionSchema);

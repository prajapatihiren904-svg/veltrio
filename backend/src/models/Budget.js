import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 month: {
    type: String,
    required: true,
    validate: {
        validator: (value) => /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(value),
        message: 'Month must use YYYY-MM format',
    },
},
currency: {
  type: String,
  default: 'INR',
  uppercase: true,
},
  category: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
  limit: { type: Number, required: true, min: 0.01, max: 1000000000000 },
  alertThreshold: { type: Number, default: 80, min: 1, max: 99 },
}, { timestamps: true });
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });
export default mongoose.model('Budget', budgetSchema);

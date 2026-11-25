import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    type: { type: String, enum: ['income', 'expense'], required: true, index: true },
    color: { type: String, default: '#10B981', match: /^#[0-9A-Fa-f]{6}$/ },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, type: 1, name: 1 }, { unique: true });
categorySchema.index({ user: 1, type: 1, createdAt: 1 });

export default mongoose.model('Category', categorySchema);

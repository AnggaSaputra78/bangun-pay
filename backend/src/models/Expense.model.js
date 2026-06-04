import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Expense name is required'],
      trim: true,
      maxlength: [200, 'Expense name cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'e_wallet', 'credit_card'],
      default: 'cash',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachments: [
      {
        url: String,
        filename: String,
        publicId: String,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ projectId: 1, expenseDate: -1 });
expenseSchema.index({ categoryId: 1 });
expenseSchema.index({ createdBy: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
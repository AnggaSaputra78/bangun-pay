import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters'],
    },
    owner: {
      type: String,
      required: [true, 'Owner is required'],
      trim: true,
      maxlength: [100, 'Owner name cannot exceed 100 characters'],
    },
    initialBudget: {
      type: Number,
      required: [true, 'Initial budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    totalExpense: {
      type: Number,
      default: 0,
      min: [0, 'Total expense cannot be negative'],
    },
    remainingBudget: {
      type: Number,
      default: function () {
        return this.initialBudget;
      },
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query performance
projectSchema.index({ name: 'text', location: 'text' });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ deletedAt: 1 });

// Virtual untuk persentase budget terpakai
projectSchema.virtual('budgetPercentage').get(function () {
  if (this.initialBudget === 0) return 0;
  return Math.round((this.totalExpense / this.initialBudget) * 100);
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
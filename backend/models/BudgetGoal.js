const mongoose = require('mongoose');

const budgetGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  limit: {
    type: Number,
    required: [true, 'Spending limit is required'],
    min: 0,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// One goal per category per month per user
budgetGoalSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BudgetGoal', budgetGoalSchema);

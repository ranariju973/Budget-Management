const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: 0,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
}, { timestamps: true });

// Index for fast user+date filtered queries
expenseSchema.index({ userId: 1, date: -1 });

// Text index for full-text search on title
expenseSchema.index({ title: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);

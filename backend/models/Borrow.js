const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  personName: {
    type: String,
    required: [true, 'Person name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  reason: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Index for fast user+date filtered queries
borrowSchema.index({ userId: 1, date: -1 });

// Text index for full-text search on personName and reason
borrowSchema.index({ personName: 'text', reason: 'text' });

module.exports = mongoose.model('Borrow', borrowSchema);

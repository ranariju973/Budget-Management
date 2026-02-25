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

module.exports = mongoose.model('Borrow', borrowSchema);

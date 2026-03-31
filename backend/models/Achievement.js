const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeId: {
    type: String,
    required: [true, 'Badge ID is required'],
    trim: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// One badge per user — prevents duplicate unlocks
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Fast lookup: all badges for a user
achievementSchema.index({ userId: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);

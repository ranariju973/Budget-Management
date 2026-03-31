const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const splitGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [60, 'Group name cannot exceed 60 characters'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: {
    type: [memberSchema],
    validate: {
      validator: (arr) => arr.length >= 1 && arr.length <= 20,
      message: 'Group must have between 1 and 20 members',
    },
  },
  inviteToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  inviteTokenExpiresAt: {
    type: Date,
  },
  isSettled: {
    type: Boolean,
    default: false,
  },
  settledAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Generate a secure invite token (64-char hex string)
splitGroupSchema.methods.generateInviteToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.inviteToken = token;
  // Token expires in 7 days
  this.inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return token;
};

// Check if a user is a member of this group
splitGroupSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => m.userId.toString() === userId.toString()
  );
};

// Check if a user is an admin of this group
splitGroupSchema.methods.isAdmin = function (userId) {
  return this.members.some(
    (m) => m.userId.toString() === userId.toString() && m.role === 'admin'
  );
};

// Indexes for fast lookups
splitGroupSchema.index({ 'members.userId': 1 });
splitGroupSchema.index({ inviteToken: 1 });
splitGroupSchema.index({ createdBy: 1 });

// Never expose __v
splitGroupSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SplitGroup', splitGroupSchema);

const mongoose = require('mongoose');
const SplitGroup = require('../models/SplitGroup');

/**
 * Group Membership Middleware
 * Verifies that req.user is a member of the group specified by :groupId.
 * Attaches req.group and req.memberRole for downstream use.
 */
const requireGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    const group = await SplitGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const member = group.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    req.group = group;
    req.memberRole = member.role;

    return next();
  } catch (error) {
    console.error('[GroupAuth]', error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

/**
 * Admin-only middleware (must be used AFTER requireGroupMember)
 */
const requireGroupAdmin = (req, res, next) => {
  if (req.memberRole !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can perform this action' });
  }
  return next();
};

module.exports = { requireGroupMember, requireGroupAdmin };

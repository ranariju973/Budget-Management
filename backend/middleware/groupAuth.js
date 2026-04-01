const { supabaseAdmin } = require('../config/supabase');

/**
 * Group Membership Middleware
 * Verifies that req.user is a member of the group specified by :groupId.
 * Attaches req.group, req.groupMembers, and req.memberRole for downstream use.
 */
const requireGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Get group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('split_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Get members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('split_group_members')
      .select('*')
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // Check if user is a member
    const member = (members || []).find((m) => m.user_id === req.user.id);

    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    req.group = group;
    req.groupMembers = members || [];
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

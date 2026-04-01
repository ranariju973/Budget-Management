const { supabaseAdmin } = require('../config/supabase');
const { createSupabaseCRUD, mapToApi } = require('../utils/supabaseCrudFactory');
const { handleError } = require('../utils/errorHandler');

/**
 * Lend CRUD — generated via factory pattern for Supabase
 */
const { getAll, create, update, remove } = createSupabaseCRUD('lends', 'Lend record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
  fieldMap: { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' },
});

/**
 * @desc    Mark a lend as paid — credits the amount back to balance
 * @route   PATCH /api/lends/:id/mark-paid
 * @access  Private
 */
const markLendAsPaid = async (req, res) => {
  try {
    // Get lend record
    const { data: lend, error: fetchError } = await supabaseAdmin
      .from('lends')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !lend) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    if (lend.is_paid) {
      return res.status(400).json({ message: 'Lend is already marked as paid' });
    }

    // Mark lend as paid
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('lends')
      .update({ is_paid: true, paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(mapToApi(updated, { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' }));
  } catch (error) {
    handleError(res, error, 'Lend record');
  }
};

module.exports = {
  getLends: getAll,
  createLend: create,
  updateLend: update,
  deleteLend: remove,
  markLendAsPaid,
};

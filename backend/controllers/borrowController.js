const { supabaseAdmin } = require('../config/supabase');
const { createSupabaseCRUD, mapToApi } = require('../utils/supabaseCrudFactory');
const { handleError } = require('../utils/errorHandler');

/**
 * Borrow CRUD — generated via factory pattern for Supabase
 */
const { getAll, create, update, remove } = createSupabaseCRUD('borrows', 'Borrow record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
  fieldMap: { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' },
});

/**
 * @desc    Mark a borrow as paid — creates an expense and updates status
 * @route   PATCH /api/borrows/:id/mark-paid
 * @access  Private
 */
const markBorrowAsPaid = async (req, res) => {
  try {
    // Get borrow record
    const { data: borrow, error: fetchError } = await supabaseAdmin
      .from('borrows')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrow.is_paid) {
      return res.status(400).json({ message: 'Borrow is already marked as paid' });
    }

    // Create an expense entry for the repaid borrow
    await supabaseAdmin.from('expenses').insert({
      user_id: req.user.id,
      title: `Borrow repaid: ${borrow.person_name}`,
      amount: borrow.amount,
      date: new Date().toISOString().split('T')[0],
    });

    // Mark borrow as paid
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('borrows')
      .update({ is_paid: true, paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(mapToApi(updated, { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' }));
  } catch (error) {
    handleError(res, error, 'Borrow record');
  }
};

module.exports = {
  getBorrows: getAll,
  createBorrow: create,
  updateBorrow: update,
  deleteBorrow: remove,
  markBorrowAsPaid,
};

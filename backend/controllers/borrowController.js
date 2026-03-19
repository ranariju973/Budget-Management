const mongoose = require('mongoose');
const Borrow = require('../models/Borrow');
const Expense = require('../models/Expense');
const createCRUD = require('../utils/crudFactory');
const { handleError } = require('../utils/errorHandler');

/**
 * Borrow CRUD — generated via factory pattern
 * Uses O(1) Set-based field validation, O(log n) B-tree indexed queries
 */
const { getAll, create, update, remove } = createCRUD(Borrow, 'Borrow record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
});

/**
 * @desc    Mark a borrow as paid — creates an expense and removes from active borrows
 * @route   PATCH /api/borrows/:id/mark-paid
 * @access  Private
 */
const markBorrowAsPaid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const borrow = await Borrow.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrow.isPaid) {
      return res.status(400).json({ message: 'Borrow is already marked as paid' });
    }

    // Create an expense entry for the repaid borrow
    await Expense.create({
      userId: req.user._id,
      title: `Borrow repaid: ${borrow.personName}`,
      amount: borrow.amount,
      date: new Date(),
    });

    // Mark borrow as paid
    borrow.isPaid = true;
    borrow.paidDate = new Date();
    await borrow.save();

    res.json(borrow);
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

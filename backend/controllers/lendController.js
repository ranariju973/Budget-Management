const mongoose = require('mongoose');
const Lend = require('../models/Lend');
const createCRUD = require('../utils/crudFactory');
const { handleError } = require('../utils/errorHandler');

/**
 * Lend CRUD — generated via factory pattern
 * Uses O(1) Set-based field validation, O(log n) B-tree indexed queries
 */
const { getAll, create, update, remove } = createCRUD(Lend, 'Lend record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
});

/**
 * @desc    Mark a lend as paid — credits the amount back to balance
 * @route   PATCH /api/lends/:id/mark-paid
 * @access  Private
 */
const markLendAsPaid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const lend = await Lend.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!lend) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    if (lend.isPaid) {
      return res.status(400).json({ message: 'Lend is already marked as paid' });
    }

    // Mark lend as paid — balance credit is handled by dashboard/summary formula
    lend.isPaid = true;
    lend.paidDate = new Date();
    await lend.save();

    res.json(lend);
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

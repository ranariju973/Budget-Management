const Borrow = require('../models/Borrow');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get all borrow records for user (optionally filter by month/year)
 * @route   GET /api/borrows
 * @access  Private
 */
const getBorrows = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const borrows = await Borrow.find(query).sort({ date: -1 }).lean();
    res.json(borrows);
  } catch (error) {
    handleError(res, error, 'Borrow');
  }
};

/**
 * @desc    Add a borrow record
 * @route   POST /api/borrows
 * @access  Private
 */
const createBorrow = async (req, res) => {
  try {
    const { personName, amount, date, reason } = req.body;

    if (!personName || !amount || !date) {
      return res.status(400).json({ message: 'Person name, amount, and date are required' });
    }

    const borrow = await Borrow.create({
      userId: req.user._id,
      personName,
      amount,
      date,
      reason,
    });

    res.status(201).json(borrow);
  } catch (error) {
    handleError(res, error, 'Borrow');
  }
};

/**
 * @desc    Update a borrow record
 * @route   PUT /api/borrows/:id
 * @access  Private
 */
const updateBorrow = async (req, res) => {
  try {
    const { personName, amount, date, reason } = req.body;
    const updateFields = {};
    if (personName !== undefined) updateFields.personName = personName;
    if (amount !== undefined) updateFields.amount = amount;
    if (date !== undefined) updateFields.date = date;
    if (reason !== undefined) updateFields.reason = reason;

    const updated = await Borrow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    res.json(updated);
  } catch (error) {
    handleError(res, error, 'Borrow');
  }
};

/**
 * @desc    Delete a borrow record
 * @route   DELETE /api/borrows/:id
 * @access  Private
 */
const deleteBorrow = async (req, res) => {
  try {
    const deleted = await Borrow.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    res.json({ message: 'Borrow record deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Borrow');
  }
};

module.exports = { getBorrows, createBorrow, updateBorrow, deleteBorrow };

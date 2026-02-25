const Borrow = require('../models/Borrow');

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

    const borrows = await Borrow.find(query).sort({ date: -1 });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a borrow record
 * @route   PUT /api/borrows/:id
 * @access  Private
 */
const updateBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrow.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { personName, amount, date, reason } = req.body;
    borrow.personName = personName ?? borrow.personName;
    borrow.amount = amount ?? borrow.amount;
    borrow.date = date ?? borrow.date;
    borrow.reason = reason ?? borrow.reason;

    const updated = await borrow.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a borrow record
 * @route   DELETE /api/borrows/:id
 * @access  Private
 */
const deleteBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    if (borrow.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await borrow.deleteOne();
    res.json({ message: 'Borrow record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBorrows, createBorrow, updateBorrow, deleteBorrow };

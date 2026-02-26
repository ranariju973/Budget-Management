const Lend = require('../models/Lend');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get all lend records for user (optionally filter by month/year)
 * @route   GET /api/lends
 * @access  Private
 */
const getLends = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const lends = await Lend.find(query).sort({ date: -1 }).lean();
    res.json(lends);
  } catch (error) {
    handleError(res, error, 'Lend');
  }
};

/**
 * @desc    Add a lend record
 * @route   POST /api/lends
 * @access  Private
 */
const createLend = async (req, res) => {
  try {
    const { personName, amount, date, reason } = req.body;

    if (!personName || !amount || !date) {
      return res.status(400).json({ message: 'Person name, amount, and date are required' });
    }

    const lend = await Lend.create({
      userId: req.user._id,
      personName,
      amount,
      date,
      reason,
    });

    res.status(201).json(lend);
  } catch (error) {
    handleError(res, error, 'Lend');
  }
};

/**
 * @desc    Update a lend record
 * @route   PUT /api/lends/:id
 * @access  Private
 */
const updateLend = async (req, res) => {
  try {
    const { personName, amount, date, reason } = req.body;
    const updateFields = {};
    if (personName !== undefined) updateFields.personName = personName;
    if (amount !== undefined) updateFields.amount = amount;
    if (date !== undefined) updateFields.date = date;
    if (reason !== undefined) updateFields.reason = reason;

    const updated = await Lend.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    res.json(updated);
  } catch (error) {
    handleError(res, error, 'Lend');
  }
};

/**
 * @desc    Delete a lend record
 * @route   DELETE /api/lends/:id
 * @access  Private
 */
const deleteLend = async (req, res) => {
  try {
    const deleted = await Lend.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    res.json({ message: 'Lend record deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Lend');
  }
};

module.exports = { getLends, createLend, updateLend, deleteLend };

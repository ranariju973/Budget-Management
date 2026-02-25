const Lend = require('../models/Lend');

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

    const lends = await Lend.find(query).sort({ date: -1 });
    res.json(lends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a lend record
 * @route   PUT /api/lends/:id
 * @access  Private
 */
const updateLend = async (req, res) => {
  try {
    const lend = await Lend.findById(req.params.id);

    if (!lend) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    if (lend.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { personName, amount, date, reason } = req.body;
    lend.personName = personName ?? lend.personName;
    lend.amount = amount ?? lend.amount;
    lend.date = date ?? lend.date;
    lend.reason = reason ?? lend.reason;

    const updated = await lend.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Delete a lend record
 * @route   DELETE /api/lends/:id
 * @access  Private
 */
const deleteLend = async (req, res) => {
  try {
    const lend = await Lend.findById(req.params.id);

    if (!lend) {
      return res.status(404).json({ message: 'Lend record not found' });
    }

    if (lend.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await lend.deleteOne();
    res.json({ message: 'Lend record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLends, createLend, updateLend, deleteLend };

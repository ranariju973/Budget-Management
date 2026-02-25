const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getIncome,
  createIncome,
  updateIncome,
} = require('../controllers/incomeController');

router.get('/', protect, getIncome);
router.post('/', protect, createIncome);
router.put('/:id', protect, updateIncome);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBorrows,
  createBorrow,
  updateBorrow,
  deleteBorrow,
  markBorrowAsPaid,
} = require('../controllers/borrowController');

router.get('/', protect, getBorrows);
router.post('/', protect, createBorrow);
router.put('/:id', protect, updateBorrow);
router.patch('/:id/mark-paid', protect, markBorrowAsPaid);
router.delete('/:id', protect, deleteBorrow);

module.exports = router;

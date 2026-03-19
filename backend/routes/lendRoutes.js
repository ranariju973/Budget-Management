const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLends,
  createLend,
  updateLend,
  deleteLend,
  markLendAsPaid,
} = require('../controllers/lendController');

router.get('/', protect, getLends);
router.post('/', protect, createLend);
router.put('/:id', protect, updateLend);
router.patch('/:id/mark-paid', protect, markLendAsPaid);
router.delete('/:id', protect, deleteLend);

module.exports = router;

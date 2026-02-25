const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLends,
  createLend,
  updateLend,
  deleteLend,
} = require('../controllers/lendController');

router.get('/', protect, getLends);
router.post('/', protect, createLend);
router.put('/:id', protect, updateLend);
router.delete('/:id', protect, deleteLend);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBudgetGoals,
  createBudgetGoal,
  updateBudgetGoal,
  deleteBudgetGoal,
  getChartData,
} = require('../controllers/budgetGoalController');

router.use(protect);

router.get('/chart-data', getChartData);
router.get('/', getBudgetGoals);
router.post('/', createBudgetGoal);
router.put('/:id', updateBudgetGoal);
router.delete('/:id', deleteBudgetGoal);

module.exports = router;

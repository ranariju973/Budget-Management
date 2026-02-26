const Expense = require('../models/Expense');
const createCRUD = require('../utils/crudFactory');

/**
 * Expense CRUD — generated via factory pattern
 * Uses O(1) Set-based field validation, O(log n) B-tree indexed queries
 */
const { getAll, create, update, remove } = createCRUD(Expense, 'Expense', {
  fields: ['title', 'amount', 'date'],
  requiredFields: ['title', 'amount', 'date'],
});

module.exports = {
  getExpenses: getAll,
  createExpense: create,
  updateExpense: update,
  deleteExpense: remove,
};

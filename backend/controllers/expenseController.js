const { createSupabaseCRUD } = require('../utils/supabaseCrudFactory');

/**
 * Expense CRUD — generated via factory pattern for Supabase
 */
const { getAll, create, update, remove } = createSupabaseCRUD('expenses', 'Expense', {
  fields: ['title', 'amount', 'date'],
  requiredFields: ['title', 'amount', 'date'],
  fieldMap: {},
});

module.exports = {
  getExpenses: getAll,
  createExpense: create,
  updateExpense: update,
  deleteExpense: remove,
};

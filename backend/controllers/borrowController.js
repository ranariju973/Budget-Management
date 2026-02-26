const Borrow = require('../models/Borrow');
const createCRUD = require('../utils/crudFactory');

/**
 * Borrow CRUD — generated via factory pattern
 * Uses O(1) Set-based field validation, O(log n) B-tree indexed queries
 */
const { getAll, create, update, remove } = createCRUD(Borrow, 'Borrow record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
});

module.exports = {
  getBorrows: getAll,
  createBorrow: create,
  updateBorrow: update,
  deleteBorrow: remove,
};

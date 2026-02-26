const Lend = require('../models/Lend');
const createCRUD = require('../utils/crudFactory');

/**
 * Lend CRUD — generated via factory pattern
 * Uses O(1) Set-based field validation, O(log n) B-tree indexed queries
 */
const { getAll, create, update, remove } = createCRUD(Lend, 'Lend record', {
  fields: ['personName', 'amount', 'date', 'reason'],
  requiredFields: ['personName', 'amount', 'date'],
});

module.exports = {
  getLends: getAll,
  createLend: create,
  updateLend: update,
  deleteLend: remove,
};

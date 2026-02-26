const mongoose = require('mongoose');
const { handleError } = require('./errorHandler');

/**
 * CRUD Factory — generates standard getAll/create/update/delete handlers
 * for any Mongoose model. Eliminates ~200 LOC of duplicated controller code.
 *
 * Time complexity:
 *  - Field validation uses Set for O(1) membership checks
 *  - Update field building uses O(f) where f = number of fields in body
 *  - All DB operations delegate to indexed Mongoose queries → O(log n) B-tree
 *
 * @param {mongoose.Model} Model - Mongoose model
 * @param {string} resourceName - Human-readable name for error messages
 * @param {Object} config
 * @param {string[]} config.fields - Allowed fields for create/update
 * @param {string[]} config.requiredFields - Fields required for create
 * @param {string} [config.nameField='title'] - Primary display field name
 */
const createCRUD = (Model, resourceName, { fields, requiredFields, nameField = 'title' }) => {
  // O(1) lookup sets — built once at module load time
  const fieldSet = new Set(fields);
  const requiredSet = new Set(requiredFields);

  /**
   * GET all records for the authenticated user, with optional month/year filter.
   * Uses compound index (userId, date) → O(log n) seek + O(k) scan where k = matching docs
   */
  const getAll = async (req, res) => {
    try {
      const { month, year } = req.query;
      const query = { userId: req.user._id };

      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        query.date = { $gte: startDate, $lte: endDate };
      }

      const docs = await Model.find(query).sort({ date: -1 }).lean();
      res.json(docs);
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * POST create a new record.
   * Required field check is O(r) where r = requiredFields.length (small constant).
   */
  const create = async (req, res) => {
    try {
      // O(r) required field validation
      for (const field of requiredSet) {
        if (!req.body[field]) {
          return res.status(400).json({
            message: `${requiredFields.join(', ')} are required`,
          });
        }
      }

      // Build doc from allowed fields only — O(f) where f = fields.length
      const docData = { userId: req.user._id };
      for (const field of fieldSet) {
        if (req.body[field] !== undefined) {
          docData[field] = field === 'amount' ? parseFloat(req.body[field]) : req.body[field];
        }
      }

      const doc = await Model.create(docData);
      res.status(201).json(doc);
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * PUT update a record by ID.
   * ObjectId validation is O(1). findOneAndUpdate uses B-tree index → O(log n).
   */
  const update = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      // Build update from allowed fields only — O(f)
      const updateFields = {};
      for (const field of fieldSet) {
        if (req.body[field] !== undefined) {
          updateFields[field] = field === 'amount' ? parseFloat(req.body[field]) : req.body[field];
        }
      }

      const updated = await Model.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        updateFields,
        { returnDocument: 'after', runValidators: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ message: `${resourceName} not found` });
      }

      res.json(updated);
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * DELETE a record by ID.
   * ObjectId validation is O(1). findOneAndDelete uses B-tree index → O(log n).
   */
  const remove = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const deleted = await Model.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!deleted) {
        return res.status(404).json({ message: `${resourceName} not found` });
      }

      res.json({ message: `${resourceName} deleted successfully` });
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  return { getAll, create, update, remove };
};

module.exports = createCRUD;

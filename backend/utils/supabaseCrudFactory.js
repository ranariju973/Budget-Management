const { handleError } = require('./errorHandler');

/**
 * Supabase CRUD Factory — generates standard getAll/create/update/delete handlers
 * for any Supabase table. Eliminates duplicated controller code.
 *
 * @param {string} tableName - Supabase table name
 * @param {string} resourceName - Human-readable name for error messages
 * @param {Object} config
 * @param {string[]} config.fields - Allowed fields for create/update
 * @param {string[]} config.requiredFields - Fields required for create
 * @param {Object} config.fieldMap - MongoDB to Supabase field name mapping
 */
const createSupabaseCRUD = (tableName, resourceName, { fields, requiredFields, fieldMap = {} }) => {
  const fieldSet = new Set(fields);
  const requiredSet = new Set(requiredFields);

  // Helper to map field names (camelCase to snake_case)
  const toDbField = (field) => fieldMap[field] || field;

  /**
   * GET all records for the authenticated user, with optional month/year filter.
   */
  const getAll = async (req, res) => {
    try {
      const { supabaseAdmin } = require('../config/supabase');
      const { month, year } = req.query;

      let query = supabaseAdmin
        .from(tableName)
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (month && year) {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map snake_case back to camelCase for API compatibility
      const mapped = data.map((row) => mapToApi(row, fieldMap));
      res.json(mapped);
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * POST create a new record.
   */
  const create = async (req, res) => {
    try {
      const { supabaseAdmin } = require('../config/supabase');

      // Required field validation
      for (const field of requiredSet) {
        if (!req.body[field]) {
          return res.status(400).json({
            message: `${requiredFields.join(', ')} are required`,
          });
        }
      }

      // Build insert data from allowed fields only
      const insertData = { user_id: req.user.id };
      for (const field of fieldSet) {
        if (req.body[field] !== undefined) {
          const dbField = toDbField(field);
          insertData[dbField] = field === 'amount' ? parseFloat(req.body[field]) : req.body[field];
        }
      }

      const { data, error } = await supabaseAdmin
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(mapToApi(data, fieldMap));
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * PUT update a record by ID.
   */
  const update = async (req, res) => {
    try {
      const { supabaseAdmin } = require('../config/supabase');

      // Build update from allowed fields only
      const updateFields = {};
      for (const field of fieldSet) {
        if (req.body[field] !== undefined) {
          const dbField = toDbField(field);
          updateFields[dbField] = field === 'amount' ? parseFloat(req.body[field]) : req.body[field];
        }
      }

      const { data, error } = await supabaseAdmin
        .from(tableName)
        .update(updateFields)
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: `${resourceName} not found` });
        }
        throw error;
      }

      res.json(mapToApi(data, fieldMap));
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  /**
   * DELETE a record by ID.
   */
  const remove = async (req, res) => {
    try {
      const { supabaseAdmin } = require('../config/supabase');

      const { data, error } = await supabaseAdmin
        .from(tableName)
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: `${resourceName} not found` });
        }
        throw error;
      }

      res.json({ message: `${resourceName} deleted successfully` });
    } catch (error) {
      handleError(res, error, resourceName);
    }
  };

  return { getAll, create, update, remove };
};

/**
 * Maps database snake_case fields to API camelCase + adds _id alias for id
 */
const mapToApi = (row, fieldMap = {}) => {
  if (!row) return null;
  
  const reverseMap = {};
  for (const [camel, snake] of Object.entries(fieldMap)) {
    reverseMap[snake] = camel;
  }

  const result = { _id: row.id }; // MongoDB compatibility
  
  for (const [key, value] of Object.entries(row)) {
    if (key === 'id') continue; // Already added as _id
    
    // Convert snake_case to camelCase
    const camelKey = reverseMap[key] || key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  
  return result;
};

module.exports = { createSupabaseCRUD, mapToApi };

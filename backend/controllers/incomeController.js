const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const { mapToApi } = require('../utils/supabaseCrudFactory');

/**
 * @desc    Get income for user (filter by month/year)
 * @route   GET /api/income
 * @access  Private
 */
const getIncome = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = supabaseAdmin
      .from('incomes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (month) query = query.eq('month', parseInt(month));
    if (year) query = query.eq('year', parseInt(year));

    const { data, error } = await query;

    if (error) throw error;

    const mapped = data.map((row) => mapToApi(row));
    res.json(mapped);
  } catch (error) {
    handleError(res, error, 'Income');
  }
};

/**
 * @desc    Create or upsert income for a month/year
 * @route   POST /api/income
 * @access  Private
 */
const createIncome = async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    if (!amount || !month || !year) {
      return res.status(400).json({ message: 'Amount, month, and year are required' });
    }

    // Upsert: try to update existing, if not found, insert
    const { data: existing } = await supabaseAdmin
      .from('incomes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('month', month)
      .eq('year', year)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('incomes')
        .update({ amount: parseFloat(amount) })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('incomes')
        .insert({
          user_id: req.user.id,
          amount: parseFloat(amount),
          month: parseInt(month),
          year: parseInt(year),
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.status(201).json(mapToApi(result));
  } catch (error) {
    handleError(res, error, 'Income');
  }
};

/**
 * @desc    Update income by ID
 * @route   PUT /api/income/:id
 * @access  Private
 */
const updateIncome = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('incomes')
      .update({ amount: parseFloat(req.body.amount) })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Income not found' });
      }
      throw error;
    }

    res.json(mapToApi(data));
  } catch (error) {
    handleError(res, error, 'Income');
  }
};

module.exports = { getIncome, createIncome, updateIncome };

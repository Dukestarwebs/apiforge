const supabase = require('../config/supabase');
const insert = async ({ userId, type, amount, description, referenceId }) => {
  const { data, error } = await supabase.from('credit_transactions').insert({ user_id: userId, type, amount, description, reference_id: referenceId }).select().single();
  if (error) throw error; return data;
};
const listByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase.from('credit_transactions').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range(from, from + limit - 1);
  if (error) throw error; return { data, count };
};
module.exports = { insert, listByUser };

const supabase = require('../config/supabase');
const getByUser = async (userId) => {
  const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error; return data;
};
const create = async (userId, plan = 'free') => {
  const now = new Date(); const end = new Date(now); end.setMonth(end.getMonth() + 1);
  const { data, error } = await supabase.from('subscriptions').insert({ user_id: userId, plan, builds_used: 0, period_start: now.toISOString(), period_end: end.toISOString() }).select().single();
  if (error) throw error; return data;
};
const updatePlan = async (userId, plan) => {
  const { data, error } = await supabase.from('subscriptions').update({ plan }).eq('user_id', userId).select().single();
  if (error) throw error; return data;
};
const incrementBuilds = async (userId) => {
  const { error } = await supabase.rpc('increment_builds_used', { p_user_id: userId });
  if (error) throw error;
};
module.exports = { getByUser, create, updatePlan, incrementBuilds };

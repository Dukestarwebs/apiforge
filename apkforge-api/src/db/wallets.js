const supabase = require('../config/supabase');
const getBalance   = async (userId) => {
  const { data, error } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
  if (error) throw error; return data.balance;
};
const createWallet = async (userId) => {
  const { data, error } = await supabase.from('wallets').insert({ user_id: userId, balance: 0 }).select().single();
  if (error) throw error; return data;
};
const addCredits   = async (userId, amount) => {
  const { data, error } = await supabase.rpc('add_credits', { p_user_id: userId, p_amount: amount });
  if (error) throw error; return data;
};
const deductCredits = async (userId, amount) => {
  const { data, error } = await supabase.rpc('deduct_credits', { p_user_id: userId, p_amount: amount });
  if (error) throw error; return data;
};
module.exports = { getBalance, createWallet, addCredits, deductCredits };

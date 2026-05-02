const supabase = require('../config/supabase');
const save   = async ({ userId, encryptedData, alias }) => {
  const { data, error } = await supabase.from('keystores').upsert({ user_id: userId, encrypted_data: encryptedData, alias }).select().single();
  if (error) throw error; return data;
};
const get    = async (userId) => {
  const { data, error } = await supabase.from('keystores').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error; return data;
};
const remove = async (userId) => {
  const { error } = await supabase.from('keystores').delete().eq('user_id', userId);
  if (error) throw error;
};
module.exports = { save, get, remove };

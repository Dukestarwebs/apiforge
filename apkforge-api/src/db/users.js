const supabase = require('../config/supabase');
const createUser  = async ({ email, passwordHash, name }) => {
  const { data, error } = await supabase.from('api_users').insert({ email, password_hash: passwordHash, name }).select().single();
  if (error) throw error; return data;
};
const findByEmail = async (email) => {
  const { data, error } = await supabase.from('api_users').select('*').eq('email', email).single();
  if (error && error.code !== 'PGRST116') throw error; return data;
};
const findById    = async (id) => {
  const { data, error } = await supabase.from('api_users').select('*').eq('id', id).single();
  if (error) throw error; return data;
};
const updateUser  = async (id, updates) => {
  const { data, error } = await supabase.from('api_users').update(updates).eq('id', id).select().single();
  if (error) throw error; return data;
};
const deleteUser  = async (id) => {
  const { error } = await supabase.from('api_users').delete().eq('id', id);
  if (error) throw error;
};
module.exports = { createUser, findByEmail, findById, updateUser, deleteUser };

const supabase = require('../config/supabase');
const createKey   = async ({ userId, keyHash, keyPrefix, label }) => {
  const { data, error } = await supabase.from('api_keys').insert({ user_id: userId, key_hash: keyHash, key_prefix: keyPrefix, label }).select().single();
  if (error) throw error; return data;
};
const findByHash  = async (keyHash) => {
  const { data, error } = await supabase.from('api_keys').select('*, api_users(*)').eq('key_hash', keyHash).eq('is_active', true).single();
  if (error && error.code !== 'PGRST116') throw error; return data;
};
const listByUser  = async (userId) => {
  const { data, error } = await supabase.from('api_keys').select('id, key_prefix, label, created_at, last_used_at').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false });
  if (error) throw error; return data;
};
const revokeKey   = async (id, userId) => {
  const { error } = await supabase.from('api_keys').update({ is_active: false }).eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
const touchLastUsed = async (id) => {
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', id);
};
module.exports = { createKey, findByHash, listByUser, revokeKey, touchLastUsed };

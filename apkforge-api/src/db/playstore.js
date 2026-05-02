const supabase = require('../config/supabase');
const save   = async ({ userId, encryptedToken, packageName }) => {
  const { data, error } = await supabase.from('playstore_connections').upsert({ user_id: userId, encrypted_token: encryptedToken, package_name: packageName }).select().single();
  if (error) throw error; return data;
};
const get    = async (userId) => {
  const { data, error } = await supabase.from('playstore_connections').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error; return data;
};
const remove = async (userId) => {
  const { error } = await supabase.from('playstore_connections').delete().eq('user_id', userId);
  if (error) throw error;
};
module.exports = { save, get, remove };

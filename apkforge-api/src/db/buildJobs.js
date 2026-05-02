const supabase = require('../config/supabase');
const { ARTIFACT_EXPIRY_DAYS } = require('../config/constants');

const create = async ({ userId, mode, outputFormat, appName, packageName, creditsDeducted }) => {
  const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + ARTIFACT_EXPIRY_DAYS);
  const { data, error } = await supabase.from('build_jobs').insert({
    user_id: userId, mode, output_format: outputFormat,
    app_name: appName, package_name: packageName,
    credits_deducted: creditsDeducted, status: 'queued',
    expires_at: expiresAt.toISOString(),
  }).select().single();
  if (error) throw error; return data;
};
const updateStatus = async (id, status, extra = {}) => {
  const { data, error } = await supabase.from('build_jobs').update({ status, ...extra }).eq('id', id).select().single();
  if (error) throw error; return data;
};
const findById = async (id) => {
  const { data, error } = await supabase.from('build_jobs').select('*').eq('id', id).single();
  if (error) throw error; return data;
};
const findByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase.from('build_jobs').select('*', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).range(from, from + limit - 1);
  if (error) throw error; return { data, count };
};
const findExpired = async () => {
  const { data, error } = await supabase.from('build_jobs').select('id, apk_storage_path, aab_storage_path').eq('status', 'success').lt('expires_at', new Date().toISOString());
  if (error) throw error; return data;
};
const findStuck = async (timeoutMs) => {
  const cutoff = new Date(Date.now() - timeoutMs).toISOString();
  const { data, error } = await supabase.from('build_jobs').select('*').in('status', ['queued','building','cloning','packaging','uploading']).lt('created_at', cutoff);
  if (error) throw error; return data;
};
const markExpired = async (id) => updateStatus(id, 'expired');
const deleteJob   = async (id, userId) => {
  const { error } = await supabase.from('build_jobs').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};
module.exports = { create, updateStatus, findById, findByUser, findExpired, findStuck, markExpired, deleteJob };

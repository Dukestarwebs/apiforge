const supabase = require('../config/supabase');
const getSignedUrl = async (bucket, filePath, expiresIn = 3600) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn);
  if (error) throw new Error(`Signed URL error: ${error.message}`);
  return data.signedUrl;
};
module.exports = { getSignedUrl };

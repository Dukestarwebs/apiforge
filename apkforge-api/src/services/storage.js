const supabase = require('../config/supabase');
const { getSignedUrl } = require('../utils/signedUrl');

const BUCKET = 'apk-artifacts';

const uploadArtifact = async (jobId, fileBuffer, fileName) => {
  const storagePath = `builds/${jobId}/${fileName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, { upsert: true, contentType: 'application/octet-stream' });
  if (error) throw new Error(`Storage upload error: ${error.message}`);
  return storagePath;
};

const getDownloadUrl = async (storagePath) => getSignedUrl(BUCKET, storagePath, 3600);

const deleteArtifact = async (storagePath) => {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) console.error('Storage delete error:', error.message);
};

module.exports = { uploadArtifact, getDownloadUrl, deleteArtifact };

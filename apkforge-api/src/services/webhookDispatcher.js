const axios = require('axios');
const crypto = require('crypto');

const dispatch = async (webhookUrl, event, data, secret) => {
  if (!webhookUrl) return;
  const payload   = JSON.stringify({ event, data, timestamp: Date.now() });
  const signature = crypto.createHmac('sha256', secret || '').update(payload).digest('hex');
  try {
    await axios.post(webhookUrl, JSON.parse(payload), {
      headers: { 'Content-Type':'application/json', 'X-APKForge-Event': event, 'X-APKForge-Signature': signature },
      timeout: 5000,
    });
  } catch (err) {
    console.error(`Webhook dispatch failed to ${webhookUrl}:`, err.message);
  }
};

module.exports = { dispatch };

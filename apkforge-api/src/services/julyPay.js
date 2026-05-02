const axios = require('axios');
const env   = require('../config/env');

const client = axios.create({
  baseURL: env.JULYPAY_BASE_URL,
  headers: { Authorization: `Bearer ${env.JULYPAY_API_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 30000,
});

// Initiate STK push — collect payment from customer phone
const collectPayment = async ({ customerPhone, amount, description, customerName }) => {
  const { data } = await client.post('/wallet/collect-payment', { customer_phone: customerPhone, amount, description, customer_name: customerName });
  if (!data.success) throw new Error(data.message || 'JulyPay collection failed');
  return data.data; // { transaction_id, reference, amount_requested, net_amount_to_receive, status }
};

// Poll collection status
const getCollectionStatus = async (transactionId) => {
  const { data } = await client.get(`/wallet/collections/${transactionId}/status`);
  return data; // { status: 'processing' | 'completed' | 'failed', net_amount_received }
};

// Get wallet balance
const getBalance = async () => {
  const { data } = await client.get('/wallet/balance');
  if (!data.success) throw new Error('Could not fetch JulyPay balance');
  return data.data;
};

module.exports = { collectPayment, getCollectionStatus, getBalance };

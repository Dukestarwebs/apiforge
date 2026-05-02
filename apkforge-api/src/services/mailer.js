const { Resend } = require('resend');
const env    = require('../config/env');
const resend = new Resend(env.RESEND_API_KEY);

const send = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
  if (error) console.error('Email error:', error);
};

const sendWelcome = (to, name) => send({
  to, subject: 'Welcome to APKForge!',
  html: `<h2>Hi ${name}!</h2><p>Your account is ready. You have 3 free credits to get started.</p><p><a href="${env.API_BASE_URL}">Get your API key</a></p>`,
});

const sendBuildSuccess = (to, name, jobId, appName) => send({
  to, subject: `Your APK is ready — ${appName}`,
  html: `<h2>Build Complete!</h2><p>Hi ${name}, your build for <strong>${appName}</strong> is ready.</p><p>Job ID: <code>${jobId}</code></p><p>Download it from your dashboard before it expires in 30 days.</p>`,
});

const sendBuildFailed = (to, name, appName, reason) => send({
  to, subject: `Build failed — ${appName}`,
  html: `<h2>Build Failed</h2><p>Hi ${name}, the build for <strong>${appName}</strong> failed.</p><p>Reason: ${reason}</p><p>Your credits have been refunded.</p>`,
});

const sendPurchaseConfirm = (to, name, credits, amount) => send({
  to, subject: `Credits added — ${credits} credits`,
  html: `<h2>Payment Confirmed</h2><p>Hi ${name}, ${credits} credits have been added to your account. Amount: UGX ${amount.toLocaleString()}</p>`,
});

module.exports = { sendWelcome, sendBuildSuccess, sendBuildFailed, sendPurchaseConfirm };

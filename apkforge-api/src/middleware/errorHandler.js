// Global Express error handler — must be last middleware in app.js
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message, err.stack);
  res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
};

module.exports = errorHandler;

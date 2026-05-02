const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes       = require('./routes/index');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(logger);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'apkforge-api', version: '1.0.0' }));

// All API routes under /api/v1
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

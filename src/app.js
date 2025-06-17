const express = require('express');
const requestLogger = require('./middleware/logger');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
	console.log('[Health] Health check requested');
	res.json({
		success: true,
		data: {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			version: '1.0.0'
		}
	});
});

// Error handler
app.use((err, req, res, next) => {
	console.error('[Error] Unhandled error:', err);
	console.error('[Error] Stack trace:', err.stack);
	res.status(500).json({
		success: false,
		error: 'INTERNAL_SERVER_ERROR',
		message: 'An unexpected error occurred'
	});
});

// Handle 404
app.use('*', (req, res) => {
	console.log('[404] Endpoint not found:', req.originalUrl);
	res.status(404).json({
		success: false,
		error: 'ENDPOINT_NOT_FOUND',
		message: 'API endpoint not found'
	});
});

module.exports = app;

const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`[Server] E-Wallet Withdrawal API running on port ${PORT}`);
	console.log('[Server] Available endpoints:');
	console.log('  POST /api/transactions/withdraw');
	console.log('  POST /api/transactions/:transactionId/reverse');
	console.log('  GET  /api/transactions/:transactionId');
	console.log('  GET  /api/accounts/:accountId/transactions');
	console.log('  GET  /api/accounts/:accountId');
	console.log('  GET  /api/health');
});

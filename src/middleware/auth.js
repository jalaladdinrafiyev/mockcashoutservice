const authenticateProcessing = (req, res, next) => {
	const apiKey = req.headers['authorization'];
	console.log('[Auth] Attempting authentication');

	if (!apiKey) {
		console.log('[Auth] Failed: No API key provided');
		return res.status(401).json({
			success: false,
			error: 'UNAUTHORIZED',
			message: 'Authorization header required'
		});
	}

	// Simple API key validation
	if (apiKey !== 'Bearer processing-api-key-789') {
		console.log('[Auth] Failed: Invalid API key provided');
		return res.status(401).json({
			success: false,
			error: 'INVALID_API_KEY',
			message: 'Invalid API key'
		});
	}

	console.log('[Auth] Success: Valid API key');
	next();
};

module.exports = authenticateProcessing;

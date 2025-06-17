const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');
const authenticateProcessing = require('../middleware/auth');

router.get('/:accountId', authenticateProcessing, AccountController.getAccount);
router.get(
	'/:accountId/transactions',
	authenticateProcessing,
	AccountController.getAccountTransactions
);

module.exports = router;

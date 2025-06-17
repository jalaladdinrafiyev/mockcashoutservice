const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authenticateProcessing = require('../middleware/auth');

router.post('/withdraw', authenticateProcessing, TransactionController.withdraw);
router.get('/:transactionId', authenticateProcessing, TransactionController.getTransaction);
router.post(
	'/:transactionId/reverse',
	authenticateProcessing,
	TransactionController.reverseTransaction
);

module.exports = router;

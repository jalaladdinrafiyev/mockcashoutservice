const AccountModel = require('../models/account');
const TransactionModel = require('../models/transaction');

class TransactionController {
	static async withdraw(req, res) {
		console.log('[Withdraw] Processing withdrawal request');
		const { accountId, amount, reference, externalRef } = req.body;

		// Basic validations
		if (!accountId) {
			console.log('[Withdraw] Failed: Missing account ID');
			return res.status(400).json({
				success: false,
				error: 'MISSING_ACCOUNT_ID',
				message: 'Account ID is required'
			});
		}
		if (!amount || amount <= 0) {
			console.log('[Withdraw] Failed: Invalid amount', amount);
			return res.status(400).json({
				success: false,
				error: 'INVALID_AMOUNT',
				message: 'Amount must be greater than 0'
			});
		}
		if (amount > 10000) {
			console.log('[Withdraw] Failed: Amount too high', amount);
			return res.status(400).json({
				success: false,
				error: 'AMOUNT_TOO_HIGH',
				message: 'Maximum withdrawal amount is 10,000'
			});
		}

		const account = AccountModel.findById(accountId);
		if (!account) {
			console.log('[Withdraw] Failed: Account not found', accountId);
			return res.status(404).json({
				success: false,
				error: 'ACCOUNT_NOT_FOUND',
				message: 'Account not found'
			});
		}
		if (account.status !== 'active') {
			console.log('[Withdraw] Failed: Account inactive', accountId);
			return res.status(403).json({
				success: false,
				error: 'ACCOUNT_INACTIVE',
				message: 'Account is not active'
			});
		}
		if (account.balance < amount) {
			console.log('[Withdraw] Failed: Insufficient funds', {
				accountId,
				balance: account.balance,
				amount
			});
			return res.status(400).json({
				success: false,
				error: 'INSUFFICIENT_FUNDS',
				message: `Insufficient balance. Available: ${account.balance.toFixed(
					2
				)}, Requested: ${amount}`
			});
		}

		// Check for existing pending withdrawal
		const existingPending = TransactionModel.findPendingByAccountId(accountId);
		if (existingPending) {
			console.log('[Withdraw] Failed: Pending transaction exists', {
				accountId,
				transactionId: existingPending.id
			});
			return res.status(409).json({
				success: false,
				error: 'PENDING_TRANSACTION_EXISTS',
				message: 'There is already a pending withdrawal for this account'
			});
		}

		// Check for duplicate externalRef
		if (externalRef) {
			const duplicateExternal = TransactionModel.findDuplicateExternalRef(externalRef);
			if (duplicateExternal) {
				console.log('[Withdraw] Failed: Duplicate external reference', {
					externalRef,
					transactionId: duplicateExternal.id
				});
				return res.status(409).json({
					success: false,
					error: 'DUPLICATE_EXTERNAL_REF',
					message: 'A transaction with this externalRef has already been processed or is pending'
				});
			}
		}

		const transaction = TransactionModel.create({
			accountId,
			type: 'withdrawal',
			amount,
			reference: reference || '',
			externalRef: externalRef || '',
			balanceBefore: account.balance
		});

		console.log('[Withdraw] Creating new transaction', {
			transactionId: transaction.id,
			accountId,
			amount
		});

		// Simulate async completion
		setTimeout(() => {
			const shouldFail = false; // Add failure simulation logic if you want

			if (shouldFail) {
				console.log('[Withdraw] Transaction failed', { transactionId: transaction.id });
				TransactionModel.update(transaction.id, { status: 'failed' });
			} else {
				// Complete transaction
				console.log('[Withdraw] Completing transaction', {
					transactionId: transaction.id,
					oldBalance: account.balance,
					newBalance: account.balance - amount
				});
				TransactionModel.update(transaction.id, {
					status: 'completed',
					balanceAfter: account.balance - amount
				});
				AccountModel.updateBalance(accountId, account.balance - amount);
			}
		}, 2000); // 2-second processing delay

		console.log('[Withdraw] Request accepted', { transactionId: transaction.id });
		res.json({
			success: true,
			message: 'Transaction submitted and is pending',
			data: {
				transactionId: transaction.id,
				status: 'pending'
			}
		});
	}

	static getTransaction(req, res) {
		const { transactionId } = req.params;
		console.log('[GetTransaction] Fetching transaction', { transactionId });

		const transaction = TransactionModel.findById(transactionId);

		if (!transaction) {
			console.log('[GetTransaction] Failed: Transaction not found', { transactionId });
			return res.status(404).json({
				success: false,
				error: 'TRANSACTION_NOT_FOUND',
				message: 'Transaction not found'
			});
		}

		console.log('[GetTransaction] Success', { transactionId });
		res.json({
			success: true,
			data: transaction
		});
	}

	static reverseTransaction(req, res) {
		const { transactionId } = req.params;
		console.log('[Reverse] Processing reverse request', { transactionId });

		const transaction = TransactionModel.findById(transactionId);

		if (!transaction) {
			console.log('[Reverse] Failed: Transaction not found', { transactionId });
			return res.status(404).json({
				success: false,
				error: 'TRANSACTION_NOT_FOUND',
				message: 'Transaction not found'
			});
		}

		if (transaction.type !== 'withdrawal') {
			console.log('[Reverse] Failed: Invalid transaction type', {
				transactionId,
				type: transaction.type
			});
			return res.status(400).json({
				success: false,
				error: 'INVALID_TYPE',
				message: 'Only withdrawal transactions can be reversed'
			});
		}

		if (transaction.status !== 'completed') {
			console.log('[Reverse] Failed: Transaction not completed', {
				transactionId,
				status: transaction.status
			});
			return res.status(400).json({
				success: false,
				error: 'NOT_REVERSIBLE',
				message: 'Transaction must be completed to reverse'
			});
		}

		if (transaction.reversed) {
			console.log('[Reverse] Failed: Transaction already reversed', { transactionId });
			return res.status(400).json({
				success: false,
				error: 'ALREADY_REVERSED',
				message: 'Transaction has already been reversed'
			});
		}

		const account = AccountModel.findById(transaction.accountId);
		if (!account) {
			console.log('[Reverse] Failed: Account not found', {
				transactionId,
				accountId: transaction.accountId
			});
			return res.status(404).json({
				success: false,
				error: 'ACCOUNT_NOT_FOUND',
				message: 'Associated account not found'
			});
		}

		console.log('[Reverse] Reversing transaction', {
			transactionId,
			oldBalance: account.balance,
			newBalance: account.balance + transaction.amount
		});

		const newBalance = account.balance + transaction.amount;
		AccountModel.updateBalance(transaction.accountId, newBalance);
		TransactionModel.update(transactionId, {
			reversed: true,
			status: 'reversed',
			balanceAfter: newBalance
		});

		console.log('[Reverse] Success', { transactionId });
		res.json({
			success: true,
			message: 'Transaction reversed successfully',
			data: {
				transactionId: transaction.id,
				newBalance: newBalance,
				status: 'reversed'
			}
		});
	}
}

module.exports = TransactionController;

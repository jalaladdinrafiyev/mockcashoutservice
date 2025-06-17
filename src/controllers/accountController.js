const AccountModel = require('../models/account');
const TransactionModel = require('../models/transaction');

class AccountController {
	static getAccount(req, res) {
		const { accountId } = req.params;
		console.log('[GetAccount] Fetching account', { accountId });

		const account = AccountModel.findById(accountId);

		if (!account) {
			console.log('[GetAccount] Failed: Account not found', { accountId });
			return res.status(404).json({
				success: false,
				error: 'ACCOUNT_NOT_FOUND',
				message: 'Account not found'
			});
		}

		console.log('[GetAccount] Success', { accountId });
		res.json({
			success: true,
			data: {
				accountId: account.id,
				name: account.name,
				status: account.status
			}
		});
	}

	static getAccountTransactions(req, res) {
		const { accountId } = req.params;
		const { limit = 10, offset = 0 } = req.query;
		console.log('[GetAccountTransactions] Fetching transactions', { accountId, limit, offset });

		const account = AccountModel.findById(accountId);
		if (!account) {
			console.log('[GetAccountTransactions] Failed: Account not found', { accountId });
			return res.status(404).json({
				success: false,
				error: 'ACCOUNT_NOT_FOUND',
				message: 'Account not found'
			});
		}

		const accountTransactions = TransactionModel.findByAccountId(accountId)
			.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
			.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

		console.log('[GetAccountTransactions] Success', {
			accountId,
			transactionCount: accountTransactions.length
		});

		res.json({
			success: true,
			data: {
				transactions: accountTransactions,
				total: TransactionModel.findByAccountId(accountId).length,
				limit: parseInt(limit),
				offset: parseInt(offset)
			}
		});
	}
}

module.exports = AccountController;

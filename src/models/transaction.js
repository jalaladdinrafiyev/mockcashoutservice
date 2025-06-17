const { v4: uuidv4 } = require('uuid');

// Mock database for transactions
const transactions = [];

class TransactionModel {
	static create(transactionData) {
		const transaction = {
			id: uuidv4(),
			timestamp: new Date().toISOString(),
			status: 'pending',
			balanceAfter: null,
			reversed: false,
			...transactionData
		};
		transactions.push(transaction);
		return transaction;
	}

	static findById(id) {
		return transactions.find(t => t.id === id);
	}

	static findByAccountId(accountId) {
		return transactions.filter(t => t.accountId === accountId);
	}

	static findPendingByAccountId(accountId) {
		return transactions.find(t => t.accountId === accountId && t.status === 'pending');
	}

	static findDuplicateExternalRef(externalRef) {
		return transactions.find(t => t.externalRef === externalRef && t.status !== 'failed');
	}

	static update(id, updates) {
		const transaction = this.findById(id);
		if (transaction) {
			Object.assign(transaction, updates);
			return true;
		}
		return false;
	}
}

module.exports = TransactionModel;
